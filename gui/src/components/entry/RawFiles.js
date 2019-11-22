import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, FormGroup, FormControlLabel, Checkbox, FormLabel, IconButton, Divider, Typography, Tooltip } from '@material-ui/core'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import { withApi } from '../api'
import { compose } from 'recompose'
import Download from './Download'
import ReloadIcon from '@material-ui/icons/Cached'

class RawFiles extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    uploadId: PropTypes.string.isRequired,
    calcId: PropTypes.string.isRequired,
    data: PropTypes.object,
    api: PropTypes.object.isRequired,
    user: PropTypes.object,
    loading: PropTypes.number.isRequired,
    raiseError: PropTypes.func.isRequired
  }

  static styles = theme => ({
    root: {},
    formLabel: {
      padding: theme.spacing.unit * 2
    }
  })

  static defaultState = {
    selectedFiles: [],
    files: null,
    doesNotExist: false
  }

  state = {...RawFiles.defaultState}

  componentDidUpdate(prevProps) {
    if (prevProps.api !== this.props.api ||
        prevProps.uploadId !== this.props.uploadId ||
        prevProps.calcId !== this.props.calcId) {
      this.setState({...RawFiles.defaultState})
    }
  }

  update() {
    const { uploadId, calcId } = this.props
    // this might accidentally happen, when the user logs out and the ids aren't
    // necessarily available anymore, but the component is still mounted
    if (!uploadId || !calcId) {
      return
    }

    this.props.api.getRawFileListFromCalc(uploadId, calcId).then(data => {
      const files = data.contents.map(file => `${data.directory}/${file.name}`)
      this.setState({files: files})
    }).catch(error => {
      this.setState({files: null})
      if (error.name === 'DoesNotExist') {
        this.setState({doesNotExist: true})
      } else {
        this.props.raiseError(error)
      }
    })
  }

  label(file) {
    return file.split('/').reverse()[0]
  }

  onSelectFile(file) {
    const {selectedFiles} = this.state
    const index = selectedFiles.indexOf(file)
    if (index === -1) {
      this.setState({selectedFiles: [file, ...selectedFiles]})
    } else {
      selectedFiles.splice(index, 1)
      this.setState({selectedFiles: selectedFiles})
    }
  }

  render() {
    const {classes, uploadId, calcId, loading, data} = this.props
    const {selectedFiles, files, doesNotExist} = this.state

    const availableFiles = files || data.files || []

    const someSelected = selectedFiles.length > 0
    const allSelected = availableFiles.length === selectedFiles.length && someSelected

    if (doesNotExist) {
      return <Typography>
        The uploaded raw files for this entry do not exist. This is most likely a NOMAD
        issue. Please inform us, if this error persists.
      </Typography>
    }

    return (
      <div className={classes.root}>
        <FormGroup row>
          <FormControlLabel
            label="select all" style={{flexGrow: 1}}
            control={
              <Checkbox value="select_all" checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={() => this.setState({selectedFiles: allSelected ? [] : availableFiles.slice()})}
              />
            }
          />
          {!files
            ? <Tooltip title="check for more files">
              <IconButton onClick={() => this.update()}>
                <ReloadIcon />
              </IconButton>
            </Tooltip> : ''
          }
          <FormLabel className={classes.formLabel}>
            {selectedFiles.length}/{availableFiles.length} files selected
          </FormLabel>
          <Download component={IconButton} disabled={selectedFiles.length === 0}
            tooltip="download selected files"
            url={(selectedFiles.length === 1) ? `raw/${uploadId}/${selectedFiles[0]}` : `raw/${uploadId}?files=${encodeURIComponent(selectedFiles.join(','))}&strip=true`}
            fileName={selectedFiles.length === 1 ? this.label(selectedFiles[0]) : `${calcId}.zip`}
          >
            <DownloadIcon />
          </Download>
        </FormGroup>
        <Divider />
        <FormGroup row>
          {availableFiles.map((file, index) => (
            <FormControlLabel key={index} label={this.label(file)}
              control={
                <Checkbox
                  disabled={loading > 0}
                  checked={selectedFiles.indexOf(file) !== -1}
                  onChange={() => this.onSelectFile(file)} value={file}
                />
              }
            />
          ))}
        </FormGroup>
      </div>
    )
  }
}

export default compose(withApi(false, true), withStyles(RawFiles.styles))(RawFiles)
