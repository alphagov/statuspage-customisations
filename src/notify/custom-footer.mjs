import {
  reformatDateRanges,
  addIncidentTypeToPageHeading,
  addIncidentTypeToIncidentList
} from '../shared/utilities.mjs'
import addAutoCompleteAttributes from '../shared/addAutocompleteAttributes.mjs'
import rewriteLogo from '../shared/rewriteLogo.mjs'
import {
  mainContainerMap,
  incidentsListMap
} from '../global/constants.mjs'
import addSkipLink from '../global/skiplink.mjs'
import { addHeadingToFooter } from '../global/pageFooter.mjs'
import {
  addHeadingsAndMoveAboutText,
  remakeStatusOverviewHeadingAsParagraph,
  rewriteIncidentsListHeading,
  remakeComponentsList,
  reformatDates
} from '../pages/homepage/index.mjs'
import {
  updateIncidentsListHeadings,
  swapHistoryPageH4ForH1
} from '../pages/history/index.mjs'
import {
  fixSubscribeToIncidentUpdatesButton,
  removeExpandIncidentsButton,
  remakePageHeadingPrefixInSentenceCase,
  addAffectedComponentsHeading
} from '../pages/incidents/index.mjs'

const pathRoot = '/' + window.location.pathname.split('/')[1]

// Guard against new pages
if (pathRoot in mainContainerMap) {
  // Leave this until we know if it's still needed
  $('.components-container').removeClass('two-columns').addClass('one-column')

  addSkipLink(pathRoot)
  addAutoCompleteAttributes()
  fixSubscribeToIncidentUpdatesButton()
  removeExpandIncidentsButton()
  rewriteLogo('GOV.UK Notify')
  addHeadingToFooter()
  reformatDateRanges()

  const $container = document.querySelector('.layout-content > .container')

  // Home page specific
  if (pathRoot === '/') {
    addHeadingsAndMoveAboutText({ h1Text: 'GOV.UK Notify status page', h2Text: 'Current status' })
    remakeStatusOverviewHeadingAsParagraph()
    rewriteIncidentsListHeading()
    remakeComponentsList()
    addIncidentTypeToIncidentList(pathRoot)
    reformatDates()
  }

  if (pathRoot === '/history') {
    const $incidentsList = $container.querySelector(incidentsListMap[pathRoot])

    swapHistoryPageH4ForH1()

    if ($incidentsList !== null) {
      addIncidentTypeToIncidentList(pathRoot)
      updateIncidentsListHeadings(pathRoot)

      const observer = new window.MutationObserver(() => {
        reformatDateRanges()
        removeExpandIncidentsButton()
        addIncidentTypeToIncidentList(pathRoot)
        updateIncidentsListHeadings(pathRoot)
      })
      observer.observe($incidentsList, { attributes: true, childList: true, subtree: true })
    }
  }

  if (pathRoot === '/incidents') {
    remakePageHeadingPrefixInSentenceCase()
    addIncidentTypeToPageHeading(pathRoot)
    addAffectedComponentsHeading()
  }
}
