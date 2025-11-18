import { getNodeByXPath, makeSentenceCase } from  '../../shared/utilities.mjs'

/*
 * Accessibility issue this proposes to address:
 * - issue ID: 37, the showy-hidey feature shows content before itself
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/11
 *   - Trello card: https://trello.com/c/ekoRmpGe/784-status-page-hidden-incidents-in-the-incident-history-are-revealed-above-the-show-button
 */
function removeExpandIncidentsButton () {
  // expand / show all incidents in a given month
  $('.expand-incidents').click().remove()
}

/*
 * Accessibility issue this proposes to address:
 * - issue ID: 28, Subscribe button does not make its purpose clear
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/9
 *   - Trello card: https://trello.com/c/rcUYJrW2/788-status-page-fix-subscribe-to-updates-button-visible-only-during-incidents
 */
function fixSubscribeToIncidentUpdatesButton () {
  // a11y fixes for subscribe to ongoing incident(s) button
  $('.subscribe-button').attr('aria-haspopup', 'dialog').text(function () {
    return this.text + ' for this incident'
  })
}

/*
 * Fix for a style issue, not accessibility
 * - Some words are capitalised in the heading context prefix
 */
function remakePageHeadingPrefixInSentenceCase () {
  const $pageHeadingContextPrefix = getNodeByXPath("//h1/following-sibling::div[contains(@class, 'subheader')]/text()")

  if ($pageHeadingContextPrefix !== null) {
    $pageHeadingContextPrefix.nodeValue = makeSentenceCase($pageHeadingContextPrefix.nodeValue) + ' '
  }
}

/*
 * Accessibility issue this proposes to address:
 * - issue ID: 53, headings are missing
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
 *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
 */
function addAffectedComponentsHeading () {
  const $affectedHeading = document.querySelector('.components-affected')

  if ($affectedHeading) {
    $affectedHeading.insertAdjacentHTML(
      'afterbegin', '<h2 class="govuk-visually-hidden">Components affected</h2>'
    )
  }
}

export {
  removeExpandIncidentsButton,
  fixSubscribeToIncidentUpdatesButton,
  remakePageHeadingPrefixInSentenceCase,
  addAffectedComponentsHeading
}
