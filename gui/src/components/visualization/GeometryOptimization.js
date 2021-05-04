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
import React, { useState, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  useTheme
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Plot from '../visualization/Plot'
import { ErrorHandler, withErrorHandler } from '../ErrorHandler'
import { diffTotal, convertSI, convertSILabel } from '../../utils'

const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: 'flex',
      width: '100%'
    },
    energies: {
      flex: '1 1 66.6%'
    },
    structure: {
      flex: '1 1 33.3%'
    }
  }
})

function GeometryOptimization({data, className, classes, units}) {
  const [finalData, setFinalData] = useState(data)
  const style = useStyles(classes)
  const theme = useTheme()

  // Side effect that runs when the data that is displayed should change. By
  // running all this heavy stuff within useEffect (instead of e.g. useMemo),
  // the first render containing the placeholders etc. can be done as fast as
  // possible.
  useEffect(() => {
    if (!data) {
      return
    }

    // Convert energies into the correct units and calculate the total difference
    let energyDiffTotal = diffTotal(data.energies)
    energyDiffTotal = convertSI(energyDiffTotal, 'joule', units, false)

    let steps = [...Array(data.energies.length).keys()]
    const energyDiff = []
    for (let i = 0; i < energyDiffTotal.length - 1; ++i) {
      energyDiff.push(Math.abs(energyDiffTotal[i + 1] - energyDiffTotal[i]))
    }
    const traces = [
      {
        x: steps,
        y: energyDiffTotal,
        name: 'Total change',
        type: 'scatter',
        showlegend: false,
        line: {
          color: theme.palette.primary.main,
          width: 2
        }
      },
      {
        x: steps.slice(1, steps.length),
        y: energyDiff,
        yaxis: 'y2',
        name: 'Abs. change per step',
        type: 'scatter',
        showlegend: false,
        line: {
          color: theme.palette.secondary.main,
          width: 2
        }
      }
    ]
    if (data?.energy_change_criteria) {
      traces.push({
        x: [steps[0], steps[steps.length - 1]],
        y: [data?.energy_change_criteria, data?.energy_change_criteria],
        yaxis: 'y2',
        name: 'Convergence criteria',
        showlegend: true,
        type: 'line',
        mode: 'lines',
        line: {
          color: theme.palette.secondary.main,
          width: 1,
          dash: '10px,10px'
        }
      })
    }
    setFinalData(traces)
  }, [data, units, theme])

  const plotLayout = useMemo(() => {
    if (!data) {
      return null
    }
    return {
      margin: {
        l: 30,
        r: 80,
        t: 20,
        b: 50
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        xanchor: 'left'
      },
      xaxis: {
        showexponent: 'first',
        title: {
          text: 'Step number'
        },
        tickmode: 'auto',
        tickformat: ',d',
        autorange: false,
        range: [0, data.energies.length - 1],
        zeroline: false,
        showspikes: true,
        spikethickness: 2,
        spikedash: 'dot',
        spikecolor: '#999999',
        spikemode: 'across' },
      yaxis: {
        title: {
          text: `Total change (${convertSILabel('joule', units)})`
        },
        tickfont: {
          color: theme.palette.primary.dark
        },
        autorange: true,
        zeroline: false
      },
      yaxis2: {
        title: {
          text: `Abs. change per step (${convertSILabel('joule', units)})`
        },
        tickfont: {
          color: theme.palette.secondary.dark
        },
        type: 'log',
        autorange: true,
        zeroline: false,
        overlaying: 'y',
        side: 'right'
      }
    }
  }, [data, theme, units])

  return (
    <Box className={style.root}>
      <Box className={style.energies}>
        <Typography variant="subtitle1" align='center'>Energy convergence</Typography>
        <ErrorHandler message='Could not load energies.'>
          <Plot
            data={finalData}
            layout={plotLayout}
            aspectRatio={2}
            floatTitle="Energy convergence"
          >
          </Plot>
        </ErrorHandler>
      </Box>
    </Box>
  )
}

GeometryOptimization.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.bool, // Set to False to show NoData component
    PropTypes.shape({
      energies: PropTypes.array.isRequired, // Energies in SI units
      energy_change_criteria: PropTypes.number // Energy change criteria in SI units
    })
  ]),
  className: PropTypes.string,
  classes: PropTypes.object,
  units: PropTypes.object // Contains the unit configuration
}

export default withErrorHandler(GeometryOptimization, 'Could not load geometry optimization data.')
