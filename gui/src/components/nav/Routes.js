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
import { Route } from 'react-router'
import { CacheRoute, CacheSwitch } from 'react-router-cache-route'
import { matchPath, useLocation, Redirect, useHistory, Link as RouterLink } from 'react-router-dom'
import { Button, Link, makeStyles, Tooltip } from '@material-ui/core'
import About from '../About'
import AIToolkitPage from '../aitoolkit/AIToolkitPage'
import TutorialsPage from '../aitoolkit/TutorialsPage'
import ReproducePage from '../aitoolkit/ReproducePage'
import CoursePage from '../aitoolkit/CoursePage'
import { MetainfoPage, help as metainfoHelp } from '../archive/MetainfoBrowser'
import EntryPage, { help as entryHelp } from '../entry/EntryPage'
import UploadPage from '../uploads/UploadPage'
import UploadsPage, { help as uploadsHelp } from '../uploads/UploadsPage'
import UserdataPage, { help as userdataHelp } from '../UserdataPage'
import APIs from '../APIs'
import SearchPageEntries, {help as searchEntriesHelp} from '../search/SearchPageEntries'
// import SearchPageMaterials, {help as searchMaterialsHelp} from '../search/SearchPageMaterials'
import { aitoolkitEnabled, appBase, oasis, encyclopediaBase } from '../../config'
import EntryQuery from '../entry/EntryQuery'
import ResolvePID from '../entry/ResolvePID'
import DatasetPage, { help as datasetHelp } from '../dataset/DatasetPage'
import DatasetsPage, { help as datasetsHelp } from '../dataset/DatasetsPage'
import ResolveDOI from '../dataset/ResolveDOI'
import { DatatableExamples } from '../datatable/DatatableExamples'

/**
 * Each route is an object with possible nested sub routes. Therefore, each object only
 * represents one segment of a full path (from root to sub route). Of course sub routes
 * can be re-used by putting them into variables and inserting them at multiple places.
 * Sub routes are matched before there parents. This way, react routers `exact` parameter
 * can be mostly omitted.
 *
 * The following keys are possible:
 * @param {string} path The path segment for this route.
 * @param {array} routes The sub routes.
 * @param {string} breadcrumb An optional breadcrumb. The string is used verbatim.
 * @param {boolean} exact Is passed to react-router routes. Does not match paths that are longer.
 * @param {string} menu This is only allowed on the first two levels. The string is used
 *   verbatim to create menu and menu items respectively.
 * @param {string} tooltip Used as tooltip titles for menu items.
 * @param {object} help  Optional object with string values keys `title` and `help`.
 *   Used for the help dialog.
 * @param {Component} component A react component that will be rendered if this route is
 *   matching the current location. Alternative for render.
 * @param {func} render This is used if this route is matching the current location.
 *   Alternative for component.
 * @param {string} href This can be used for menu items that are not used for navigating
 *   in the app, but linking to other web sites.
 */

/**
 * The reusable sub routes for entries.
 */
const entryRoutes = [
  {
    path: 'entry',
    routes: [
      {
        path: 'id/:uploadId/:entryId',
        breadcrumb: 'Entry',
        component: EntryPage,
        help: {
          title: 'The entry page',
          content: entryHelp
        },
        routes: [
          {
            path: 'raw',
            exact: true,
            breadcrumb: 'Raw data files'
          },
          {
            path: 'archive',
            exact: true,
            breadcrumb: 'Processed data'
          },
          {
            path: 'logs',
            exact: true,
            breadcrumb: 'Processing logs'
          }
        ]
      },
      {
        path: 'query',
        exact: true,
        component: EntryQuery
      },
      {
        path: 'pid',
        component: ResolvePID
      }
    ]
  }
]

/**
 * The reusable sub routes for datasets
 */
const datasetRoutes = [
  {
    path: 'dataset',
    routes: [
      {
        path: 'id/:datasetId',
        cache: 'always',
        breadcrumb: 'Dataset',
        component: DatasetPage,
        routes: entryRoutes,
        help: {
          title: 'Datasets',
          content: datasetHelp
        }
      },
      {
        path: 'doi',
        component: ResolveDOI
      }
    ]
  }
]

/**
 * The reusable sub routes for uploads
 */
const uploadRoutes = [
  {
    path: 'upload',
    routes: [
      {
        path: 'id/:uploadId',
        exact: true,
        breadcrumb: 'Upload',
        component: UploadPage,
        routes: entryRoutes
      }
    ]
  }
]

const toolkitRoute = (!oasis && aitoolkitEnabled)
  ? {
    path: 'aitoolkit',
    exact: true,
    menu: 'AI Toolkit',
    tooltip: 'NOMAD\'s Artificial Intelligence Toolkit tutorial Jupyter notebooks',
    component: AIToolkitPage,
    breadcrumb: 'NOMAD Artificial Intelligence Toolkit'
  } : {
    href: 'https://nomad-lab.eu/AIToolkit',
    menu: 'AI Toolkit',
    tooltip: 'Visit the NOMAD Artificial Intelligence Analytics Toolkit'
  }

/**
 * The list with all routes. This is used to determine the routes for routing, the breadcrumbs,
 * and the main menu.
 */
