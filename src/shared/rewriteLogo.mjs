function rewriteLogo () {
  const $logo = document.querySelector('.page-name')

  if ($logo !== null) {
    $logo.querySelector('a').textContent = 'GOV.UK Notify'
  }
}

export default rewriteLogo
