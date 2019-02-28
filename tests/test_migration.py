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

import pytest
import os
import os.path
from bravado.client import SwaggerClient
import json
import glob
from io import StringIO

from nomad import infrastructure, coe_repo

from nomad.migration import NomadCOEMigration, SourceCalc, Package
from nomad.infrastructure import repository_db_connection

from tests.conftest import create_postgres_infra, create_auth_headers
from tests.bravado_flask import FlaskTestHttpClient
from tests.test_api import create_auth_headers

test_source_db_name = 'test_nomad_fairdi_migration_source'
test_target_db_name = 'test_nomad_fairdi_migration_target'


@pytest.fixture(scope='module')
def source_repo(monkeysession, postgres_infra):
    """
    Fixture for an example migration source db with:
    - two user
    - two calculations (1 per user)
    - one calculation with all metadata (dataset, ref, comment, coauther, sharewith)
    """
    try:
        with repository_db_connection(dbname='postgres', with_trans=False) as con:
            with con.cursor() as cursor:
                cursor.execute("CREATE DATABASE %s ;" % test_source_db_name)
    except Exception:
        pass

    with repository_db_connection(dbname=test_source_db_name, with_trans=False) as con:
        with con.cursor() as cur:
            cur.execute(
                'DROP SCHEMA IF EXISTS public CASCADE;'
                'CREATE SCHEMA IF NOT EXISTS public;'
                'GRANT ALL ON SCHEMA public TO postgres;'
                'GRANT ALL ON SCHEMA public TO public;')

            schema_sql_file, example_data_sql_file = (
                os.path.join(os.path.dirname(infrastructure.__file__), 'empty_repository_db.sql'),
                os.path.join('tests', 'data', 'migration', 'example_source_db.sql'))

            for sql_file in [schema_sql_file, example_data_sql_file]:
                with open(sql_file, 'r') as f:
                    cur.execute(f.read())

    with create_postgres_infra(monkeysession, exists=True, readonly=True, dbname=test_source_db_name) as db:
        yield db


@pytest.fixture(scope='function')
def target_repo(postgres):
    with create_postgres_infra(readonly=False, exists=False, dbname=test_target_db_name) as db:
        db.execute('DELETE FROM affiliations;')
        db.execute('DELETE FROM sessions WHERE user_id >= 3;')
        db.execute('DELETE FROM users WHERE user_id >= 3;')
        assert db.query(coe_repo.User).filter_by(email='admin').first() is not None
        yield db
        db.execute('TRUNCATE uploads CASCADE;')


@pytest.fixture(scope='function')
def migration(source_repo, target_repo):
    Package.objects().delete()  # the mongo fixture drops the db, but we still get old results, probably mongoengine caching
    migration = NomadCOEMigration(sites=['tests/data/migration'])
    yield migration


@pytest.fixture(scope='function')
def source_package(mongo, migration):
    migration.package(*glob.glob('tests/data/migration/*'))


@pytest.mark.parametrize('n_packages, restriction, upload', [
    (1, 36, 'baseline'), (2, 0, 'too_big'), (1, 24, 'restriction')])
def test_package(mongo, migration, monkeypatch, n_packages, restriction, upload):
    monkeypatch.setattr('nomad.migration.max_package_size', 3)
    migration.package(*glob.glob(os.path.join('tests/data/migration/packaging', upload)))
    packages = Package.objects()
    for package in packages:
        assert len(package.filenames) > 0
        assert package.size > 0
        assert package.restricted == restriction

    assert packages.count() == n_packages


def perform_index(migration, has_indexed, with_metadata, **kwargs):
    has_source_calc = False
    for source_calc, total in SourceCalc.index(migration.source, with_metadata=with_metadata, **kwargs):
        assert source_calc.pid is not None
        assert source_calc.mainfile in ['1/template.json', '2/template.json']
        assert source_calc.upload == 'upload'
        has_source_calc = True
        assert total == 3  # 2 calcs + 1 dataset

    assert has_source_calc == has_indexed

    test_calc = SourceCalc.objects(mainfile='1/template.json', upload='upload').first()
    assert test_calc is not None

    if with_metadata:
        assert test_calc.metadata['uploader']['id'] == 3
        assert test_calc.metadata['comment'] == 'label1'


@pytest.mark.parametrize('with_metadata', [False, True])
def test_create_index(migration, mongo, with_metadata: bool):
    perform_index(migration, has_indexed=True, drop=True, with_metadata=with_metadata)


@pytest.mark.parametrize('with_metadata', [True, False])
def test_update_index(migration, mongo, with_metadata: bool):
    perform_index(migration, has_indexed=True, drop=True, with_metadata=with_metadata)
    perform_index(migration, has_indexed=False, drop=False, with_metadata=with_metadata)


