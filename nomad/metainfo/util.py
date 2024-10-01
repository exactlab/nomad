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
from __future__ import annotations

import hashlib
import re
from difflib import SequenceMatcher
from typing import Any

import pint

from nomad.metainfo.data_type import Enum
from nomad.units import ureg

__hash_method = 'sha1'  # choose from hashlib.algorithms_guaranteed

MEnum = Enum  # type: ignore


class MQuantity:
    """
    A simple wrapper to represent complex quantities that may have multiple values,
    additional attributes, and more.
    """

    def __init__(
        self,
        in_name: str | None,
        in_value: Any,
        in_unit: pint.Unit | None = None,
        in_attributes: dict | None = None,
    ):
        """
        The validation of value/unit/attribute is performed at 'MSection' level.
        """
        self.name: str | None = in_name
        if self.name:
            assert isinstance(self.name, str), 'Name must be a string'

        self.unit: pint.Unit | None = None
        if isinstance(in_value, pint.Quantity):
            self.value = in_value.m  # magnitude
            self.unit = in_value.u  # unit
            assert in_unit is None, f'Unit is already defined in the value {in_value}'
        else:
            # the input argument is not a pint quantity
            # the unit is set to None
            self.value = in_value
            if isinstance(in_unit, pint.Unit):
                self.unit = in_unit
            elif isinstance(in_unit, str):
                self.unit = ureg.parse_units(in_unit)

        self.original_unit: pint.Unit | None = self.unit

        self.attributes: dict = {}
        if in_attributes is not None:
            self.attributes.update(**in_attributes)
            self.__dict__.update(**in_attributes)

    @staticmethod
    def from_dict(name: str, data: dict) -> MQuantity:
        m_quantity = MQuantity(
            name,
            data['m_value'],
            data.get('m_unit', None),
            data.get('m_attributes', None),
        )

        if 'm_original_unit' in data:
            m_quantity.original_unit = ureg.parse_units(data['m_original_unit'])

        return m_quantity

    @staticmethod
    def wrap(in_value: Any, in_name: str | None = None):
        """
        Syntax sugar to wrap a value into a MQuantity. The name is optional.

        This would be useful for non-variadic primitive quantities with additional attributes.
        """
        return MQuantity(in_name, in_value)

    def __repr__(self):
        return self.name if self.name else 'Unnamed quantity'

    def m_set_attribute(self, name, value):
        """
        Validation is done outside this container
        """
        self.attributes[name] = value

    def get(self):
        if self.unit:
            return ureg.Quantity(self.value, self.unit)

        return self.value


class MSubSectionList(list):
    def __init__(self, section, sub_section_def):
        self.section = section
        self.sub_section_def = sub_section_def
        super().__init__()

    def __setitem__(self, key, value):
        old_value = self[key]
        super().__setitem__(key, value)
        # noinspection PyProtectedMember
        self.section._on_add_sub_section(self.sub_section_def, value, key)
        # noinspection PyProtectedMember
        self.section._on_remove_sub_section(self.sub_section_def, old_value)

    def __getitem__(self, item):
        if isinstance(item, str):
            for sub_section in self:
                if sub_section.m_key == item:
                    return sub_section
            raise KeyError(f'No subsection keyed {item} found.')

        return super().__getitem__(item)

    def __delitem__(self, key):
        self.pop(key)

    def __setslice__(self, i, j, sequence):
        raise NotImplementedError('You can only append subsections.')

    def __delslice__(self, i, j):
        raise NotImplementedError('You can only append subsections.')

    def append(self, value):
        super().append(value)
        # noinspection PyProtectedMember
        self.section._on_add_sub_section(self.sub_section_def, value, len(self) - 1)

    def pop(self, key=-1):
        if key < 0:
            key = key + len(self)
        old_value = super().pop(key)
        for index in range(key, len(self)):
            # noinspection PyProtectedMember
            self.section._on_add_sub_section(self.sub_section_def, self[index], index)

        # noinspection PyProtectedMember
        self.section._on_remove_sub_section(self.sub_section_def, old_value)

        return old_value

    def extend(self, new_value):
        start_index = len(self)
        super().extend(new_value)
        for index, value in enumerate(new_value):
            # noinspection PyProtectedMember
            self.section._on_add_sub_section(
                self.sub_section_def, value, start_index + index
            )

    def insert(self, i, element):
        raise NotImplementedError('You can only append subsections.')

    def remove(self, element):
        raise NotImplementedError('You can only append subsections.')

    def reverse(self):
        raise NotImplementedError('You can only append subsections.')

    def sort(self, *, key=..., reverse=...):
        raise NotImplementedError('You can only append subsections.')

    def clear(self):
        old_values = list(self)
        super().clear()
        for old_value in old_values:
            # noinspection PyProtectedMember
            self.section._on_remove_sub_section(self.sub_section_def, old_value)

    def has_duplicated_key(self) -> bool:
        """
        Check if each section has a unique key.
        The key is from `.m_key` or the index of the section.
        """
        unique_keys: set = set()
        for index, section in enumerate(self):
            if section is not None:
                if section.m_key in unique_keys:
                    return True
                unique_keys.add(section.m_key)

        return False


