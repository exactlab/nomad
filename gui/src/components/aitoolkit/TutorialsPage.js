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
import React, { useMemo } from 'react'
import { Box, Divider, Typography, AccordionDetails, makeStyles, Link, AccordionActions, Button, Grid, TextField } from '@material-ui/core'
import MUIAccordion from '@material-ui/core/Accordion'
import MUIAccordionSummary from '@material-ui/core/AccordionSummary'
import { withStyles } from '@material-ui/core/styles'
import tutorials from '../../toolkitMetadata'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Markdown from '../Markdown'
import { StringParam, useQueryParams, useQueryParam } from 'use-query-params'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TutorialsIcon from './assets/AIT_ico_bp_tutorial.svg'
import AccessIcon from './assets/AIT_ico_bd_link_external_big.svg'
import WatchIcon from './assets/AIT_ico_bd_youtube.svg'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(3),
    width: '100%',
    // marginLeft: 'auto',
    // marginRight: 'auto',
    marginLeft: '100px',
    marginRight: '100px',
    maxWidth: 1024
  },
  section: {
    marginTop: theme.spacing(3)
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2)
  },
  title: {
    fontWeight: 'bold',
    color: '#2A3C67',
    fontSize: 30
  },
  deck: {
    color: '#2A3C67',
    fontSize: 15,
    marginTop: '20px'
  },
  icon: {
    height: '400px',
    marginTop: '-20px'
  },
  filter: {
    fontWeight: 'bold',
    color: '#2A3C67',
    fontSize: 15,
    marginTop: '-100px'
  },
  autocomplete: {
    height: 'auto',
    color: '#2A3C67',
    border: '3px solid rgba(127, 239, 239, 1)',
    borderRadius: '10px 10px 10px 10px',
    marginTop: '-70px'

  },
  tutorialTitle: {
    fontWeight: 'bold',
    fontSize: 25,
    lineHeight: '30px',
    color: '#2A3C67'
  },
  tutorialAuthors: {
    color: '#2A3C67',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: '20px',
    align: 'right'
  },
  tutorialDetails: {
    flexDirection: 'column',
    '& *': {
      marginTop: theme.spacing(1)
    },
    '& :first-child': {
      marginTop: -theme.spacing(2)
    }
  },
  link: {
    cursor: 'pointer',
    fontWeight: 'normal'

  }
}))

const Accordion = withStyles({
  root: {
    borderTop: '10px solid rgba(127, 239, 239, 1)',
    scrollbarGutter: 'false',
    '&:not(:last-child)': {
    },
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    }
  },
  heading: {
    fontSize: 35,
    flexBasis: '33.33%',
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: 10
  },
  expanded: {}
})(MUIAccordion)

const AccordionSummary = withStyles({
  root: {
    flexDirection: 'column'
  },
  content: {
    marginBottom: 0,
    flexGrow: 1
  },
  expandIcon: {
    marginRight: '10px',
    paddingTop: '10px'
  }
})(MUIAccordionSummary)