@pytest.fixture(scope='function')
def migrate_infra(migration, target_repo, proc_infra, client, monkeypatch):
    """
    Parameters to test
    - missing upload, extracted, archive, broken archive
    - upload process failure
    - upload with no parsable files
    - calculations with process errors
    - matching, non matching calculations
    - to few calculations
    - to many caclualtions
    - not in the index

    All with two calcs, two users (for coauthors)
    """
    # source repo is the infrastructure repo
    indexed = list(migration.index(drop=True, with_metadata=True))
    assert len(indexed) == 2

    # target repo is the infrastructure repo
    def create_client():
        admin = target_repo.query(coe_repo.User).filter_by(email='admin').first()
        http_client = FlaskTestHttpClient(client, headers=create_auth_headers(admin))
        return SwaggerClient.from_url('/swagger.json', http_client=http_client)

    def stream_upload_with_client(client, upload_f, name=None):
        return client.uploads.upload(file=upload_f, name=name).response().result

    monkeypatch.setattr('nomad.infrastructure.repository_db', target_repo)
    monkeypatch.setattr('nomad.client.create_client', create_client)
    monkeypatch.setattr('nomad.client.stream_upload_with_client', stream_upload_with_client)

    # source repo is the still the original infrastructure repo
    migration.copy_users()

    yield migration


def test_copy_users(migrate_infra, target_repo):
    assert target_repo.query(coe_repo.User).filter_by(user_id=3).first().email == 'one'
    assert target_repo.query(coe_repo.User).filter_by(user_id=4).first().email == 'two'


mirgation_test_specs = [
    ('baseline', 'baseline', dict(migrated=2, source=2), {}),
    ('local', 'baseline', dict(migrated=2, source=2), dict(local=True)),
    # ('archive', dict(migrated=2, source=2)),
    ('new_upload', 'new_upload', dict(new=2), {}),
    ('new_calc', 'new_calc', dict(migrated=2, source=2, new=1), {}),
    ('missing_calc', 'missing_calc', dict(migrated=1, source=2, missing=1), {}),
    ('missmatch', 'missmatch', dict(migrated=2, source=2, diffs=1), {}),
    ('failed_calc', 'failed_calc', dict(migrated=1, source=2, diffs=0, missing=1, failed=1, errors=1), {}),
    ('failed_upload', 'baseline', dict(migrated=0, source=2, missing=2, errors=1), {}),
    ('failed_publish', 'baseline', dict(migrated=0, source=2, missing=2, failed=2, errors=1), {})
]


@pytest.mark.filterwarnings("ignore:SAWarning")
@pytest.mark.parametrize('name, test, assertions, kwargs', mirgation_test_specs)
@pytest.mark.timeout(30)
def test_migrate(migrate_infra, name, test, assertions, kwargs, monkeypatch, caplog):
    def with_error(*args, **kwargs):
        return StringIO('hello, this is not a zip')

    if name == 'failed_upload':
        monkeypatch.setattr('nomad.migration.Package.open_package_upload_file', with_error)

    if name == 'failed_publish':
        monkeypatch.setattr('nomad.processing.data.Upload.to_upload_with_metadata', with_error)

    upload_path = os.path.join('tests/data/migration', test)
    upload_path = os.path.join(upload_path, os.listdir(upload_path)[0])

    pid_prefix = 10
    migrate_infra.set_pid_prefix(pid_prefix)
    report = migrate_infra.migrate(upload_path, create_packages=True, **kwargs)

    assert report.total_calcs == assertions.get('migrated', 0) + assertions.get('new', 0) + assertions.get('failed', 0)

    # assert if new, diffing, migrated calcs where detected correctly
    assert report.total_source_calcs == assertions.get('source', 0)
    assert report.migrated_calcs == assertions.get('migrated', 0)
    assert report.calcs_with_diffs == assertions.get('diffs', 0)
    assert report.new_calcs == assertions.get('new', 0)
    assert report.missing_calcs == assertions.get('missing', 0)

    # assert if migrated calcs have correct user metadata
    repo_db = infrastructure.repository_db
    if assertions.get('migrated', 0) > 0:
        calc_1: coe_repo.Calc = repo_db.query(coe_repo.Calc).get(1)
        assert calc_1 is not None
        metadata = calc_1.to_calc_with_metadata()
        assert metadata.pid <= 2
        assert metadata.uploader['id'] == 3
        assert metadata.upload_time.isoformat() == '2019-01-01T12:00:00+00:00'
        assert len(metadata.datasets) == 1
        assert metadata.datasets[0]['id'] == 3
        assert metadata.datasets[0]['name'] == 'test_dataset'
        assert metadata.datasets[0]['doi']['value'] == 'internal_ref'
        assert metadata.comment == 'label1'
        assert len(metadata.coauthors) == 1
        assert metadata.coauthors[0]['id'] == 4
        assert len(metadata.references) == 1
        assert metadata.references[0]['value'] == 'external_ref'

    if assertions.get('migrated', 0) > 1:
        calc_2: coe_repo.Calc = repo_db.query(coe_repo.Calc).get(2)
        assert calc_1 is not None
        metadata = calc_2.to_calc_with_metadata()
        assert len(metadata.shared_with) == 1
        assert metadata.shared_with[0]['id'] == 3

    # assert pid prefix of new calcs
    if assertions.get('new', 0) > 0:
        assert repo_db.query(coe_repo.Calc).get(pid_prefix) is not None

    errors = 0
    for record in caplog.get_records(when='call'):
        if record.levelname in ['ERROR', 'CRITICAL']:
            record_data = json.loads(record.getMessage())
            if 'source_upload_id' in record_data:
                errors += 1

    assert errors == assertions.get('errors', 0)