class Annotation:
    """Base class for annotations."""

    def m_to_dict(self):
        """
        Returns a JSON serializable representation that is used for exporting the
        annotation to JSON.
        """
        return str(self.__class__.__name__)


class DefinitionAnnotation(Annotation):
    """Base class for annotations for definitions."""

    def __init__(self):
        self.definition = None

    def init_annotation(self, definition):
        self.definition = definition


class SectionAnnotation(DefinitionAnnotation):
    """
    Special annotation class for section definition that allows to auto add annotations
    to section instances.
    """

    def new(self, section) -> dict[str, Any]:
        return {}


def to_dict(entries):
    if isinstance(entries, list):
        return [to_dict(entry) for entry in entries]

    # noinspection PyBroadException
    try:
        entries = entries.m_to_dict()
    except Exception:
        pass

    return entries


def convert_to(from_magnitude, from_unit: ureg.Unit | None, to_unit: ureg.Unit | None):
    """
    Convert a magnitude from one unit to another.

    Arguments:
        from_magnitude: the magnitude to be converted
        from_unit: the unit of the magnitude
        to_unit: the unit to convert to

    Return:
        the converted magnitude
    """

    if to_unit is None:
        return from_magnitude

    from_quantity: ureg.Quantity = from_magnitude * from_unit

    return from_quantity.to(to_unit).m


def __similarity_match(candidates: list, name: str):
    """
    Use similarity to find the best match for a name.
    """
    similarity: list = [
        SequenceMatcher(None, v.name.upper(), name.upper()).ratio() for v in candidates
    ]

    return candidates[similarity.index(max(similarity))]


def resolve_variadic_name(definitions: dict, name: str, hint: str | None = None):
    """
    For properties with variadic names, it is necessary to check all possible definitions
    in the schema to find the unique and correct definition that matches the naming pattern.

    In the schema defines a property with the name 'FOO_bar', implying the prefix 'FOO' is
    merely a placeholder, the actual name in the data can be anything, such as 'a_bar' or 'b_bar'.

    This method checks each definition name by replacing the placeholder with '.*' and then check if
    the property name matches the pattern. If it does, it returns the corresponding definition.

    For example, the definition name 'FOO_bar' will be replaced by '.*_bar', which further matches
    'a_bar', 'aa_bar', etc.

    In case of multiple quantities with identical template/variadic patterns, the following strategy
    is used:
        1. Check all quantities and collect all qualified quantities that match the naming pattern
            in a candidate list.
        2. Use the optionally provided hint string, which shall be one of attribute names of the desired
            quantity. Check all candidates if this attribute exists. The existence of a hint attribute
            prioritize this quantity, and it will be put into a prioritized list.
        3. If the prioritized candidate list contains multiple matches, use name similarity determine
            which to be used.
        4. If no hint is provided, or no candidate has the hint attribute, check all quantities in the
            first candidate list and use name similarity to determine which to be used.

    """

    # check the exact name match
    if name in definitions:
        return definitions[name]

    # check naming pattern match
    candidates: list = []
    for definition in set(definitions.values()):
        if not definition.variable:
            continue

        name_pattern = re.sub(
            r'^([a-z0-9_]*)[A-Z0-9]+([a-z0-9_]*)$', r'\1[a-z0-9]+\2', definition.name
        )
        if re.match(name_pattern, name):
            candidates.append(definition)

    if len(candidates) == 0:
        raise ValueError(f'Cannot find a proper definition for name "{name}".')

    if len(candidates) == 1:
        return candidates[0]

    hinted_candidates: list = []
    if hint is not None:
        for definition in candidates:
            try:
                if resolve_variadic_name(definition.all_attributes, hint):
                    hinted_candidates.append(definition)
            except ValueError:
                pass

    if len(hinted_candidates) == 1:
        return hinted_candidates[0]

    # multiple matches, check similarity
    if len(hinted_candidates) > 1:
        return __similarity_match(hinted_candidates, name)

    return __similarity_match(candidates, name)


