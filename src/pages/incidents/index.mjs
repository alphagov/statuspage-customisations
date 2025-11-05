import { makeSentenceCase } from  '../../shared/utilities.mjs'

function removeExpandIncidentsButton () {
  // expand / show all incidents in a given month
  $('.expand-incidents').click().remove()
}

function fixSubscribeToIncidentUpdatesButton () {

  // a11y fixes for subscribe to ongoing incident(s) button
  $('.subscribe-button').attr('aria-haspopup', 'dialog').text(function () {
    return this.text + ' for this incident'
  })

}

function remakePageHeadingPrefixInSentenceCase ($pageHeadingContextPrefix) {
  $pageHeadingContextPrefix.nodeValue = makeSentenceCase($pageHeadingContextPrefix.nodeValue) + ' '
}

function addAffectedComponentsHeading ($affectedHeading) {
  $affectedHeading.insertAdjacentHTML(
    'afterbegin', '<h2 class="govuk-visually-hidden">Components affected</h2>'
  )
}

export {
  removeExpandIncidentsButton,
  fixSubscribeToIncidentUpdatesButton,
  remakePageHeadingPrefixInSentenceCase,
  addAffectedComponentsHeading
}
