/*
 * Copyright The NOMAD Authors.
 *
 * This file is part of NOMAD. See https://nomad-lab.eu for further info.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'
import DetailsIcon from '@material-ui/icons/MoreHoriz'
import { encyclopediaEnabled } from '../../../config'
import { MaterialButton } from '../../nav/Routes'
import {
  addColumnDefaults,
  Datatable, DatatableLoadMorePagination, DatatableTable,
  DatatableToolbar } from '../../datatable/Datatable'

const columns = [
  {key: 'chemical_formula_hill', label: 'Formula', align: 'left'},
  {key: 'structural_type'},
  {key: 'symmetry.structure_name'},
  {key: 'symmetry.crystal_system'},
  {key: 'symmetry.space_group_symbol'},
  {key: 'symmetry.space_group_number'},
  {key: 'material_id', align: 'left'}
]

addColumnDefaults(columns)

const defaultSelectedColumns = [
  'chemical_formula_hill',
  'structural_type',
  'symmetry.structure_name',
  'symmetry.space_group_number',
  'symmetry.crystal_system',
  'material_id']

const VisitMaterialAction = React.memo(function VisitMaterialAction({data}) {
  return <MaterialButton
    materialId={data.material_id}
    component={IconButton}
  >
    <DetailsIcon/>
  </MaterialButton>
})
VisitMaterialAction.propTypes = {
  data: PropTypes.object.isRequired
}

/**
 * Displays the list of search results for materials.
 */
const SearchResultsMaterials = React.memo(function SearchResultsMaterials(props) {
  const {pagination} = props

  return <Datatable
    columns={columns} shownColumns={defaultSelectedColumns} {...props}
  >
    <DatatableToolbar title={`${pagination.total} search results`} />
    <DatatableTable actions={encyclopediaEnabled && VisitMaterialAction}>
      <DatatableLoadMorePagination color="primary">load more</DatatableLoadMorePagination>
    </DatatableTable>
  </Datatable>
})
SearchResultsMaterials.propTypes = {
  pagination: PropTypes.object.isRequired
}

export default SearchResultsMaterials
