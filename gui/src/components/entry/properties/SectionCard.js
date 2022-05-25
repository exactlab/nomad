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
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {PropertyCard} from './PropertyCard'
import SectionEditor from '../../archive/SectionEditor'
import { useEntryContext } from '../EntryContext'
import { Box, IconButton, Typography } from '@material-ui/core'
import CodeIcon from '@material-ui/icons/Code'
import MoreIcon from '@material-ui/icons/MoreVert'
import { ArchiveButton } from '../../nav/Routes'
import {SectionPlots} from '../../archive/ArchiveBrowser'

const SectionCard = React.memo(({archivePath, sectionDef, section, ...props}) => {
  const {entryId, uploadId, requireArchive} = useEntryContext()
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    requireArchive()
  }, [requireArchive])

  const actions = <React.Fragment>
    <IconButton onClick={() => setShowJson(value => !value)}>
      <CodeIcon />
    </IconButton>
    <ArchiveButton
      component={IconButton}
      entryId={entryId} uploadId={uploadId}
      path={archivePath}
    >
      <MoreIcon/>
    </ArchiveButton>
  </React.Fragment>

  if (!sectionDef) {
    console.error('SectionCard: section definition is not available')
    return ''
  }

  return <PropertyCard title={sectionDef.name} action={actions}>
    {sectionDef._qualifiedName === 'nomad.parsing.tabular.Table' && (
      <Box margin={2}>
        <Typography>Data from a table with {section.row_refs?.length || '...'} rows.</Typography>
      </Box>
    )}
    <Box margin={2}>
      <SectionEditor
        sectionDef={sectionDef}
        section={section}
        showJson={showJson}
        {...props}
      />
      {sectionDef.m_annotations?.plot && <SectionPlots sectionDef={sectionDef} section={section}/>}
    </Box>
  </PropertyCard>
})

SectionCard.propTypes = {
  archivePath: PropTypes.string.isRequired,
  sectionDef: PropTypes.object.isRequired,
  section: PropTypes.object.isRequired
}

export default SectionCard
