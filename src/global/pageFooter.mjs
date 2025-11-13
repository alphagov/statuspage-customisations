import { getNodeByXPath, makeSentenceCase } from '../shared/utilities.mjs'

/*
 * Accessibility issues this proposes to address:
 * - issue ID: 69, lack of accessibility statement
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/3
 *   - Trello card: https://trello.com/c/PUxouWrT/773-status-page-add-link-to-the-a11y-statement-to-meet-psbar-regulations
 * - issue ID: 53, headings are missing
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
 *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
 */
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
