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
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography
} from '@material-ui/core'
import DOS from './DOS'
import BandStructure from './BandStructure'
import BrillouinZone from './BrillouinZone'
import { RecoilRoot } from 'recoil'
import { unitsState } from '../archive/ArchiveBrowser'
import { makeStyles } from '@material-ui/core/styles'

function ElectronicStructureOverview({data, range, className, classes, raiseError}) {
  const [dosLayout, setDosLayout] = useState({
    autorange: false,
    yaxis: {range: range}
  })
  const [bsLayout, setBsLayout] = useState({
    autorange: false,
    yaxis: {range: range}
  })

  // Styles
  const useStyles = makeStyles((theme) => {
    return {
      row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flexWrap: 'wrap'
      },
      bz: {
        flex: '0 0 66.6%'
      },
      bs: {
        flex: '0 0 66.6%'
      },
      dos: {
        flex: '0 0 33.3%'
      }
    }
  })
  const style = useStyles(classes)

  // Synchronize panning between BS/DOS plots
  const handleBSRelayouting = useCallback((event) => {
    if (data.dos) {
      let update = {
        yaxis: {
          autorange: false,
          range: [event['yaxis.range[0]'], event['yaxis.range[1]']]
        }
      }
      setDosLayout(update)
    }
  }, [data])
  const handleDOSRelayouting = useCallback((event) => {
    if (data.bs) {
      let update = {
        yaxis: {
          autorange: false,
          range: [event['yaxis.range[0]'], event['yaxis.range[1]']]
        }
      }
      setBsLayout(update)
    }
  }, [data])

  return (
    <RecoilRoot>
      <Box className={style.row}>
        {data.bs
          ? <Box className={style.bs}>
            <Typography variant="subtitle1" align='center'>Band structure</Typography>
            <BandStructure
              data={data?.bs?.section_k_band}
              layout={bsLayout}
              aspectRatio={1.2}
              unitsState={unitsState}
              onRelayouting={handleBSRelayouting}
              onReset={() => { setDosLayout({yaxis: {range: range}}) }}
            ></BandStructure>
          </Box>
          : null
        }
        {data.dos
          ? <Box className={style.dos}>
            <Typography variant="subtitle1" align='center'>Density of states</Typography>
            <DOS
              data={data.dos.section_dos}
              layout={dosLayout}
              aspectRatio={0.6}
              onRelayouting={handleDOSRelayouting}
              onReset={() => { setBsLayout({yaxis: {range: range}}) }}
              unitsState={unitsState}
            ></DOS>
          </Box>
          : null
        }
        {data.bs
          ? <Box className={style.bz}>
            <Typography variant="subtitle1" align='center'>Brillouin zone</Typography>
            <BrillouinZone
              data={data.bs.section_k_band}
              aspectRatio={1.2}
            ></BrillouinZone>
          </Box>
          : null
        }
      </Box>
    </RecoilRoot>
  )
}

ElectronicStructureOverview.propTypes = {
  data: PropTypes.object,
  range: PropTypes.array,
  className: PropTypes.string,
  classes: PropTypes.object,
  raiseError: PropTypes.func
}
ElectronicStructureOverview.defaultProps = {
  range: [-10, 20]
}

export default ElectronicStructureOverview
