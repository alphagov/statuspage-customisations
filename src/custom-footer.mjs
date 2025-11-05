import {
  generateId,
  swapElForHTML,
  reformatDateRanges,
  makeSentenceCase,
  getNodeByXPath,
  addIncidentTypeToTarget,
  addIncidentTypeToIncidentList
} from './shared/utilities.mjs'
import addAutoCompleteAttributes from './shared/addAutocompleteAttributes.mjs'
import { mainContainerMap, incidentLevelMap } from './global/constants.mjs'
import addSkipLink from './global/skiplink.mjs'
import { addHeadingToFooter } from './global/pageFooter.mjs'
import {
  addHeadingsAndMoveAboutText,
  remakeStatusOverviewHeadingAsParagraph,
  rewriteIncidentsListHeading,
  remakeComponentsList,
  reformatDates
} from './pages/homepage/index.mjs'
import {
  updateIncidentsListHeadings,
  swapHistoryPageH4ForH1
} from './pages/history/index.mjs'
import {
  fixSubscribeToIncidentUpdatesButton,
  removeExpandIncidentsButton,
  remakePageHeadingPrefixInSentenceCase,
  addAffectedComponentsHeading
} from './pages/incidents/index.mjs'

const pathRoot = '/' + window.location.pathname.split('/')[1]

// Add skiplink
if (pathRoot in mainContainerMap) {
  addSkipLink(pathRoot)
}

$('.components-container').removeClass('two-columns').addClass('one-column')

addAutoCompleteAttributes()
fixSubscribeToIncidentUpdatesButton()
removeExpandIncidentsButton()

const $logo = document.querySelector('.page-name')
const $container = document.querySelector('.layout-content > .container')
const $pageFooter = document.querySelector('.page-footer')

// Rewrite logo
if ($logo !== null) {
  $logo.querySelector('a').textContent = 'GOV.UK Notify'
}

// Add heading to footer
if ($pageFooter !== null) {
  addHeadingToFooter($pageFooter)
}

// Home page specific
if ($container !== null) {
  reformatDateRanges()

  // Home page specific
  if (pathRoot === '/') {
    const $aboutText = document.querySelector('.page-status + .text-section, .unresolved-incidents + .text-section')
    const $pageStatus = document.querySelector('.page-status, .unresolved-incidents')
    const $incidentsList = $container.querySelector('.incidents-list')

    if (($aboutText !== null) && ($pageStatus !== null)) {
      addHeadingsAndMoveAboutText($container, $aboutText, $pageStatus)

      const $pageStatusContent = $pageStatus.querySelector('h2')

      if ($pageStatusContent !== null) {
        remakeStatusOverviewHeadingAsParagraph($pageStatusContent)
      }

      rewriteIncidentsListHeading()

      const $componentContainer = document.querySelector('.components-container')
      if ($componentContainer !== null) {
        remakeComponentsList($componentContainer)
      }

      addIncidentTypeToIncidentList($incidentsList, pathRoot)
      reformatDates()
    }
  }

  if (pathRoot === '/history') {
    const $pageHeading = $container.querySelector('h4:first-child')
    const $incidentsList = $container.querySelector('.months-container')

    if ($pageHeading !== null) {
      swapHistoryPageH4ForH1($pageHeading)
    }

    if ($incidentsList !== null) {

      addIncidentTypeToIncidentList($incidentsList, pathRoot)
      updateIncidentsListHeadings($incidentsList)

      const observer = new window.MutationObserver(() => {
        reformatDateRanges()
        removeExpandIncidents()
        addIncidentTypeToIncidentList($incidentsList, pathRoot)
        updateIncidentsListHeadings($incidentsList)
      })
      observer.observe($incidentsList, { attributes: true, childList: true, subtree: true })

    }
  }

  if (pathRoot === '/incidents') {
    const $pageHeadingContextPrefix = getNodeByXPath("//h1/following-sibling::div[contains(@class, 'subheader')]/text()")
    const $affectedHeading = $container.querySelector('.components-affected')
    const $incidentHeading = document.querySelector('.incident-name')

    if ($pageHeadingContextPrefix !== null) {
      remakePageHeadingPrefixInSentenceCase($pageHeadingContextPrefix)
    }

    if ($affectedHeading !== null) {
      addAffectedComponentsHeading($affectedHeading)
    }

    addIncidentTypeToTarget($incidentHeading, pathRoot)
  }
}
