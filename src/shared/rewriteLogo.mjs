function rewriteLogo (logoText) {
  const $logo = document.querySelector('.page-name')

  if ($logo !== null) {
    $logo.querySelector('a').textContent = logoText
  }
}

export default rewriteLogo