export const routes = [
  {
    path: 'user',
    exact: true,
    redirect: '/user/uploads',
    menu: 'Publish',
    routes: [
      {
        path: 'uploads',
        exact: true,
        component: UploadsPage,
        menu: 'Uploads',
        tooltip: 'Upload and publish new data',
        breadcrumb: 'Your uploads',
        routes: uploadRoutes,
        help: {
          title: 'How to upload data to NOMAD',
          content: uploadsHelp
        }
      },
      {
        path: 'datasets',
        exact: true,
        component: DatasetsPage,
        menu: 'Datasets',
        tooltip: 'Manage your datasets',
        breadcrumb: 'Your datasets',
        routes: datasetRoutes,
        help: {
          title: 'What are NOMAD datasets',
          content: datasetsHelp
        }
      },
      {
        path: 'search',
        exact: true,
        cache: 'always',
        menu: 'Search your data',
        breadcrumb: 'Search your data',
        tooltip: 'Search the data you have uploaded',
        help: {
          title: 'How to manage your data',
          content: userdataHelp
        },
        component: UserdataPage,
        routes: [...entryRoutes, ...datasetRoutes, ...uploadRoutes]
      }
    ]
  },
  {
    path: 'search',
    redirect: '/search/entries',
    menu: 'Explore',
    routes: [
      {
        path: 'entries',
        exact: true,
        cache: 'always',
        component: SearchPageEntries,
        menu: 'Entries',
        tooltip: 'Search individual database entries',
        breadcrumb: 'Entries search',
        help: {
          title: 'Searching for entries',
          content: searchEntriesHelp
        },
        routes: entryRoutes
      },
      {
        menu: 'Material Encyclopedia',
        href: 'https://nomad-lab.eu/prod/rae/encyclopedia',
        tooltip: 'Search materials in the NOMAD Encyclopedia'
      }
      // {
      //   path: 'materials',
      //   exact: true,
      //   cache: 'always',
      //   component: SearchPageMaterials,
      //   menu: 'Material Encyclopedia',
      //   tooltip: 'Search materials',
      //   breadcrumb: 'Materials search',
      //   help: {
      //     title: 'Searching for materials',
      //     content: searchMaterialsHelp
      //   }
      // }
    ]
  },
  {
    path: 'analyze',
    menu: 'Analyze',
    routes: [
      {
        path: 'apis',
        exact: true,
        menu: 'APIs',
        tooltip: 'The list of APIs offered by NOMAD',
        breadcrumb: 'NOMAD APIs',
        component: APIs
      },
      {
        path: 'metainfo',
        menu: 'The NOMAD Metainfo',
        tooltip: 'Browse the NOMAD Metainfo Schema',
        breadcrumb: 'NOMAD Metainfo Browser',
        help: {
          title: 'About the NOMAD metainfo',
          content: metainfoHelp
        },
        component: MetainfoPage
      },
      toolkitRoute,
      {
        path: 'tutorials',
        title: 'Artificial Intelligence Toolkit',
        component: TutorialsPage
      },
      {
        path: 'reproduce',
        title: 'Artificial Intelligence Toolkit',
        component: ReproducePage
      },
      {
        path: 'course',
        title: 'Artificial Intelligence Toolkit',
        component: CoursePage
      }
    ]
  },
  {
    path: 'about',
    menu: 'About',
    redirect: '/about/information',
    routes: [
      {
        path: 'information',
        exact: true,
        menu: 'Information',
        component: About,
        breadcrumb: 'About NOMAD',
        tooltip: 'Overview of the NOMAD'
      },
      {
        menu: 'Forum',
        href: 'https://matsci.org/c/nomad/',
        tooltip: 'The NOMAD user/developer forum on matsci.org'
      },
      {
        menu: 'FAQ',
        href: 'https://nomad-lab.eu/repository-archive-faqs',
        tooltip: 'Frequently Asked Questions (FAQ)'
      },
      {
        menu: 'Docs',
        href: `${appBase}/docs/index.html`,
        tooltip: 'The full user and developer documentation'
      },
      {
        menu: 'Sources',
        href: 'https://gitlab.mpcdf.mpg.de/nomad-lab/nomad-FAIR',
        tooltip: 'NOMAD\'s main Gitlab project'
      },
      {
        menu: 'Terms',
        consent: true,
        tooltip: 'The terms of service and cookie consent'
      }
    ]
  },
  ...datasetRoutes,
  ...entryRoutes,
  ...uploadRoutes,
  {
    path: 'dev/datatable',
    render: () => <DatatableExamples />
  }
]

/**
 * The flattened array of all possible routs with paths starting the the root of the
 * app.
 */
export const allRoutes = []

function addRoute(route, pathPrefix) {
  let path = ''
  if (!(route.path === '' && pathPrefix === '')) {
    path = route.path && `${pathPrefix}/${route.path}`
  }
  if (route.routes) {
    route.routes.forEach(childRoute => addRoute(childRoute, path))
  }
  const fullRoute = {...route, path: path}
  allRoutes.push(fullRoute)
}
routes.forEach(route => addRoute(route, ''))

