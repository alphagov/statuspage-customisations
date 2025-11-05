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
