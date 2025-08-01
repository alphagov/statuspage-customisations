$(function () {
  // add skiplink and link to main content
  const pathRoot = '/' + window.location.pathname.split('/')[1]
  const mainContainerMap = {
    '/': '.masthead-container + .container',
    '/history': '.months-container',
    '/incidents': '.incident-updates-container'
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

  removeExpandIncidents()

  const $logo = document.querySelector('.page-name')
  const $container = document.querySelector('.layout-content > .container')
  const $pageFooter = document.querySelector('.page-footer')

  function swapElForHTML ($oldEl, newHTML) {
    $oldEl.insertAdjacentHTML('beforebegin', newHTML)
    $oldEl.remove()
  }

  // Rewrite logo
  if ($logo !== null) {
    $logo.querySelector('a').textContent = 'GOV.UK Notify'
  }

  // Add heading to footer
  if ($pageFooter !== null) {
    $pageFooter.insertAdjacentHTML('afterbegin', '<h2 class="page-footer__heading govuk-visually-hidden">Support links</h2>')
  }

  // Home page specific
  if ($container !== null) {
    if (pathRoot === '/') {
      const $aboutText = document.querySelector('.page-status + .text-section')
      const $pageStatus = document.querySelector('.page-status')
      const $pageStatusContent = $pageStatus.querySelector('h2')

      if (($aboutText !== null) && ($pageStatus !== null) && ($pageStatusContent !== null)) {
        // Add headings and move 'about' text
        $container.insertAdjacentElement('afterbegin', $aboutText)
        $container.insertAdjacentHTML('afterbegin', '<h1 class="font-x-largest">GOV.UK Notify status page</h1>')
        $pageStatus.insertAdjacentHTML('beforebegin', '<h2 class="page-status__heading font-largest">Current status</h2>')

        // Remake status overview from h2 to p
        swapElForHTML($pageStatusContent, `<p class="${$pageStatusContent.className}">${$pageStatusContent.textContent}</p>`)

        // Rewrite heading for incidents list to make it clear it includes today
        document.querySelector('.incidents-list > h2:first-child').textContent = 'Recent incidents'

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
        const pageHeadingText = $pageHeading.textContent

        // stop camel casing
        $pageHeading.textContent = pageHeadingText[0].toUpperCase() + pageHeadingText.toLowerCase().slice(1)
        swapElForHTML($pageHeading, `<h1 class="font-x-largest">${pageHeadingText}</h1>`)
      }

      function updateIncidentsList () {
        const $monthHeadings = $incidentsList.querySelectorAll('h4.month-title')

        if ($monthHeadings.length > 0) {
          $monthHeadings.forEach($el => swapElForHTML($el, `<h2 class="${$el.className}">${$el.textContent}</h2>`))
        }
      }

      updateIncidentsList()

      const observer = new window.MutationObserver(() => {
        updateIncidentsList()
        removeExpandIncidents()
      })
      observer.observe($incidentsList, { attributes: true, childList: true, subtree: true })
    }

    if (pathRoot === '/incidents') {
      const $affectedHeading = $container.querySelector('.components-affected')

      if ($affectedHeading !== null) {
        $affectedHeading.insertAdjacentHTML(
          'afterbegin', '<h2 class="govuk-visually-hidden">Components affected</h2>'
        )
      }
    }
  }
})
