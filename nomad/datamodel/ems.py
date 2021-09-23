#
# Copyright The NOMAD Authors.
#
# This file is part of NOMAD. See https://nomad-lab.eu for further info.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

'''
Experimental material science specific metadata
'''
from nomad import config
from nomad.metainfo import Quantity, MSection, Section, Datetime


def _unavailable(value):
    if value is None:
        return config.services.unavailable_value

    return value


class EMSMetadata(MSection):
    m_def = Section(a_domain='ems')

    # sample quantities
    chemical = Quantity(type=str)
    sample_constituents = Quantity(type=str)
    sample_microstructure = Quantity(type=str)

    # general metadata
    experiment_summary = Quantity(type=str)
    origin_time = Quantity(type=Datetime)
    experiment_location = Quantity(type=str)

    # method
    method = Quantity(type=str)
    data_type = Quantity(type=str)
    probing_method = Quantity(type=str)

    # origin metadata
    repository_name = Quantity(type=str)
    repository_url = Quantity(type=str)
    entry_repository_url = Quantity(type=str)
    preview_url = Quantity(type=str)

    # TODO move to more a general metadata section
    quantities = Quantity(type=str, shape=['0..*'], default=[])
    group_hash = Quantity(type=str)

    def apply_domain_metadata(self, entry_archive):
        from nomad import utils

        if entry_archive is None:
            return

        entry = self.m_parent

        root_section = entry_archive.section_measurement[0]

        sample = root_section.section_metadata.section_sample
        entry.formula = config.services.unavailable_value
        if sample:
            # TODO deal with multiple materials
            material = sample.section_material[0] if len(sample.section_material) > 0 else None
            if material:
                entry.formula = _unavailable(material.formula)
                atoms = material.elements

                if atoms is None:
                    entry.atoms = []
                else:
                    if hasattr(atoms, 'tolist'):
                        atoms = atoms.tolist()
                    entry.n_atoms = len(atoms)

                    atoms = list(set(atoms))
                    atoms.sort()
                    entry.atoms = atoms

                if material.name:
                    self.chemical = _unavailable(material.name)
                else:
                    self.chemical = _unavailable(material.formula)

            self.sample_microstructure = _unavailable(sample.sample_microstructure)
            self.sample_constituents = _unavailable(sample.sample_constituents)

        self.experiment_summary = root_section.section_metadata.section_experiment.notes
        location = root_section.section_metadata.section_experiment.experiment_location
        if location is not None:
            location_str = ', '.join([
                getattr(location, prop)
                for prop in ['facility', 'institution', 'address']
                if getattr(location, prop) is not None])
            self.experiment_location = location_str

        if root_section.section_metadata.section_experiment.experiment_start_time:
            self.origin_time = root_section.section_metadata.section_experiment.experiment_start_time
        elif root_section.section_metadata.section_experiment.experiment_publish_time:
            self.origin_time = root_section.section_metadata.section_experiment.experiment_publish_time
        else:
            self.origin_time = self.m_parent.upload_time

        # self.data_type = _unavailable(root_section.section_method.data_type)
        self.method = _unavailable(root_section.section_metadata.section_experiment.method_name)
        # self.probing_method = _unavailable(root_section.section_method.probing_method)

        self.repository_name = _unavailable(root_section.section_metadata.section_origin.repository_name)
        self.repository_url = root_section.section_metadata.section_origin.repository_url
        self.preview_url = root_section.section_metadata.section_origin.preview_url
        self.entry_repository_url = root_section.section_metadata.section_origin.entry_repository_url

        self.group_hash = utils.hash(
            entry.formula,
            self.method,
            self.experiment_location,
            entry.with_embargo,
            entry.uploader)

        quantities = set()

        quantities.add(root_section.m_def.name)
        for _, property_def, _ in root_section.m_traverse():
            quantities.add(property_def.name)

        self.quantities = list(quantities)

        if self.m_parent.references is None:
            self.m_parent.references = [self.entry_repository_url]
