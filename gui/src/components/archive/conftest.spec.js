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
import { join, basename } from 'path'
import { waitFor } from '@testing-library/dom'
import { screen, within } from '../conftest.spec'
import userEvent from '@testing-library/user-event'
import { laneErrorBoundryMessage } from './Browser'

/*****************************************************************************************
 * Utilities for testing browser functionality.
 *
 * Key concepts:
 *  browserConfig
 *    An object storing information about how a Browser component was instantiated and configured,
 *    plus a *browserTree* attriute defining what should be shown in the browser for different
 *    paths (depending on where the user navigates).
 *  browserTree
 *    An object with keys and values, where the keys are browseable paths ('' = the browser root lane)
 *    and the values are objects of the form:
 *      {cb: <lane check function>, extra: <object with additional key-value pairs>}
 *  lane check function
 *    A function which performs the standard checks that a particular lane is rendered correctly.
 *    These functions are referred in the *browserTree* (the *cb* attribute), and the checkLanes
 *    utility function uses them to check the lanes that should be visible for a certain path.
 *    The function is invoked with the object
 *      {lane, laneIndex, lanePath, lastSegment, ...browserConfig, ...extra}
 *    as input. Some lane check functions are defined in this file, as they may be used in
 *    tests defined in different files.
 *****************************************************************************************/

/**
 * Utility for calculating which items should exist in the given path in the specified
 * browserTree. Returns these as an array of strings.
 */
export function itemsInTreePath(browserTree, path) {
  const rv = []
  const pathPrefix = path ? path + '/' : ''
  for (const treePath in browserTree) {
    if (treePath && treePath.startsWith(pathPrefix)) {
      const item = treePath.substring(pathPrefix.length).split('/')[0]
      if (!rv.includes(item)) {
        rv.push(item)
      }
    }
  }
  return rv.sort()
}

/**
 * Deletes everything at or under a specific path in the provided browserTree
 */
export function purgeTreePath(browserTree, path) {
  const keysToDelete = []
  for (const key in browserTree) {
    if (!path || key === path || key.startsWith(path + '/')) {
      keysToDelete.push(key)
    }
  }
  keysToDelete.forEach(key => delete browserTree[key])
}

/**
 * Gets a lane object from the screen by its index. If a laneKey is specified, we also check
 * that the lane has this key. If no matching lane is found, we return null.
 */
export function getLane(laneIndex, laneKey) {
  try {
    if (laneKey) {
      laneKey = laneKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape for use in regexp
    }
    const re = laneKey ? new RegExp(`^lane${laneIndex}:${laneKey}`) : new RegExp(`^lane${laneIndex}:.*`)
    return screen.getByTestId(re)
  } catch {
    return null
  }
}

/**
 * Extracts the lane key from a lane object (using its data-testid attribute)
 */
export function getLaneKey(lane) {
  const testId = lane.attributes['data-testid'].value
  return testId.substring(testId.search(':') + 1)
}

/**
 * Extracts the item key from an item object (using its data-testid attribute)
 */
export function getItemKey(item) {
  const testId = item.attributes['data-testid'].value
  return testId.substring(5)
}

/**
 * Checks that the browser is correctly rendered, provided the browser's path.
 * Each lane corresponding to a segment in the path is checked by calling the cb function
 * defined in the browserTree (which should be an attribute of browserConfig)
 */
export async function checkLanes(path, browserConfig) {
  const { browserTree } = browserConfig
  const lanePaths = ['']
  if (path) {
    let lanePath = ''
    path.split('/').forEach(segment => {
      lanePath = join(lanePath, segment)
      lanePaths.push(lanePath)
    })
  }
  for (let laneIndex = 0; laneIndex < lanePaths.length; laneIndex++) {
    const lanePath = lanePaths[laneIndex]
    const { cb, extra } = browserTree[lanePath]
    expect(cb).toBeDefined()
    const lastSegment = basename(lanePath)
    const lane = getLane(laneIndex, lastSegment)
    const args = {lane, laneIndex, lanePath, lastSegment, ...browserConfig, ...extra}
    await cb(args)
  }
  expect(getLane(lanePaths.length)).toBeNull() // otherwise we have too many lanes
}

/**
 * Selects (clicks) on an item in the specified lane and waits for the new lane to render.
 * Note, the item must not already be selected. Throws an exception if the rendering fails.
 * Returns the new lane when done. If you already have the item object, you can pass it
 * as the last argument (for optimization purposes), otherwise it will be fetched from the
 * itemKey.
 */
export async function selectItemAndWaitForRender(lane, laneIndex, itemKey, item = null) {
  if (!item) {
    item = within(lane).getByTestId(`item:${itemKey}`)
  }
  userEvent.click(item)
  await waitFor(() => {
    expect(getLane(laneIndex + 1, itemKey)).not.toBeNull()
    expect(getLane(laneIndex + 2)).toBeNull()
  })
  const nextLane = getLane(laneIndex + 1)
  expect(within(nextLane).queryByText(laneErrorBoundryMessage)).toBeNull()
  return nextLane
}

