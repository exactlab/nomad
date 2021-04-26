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
import clsx from 'clsx'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ViewColumnIcon from '@material-ui/icons/ViewColumn'
import { Popover, List, ListItemText, ListItem, Collapse, Icon, Box } from '@material-ui/core'
import { compose } from 'recompose'
import _ from 'lodash'
import { normalizeDisplayValue } from '../config'
import SortIcon from '@material-ui/icons/Sort'
import searchQuantities from '../searchQuantities'

const globalSelectedColumns = {}

class DataTableToolbarUnStyled extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    selectedColumns: PropTypes.arrayOf(PropTypes.string),
    onColumnsChanged: PropTypes.func,
    selectActions: PropTypes.element,
    columns: PropTypes.object.isRequired,
    actions: PropTypes.element,
    title: PropTypes.string
  }

  static styles = theme => ({
    root: {
      paddingLeft: theme.spacing(3)
    },
    selected: {
      color: theme.palette.secondary.main
    },
    title: {
      whiteSpace: 'nowrap',
      marginRight: theme.spacing(1)
    },
    grow: {
      flex: '1 1 100%'
    }
  })

  state = {
    anchorEl: null
  }

  handleClick = event => {
    this.setState({
      anchorEl: event.currentTarget
    })
  }

  handleClose = () => {
    this.setState({
      anchorEl: null
    })
  }

  handleToggle = (value) => {
    const { onColumnsChanged, selectedColumns } = this.props
    const currentIndex = selectedColumns.indexOf(value)
    const newColumns = [...selectedColumns]

    if (currentIndex === -1) {
      newColumns.push(value)
    } else {
      newColumns.splice(currentIndex, 1)
    }

    if (onColumnsChanged) {
      onColumnsChanged(newColumns)
    }
  }

  render() {
    const { classes, numSelected, selectedColumns, selectActions, actions, columns, title } = this.props
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)

    const regularActions = <React.Fragment>
      {actions || <React.Fragment/>}
      <Tooltip title="Change displayed columns">
        <IconButton onClick={this.handleClick}>
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={this.handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <List>
          {Object.keys(columns).map(key => {
            const column = columns[key]
            return (
              <ListItem key={key} role={undefined} dense button onClick={() => this.handleToggle(key)}>
                <Checkbox
                  checked={selectedColumns.indexOf(key) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={column.label} />
              </ListItem>
            )
          })}
        </List>
      </Popover>
    </React.Fragment>

    if (numSelected > 0) {
      return (
        <Toolbar className={clsx(classes.root, {[classes.selected]: true})} >
          <Typography className={classes.title} color="inherit" variant="h6">
            {numSelected.toLocaleString()} selected:
          </Typography>
          {selectActions}
          <span className={classes.grow} />
          {regularActions}
        </Toolbar>
      )
    } else {
      return (
        <Toolbar className={classes.root}>
          <Typography className={classes.title} variant="h6" id="tableTitle">
            {title || ''}
          </Typography>
          <span className={classes.grow} />
          {regularActions}
        </Toolbar>
      )
    }
  }
}

const DataTableToolbar = withStyles(DataTableToolbarUnStyled.styles)(DataTableToolbarUnStyled)

