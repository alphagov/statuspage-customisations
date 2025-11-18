/*
 * Accessibility issue this proposes to address:
 * - Only an issue with GOV.UK Notify's statuspage. The logo text didn't match what it linked to
 */
function rewriteLogo (logoText) {
  const $logo = document.querySelector('.page-name')

  if ($logo !== null) {
    $logo.querySelector('a').textContent = logoText
  }
}

export default rewriteLogo
