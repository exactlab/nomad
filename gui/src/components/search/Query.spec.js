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
import { defaultApp } from '../../defaultApp'
import { render, screen } from '../conftest.spec'
import QueryChips from './Query'
import { SearchContext } from './SearchContext'

test.each([
  ['integer', 'results.material.n_elements', 12, 'N elements', '12'],
  ['string', 'results.material.symmetry.crystal_system', 'cubic', 'Crystal system', 'cubic'],
  ['float', 'results.properties.electronic.band_gap.value', '12.3 eV', 'Value', '12.3 eV'],
  ['datetime', 'upload_create_time', 0, 'Upload create time', '01/01/1970'],
  ['boolean', 'results.properties.electronic.dos_electronic.spin_polarized', 'false', 'Spin-polarized', 'false']
])('%s', async (name, quantity, input, title, output) => {
  render(
    <SearchContext
        resource={defaultApp.resource}
        initialPagination={defaultApp.pagination}
        initialColumns={defaultApp.columns}
        initialRows={defaultApp.rows}
        initialMenu={defaultApp?.menu}
        initialFiltersLocked={defaultApp.filters_locked}
        initialDashboard={defaultApp?.dashboard}
        initialFilterValues={{[quantity]: input}}
        initialSearchSyntaxes={defaultApp?.search_syntaxes}
    >
      <QueryChips/>
    </SearchContext>
  )
  expect(screen.getByText(title, {exact: false})).toBeInTheDocument()
  expect(screen.getByText(output)).toBeInTheDocument()
})
