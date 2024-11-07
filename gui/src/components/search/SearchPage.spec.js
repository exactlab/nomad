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

import React, { useMemo } from 'react'
import { render, screen } from '../conftest.spec'
import { expectMenu, expectSearchResults } from './conftest.spec'
import { defaultApp } from '../../defaultApp'
import { SearchContext } from './SearchContext'
import SearchPage from './SearchPage'

// We set an initial mock for the SearchContext module
const mockSetFilter = jest.fn()
const mockUseMemo = useMemo
jest.mock('./SearchContext', () => ({
    ...jest.requireActual('./SearchContext'),
    useSearchContext: () => ({
      ...jest.requireActual('./SearchContext').useSearchContext(),
      useAgg: (quantity, visible, id, config) => {
        const response = mockUseMemo(() => {
          return undefined
        }, [])
        return response
      },
      useFilterState: jest.fn((quantity) => {
        const response = mockUseMemo(() => {
          return [undefined, mockSetFilter]
        }, [])
        return response
      }),
      useResults: jest.fn((quantity) => {
        const response = mockUseMemo(() => {
          return {data: [{}], pagination: {total: 1}}
        }, [])
        return response
      })
    })
}))

describe('', () => {
  test('render search page components', async () => {
    render(
      <SearchContext
          resource={defaultApp.resource}
          initialPagination={defaultApp.pagination}
          initialColumns={defaultApp.columns}
          initialRows={defaultApp.rows}
          initialMenu={defaultApp.menu}
          initialFiltersLocked={defaultApp.filters_locked}
          initialDashboard={defaultApp?.dashboard}
          initialSearchSyntaxes={defaultApp?.search_syntaxes}
          id={defaultApp?.path}
      >
        <SearchPage />
      </SearchContext>
    )
    // Test that menu is shown
    await expectMenu(defaultApp.menu)

    // Test that search bar is shown
    screen.getByPlaceholderText('Type your query or keyword here')

    // Test that query is shown
    screen.getByText('Your query will be shown here')

    // Test that results table is shown
    await expectSearchResults(defaultApp.columns)
  })
})
