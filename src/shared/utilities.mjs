import { incidentLevelMap } from '../global/constants.mjs'

function generateId () {
  return Math.random().toString(36).replace(/[^a-z]+/g, '')
}

function swapElForHTML ($oldEl, newHTML) {
  $oldEl.insertAdjacentHTML('beforebegin', newHTML)
  $oldEl.remove()
}

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

function makeSentenceCase (str) {
  const trimmed = str.trim()
  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase()
}

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

function addIncidentTypeToIncidentList ($list, pathRoot) {
  const $incidentLinks = $list.querySelectorAll('a')

  if ($incidentLinks.length > 0) {
    $incidentLinks.forEach($el => addIncidentTypeToTarget($el, pathRoot, 'after'))
  }
}

export {
  generateId,
  swapElForHTML,
  reformatDateRanges,
  makeSentenceCase,
  getNodeByXPath,
  addIncidentTypeToTarget,
  addIncidentTypeToIncidentList
}
