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
import { PropertyCard } from './PropertyCard'
import OptoelectronicProperties from '../../visualization/OptoelectronicProperties'

const OptoelectronicPropertiesCard = React.memo(({index, properties, archive}) => {
  // Find out which properties are present
  const hasBg = properties.has('band_gap_optical')
  const hasSc = properties.has('solar_cell')

  // Do not show the card if none of the properties are available
  if (!hasBg && !hasSc) {
    return null
  }

  // Resolve band gap data
  let bandGap = index?.results?.properties?.optoelectronic?.band_gap_optical || false

  // Resolve solar cell data
  let solarCell = index?.results?.properties?.optoelectronic?.solar_cell || false

  return <PropertyCard title="Optoelectronic properties">
    <OptoelectronicProperties bandGap={bandGap} solarCell={solarCell}/>
  </PropertyCard>
})

OptoelectronicPropertiesCard.propTypes = {
  index: PropTypes.object.isRequired,
  properties: PropTypes.object.isRequired,
  archive: PropTypes.object
}

export default OptoelectronicPropertiesCard
