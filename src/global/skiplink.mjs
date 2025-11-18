import { mainContainerMap } from './constants.mjs'

/*
 * Accessibility issue this proposes to address:
 * - ID: 17, no mechanism to skip to the main content
 *   - PR: https://github.com/alphagov/statuspage-customisations/pull/12
 *   - Trello card: https://trello.com/c/YTw6kldC/798-status-page-add-skiplink-to-pages
 */
function addSkipLink (pathRoot) {
  const $mainContainer = document.querySelector(mainContainerMap[pathRoot])

  if ($mainContainer !== null) {
    $mainContainer.setAttribute('id', 'main-content')
    document.body.insertAdjacentHTML('afterbegin', '<a href="#main-content" class="govuk-skip-link">Skip to main content</a>')
  }
}

export default addSkipLink
