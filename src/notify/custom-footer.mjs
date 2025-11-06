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
  // Add skiplink, only for the home and incident pages
  // The history page only loads its main content area after the page load so needs this to run later
  if ((pathRoot in mainContainerMap) && (pathRoot !== '/history')) {
    addSkipLink(pathRoot)
  }

  // Leave this until we know if it's still needed
  $('.components-container').removeClass('two-columns').addClass('one-column')

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
    const $historyContentContainer = $container.querySelector('.layout-content > .container > div:first-of-type')

    swapHistoryPageH4ForH1()

    if ($historyContentContainer !== null) {
      const observer = new window.MutationObserver((mutationRecords) => {
        const $incidentsList = document.querySelector(incidentsListMap[pathRoot])

        // prevent our changes triggering mutations, and so this function
        observer.disconnect()

        addSkipLink(pathRoot)
        reformatDateRanges()
        removeExpandIncidentsButton()
        addIncidentTypeToIncidentList(pathRoot)
        updateIncidentsListHeadings(pathRoot)

        // reset observation, targeted only the history entries we expect the pagination to change
        observer.observe($incidentsList, { attributes: true, childList: true, subtree: true })
      })

      // the page loads as an empty shell, with nothing between the heading and footer
      // so watch for the rest of the content to load before changing it
      observer.observe($historyContentContainer, { attributes: true, childList: true, subtree: true })
    }
  }

  if (pathRoot === '/incidents') {
    remakePageHeadingPrefixInSentenceCase()
    addIncidentTypeToPageHeading(pathRoot)
    addAffectedComponentsHeading()
  }
}
