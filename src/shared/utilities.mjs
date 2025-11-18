import { incidentLevelMap, incidentsListMap } from '../global/constants.mjs'

/*
 * Utility method, not specific to any accessibility issue
 */
function generateId () {
  return Math.random().toString(36).replace(/[^a-z]+/g, '')
}

/*
 * Utility method, not specific to any accessibility issue
 */
function swapElForHTML ($oldEl, newHTML) {
  $oldEl.insertAdjacentHTML('beforebegin', newHTML)
  $oldEl.remove()
}

/*
 * Fix for a style issue, not accessibility:
 * - This remakes all dates to match GDS style: https://www.gov.uk/guidance/style-guide/a-to-z#dates
 */
function reformatDateRanges () {
  function reformatRange ($range) {
    if (/^[A-Za-z-]+\s+\d+,\s+\d+:\d+\s+-\s+([A-Za-z]+\s+\d+,\s+)?\d+:\d+\s+[A-Z]+$/.test($range.textContent)) {
      const $dateVars = $range.querySelectorAll('var[data-var=date]')

      $range.insertAdjacentElement('afterbegin', $dateVars[0])
      $range.childNodes[1].nodeValue = ' ' + $range.childNodes[1].nodeValue.trim()
      if ($dateVars.length > 1) {
        const $month = $dateVars[1].previousSibling
        $range.insertBefore($dateVars[1], $month)
        $month.nodeValue = $month.nodeValue.replace(' - ', ' ')
        $range.insertBefore(document.createTextNode(' - '), $dateVars[1])
      }
    }
  }

  if (document.querySelector('.incident-list') !== null) {
    const $incidentDateRanges = document.querySelectorAll('.incident-data > .secondary')

    if ($incidentDateRanges !== null) { $incidentDateRanges.forEach($el => reformatRange($el)) }
  }
}

/*
 * Fix for a style issue, not accessibility
 * - Some words are capitalised in the middle of sentences
 */
function makeSentenceCase (str) {
  const trimmed = str.trim()
  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase()
}

/*
 * Utility method, not specific to any accessibility issue
 */
function getNodeByXPath (xpath) {
  const result = document.evaluate(
    xpath,
    document,
    null,
    window.XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )

  return result.singleNodeValue
}

/*
 * Accessibility issue this proposes to address:
 * - ID: 9, Titles for incidents have different colours which convey a meaning
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/24
 *   - Trello card: https://trello.com/c/ari5FjHW/1425-status-page-status-colours-convey-meaning
 */
function addIncidentTypeToTarget ($target, pageType, position = null) {
  let incidentLevel
  // homepage incident list has a different html structure to history page
  if (pageType === '/') {
    incidentLevel = Array.from($target.parentNode.classList).filter(c => c.startsWith('impact-'))[0]
  } else {
    incidentLevel = Array.from($target.classList).filter(c => c.startsWith('impact-'))[0]
  }
  const $incidentLevelTextContainer = document.createElement('div')
  $incidentLevelTextContainer.classList.add('incident-level', 'color-secondary')
  if (pageType === '/incidents') {
    $incidentLevelTextContainer.classList.add('font-largest')
  } else {
    const id = generateId()
    $target.setAttribute('aria-describedby', id)
    $incidentLevelTextContainer.setAttribute('id', id)
    $incidentLevelTextContainer.classList.add('font-regular')
  }
  if (incidentLevel in incidentLevelMap) {
    $incidentLevelTextContainer.textContent = incidentLevelMap[incidentLevel]
  }
  if (position && position === 'after') {
    $target.after($incidentLevelTextContainer)
  } else {
    $target.prepend($incidentLevelTextContainer)
  }
}

/*
 * Accessibility issue this proposes to address:
 * - ID: 9, Titles for incidents have different colours which convey a meaning
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/24
 *   - Trello card: https://trello.com/c/ari5FjHW/1425-status-page-status-colours-convey-meaning
 */
function addIncidentTypeToPageHeading (pathRoot) {
  const $incidentHeading = document.querySelector('.incident-name')

  if ($incidentHeading !== null) {
    addIncidentTypeToTarget($incidentHeading, pathRoot)
  }
}

/*
 * Accessibility issue this proposes to address:
 * - ID: 9, Titles for incidents have different colours which convey a meaning
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/24
 *   - Trello card: https://trello.com/c/ari5FjHW/1425-status-page-status-colours-convey-meaning
 */
function addIncidentTypeToIncidentList (pathRoot) {
  const $incidentsList = document.querySelector(incidentsListMap[pathRoot])

  if ($incidentsList !== null) {
    $incidentsList.querySelectorAll('a').forEach($el => addIncidentTypeToTarget($el, pathRoot, 'after'))
  }
}

export {
  generateId,
  swapElForHTML,
  reformatDateRanges,
  makeSentenceCase,
  getNodeByXPath,
  addIncidentTypeToTarget,
  addIncidentTypeToPageHeading,
  addIncidentTypeToIncidentList
}