class DataTableUnStyled extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    /**
     * The table data as an array
     */
    data: PropTypes.array,
    /**
     *  The total amount of entries including pagination, i.e. beyond what is displayed in the table
     */
    total: PropTypes.number,
    /**
     * Specification of all columns. Keys have to match data keys. Each column has to
     * define a label. Columns can define description, render function. Columns are
     * always given in the order of this.
     */
    columns: PropTypes.object.isRequired,
    /**
     * The set of columns initially shown as an array of column keys.
     */
    selectedColumns: PropTypes.arrayOf(PropTypes.string),
    /**
     * If this key is given, it is used to globaly store user modifications to the selected
     * columns under this key.
     */
    selectedColumnsKey: PropTypes.string,
    /**
     * Single element that is rendered to display actions for the selection. With no
     * select actions, no selection will be shown.
     */
    selectActions: PropTypes.element,
    /**
     * Single element that is rendered to display actions on the overall table.
     */
    actions: PropTypes.element,
    /**
     * A render function that gets the row data as prop data. Should render actions for
     * a single row.
     */
    entryActions: PropTypes.func,
    /**
     * A render function that shows row details in an accordion.
     */
    entryDetails: PropTypes.func,
    /**
     * A singlular and plural label for the shown entities
     */
    entityLabels: PropTypes.arrayOf(PropTypes.string),
    /**
     * Single element that is rendered to display possible pagination
     */
    pagination: PropTypes.element,
    /**
     * Function that returns an id for a given row data item.
     */
    id: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']),
    orderBy: PropTypes.string,
    /**
     * The current selection. If null/undefined all elements will be selected.
     */
    selected: PropTypes.arrayOf(PropTypes.string),
    /**
     * Is called when the current set of selected entries is changed. Will be
     * an array of ids. Is empty array for empty selection, and null for select all.
     */
    onSelectionChanged: PropTypes.func,
    /**
     * Called with a column that supports sorting was clicked. Get two arguments
     * the order (asc|desc) and the column key.
     */
    onOrderChanged: PropTypes.func,
    /**
     * If no entryDetails are given. This will be called, when an entry was clicked.
     */
    onEntryClicked: PropTypes.func,
    rows: PropTypes.number
  }

  static styles = (theme => ({
    table: {
      width: '100%'
      // tableLayout: 'fixed'
    },
    checkboxCell: {
      width: 64
    },
    actionsCell: {
      textAlign: 'right',
      width: 1,
      whiteSpace: 'nowrap'
    },
    cell: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: 200,
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      height: theme.spacing(6)
    },
    ellipsisFront: {
      direction: 'rtl',
      textAlign: 'left'
    },
    clickable: {
      cursor: 'pointer'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1
    },
    details: {
      borderBottom: '1px solid rgba(224, 224, 224, 1)'
    },
    selectedEntryCell: {
      color: theme.palette.primary.contrastText,
      fontWeight: 700
    },
    selectedEntryButton: {
      color: theme.palette.primary.contrastText
    },
    selectedEntryRow: {
      backgroundColor: `${theme.palette.primary.main} !important`
    },
    selectedEntryCheckbox: {
      color: `${theme.palette.primary.contrastText} !important`
    }
  }))

  constructor(props) {
    super(props)
    this.handleSelectAllClick = this.handleSelectAllClick.bind(this)
    this.handleSelectedColumnsChanged = this.handleSelectedColumnsChanged.bind(this)
  }

  defaultSelectedColumns() {
    let selectedColumns = this.props.selectedColumns || Object.keys(this.props.columns)
    if (this.props.selectedColumnsKey) {
      selectedColumns = globalSelectedColumns[this.props.selectedColumnsKey] || selectedColumns
    }
    return selectedColumns
  }

  state = {
    selectedEntry: null,
    selectedColumns: null
  }

  handleRequestSort(event, property) {
    const { orderBy, order, onOrderChanged } = this.props
    const isDesc = orderBy === property && order === 'desc'
    if (onOrderChanged) {
      onOrderChanged(isDesc ? 'asc' : 'desc', property)
    }
  }

  handleSelectAllClick(event) {
    const { onSelectionChanged } = this.props
    if (onSelectionChanged) {
      if (event.target.checked) {
        onSelectionChanged(null)
      } else {
        onSelectionChanged([])
      }
    }
  }

  handleSelect(event, rowId) {
    event.stopPropagation()
    let { selected, onSelectionChanged } = this.props

    if (!selected) {
      selected = [...this.props.data.map(this.props.id)]
    }
    if (onSelectionChanged) {
      const selectedIndex = selected.indexOf(rowId)
      let newSelected = []

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, rowId)
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1))
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1))
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        )
      }
      onSelectionChanged(newSelected)
    }
  }

  handleClick(event, rowId) {
    if (this.props.entryDetails) {
      if (this.state.selectedEntry === rowId) {
        this.setState({selectedEntry: null})
      } else {
        this.setState({selectedEntry: rowId})
      }
    } else if (this.props.onEntryClicked) {
      this.props.onEntryClicked(rowId)
    }
  }

  handleSelectedColumnsChanged(columns) {
    if (this.props.selectedColumnsKey) {
      globalSelectedColumns[this.props.selectedColumnsKey] = columns
    }
    this.setState({selectedColumns: columns})
  }

  renderDetails(row) {
    const { classes, entryDetails, id, entryActions } = this.props
    const { selectedEntry } = this.state
    const selectedColumns = this.state.selectedColumns || this.defaultSelectedColumns()
    if (entryDetails) {
      return (
        <tr>
          <td colSpan={selectedColumns.length + 1 + (entryActions ? 1 : 0)} style={{padding: 0}}>
            <Collapse
              in={selectedEntry === id(row)} timeout="auto"
              mountOnEnter unmountOnExit
            >
              <div className={classes.details}>
                {entryDetails(row)}
              </div>
            </Collapse>
          </td>
        </tr>
      )
    } else {
      return <React.Fragment/>
    }
  }

  render() {
    const {
      classes, data, total, order, orderBy, id, rows, selectActions, actions,
      entryDetails, entryActions, columns, entityLabels, pagination } = this.props
    const { selectedEntry } = this.state
    const selectedColumns = this.state.selectedColumns || this.defaultSelectedColumns()

    const totalNumber = total || 0

    const isSelected = row => (!selected) || selected.indexOf(id(row)) !== -1

    const emptyRows = rows - Math.min(rows, data.length)
    const withSelect = Boolean(selectActions)

    let selected = this.props.selected
    if (!withSelect) {
      selected = []
    }

    let title = 'loading ...'
    if (total !== undefined) {
      title = `${totalNumber.toLocaleString()} ${totalNumber === 1 ? entityLabels[0] : entityLabels[1]}`
    }

    return (
      <div>
        <DataTableToolbar
          title={title}
          columns={columns}
          numSelected={selected ? selected.length : totalNumber}
          selectedColumns={selectedColumns}
          selectActions={selectActions}
          actions={actions}
          onColumnsChanged={this.handleSelectedColumnsChanged}
        />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                {withSelect ? <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected && selected.length > 0 && selected.length !== totalNumber}
                    checked={!selected || (selected.length === totalNumber && totalNumber !== 0)}
                    disabled={totalNumber === 0}
                    onChange={this.handleSelectAllClick}
                  />
                </TableCell> : <React.Fragment/>}
                {Object.keys(columns).filter(key => selectedColumns.indexOf(key) !== -1).map(key => {
                  const column = columns[key]
                  const description = column.description || (searchQuantities[key] && searchQuantities[key].description)
                  return (
                    <TableCell
                      key={key}
                      className={classes.cell}
                      align={column.align || 'left'}
                      sortDirection={orderBy === key ? order : false}
                    >
                      <Tooltip title={description || ''}>
                        {column.supportsSort ? <TableSortLabel
                          active={orderBy === key}
                          hideSortIcon
                          direction={order}
                          onClick={event => this.handleRequestSort(event, key)}
                        >
                          {column.label}
                          <Box paddingLeft={1} fontSize="1rem">
                            {orderBy !== key && <Icon fontSize="small"><SortIcon style={{fontSize: '1rem'}}/></Icon>}
                          </Box>
                          {orderBy === key ? (
                            <span className={classes.visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </span>
                          ) : null}
                        </TableSortLabel> : <span>{column.label}</span>}
                      </Tooltip>
                    </TableCell>
                  )
                })}
                {entryActions && <TableCell className={classes.actionsCell}/>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
                const isItemSelected = isSelected(row)
                const rowId = id(row)
                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      hover
                      onClick={event => this.handleClick(event, rowId)}
                      tabIndex={-1}
                      selected={isItemSelected}
                      className={clsx([Boolean(entryDetails) && classes.clickable, (selectedEntry === rowId) && classes.selectedEntryRow])}
                    >
                      {withSelect ? <TableCell
                        padding="checkbox"
                        className={classes.checkboxCell}
                      >
                        <Checkbox
                          classes={{
                            root: (selectedEntry === rowId) && classes.selectedEntryCheckbox,
                            checked: (selectedEntry === rowId) && classes.selectedEntryCheckbox
                          }}
                          checked={isItemSelected}
                          onClick={event => this.handleSelect(event, rowId)}
                        />
                      </TableCell> : <React.Fragment/> }
                      {Object.keys(columns).filter(key => selectedColumns.indexOf(key) !== -1).map((key, i) => {
                        const column = columns[key]
                        return (
                          <TableCell
                            className={clsx([classes.cell, column.ellipsisFront && classes.ellipsisFront, (selectedEntry === rowId) && classes.selectedEntryCell])}
                            key={key}
                            align={column.align || 'left'}
                          >
                            {normalizeDisplayValue(column.render ? column.render(row) : _.get(row, key))}
                          </TableCell>
                        )
                      })}
                      {entryActions && <TableCell className={classes.actionsCell}>{entryActions(row, (selectedEntry === rowId))}</TableCell>}
                    </TableRow>
                    {this.renderDetails(row)}
                  </React.Fragment>
                )
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 61 * emptyRows }}>
                  <TableCell colSpan={selectedColumns.length + 1 + (entryActions ? 1 : 0)} />
                </TableRow>
              )}
              {pagination ? <TableRow>{pagination}</TableRow> : <React.Fragment/>}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }
}

export default compose(withStyles(DataTableUnStyled.styles))(DataTableUnStyled)