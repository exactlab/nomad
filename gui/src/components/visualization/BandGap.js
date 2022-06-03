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
import React, { } from 'react'
import PropTypes from 'prop-types'
import { SectionTable } from '../Quantity'
import { useUnits } from '../../units'
import NoData from './NoData'
import Placeholder from './Placeholder'

// Band gap quantities to show. Saved as const object to prevent re-renders
const columns = {
  index: {label: 'Ch.', align: 'left'},
  value: {label: 'Value'},
  type: {label: 'Type', placeholder: '-'}
}

/**
 * Shows a summary of all band gap values, each displayed in a separate row of a
 * table.
 */
const BandGap = React.memo(({data, section}) => {
  const units = useUnits()
  return data !== false
    ? data
      ? <SectionTable
        horizontal
        section={section || 'results.properties.electronic.band_structure_electronic.band_gap'}
        quantities={columns}
        data={{data: data}}
        units={units}
      />
      : <Placeholder />
    : <NoData />
})

BandGap.propTypes = {
  data: PropTypes.any,
  section: PropTypes.string
}

export default BandGap
