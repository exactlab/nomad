# Copyright 2018 Markus Scheidgen
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an"AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from typing import List, Any, Union, cast
from celery.result import AsyncResult, result_from_tuple
import itertools
import time
import traceback

from nomad import utils
from nomad.normalizing import normalizers
from nomad.processing.app import app


class Proc(utils.DataObject):
    """
    This is a base class for processing state. Processing state is reprented as a
    sequence of pseudo tasks (not necessarely celery tasks). This class keeps the
    tasks names, the currently active tasks, and a general *status*, that can be
    ``PENDING``, ``PROGRESS``, ``SUCCESS``, or ``FAILURE``. A processing can be
    failed on each *task*; successiv tasks are only executed if the processing has not
    yet failed.

    The processing state can be persistet as JSON (e.g. in mongodb).

    Arguments:
        task_names: a list of task names in sequence

    Attributes:
        current_task_name: name of the currently running task
        status: aggregated status for the whole process, celery status names as convention
        errors: a list of potential error that caused failure
    """
    def __init__(self, task_names: List[str], *args, **kwargs) -> None:
        super().__init__(*args)
        self.task_names: List[str] = task_names
        self.current_task_name: str = None
        self.status: str = 'PENDING'
        self.errors: List[str] = []
        self.warnings: List[str] = []

        self.update(kwargs)

    def continue_with(self, task_name: str) -> bool:
        """ Upadtes itself with information about the new current task. """

        assert self.status != 'SUCCESS', 'Cannot continue on completed workflow.'

        if self.status == 'FAILURE':
            return False
        else:
            self.status = 'PROGRESS'
            self.current_task_name = task_name
            return True

    def success(self) -> None:
        self.status = 'SUCCESS'

    @property
    def is_started(self) -> bool:
        """ True, if the task is started. """
        return self.status is not 'PENDING'

    def fail(self, e: Union[List[str], List[Exception], Exception, str]):
        """ Allows tasks to mark this processing as failed. All following task will do nothing. """
        raw_errors: Union[List[str], List[Exception]] = None
        if isinstance(e, list):
            raw_errors = e
        else:
            raw_errors = cast(Union[List[str], List[Exception]], [e])

        for error in raw_errors:
            if isinstance(error, str):
                self.errors.append(error)
            elif isinstance(error, Exception):
                tb = traceback.format_exc()
                self.errors.append(error.__str__())
                self.errors.append(tb)
            else:
                assert False, 'Unknown error'

        self.status = 'FAILURE'


class CalcProc(Proc):
    """
    Used to represent the state of an calc processing. It is used to provide
    information to the user (via api, users) and act as a state object within the
    more complex calc processing task.
    Currently just pseudo tasks. Keep in mind that this task might become several
    celery tasks in the future.
    The list of tasks is derived from the given parser, and the list of defined
    normalizers (:mod:`nomad.normalizing`).

    Arguments:
        upload_hash: the hash that identifies the upload in the archive
        mainfile: the path to the mainfile in the upload
        parser_name: the name of the parser to use/used
        tmp_mainfile: the full path to the mainfile in the local fs

    Attributes:
        calc_hash: the mainfile hash that identifies the calc in the archive
        celery_task_id: the celery task id for the calc parse celery task
    """
    def __init__(self, mainfile, parser_name, tmp_mainfile, *args, **kwargs):
        task_names = [
            [parser_name],
            [n.__name__ for n in normalizers],
            ['archiving']
        ]

        super().__init__(task_names=list(itertools.chain(*task_names)), *args)

        self.mainfile = mainfile
        self.parser_name = parser_name
        self.tmp_mainfile = tmp_mainfile

        self.calc_hash = utils.hash(mainfile)

        self.celery_task_id: str = None

        self.update(kwargs)

    def update_from_backend(self) -> bool:
        """ Consults results backend and updates. Returns if object might have changed. """
        if self.status in ['FAILURE', 'SUCCESS']:
            return False
        if self.celery_task_id is None:
            return False

        celery_task_result = AsyncResult(self.celery_task_id, app=app)
        if celery_task_result.ready():
            self.update(celery_task_result.result)
            return True
        else:
            info = celery_task_result.info
            if info is not None:
                self.update(info)
                return True

        return False