/**
 * Navigates to the specified path by clicking the appropriate items in the lanes. The method
 * figures out itself, by inspecting the existing lanes, which clicks are needed. If a browserConfig
 * with a browserTree attribute is specified, we also call checkLanes after each click.
 * Returns the final lane.
 */
export async function navigateTo(path, browserConfig) {
  if (!path) {
    return getLane(0)
  }
  const segments = path.split('/')
  let subpath = ''
  let laneIndex = 0
  let lane = getLane(0)
  let nextLane = getLane(1)
  for (const segment of segments) {
    subpath = join(subpath, segment)
    const selectedItemKey = nextLane ? getLaneKey(nextLane) : null
    if (selectedItemKey !== segment) {
      // Need to select a (different) item in this lane
      lane = await selectItemAndWaitForRender(lane, laneIndex, segment)
      if (browserConfig?.browserTree) {
        await checkLanes(subpath, browserConfig)
      }
    } else {
      lane = nextLane
    }
    laneIndex += 1
    nextLane = getLane(laneIndex + 1)
  }
  return lane
}

/**
 * Browses recursively, navigating to all items that pass the provided itemFilter. If no
 * itemFilter is provided, all items will be visited. This method provides an easy way to
 * verify that the browser renders all (or at least a lot of) paths correctly.
 */
export async function browseRecursively(lane, laneIndex, path, consoleLogSpy, consoleErrorSpy, itemFilter, filterKeyLength = 2, filterMemory = null) {
  if (filterMemory === null) {
    filterMemory = {}
  }
  // Click on all discovered item-lists to open them
  for (const itemList of within(lane).queryAllByRole('item-list')) {
    const label = itemList.textContent
    process.stdout.write(`Expanding item list: ${path}/${label}\n`)
    userEvent.click(itemList)
    await within(lane).findByTestId(`item-list:${label}`)
  }
  const items = {}
  for (const item of within(lane).queryAllByTestId(/^item:/)) {
    const itemKey = getItemKey(item)
    items[itemKey] = item
  }
  const itemKeys = itemFilter ? itemFilter(path, items) : Object.keys(items)
  for (const itemKey of itemKeys) {
    const itemPath = join(path, itemKey)
    const segments = itemPath.split('/')
    const filterKey = segments.slice(segments.length - filterKeyLength).join('/')
    if (!filterMemory[filterKey]) {
      filterMemory[filterKey] = true
      const item = items[itemKey]
      const nextPath = `${path}/${itemKey}`
      process.stdout.write(`Rendering path: ${nextPath}\n`)
      const nextLane = await selectItemAndWaitForRender(lane, laneIndex, itemKey, item)
      expect(consoleLogSpy).not.toBeCalled()
      expect(consoleErrorSpy).not.toBeCalled()
      // new lane rendered successfully
      await browseRecursively(nextLane, laneIndex + 1, nextPath, consoleLogSpy, consoleErrorSpy, itemFilter, filterKeyLength, filterMemory)
    }
  }
}

/*****************************************************************************************
 * Lane check functions
 *****************************************************************************************/

/**
 * Lane check function for directory lanes
 */
export async function checkDirectoryLane({lane, laneIndex, lanePath, lastSegment, browserTree, rootTitle, editable}) {
  expect(within(lane).getByText(laneIndex === 0 ? rootTitle : lastSegment)).toBeVisible() // Lane title

  itemsInTreePath(browserTree, lanePath).forEach(item => {
    expect(within(lane).getByText(item)).toBeVisible()
  })
  // Buttons
  expect(within(lane).getByButtonText('download this folder')).toBeEnabled()
  expect(within(lane).getByButtonText('reload directory contents')).toBeEnabled()
  for (const buttonTitle of ['upload to this folder (click or drop files)', 'create new folder', 'delete this folder']) {
    if (editable) {
      expect(within(lane).getByButtonText(buttonTitle)).toBeEnabled()
    } else {
      expect(within(lane).queryByButtonText(buttonTitle)).toBeNull()
    }
  }
}

/**
 * Lane check function for file preview lanes
 */
export async function checkFileLane(
  {lane, lastSegment, entryId, parserName, editable}) {
  expect(within(lane).getByText(lastSegment)).toBeVisible() // Lane title
  if (entryId) {
    expect(within(lane).getByText(entryId)).toBeVisible()
  }
  if (parserName) {
    expect(within(lane).getByText(parserName)).toBeVisible()
  }
  // Buttons
  expect(within(lane).getByButtonText('download this file')).toBeEnabled()
  if (editable) {
    expect(within(lane).getByButtonText('delete this file')).toBeEnabled()
  } else {
    expect(within(lane).queryByButtonText('delete this file')).toBeNull()
  }
}