/**
 * Renders all the apps routes according to `routes`.
 */
const useStyles = makeStyles((theme) => (
  {
    wrapper: {
      height: '100%'
    }
  }
))
export const Routes = React.memo(function Routes() {
  const styles = useStyles()
  return <CacheSwitch>
    {allRoutes
      .filter(route => route.path && (route.component || route.render || route.redirect || route.children))
      .map((route, i) => {
        if (route.redirect) {
          return <Redirect
            key={i}
            path={route.path} exact={route.exact}
            to={route.redirect}
          />
        }
        const Comp = route.cache ? CacheRoute : Route
        return <Comp
          key={i}
          path={route.path}
          exact={route.exact}
          component={route.component}
          render={route.render}
          when={route.cache}
          className={route.cache && styles.wrapper}
        >
          {route.children || undefined}
        </Comp>
      })}
    <Redirect from="/" to="/about/information" />
  </CacheSwitch>
})

/**
 * Some routes are available under different prefix routes. E.g., entries under search,
 * uploads, or datasets. This function computes a full url for such a route, based on
 * the given location. E.g., if location is `/search/entries/...`, getUrl for entries
 * would give `/search/entries/entry/id/someuploadid/someentryid`. If the current location
 * does not contain a possible prefix, the url will be returned without prefix.
 *
 * @param {*} path The partial path that should be the end of the returned url.
 * @param {*} location The current react-router location object, e.g. from `useLocation()`.
 * @returns The full url. E.g., that can be put into react-router `<Link to={...}>`.
 */
export function getUrl(path, location) {
  const commonPathPrefix = path.split('/')[0]
  const pathname = location?.pathname
  const match = pathname && allRoutes
    .filter(route => route.routes?.some(route => route.path === commonPathPrefix))
    .map(route => matchPath(pathname, route.path)).find(match => match)
  const url = match?.url || ''

  return `${url}/${path}`
}

export const RouteLink = React.forwardRef((props, ref) => {
  const {path, children, ...moreProps} = props
  const location = useLocation()
  const to = getUrl(path, location)
  return <Link component={RouterLink} to={to} {...moreProps}>{children}</Link>
})
RouteLink.propTypes = {
  path: PropTypes.string.isRequired,
  children: PropTypes.node
}

export const RouteButton = React.forwardRef((props, ref) => {
  const {component, onClick, path, ...moreProps} = props
  const location = useLocation()
  const history = useHistory()
  const handleClick = (event) => {
    event.stopPropagation()
    onClick && onClick(event)
    history.push(getUrl(path, location))
  }
  return React.createElement(component || Button, {onClick: handleClick, ...moreProps, ref: ref})
})
RouteButton.propTypes = {
  path: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  component: PropTypes.elementType
}

/**
 * A button that allows to navigate to the entry page under the current route prefix.
 * @param {string} uploadId
 * @param {string} entryId
 * @param {elementType} component The component to use to render the button. Default is Button.
 */
export const EntryButton = React.forwardRef((props, ref) => {
  const {uploadId, entryId, ...moreProps} = props
  const path = `entry/id/${uploadId}/${entryId}`
  return <RouteButton path={path} {...moreProps} ref={ref} />
})
EntryButton.propTypes = {
  uploadId: PropTypes.string.isRequired,
  entryId: PropTypes.string.isRequired
}

/**
 * A button that allows to navigate to the dataset page under the current route prefix.
 * @param {string} datasetId
 * @param {elementType} component The component to use to render the button. Default is Button.
 */
export const DatasetButton = React.forwardRef((props, ref) => {
  const {datasetId, ...moreProps} = props
  const path = `dataset/id/${datasetId}`
  return <RouteButton path={path} {...moreProps} ref={ref} />
})
DatasetButton.propTypes = {
  datasetId: PropTypes.string.isRequired
}

/**
 * A button that allows to navigate to the upload page under the current route prefix.
 * @param {string} uploadId
 * @param {elementType} component The component to use to render the button. Default is Button.
 */
export const UploadButton = React.forwardRef((props, ref) => {
  const {uploadId, ...moreProps} = props
  const path = `upload/id/${uploadId}`
  return <RouteButton path={path} {...moreProps} ref={ref} />
})
UploadButton.propTypes = {
  uploadId: PropTypes.string.isRequired
}

/**
 * A button that allows to navigate to the material page (currently an external link).
 * @param {string} materialId
 * @param {elementType} component The component to use to render the button. Default is Button.
 */
export const MaterialButton = ({materialId, component, tooltip, ...rest}) => {
  const href = `${encyclopediaBase}/material/${materialId}`
  const props = component
    ? {href: href, ...rest}
    : {href: href, color: 'primary', ...rest}
  let comp = React.createElement(component || Button, props)

  if (tooltip) {
    return <Tooltip title={tooltip}>
      {comp}
    </Tooltip>
  }
  return comp
}

MaterialButton.propTypes = {
  materialId: PropTypes.string.isRequired,
  component: PropTypes.elementType,
  tooltip: PropTypes.string
}
MaterialButton.defaultProps = {
  tooltip: 'View this material in the Encyclopedia'
}

export default Routes
