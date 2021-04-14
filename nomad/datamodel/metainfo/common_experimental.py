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

import numpy as np

from nomad.metainfo import (
    MSection, MCategory, Package, Quantity, SubSection,
    Datetime, JSON)


m_package = Package(name='experimental_common')


class UserProvided(MCategory):
    pass


class DeviceSettings(MSection):
    device_name = Quantity(type=str)
    analysis_method = Quantity(type=str)
    analyzer_lens = Quantity(type=str)
    analyzer_slit = Quantity(type=str)
    scan_mode = Quantity(type=str)
    detector_voltage = Quantity(type=str)
    workfunction = Quantity(type=str)
    channel_id = Quantity(type=str)
    max_energy = Quantity(type=str)
    min_energy = Quantity(type=str)
    guntype = Quantity(type=str)
    beam_energy = Quantity(type=str)
    resolution = Quantity(type=str)
    step_size = Quantity(type=str)
    acquisition_mode = Quantity(type=str)
    beam_current = Quantity(type=str)
    detector_type = Quantity(type=str)
    dark_current = Quantity(type=str)
    notes = Quantity(type=str, categories=[UserProvided])


class Sample(MSection):
    spectrum_region = Quantity(type=str, shape=[])
    sample_id = Quantity(type=str)
    formula = Quantity(type=str)
    elements = Quantity(type=str, shape=['*'])
    sample_title = Quantity(type=str)
    notes = Quantity(type=str, categories=[UserProvided])


class Experiment(MSection):
    method_name = Quantity(type=str)
    method_abbreviation = Quantity(type=str)
    experiment_id = Quantity(type=str)
    experiment_publish_time = Quantity(
        type=Datetime, description='The datetime when this experiment was published.')
    experiment_start_time = Quantity(
        type=Datetime, description='The datetime of the beginning of the experiment.')
    experiment_end_time = Quantity(
        type=Datetime, description='The datetime of the experiment end.')
    edges = Quantity(type=str, shape=['*'])
    description = Quantity(type=str)
    notes = Quantity(type=str, categories=[UserProvided])
    

class Instrument(MSection):
    n_scans = Quantity(type=str)
    dwell_time = Quantity(type=str)
    excitation_energy = Quantity(type=str)
    source_label = Quantity(type=str)
    notes = Quantity(type=str, categories=[UserProvided])

    section_device_settings = SubSection(sub_section=DeviceSettings, repeats=True)


class Author(MSection):
    author_name = Quantity(type=str)
    author_profile_url = Quantity(type=str)
    author_profile_api_url = Quantity(type=str)
    group_name = Quantity(type=str)
    notes = Quantity(type=str, categories=[UserProvided])


class DataHeader(MSection):
    channel_id = Quantity(type=int)
    label = Quantity(type=str)
    unit = Quantity(type=str)
    notes = Quantity(type=str, categories=[UserProvided])


class Origin(MSection):
    section_author = SubSection(sub_section=Author, repeats=True)
    permalink = Quantity(type=str)
    api_permalink = Quantity(type=str)
    repository_name = Quantity(
        type=str, description='The name of the repository, where the data is stored.')

    repository_url = Quantity(
        type=str, description='An URL to the repository, where the data is stored.')

    preview_url = Quantity(
        type=str, description='An URL to an image file that contains a preview.')

    entry_repository_url = Quantity(
        type=str, description='An URL to the entry on the repository, where the data is stored.')
    notes = Quantity(type=str, categories=[UserProvided])


class Spectrum(MSection):
    n_values = Quantity(type=int)
    excitation_energy_expected = Quantity(type=np.dtype(np.float64), shape=['n_values'], unit='J', description='The expected excitation energy range of the spectrum')
    excitation_energy_actual = Quantity(type=np.dtype(np.float64), shape=['n_values'], unit='J', description='The actual excitation energy range of the spectrum')
    count = Quantity(type=np.dtype(np.float64), shape=['n_values'], description='The count at each energy value, dimensionless')
    ring_current = Quantity(type=np.dtype(np.float64), shape=['n_values'], unit='A', description='Ring current')
    total_electron_yield = Quantity(type=np.dtype(np.float64), shape=['n_values'], unit='V', description='Total electron yield')
    mirror_current = Quantity(type=np.dtype(np.float64), shape=['n_values'], unit='V', description='Mirror current')
    energy = Quantity(type=np.dtype(np.float64), shape=['n_values'], unit='J', description='The energy range of the (EELS) spectrum')
    notes = Quantity(type=str, categories=[UserProvided])


