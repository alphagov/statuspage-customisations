import { mainContainerMap } from './constants.mjs'

function addSkipLink (pathRoot) {
  const $mainContainer = document.querySelector(mainContainerMap[pathRoot])

  if ($mainContainer !== null) {
    $mainContainer.setAttribute('id', 'main-content')
    document.body.insertAdjacentHTML('afterbegin', '<a href="#main-content" class="govuk-skip-link">Skip to main content</a>')
  }
}

export default addSkipLink
