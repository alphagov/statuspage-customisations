import { incidentsListMap } from '../../global/constants.mjs'
import { swapElForHTML, makeSentenceCase } from '../../shared/utilities.mjs'

function swapHistoryPageH4ForH1 () {
  const $pageHeading = document.querySelector('.layout-content > .container h4:first-child')

  if ($pageHeading !== null) {
    swapElForHTML($pageHeading, `<h1 class="font-x-largest">${makeSentenceCase($pageHeading.textContent)}</h1>`)
  }
}

function updateIncidentsListHeadings (pathRoot) {
  const incidentsListSelector = incidentsListMap[pathRoot]
  const $monthHeadings = document.querySelectorAll(`${incidentsListSelector} h4.month-title`)

  if ($monthHeadings.length > 0) {
    $monthHeadings.forEach($el => swapElForHTML($el, `<h2 class="${$el.className}">${$el.textContent}</h2>`))
  }
}

export { swapHistoryPageH4ForH1, updateIncidentsListHeadings }
