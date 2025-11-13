/*
 * Accessibility issue this proposes to address:
 * - ID: 21, Some form fields are not correctly set up for autocomplete
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/6
 *   - Trello card: https://trello.com/c/erU3zqaQ/772-status-page-add-missing-autocomplete-attributes-to-subscribe-to-updates-form-input
 */
function addAutocompleteAttributes () {
  // adds autocomplete attributes to controls that don't have one
  const selectorAndAutocompleteAttributes = {
    email: 'email',
    phone_country: 'tel-country-code',
    phone_number: 'tel-national'
  }

  $.each(selectorAndAutocompleteAttributes, function (key, val) {
    const $targetElements = $(`[name='${key}']`)
    $.each($targetElements, function () {
      $(this).attr('autocomplete', val)
    })
  })
}

export default addAutocompleteAttributes