class UploadProc(Proc):
    """
    Used to represent the state of an upload processing. It is used to provide
    information to the user (via api, users) and act as a state object that is passed
    from celery task to celery task.

    It is serializable (JSON, pickle). Iternaly stores
    :class:`~celery.results.AsyncResults` instance in serialized *tuple* form to
    keep connected to the results backend.

    The state of calculation processings (:class:`CalcProc`) is keept as a list of
    children. This might be inappropriate in the future, when there are uploads with
    thousands of calculations.

    Warning:
        You have to call :func:`forget` eventually to free all resources and the celery
        results backend.

        Anyhow, results will be deleted after 1 day, depending on `configuration
        <http://docs.celeryproject.org/en/latest/userguide/configuration.html#result-expires>`_.

    Arguments:
        upload_id: the id of the uploaded file in the object storage,
                   see also :mod:`nomad.files`

    Attributes:
        upload_hash: the hash of the uploaded file; e.g., used for archive/repo ids
        calc_procs: the state data for all child calc processings
        celery_task_ids: serialized form of the celery async_results tree for the processing
    """
    def __init__(self, upload_id: str, *args, **kwargs) -> None:
        assert upload_id is not None
        # TODO there should be a way to read the names from the tasks
        # but currently this is not possible due to import cycles
        task_names = ['uploading', 'extracting', 'parse_all', 'cleanup']
        super().__init__(task_names, *args)

        self.upload_id = upload_id
        self.upload_hash: str = None

        self.calc_procs: List[CalcProc] = []

        self.celery_task_ids: Any = None

        self.update(kwargs)

        if not self.is_started:
            self.continue_with(task_names[0])

    def update(self, dct):
        # Since the data might be updated from deserialized dicts, list and CalcProc
        # instances might by dicts, or mongoengines BaseList, BaseDicts. This overwrite
        # replaces it.
        # TODO there might be a better solution, or the problem solves itself, when
        # moving away from mongo.
        if 'calc_procs' in dct:
            calc_procs = dct['calc_procs']
            for idx, calc_proc_dct in enumerate(calc_procs):
                if not isinstance(calc_proc_dct, CalcProc):
                    calc_procs[idx] = CalcProc(**calc_proc_dct)
            if type(calc_procs) != list:
                dct['calc_procs'] = list(calc_procs)

        super().update(dct)

    @property
    def _celery_task_result(self) -> AsyncResult:
        """
        The celery async_result in its regular usable, but not serializable form.

        We use the tuple form to allow serialization (i.e. storage). Keep in mind
        that the sheer `task_id` is not enough, because it does not contain
        the parent tasks, i.e. result tree.
        See `third comment <https://github.com/celery/celery/issues/1328>`_
        for details.
        """
        assert self.celery_task_ids is not None

        return result_from_tuple(self.celery_task_ids, app=app)

    def update_from_backend(self) -> bool:
        """
        Consults the result backend and updates itself with the available results.
        Will only update not completed processings.

        Returns:
             If object might have changed.
        """
        assert self.is_started, 'Run is not yet started.'

        if self.status in ['SUCCESS', 'FAILURE']:
            return False

        if self.celery_task_ids is None:
            return False

        celery_task_result = self._celery_task_result
        task_index = len(self.task_names)
        might_have_changed = False
        while celery_task_result is not None:
            task_index -= 1
            if celery_task_result.ready():
                result = celery_task_result.result
                if isinstance(result, Exception):
                    self.fail(result)
                    self.current_task_name = self.task_names[task_index]
                    logger = utils.get_logger(
                        __name__,
                        upload_id=self.upload_id,
                        current_task_name=self.current_task_name)
                    logger.error('Celery task raised exception', exc_info=result)
                else:
                    self.update(result)
                might_have_changed = True
                break
            else:
                if celery_task_result.status == 'PROGRESS':
                    # get potential info
                    result = celery_task_result.info
                    if result is not None:
                        self.update(result)
                        break

                celery_task_result = celery_task_result.parent

        if self.calc_procs is not None:
            for calc_proc in self.calc_procs:
                if calc_proc.update_from_backend():
                    might_have_changed = True

        return might_have_changed

    def forget(self) -> None:
        """ Forget the results of a completed run; free all resources in the results backend. """
        # TODO, this is not forgetting the parse task in the parse_all header, right?
        assert self.ready(), 'Run is not completed.'

        celery_task_result = self._celery_task_result
        while celery_task_result is not None:
            celery_task_result.forget()
            celery_task_result = celery_task_result.parent

    def ready(self) -> bool:
        """ Returns: True if the task has been executed. """
        self.update_from_backend()
        return self.status in ['FAILURE', 'SUCCESS']

    def get(self, interval=1, timeout=None) -> 'UploadProc':
        """
        Blocks until the processing has finished. It uses the given interval
        to contineously consult the results backend.

        Arguments:
            interval: a period to sleep between updates
            timeout: a rough timeout to terminated, even unfinished

        Returns: An upadted instance of itself with all the results.
        """
        assert self.is_started, 'Run is not yet started.'

        slept = 0
        while not self.ready() and (timeout is None or slept < timeout):
            time.sleep(interval)
            slept += interval
            self.update_from_backend()

        self.update_from_backend()

        return self
