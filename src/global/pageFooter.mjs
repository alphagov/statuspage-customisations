import { getNodeByXPath, makeSentenceCase } from '../shared/utilities.mjs'

function addHeadingToFooter () {
  const $pageFooter = document.querySelector('.page-footer')

  if ($pageFooter !== null) {
    $pageFooter.insertAdjacentHTML('afterbegin', '<h2 class="page-footer__heading govuk-visually-hidden">Support links</h2>')
    const $footerLinkText = getNodeByXPath("//div[contains(@class, 'page-footer')]/a/*[contains(., '←')]/following-sibling::text()")

    if ($footerLinkText !== null) {
      $footerLinkText.nodeValue = ' ' + makeSentenceCase($footerLinkText.nodeValue)
    }
  }
}

export { addHeadingToFooter }
