$(function () {
  // add skiplink and link to main content
  const pathRoot = '/' + window.location.pathname.split('/')[1]
  const mainContainerMap = {
    '/': '.masthead-container + .container',
    '/history': '.months-container',
    '/incidents': '.incident-updates-container'
  }

  const incidentLevelMap = {
    'impact-none': 'No incident',
    'impact-maintenance': 'Maintenance',
    'impact-minor': 'Minor incident',
    'impact-major': 'Major incident',
    'impact-critical': 'Critical incident'
  }

  // generate ID
  function generateId () {
    return Math.random().toString(36).replace(/[^a-z]+/g, '')
  }

  // Add skiplink
  if (pathRoot in mainContainerMap) {
    document.querySelector(mainContainerMap[pathRoot]).setAttribute('id', 'main-content')
    document.body.insertAdjacentHTML('afterbegin', '<a href="#main-content" class="govuk-skip-link">Skip to main content</a>')
  }

  $('.components-container').removeClass('two-columns').addClass('one-column')
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

  // a11y fixes for subscribe to ongoing incident(s) button
  $('.subscribe-button').attr('aria-haspopup', 'dialog').text(function () {
    return this.text + ' for this incident'
  })

  function removeExpandIncidents () {
    // expand / show all incidents in a given month
    $('.expand-incidents').click().remove()
  }

  function addIncidentTypeToTarget ($target, pageType, position = null) {
    let incidentLevel
    // homepage incident list has a different html structure to history page
    if (pageType === '/') {
      incidentLevel = Array.from($target.parentNode.classList).filter(c => c.startsWith('impact-'))[0]
    } else {
      incidentLevel = Array.from($target.classList).filter(c => c.startsWith('impact-'))[0]
    }
    const $incidentLevelTextContainer = document.createElement('div')
    $incidentLevelTextContainer.classList.add('incident-level', 'color-secondary')
    if (pageType === '/incidents') {
      $incidentLevelTextContainer.classList.add('font-largest')
    } else {
      const id = generateId()
      $target.setAttribute('aria-describedby', id)
      $incidentLevelTextContainer.setAttribute('id', id)
      $incidentLevelTextContainer.classList.add('font-regular')
    }
    if (incidentLevel in incidentLevelMap) {
      $incidentLevelTextContainer.textContent = incidentLevelMap[incidentLevel]
    }
    if (position && position === 'after') {
      $target.after($incidentLevelTextContainer)
    } else {
      $target.prepend($incidentLevelTextContainer)
    }
  }

  removeExpandIncidents()

  const $logo = document.querySelector('.page-name')
  const $container = document.querySelector('.layout-content > .container')
  const $pageFooter = document.querySelector('.page-footer')

  function swapElForHTML ($oldEl, newHTML) {
    $oldEl.insertAdjacentHTML('beforebegin', newHTML)
    $oldEl.remove()
  }

  function reformatDateRanges () {
    function reformatRange ($range) {
      if (/^[A-Za-z-]+\s+\d+,\s+\d+:\d+\s+-\s+([A-Za-z]+\s+\d+,\s+)?\d+:\d+\s+[A-Z]+$/.test($range.textContent)) {
        const $dateVars = $range.querySelectorAll('var[data-var=date]')

        $range.insertAdjacentElement('afterbegin', $dateVars[0])
        $range.childNodes[1].nodeValue = ' ' + $range.childNodes[1].nodeValue.trim()
        if ($dateVars.length > 1) {
          const $month = $dateVars[1].previousSibling
          $range.insertBefore($dateVars[1], $month)
          $month.nodeValue = $month.nodeValue.replace(' - ', ' ')
          $range.insertBefore(document.createTextNode(' - '), $dateVars[1])
        }
      }
    }

    if (document.querySelector('.incident-list') !== null) {
      const $incidentDateRanges = document.querySelectorAll('.incident-data > .secondary')

      if ($incidentDateRanges !== null) { $incidentDateRanges.forEach($el => reformatRange($el)) }
    }
  }

  function makeSentenceCase (str) {
    const trimmed = str.trim()
    return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  function getNodeByXPath (xpath) {
    const result = document.evaluate(
      xpath,
      document,
      null,
      window.XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    )

    return result.singleNodeValue
  }

  function addIncidentTypeToIncidentList ($list, pathRoot) {
    const $incidentLinks = $list.querySelectorAll('a')

    if ($incidentLinks.length > 0) {
      $incidentLinks.forEach($el => addIncidentTypeToTarget($el, pathRoot, 'after'))
    }
  }

  // Rewrite logo
  if ($logo !== null) {
    $logo.querySelector('a').textContent = 'GOV.UK Notify'
  }

  // Add heading to footer
  if ($pageFooter !== null) {
    $pageFooter.insertAdjacentHTML('afterbegin', '<h2 class="page-footer__heading govuk-visually-hidden">Support links</h2>')
    const $footerLinkText = getNodeByXPath("//div[contains(@class, 'page-footer')]/a/*[contains(., '←')]/following-sibling::text()")

    if ($footerLinkText !== null) {
      $footerLinkText.nodeValue = ' ' + makeSentenceCase($footerLinkText.nodeValue)
    }
  }

  // Home page specific
  if ($container !== null) {
    reformatDateRanges()

    // Home page specific
    if (pathRoot === '/') {
      const $aboutText = document.querySelector('.page-status + .text-section, .unresolved-incidents + .text-section')
      const $pageStatus = document.querySelector('.page-status, .unresolved-incidents')
      const $incidentsList = $container.querySelector('.incidents-list')

      if (($aboutText !== null) && ($pageStatus !== null)) {
        const $pageStatusContent = $pageStatus.querySelector('h2');

        // Add headings and move 'about' text
        $container.insertAdjacentElement('afterbegin', $aboutText)
        $container.insertAdjacentHTML('afterbegin', '<h1 class="font-x-largest">GOV.UK Notify status page</h1>')
        $pageStatus.insertAdjacentHTML('beforebegin', '<h2 class="page-status__heading font-largest">Current status</h2>')

        // Remake status overview h2 to p
        if ($pageStatusContent !== null) {
          swapElForHTML($pageStatusContent, `<p class="${$pageStatusContent.className}">${$pageStatusContent.textContent}</p>`)
        }

        // Rewrite heading for incidents list to make it clear it includes today
        document.querySelector('.incidents-list > h2:first-child').textContent = 'Recent incidents'

        // make components list an actual semantic list
        // adds visually hiddent 'status' text
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

        // add incident descriptor to incidents
        addIncidentTypeToIncidentList($incidentsList, pathRoot)

        // Reformat dates
        document.querySelectorAll('.status-day > .date').forEach($el => {
          if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test($el.textContent)) {
            const $textNodes = Array.from($el.childNodes).filter($el => $el.nodeType === 3)
            $el.insertAdjacentElement('afterbegin', $el.querySelector('var:first-of-type'))
            $textNodes[0].nodeValue = ' ' + $textNodes[0].nodeValue
            $textNodes[1].remove()
          }
        })
      }
    }

    if (pathRoot === '/history') {
      const $pageHeading = $container.querySelector('h4:first-child')
      const $incidentsList = $container.querySelector('.months-container')

      if ($pageHeading !== null) {
        swapElForHTML($pageHeading, `<h1 class="font-x-largest">${makeSentenceCase($pageHeading.textContent)}</h1>`)
      }

      function updateIncidentsListHeadings () {
        const $monthHeadings = $incidentsList.querySelectorAll('h4.month-title')

        if ($monthHeadings.length > 0) {
          $monthHeadings.forEach($el => swapElForHTML($el, `<h2 class="${$el.className}">${$el.textContent}</h2>`))
        }
      }

      addIncidentTypeToIncidentList($incidentsList, pathRoot)

      updateIncidentsListHeadings()

      const observer = new window.MutationObserver(() => {
        updateIncidentsListHeadings()
        reformatDateRanges()
        removeExpandIncidents()
        addIncidentTypeToIncidentList($incidentsList, pathRoot)
      })
      observer.observe($incidentsList, { attributes: true, childList: true, subtree: true })
    }

    if (pathRoot === '/incidents') {
      const $pageHeadingContextPrefix = getNodeByXPath("//h1/following-sibling::div[contains(@class, 'subheader')]/text()")
      const $affectedHeading = $container.querySelector('.components-affected')
      const $incidentHeading = document.querySelector('.incident-name')

      if ($pageHeadingContextPrefix !== null) {
        $pageHeadingContextPrefix.nodeValue = makeSentenceCase($pageHeadingContextPrefix.nodeValue) + ' '
      }

      if ($affectedHeading !== null) {
        $affectedHeading.insertAdjacentHTML(
          'afterbegin', '<h2 class="govuk-visually-hidden">Components affected</h2>'
        )
      }
      addIncidentTypeToTarget($incidentHeading, pathRoot)
    }
  }
})