export default function AIToolkitPage() {
  const classes = useStyles()
  const [expanded, setExpanded] = useQueryParam('expanded', StringParam)
  const [queryParameters, setQueryParameters] = useQueryParams({
    author: StringParam, keyword: StringParam, method: StringParam, filterString: StringParam
  })
  const emptyQuery = {
    author: null,
    keyword: null,
    method: null,
    filterString: null
  }

  const filter = tutorial => {
    const {author, keyword, method} = queryParameters
    if (author && tutorial.authors.indexOf(author) === -1) {
      return false
    }
    if (keyword && tutorial.labels.application_keyword.indexOf(keyword) === -1) {
      return false
    }
    if (method && tutorial.labels.data_analytics_method.indexOf(method) === -1) {
      return false
    }
    return true
  }

  const tutorials_list = tutorials.tutorials.filter(tutorial => tutorial.labels.application_section[0] === 'Tutorials for artificial-intelligence methods')

  const {authors, keywords, methods} = useMemo(() => {
    const authors = {}
    const keywords = {}
    const methods = {}
    tutorials_list.forEach(tutorial => {
      tutorial.key = tutorial.title.replace(/\W/gm, '_').toLowerCase()
      tutorial.authors.forEach(i => { authors[i] = i })
      tutorial.labels.application_keyword.forEach(i => { keywords[i] = i })
      tutorial.labels.data_analytics_method.forEach(i => { methods[i] = i })
    }
    )
    return {
      authors: Object.keys(authors).sort(),
      keywords: Object.keys(keywords).sort(),
      methods: Object.keys(methods).sort()
    }
  }, [tutorials_list])

  return <Grid container spacing={2} className={classes.root}>
    <Grid container spacing={0} className={classes.root}>
      <Grid item xs={5} >
        <Box className={classes.title}>
          {
            'Learn from tutorials'
          }
        </Box>
        <Box className={classes.deck}>
          {
            'We develop and implement methods that identify correlations and structure in big data of materials. This will enable scientists and engineers to decide which materials are useful for specific applications or which new materials should be the focus of future studies. The following tutorials are designed to get started with the AI Toolkit.'
          }
        </Box>
      </Grid>
      <Grid item xs={6} className={classes.icon}>
        <img src={TutorialsIcon} className={classes.icon}/>
      </Grid>
    </Grid>
    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={12} >
        <Box className={classes.filter} >
          {
            'Filter Tutorials'
          }
        </Box>
      </Grid>
      <Grid item xs={2}>
        <Autocomplete
          className={classes.autocomplete}
          id="combo-box-demo"
          options={authors}
          getOptionLabel={option => option}
          renderInput={params => (
            <TextField {...params} fontSize='40' label="author" InputProps={{...params.InputProps, disableUnderline: true}} fullWidth />
          )}
          value={queryParameters.author}
          onChange={(_, value) => setQueryParameters({...emptyQuery, author: value})}
        />
      </Grid>
      <Grid item xs={2}>
        <Autocomplete
          className={classes.autocomplete}
          id="combo-box-demo"
          options={keywords}
          getOptionLabel={option => option}
          renderInput={params => (
            <TextField {...params} label="keyword" InputProps={{...params.InputProps, disableUnderline: true}} fullWidth />
          )}
          value={queryParameters.keyword}
          onChange={(_, value) => setQueryParameters({...emptyQuery, keyword: value})}
        />
      </Grid>
      <Grid item xs={2}>
        <Autocomplete
          className={classes.autocomplete}
          sx={{ height: 300 }}
          id="combo-box-demo"
          options={methods}
          renderInput={params => (
            <TextField {...params} label="method" InputProps={{...params.InputProps, disableUnderline: true}} fullWidth />
          )}
          value={queryParameters.method}
          onChange={(_, value) => setQueryParameters({...emptyQuery, method: value})}
        />
      </Grid>
    </Grid>

    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={12}>
        {tutorials_list.map(tutorial => (
          <div key={tutorial.title} className={classes.tutorial}>
            <Accordion
              key={tutorial.key}
              disabled={!filter(tutorial)}
              expanded={expanded === tutorial.key}
              onChange={() => setExpanded(expanded === tutorial.key ? null : tutorial.key)}
              className={classes.tutorial}
              elevation={0}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container spacing={2} className={classes.root} >
                  <Grid item xs={8} >
                    <Typography className={classes.tutorialTitle} >
                      {tutorial.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography className={classes.tutorialAuthors} >
                      {'Authors: '}
                      {tutorial.authors
                        .map(name => {
                          const label = name.split(',').reverse().join(' ')
                          return <Link
                            className={classes.link}
                            key={name}
                            onClick={() => setQueryParameters({
                              ...emptyQuery,
                              author: queryParameters.author === name ? null : name
                            })}
                          >
                            <i>{label}</i>
                          </Link>
                        }).reduce((prev, curr) => [prev, ', ', curr])
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails className={classes.tutorialDetails}>
                <Markdown>
                  {tutorial.description}
                </Markdown>
                <Typography>
                  <b>keywords</b>: {tutorial.labels.application_keyword
                    .map(keyword => (
                      <Link
                        className={classes.link}
                        key={keyword}
                        onClick={() => setQueryParameters({
                          ...emptyQuery,
                          keyword: queryParameters.keyword === keyword ? null : keyword
                        })}
                      >
                        {keyword}
                      </Link>
                    )).reduce((prev, curr) => [prev, ', ', curr])
                  }
                </Typography>
                <Typography>
                  <b>method</b>: {tutorial.labels.data_analytics_method
                    .map(method => (
                      <Link
                        className={classes.link}
                        key={method}
                        onClick={() => setQueryParameters({
                          ...emptyQuery,
                          method: queryParameters.method === method ? null : method
                        })}
                      >
                        {method}
                      </Link>
                    )).reduce((prev, curr) => [prev, ', ', curr])
                  }
                </Typography>
              </AccordionDetails>

              <AccordionActions>
                <Button color="black" href={tutorial.link} target="tutorial" endIcon={<img src={AccessIcon}></img>}>
                    Access this tutorial
                </Button>
                <Button color="primary" href={tutorial.link_public} target="tutorial" endIcon={<img src={WatchIcon}></img>}>
                    Watch video
                </Button>
              </AccordionActions>
              <Divider />
            </Accordion>
          </div>
        ))}
      </Grid>
    </Grid>
  </Grid>
}