def validate_allowable_unit(
    dimensionality: str | None,
    allowable_list: str | list | pint.Unit | pint.Quantity,
) -> bool:
    """
    For a given list of units, e.g., ['m', 'cm', 'mm'], and a target NX unit token such as 'NX_LENGTH',
    this function checks the compatibility of the target unit with the list of units.

    Returns:
        True if ALL units are compatible with the unit token (dimensionality).
        False if at least one unit cannot be represented by the unit token (dimensionality).
    """
    if not dimensionality:
        return True

    if isinstance(allowable_list, str):
        if dimensionality in ('1', 'dimensionless'):
            return ureg.Quantity(1, allowable_list).dimensionless

        try:
            return ureg.Quantity(1, allowable_list).check(dimensionality)
        except KeyError:
            return False

    if isinstance(allowable_list, (pint.Unit, pint.Quantity)):
        if dimensionality in ('1', 'dimensionless'):
            return allowable_list.dimensionless

        return allowable_list.dimensionality == dimensionality

    for unit in allowable_list:
        if not validate_allowable_unit(dimensionality, unit):
            return False

    return True


def default_hash():
    """
    Returns a hash object using the designated hash algorithm.
    """
    return hashlib.new(__hash_method)


def split_python_definition(definition_with_id: str) -> tuple[list, str | None]:
    """
    Split a Python type name into names and an optional id.

    Example:
        my_package.my_section@my_id  ==> (['my_package', 'my_section'], 'my_id')

        my_package.my_section       ==> (['my_package', 'my_section'], None)

        my_package/section_definitions/0 ==> (['my_package', 'section_definitions/0'], None)
    """

    def __split(name: str):
        # The definition name must contain at least one dot which comes from the module name.
        # The actual definition could be either a path (e.g., my_package/section_definitions/0)
        # or a name (e.g., my_section).
        # If it is a path (e.g., a.b.c/section_definitions/0), after split at '.', the last segment
        # (c/section_definitions/0) contains the package name (c). It needs to be relocated.
        segments: list = name.split('.')
        if '/' in segments[-1]:
            segments.extend(segments.pop().split('/', 1))
        return segments

    if '@' not in definition_with_id:
        return __split(definition_with_id), None

    definition_names, definition_id = definition_with_id.split('@')
    return __split(definition_names), definition_id


def dict_to_named_list(data) -> list:
    if not isinstance(data, dict):
        return data

    results: list = []
    for key, value in data.items():
        if value is None:
            value = {}
        value.update(dict(name=key))
        results.append(value)
    return results


def camel_case_to_snake_case(obj: dict):
    for k, v in list(obj.items()):
        if k != k.lower() and k != k.upper() and '_' not in k:
            snake_case_key = re.sub(r'(?<!^)(?=[A-Z])', '_', k).lower()
            obj[snake_case_key] = v
            del obj[k]
            k = snake_case_key
        if isinstance(v, dict):
            obj[k] = camel_case_to_snake_case(v)
        if isinstance(v, list):
            for i, item in enumerate(v):
                if isinstance(item, dict):
                    obj[k][i] = camel_case_to_snake_case(item)
    return obj
