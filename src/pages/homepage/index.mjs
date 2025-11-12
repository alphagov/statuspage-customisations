import { swapElForHTML } from '../../shared/utilities.mjs'

function addHeadingsAndMoveAboutText (content) {
  const $container = document.querySelector('.layout-content > .container')
  const $aboutText = document.querySelector('.page-status + .text-section, .unresolved-incidents + .text-section')
  const $pageStatus = document.querySelector('.page-status, .unresolved-incidents')

  if (($container !== null) && ($aboutText !== null) && ($pageStatus !== null))  {
    $container.insertAdjacentElement('afterbegin', $aboutText)
    $container.insertAdjacentHTML('afterbegin', `<h1 class="font-x-largest">${content.h1Text}</h1>`)
    $pageStatus.insertAdjacentHTML('beforebegin', `<h2 class="page-status__heading font-largest">${content.h2Text}</h2>`)
  }
}

function remakeStatusOverviewHeadingAsParagraph () {
  const $pageStatusContent = document.querySelector('.page-status h2, .unresolved-incidents h2')

  if ($pageStatusContent !== null) {
    swapElForHTML($pageStatusContent, `<p class="${$pageStatusContent.className}">${$pageStatusContent.textContent}</p>`)
  }
}

function rewriteIncidentsListHeading () {
  document.querySelector('.incidents-list > h2:first-child').textContent = 'Recent incidents'
}

function remakeComponentsList () {
  const $componentContainer = document.querySelector('.components-container')

  swapElForHTML(document.querySelector('.components-container'), `<ul class="${$componentContainer.className}">${$componentContainer.innerHTML}</ul>`)
  const $newComponentContainer = document.querySelector('.components-container')
  const $components = $newComponentContainer.querySelectorAll('.component-container')
  $components.forEach($el => {
    const classes = $el.className
    const $componentName = $el.querySelector('.name')
    const $componentStatus = $el.querySelector('.component-status')
    const componentStatusClasses = $el.querySelector('.component-inner-container').className
    const $listElement = `
    <li class="${classes} ${componentStatusClasses}">
      <span class="${$componentName.className}">
        ${$componentName.textContent}
      </span>
      <span class="${$componentStatus.className}">
        <span class="govuk-visually-hidden">status: </span>
        ${$componentStatus.textContent}
      </span>
    </li>`
    swapElForHTML($el, $listElement)
  })
}

function reformatDates () {
  document.querySelectorAll('.status-day > .date').forEach($el => {
    if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test($el.textContent)) {
      const $textNodes = Array.from($el.childNodes).filter($el => $el.nodeType === 3)
      $el.insertAdjacentElement('afterbegin', $el.querySelector('var:first-of-type'))
      $textNodes[0].nodeValue = ' ' + $textNodes[0].nodeValue
      $textNodes[1].remove()
    }
  })
}

export {
  addHeadingsAndMoveAboutText,
  remakeStatusOverviewHeadingAsParagraph,
  rewriteIncidentsListHeading,
  remakeComponentsList,
  reformatDates
}
