import repo from '@material-ui/core/colors/deepPurple'
import archive from '@material-ui/core/colors/teal'
import enc from '@material-ui/core/colors/amber'
import analytics from '@material-ui/core/colors/lightGreen'
import secondary from '@material-ui/core/colors/blueGrey'
import { createMuiTheme } from '@material-ui/core'

window.nomadEnv = window.nomadEnv || {}
export const appBase = window.nomadEnv.appBase.replace(/\/$/, '')
export const apiBase = `${appBase}/api`
export const optimadeBase = `${appBase}/optimade`
export const guiBase = process.env.PUBLIC_URL
export const kibanaBase = window.nomadEnv.kibanaBase
export const matomoUrl = window.nomadEnv.matomoUrl
export const matomoSiteId = window.nomadEnv.matomoSiteId
export const debug = window.nomadEnv.debug || false
export const sendTrackingData = window.nomadEnv.sendTrackingData

export const repoPrimaryColor = repo

const createTheme = themeData => createMuiTheme({
  typography: {
    useNextVariants: true
  },
  ...themeData
})

export const genTheme = createTheme({
  palette: {
    primary: secondary,
    secondary: secondary
  }
})

export const repoTheme = createTheme({
  palette: {
    primary: repo,
    secondary: repo
  }
})

export const archiveTheme = createTheme({
  palette: {
    primary: archive,
    secondary: repo
  }
})

export const encTheme = createTheme({
  palette: {
    primary: enc,
    secondary: repo
  }
})

export const analyticsTheme = createTheme({
  palette: {
    primary: analytics,
    secondary: repo
  }
})

export const formatQuantity = (x) => {
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
