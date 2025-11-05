import { swapElForHTML, makeSentenceCase } from '../../shared/utilities.mjs'

function swapHistoryPageH4ForH1 ($pageHeading) {
  swapElForHTML($pageHeading, `<h1 class="font-x-largest">${makeSentenceCase($pageHeading.textContent)}</h1>`)
}

function updateIncidentsListHeadings ($incidentsList) {
  const $monthHeadings = $incidentsList.querySelectorAll('h4.month-title')

  if ($monthHeadings.length > 0) {
    $monthHeadings.forEach($el => swapElForHTML($el, `<h2 class="${$el.className}">${$el.textContent}</h2>`))
  }
}

export { swapHistoryPageH4ForH1, updateIncidentsListHeadings }