class Metadata(MSection):
    section_sample = SubSection(sub_section=Sample)
    section_experiment = SubSection(sub_section=Experiment)
    section_instrument = SubSection(sub_section=Instrument)
    section_data_header = SubSection(sub_section=DataHeader)
    section_origin = SubSection(sub_section=Origin)
    notes = Quantity(type=str, categories=[UserProvided])


class Data(MSection):
    section_spectrum = SubSection(sub_section=Spectrum)
    notes = Quantity(type=str, categories=[UserProvided])


class Measurement(MSection):
    section_metadata = SubSection(sub_section=Metadata)
    section_data = SubSection(sub_section=Data)
    description = Quantity(type=str, categories=[UserProvided])


# class Experiment(MSection):
#     '''
#     The root section for all (meta)data that belongs to a single experiment.
#     '''
#     m_def = Section(validate=False)

#     experiment_summary = Quantity(
#         type=str, description='A descriptive summary of the content of the experiment.')

#     experiment_location = SubSection(sub_section=SectionProxy('Location'))

#     experiment_publish_time = Quantity(
#         type=Datetime, description='The datetime when this experiment was published.')

#     experiment_time = Quantity(
#         type=Datetime, description='The datetime of the beginning of the experiment.')

#     experiment_end_time = Quantity(
#         type=Datetime, description='The datetime of the experiment end.')

#     raw_metadata = Quantity(
#         type=JSON, description='The whole or partial metadata in its original source JSON format.')

#     section_data = SubSection(sub_section=SectionProxy('Data'))

#     section_method = SubSection(sub_section=SectionProxy('Method'))

#     section_sample = SubSection(sub_section=SectionProxy('Sample'))


# class Location(MSection):
#     m_def = Section(validate=False)

#     address = Quantity(
#         type=str, description='''
#         The address where the experiment took place, format 'Country, City, Street'
#         ''')

#     institution = Quantity(
#         type=str, description='''
#         Name of the institution hosting the experimental facility (e.g. in full or an
#         acronym).
#         ''')

#     facility = Quantity(
#         type=str, description='''
#         Name of the experimental facility (e.g. in full or an acronym).
#         ''')


# class Data(MSection):
#     '''
#     This section contains information about the stored data.
#     '''
#     m_def = Section(validate=False)

#     repository_name = Quantity(
#         type=str, description='The name of the repository, where the data is stored.')

#     repository_url = Quantity(
#         type=str, description='An URL to the repository, where the data is stored.')

#     preview_url = Quantity(
#         type=str, description='An URL to an image file that contains a preview.')

#     entry_repository_url = Quantity(
#         type=str, description='An URL to the entry on the repository, where the data is stored.')


# class Method(MSection):
#     '''
#     This section contains information about the applied experimental method.
#     '''
#     m_def = Section(validate=False)

#     data_type = Quantity(
#         type=str, description='Name of the type of data that the experiment produced.')

#     method_name = Quantity(
#         type=str, description='Full name of the experimental method in use')

#     method_abbreviation = Quantity(
#         type=str,
#         description='Abbreviated name (i.e. acronym) of the experimental method')

#     probing_method = Quantity(
#         type=str, description='The probing method used')

#     instrument_description = Quantity(
#         type=str, description='A description of the instrumentation used for the experiment.')


# class Sample(MSection):
#     '''
#     The section for all sample related (meta)data that was used in the experiment.
#     '''
#     m_def = Section(validate=False)

#     sample_description = Quantity(
#         type=str, description='Description of the sample used in the experiment.')

#     sample_id = Quantity(
#         type=str, description='Identification number or signatures of the sample used.')

#     sample_state = Quantity(
#         type=str, description='The physical state of the sample.')

#     sample_temperature = Quantity(
#         type=np.dtype(np.float64), unit='kelvin',
#         description='The temperature of the sample during the experiment.')

#     sample_microstructure = Quantity(
#         type=str, description='The sample microstructure.')

#     sample_constituents = Quantity(
#         type=str, description='The constituents.')

#     section_material = SubSection(sub_section=SectionProxy('Material'))


# class Material(MSection):
#     ''' This section describes a sample's material. '''
#     m_def = Section(validate=False)

#     chemical_formula = Quantity(
#         type=str, description='The chemical formula that describes the sample.')

#     chemical_name = Quantity(
#         type=str, description='The chemical name that describes the sample.')

#     atom_labels = Quantity(
#         type=str, shape=['number_of_elements'],
#         description='Atom labels for distinct elements in the sample.')

#     number_of_elements = Quantity(
#         type=int, derived=lambda m: len(m.atom_labels) if m.atom_labels else 0,
#         description='Number of distinct chemical elements in the sample.')

#     space_group = Quantity(
#         type=int, description='Space group of the sample compound (if crystalline).')


m_package.__init_metainfo__()
