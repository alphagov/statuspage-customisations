(function () {
  'use strict';

  const mainContainerMap = {
    '/': '.masthead-container + .container',
    '/history': '.months-container',
    '/incidents': '.incident-updates-container'
  };

  const incidentLevelMap = {
    'impact-none': 'No incident',
    'impact-maintenance': 'Maintenance',
    'impact-minor': 'Minor incident',
    'impact-major': 'Major incident',
    'impact-critical': 'Critical incident'
  };

  const incidentsListMap = {
    '/': '.incidents-list',
    '/history': '.months-container'
  };

  /*
   * Utility method, not specific to any accessibility issue
   */
  function generateId () {
    return Math.random().toString(36).replace(/[^a-z]+/g, '')
  }

  /*
   * Utility method, not specific to any accessibility issue
   */
  function swapElForHTML ($oldEl, newHTML) {
    $oldEl.insertAdjacentHTML('beforebegin', newHTML);
    $oldEl.remove();
  }

  /*
   * Fix for a style issue, not accessibility:
   * - This remakes all dates to match GDS style: https://www.gov.uk/guidance/style-guide/a-to-z#dates
   */
  function reformatDateRanges () {
    function reformatRange ($range) {
      if (/^[A-Za-z-]+\s+\d+,\s+\d+:\d+\s+-\s+([A-Za-z]+\s+\d+,\s+)?\d+:\d+\s+[A-Z]+$/.test($range.textContent)) {
        const $dateVars = $range.querySelectorAll('var[data-var=date]');

        $range.insertAdjacentElement('afterbegin', $dateVars[0]);
        $range.childNodes[1].nodeValue = ' ' + $range.childNodes[1].nodeValue.trim();
        if ($dateVars.length > 1) {
          const $month = $dateVars[1].previousSibling;
          $range.insertBefore($dateVars[1], $month);
          $month.nodeValue = $month.nodeValue.replace(' - ', ' ');
          $range.insertBefore(document.createTextNode(' - '), $dateVars[1]);
        }
      }
    }

    if (document.querySelector('.incident-list') !== null) {
      const $incidentDateRanges = document.querySelectorAll('.incident-data > .secondary');

      if ($incidentDateRanges !== null) { $incidentDateRanges.forEach($el => reformatRange($el)); }
    }
  }

  /*
   * Fix for a style issue, not accessibility
   * - Some words are capitalised in the middle of sentences
   */
  function makeSentenceCase (str) {
    const trimmed = str.trim();
    return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  /*
   * Utility method, not specific to any accessibility issue
   */
  function getNodeByXPath (xpath) {
    const result = document.evaluate(
      xpath,
      document,
      null,
      window.XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );

    return result.singleNodeValue
  }

  /*
   * Accessibility issue this proposes to address:
   * - ID: 9, Titles for incidents have different colours which convey a meaning
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/24
   *   - Trello card: https://trello.com/c/ari5FjHW/1425-status-page-status-colours-convey-meaning
   */
  function addIncidentTypeToTarget ($target, pageType, position = null) {
    let incidentLevel;
    // homepage incident list has a different html structure to history page
    if (pageType === '/') {
      incidentLevel = Array.from($target.parentNode.classList).filter(c => c.startsWith('impact-'))[0];
    } else {
      incidentLevel = Array.from($target.classList).filter(c => c.startsWith('impact-'))[0];
    }
    const $incidentLevelTextContainer = document.createElement('div');
    $incidentLevelTextContainer.classList.add('incident-level', 'color-secondary');
    if (pageType === '/incidents') {
      $incidentLevelTextContainer.classList.add('font-largest');
    } else {
      const id = generateId();
      $target.setAttribute('aria-describedby', id);
      $incidentLevelTextContainer.setAttribute('id', id);
      $incidentLevelTextContainer.classList.add('font-regular');
    }
    if (incidentLevel in incidentLevelMap) {
      $incidentLevelTextContainer.textContent = incidentLevelMap[incidentLevel];
    }
    if (position && position === 'after') {
      $target.after($incidentLevelTextContainer);
    } else {
      $target.prepend($incidentLevelTextContainer);
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - ID: 9, Titles for incidents have different colours which convey a meaning
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/24
   *   - Trello card: https://trello.com/c/ari5FjHW/1425-status-page-status-colours-convey-meaning
   */
  function addIncidentTypeToPageHeading (pathRoot) {
    const $incidentHeading = document.querySelector('.incident-name');

    if ($incidentHeading !== null) {
      addIncidentTypeToTarget($incidentHeading, pathRoot);
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - ID: 9, Titles for incidents have different colours which convey a meaning
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/24
   *   - Trello card: https://trello.com/c/ari5FjHW/1425-status-page-status-colours-convey-meaning
   */
  function addIncidentTypeToIncidentList (pathRoot) {
    const $incidentsList = document.querySelector(incidentsListMap[pathRoot]);

    if ($incidentsList !== null) {
      $incidentsList.querySelectorAll('a').forEach($el => addIncidentTypeToTarget($el, pathRoot, 'after'));
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - ID: 21, Some form fields are not correctly set up for autocomplete
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/6
   *   - Trello card: https://trello.com/c/erU3zqaQ/772-status-page-add-missing-autocomplete-attributes-to-subscribe-to-updates-form-input
   */
  function addAutocompleteAttributes () {
    // adds autocomplete attributes to controls that don't have one
    const selectorAndAutocompleteAttributes = {
      email: 'email',
      phone_country: 'tel-country-code',
      phone_number: 'tel-national'
    };

    $.each(selectorAndAutocompleteAttributes, function (key, val) {
      const $targetElements = $(`[name='${key}']`);
      $.each($targetElements, function () {
        $(this).attr('autocomplete', val);
      });
    });
  }

  /*
   * Accessibility issue this proposes to address:
   * - Only an issue with GOV.UK Notify's statuspage. The logo text didn't match what it linked to
   */
  function rewriteLogo (logoText) {
    const $logo = document.querySelector('.page-name');

    if ($logo !== null) {
      $logo.querySelector('a').textContent = logoText;
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - ID: 17, no mechanism to skip to the main content
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/12
   *   - Trello card: https://trello.com/c/YTw6kldC/798-status-page-add-skiplink-to-pages
   */
  function addSkipLink (pathRoot) {
    const $mainContainer = document.querySelector(mainContainerMap[pathRoot]);

    if ($mainContainer !== null) {
      $mainContainer.setAttribute('id', 'main-content');
      document.body.insertAdjacentHTML('afterbegin', '<a href="#main-content" class="govuk-skip-link">Skip to main content</a>');
    }
  }

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
    const $pageFooter = document.querySelector('.page-footer');

    if ($pageFooter !== null) {
      $pageFooter.insertAdjacentHTML('afterbegin', '<h2 class="page-footer__heading govuk-visually-hidden">Support links</h2>');
      const $footerLinkText = getNodeByXPath("//div[contains(@class, 'page-footer')]/a/*[contains(., '←')]/following-sibling::text()");

      if ($footerLinkText !== null) {
        $footerLinkText.nodeValue = ' ' + makeSentenceCase($footerLinkText.nodeValue);
      }
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 53, headings are missing
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
   *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
   *   - Note: this also moves the 'about' text further up the page
   */
  function addHeadingsAndMoveAboutText (content) {
    const $container = document.querySelector('.layout-content > .container');
    const $aboutText = document.querySelector('.page-status + .text-section, .unresolved-incidents + .text-section');
    const $pageStatus = document.querySelector('.page-status, .unresolved-incidents');

    if (($container !== null) && ($aboutText !== null) && ($pageStatus !== null))  {
      $container.insertAdjacentElement('afterbegin', $aboutText);
      $container.insertAdjacentHTML('afterbegin', `<h1 class="font-x-largest">${content.h1Text}</h1>`);
      $pageStatus.insertAdjacentHTML('beforebegin', `<h2 class="page-status__heading font-largest">${content.h2Text}</h2>`);
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 53, headings are missing
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
   *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
   *   - Note: stops this heading being a heading
   */
  function remakeStatusOverviewHeadingAsParagraph () {
    const $pageStatusContent = document.querySelector('.page-status h2, .unresolved-incidents h2');

    if ($pageStatusContent !== null) {
      swapElForHTML($pageStatusContent, `<p class="${$pageStatusContent.className}">${$pageStatusContent.textContent}</p>`);
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 53, headings are missing
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
   *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
   *   - Note: The existing heading is 'Past incidents' but it can contain current ones
   */
  function rewriteIncidentsListHeading () {
    const $incidentsListHeading = document.querySelector('.incidents-list > h2:first-child');

    if ($incidentsListHeading !== null) {
      $incidentsListHeading.textContent = 'Recent incidents';
    }
  }

  function remakeComponentsList () {
    const $componentContainer = document.querySelector('.components-container');

    swapElForHTML(document.querySelector('.components-container'), `<ul class="${$componentContainer.className}">${$componentContainer.innerHTML}</ul>`);
    const $newComponentContainer = document.querySelector('.components-container');
    const $components = $newComponentContainer.querySelectorAll('.component-container');
    $components.forEach($el => {
      const classes = $el.className;
      const $componentName = $el.querySelector('.name');
      const $componentStatus = $el.querySelector('.component-status');
      const componentStatusClasses = $el.querySelector('.component-inner-container').className;
      const $listElement = `
    <li class="${classes} ${componentStatusClasses}">
      <span class="${$componentName.className}">
        ${$componentName.textContent}
      </span>
      <span class="${$componentStatus.className}">
        <span class="govuk-visually-hidden">status: </span>
        ${$componentStatus.textContent}
      </span>
    </li>`;
      swapElForHTML($el, $listElement);
    });
  }

  function reformatDates () {
    document.querySelectorAll('.status-day > .date').forEach($el => {
      if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test($el.textContent)) {
        const $textNodes = Array.from($el.childNodes).filter($el => $el.nodeType === 3);
        $el.insertAdjacentElement('afterbegin', $el.querySelector('var:first-of-type'));
        $textNodes[0].nodeValue = ' ' + $textNodes[0].nodeValue;
        $textNodes[1].remove();
      }
    });
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 53, headings are missing
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
   *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
   */
  function swapHistoryPageH4ForH1 () {
    const $pageHeading = document.querySelector('.layout-content > .container h4:first-child');

    if ($pageHeading !== null) {
      swapElForHTML($pageHeading, `<h1 class="font-x-largest">${makeSentenceCase($pageHeading.textContent)}</h1>`);
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 53, headings are missing
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
   *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
   */
  function updateIncidentsListHeadings (pathRoot) {
    const incidentsListSelector = incidentsListMap[pathRoot];
    const $monthHeadings = document.querySelectorAll(`${incidentsListSelector} h4.month-title`);

    if ($monthHeadings.length > 0) {
      $monthHeadings.forEach($el => swapElForHTML($el, `<h2 class="${$el.className}">${$el.textContent}</h2>`));
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 37, the showy-hidey feature shows content before itself
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/11
   *   - Trello card: https://trello.com/c/ekoRmpGe/784-status-page-hidden-incidents-in-the-incident-history-are-revealed-above-the-show-button
   */
  function removeExpandIncidentsButton () {
    // expand / show all incidents in a given month
    $('.expand-incidents').click().remove();
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 28, Subscribe button does not make its purpose clear
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/9
   *   - Trello card: https://trello.com/c/rcUYJrW2/788-status-page-fix-subscribe-to-updates-button-visible-only-during-incidents
   */
  function fixSubscribeToIncidentUpdatesButton () {
    // a11y fixes for subscribe to ongoing incident(s) button
    $('.subscribe-button').attr('aria-haspopup', 'dialog').text(function () {
      return this.text + ' for this incident'
    });
  }

  /*
   * Fix for a style issue, not accessibility
   * - Some words are capitalised in the heading context prefix
   */
  function remakePageHeadingPrefixInSentenceCase () {
    const $pageHeadingContextPrefix = getNodeByXPath("//h1/following-sibling::div[contains(@class, 'subheader')]/text()");

    if ($pageHeadingContextPrefix !== null) {
      $pageHeadingContextPrefix.nodeValue = makeSentenceCase($pageHeadingContextPrefix.nodeValue) + ' ';
    }
  }

  /*
   * Accessibility issue this proposes to address:
   * - issue ID: 53, headings are missing
   *   - PR: https://github.com/alphagov/statuspage-customisations/pull/16
   *   - Trello card: https://trello.com/c/fVAVltqC/796-status-page-add-headings-to-pages
   */
  function addAffectedComponentsHeading () {
    const $affectedHeading = document.querySelector('.components-affected');

    if ($affectedHeading) {
      $affectedHeading.insertAdjacentHTML(
        'afterbegin', '<h2 class="govuk-visually-hidden">Components affected</h2>'
      );
    }
  }

  const pathRoot = '/' + window.location.pathname.split('/')[1];

  // Guard against new pages
  if (pathRoot in mainContainerMap) {
    // Add skiplink, only for the home and incident pages
    // The history page only loads its main content area after the page load so needs this to run later
    if ((pathRoot in mainContainerMap) && (pathRoot !== '/history')) {
      addSkipLink(pathRoot);
    }

    // Leave this until we know if it's still needed
    $('.components-container').removeClass('two-columns').addClass('one-column');

    addAutocompleteAttributes();
    fixSubscribeToIncidentUpdatesButton();
    removeExpandIncidentsButton();
    rewriteLogo('GOV.UK Notify');
    addHeadingToFooter();
    reformatDateRanges();

    const $container = document.querySelector('.layout-content > .container');

    // Home page specific
    if (pathRoot === '/') {
      addHeadingsAndMoveAboutText({ h1Text: 'GOV.UK Notify status page', h2Text: 'Current status' });
      remakeStatusOverviewHeadingAsParagraph();
      rewriteIncidentsListHeading();
      remakeComponentsList();
      addIncidentTypeToIncidentList(pathRoot);
      reformatDates();
    }

    if (pathRoot === '/history') {
      const $historyContentContainer = $container.querySelector('.layout-content > .container > div:first-of-type');

      swapHistoryPageH4ForH1();

      if ($historyContentContainer !== null) {
        const observer = new window.MutationObserver((mutationRecords) => {
          const $incidentsList = document.querySelector(incidentsListMap[pathRoot]);

          // prevent our changes triggering mutations, and so this function
          observer.disconnect();

          addSkipLink(pathRoot);
          reformatDateRanges();
          removeExpandIncidentsButton();
          addIncidentTypeToIncidentList(pathRoot);
          updateIncidentsListHeadings(pathRoot);

          // reset observation, targeted only the history entries we expect the pagination to change
          observer.observe($incidentsList, { attributes: true, childList: true, subtree: true });
        });

        // the page loads as an empty shell, with nothing between the heading and footer
        // so watch for the rest of the content to load before changing it
        observer.observe($historyContentContainer, { attributes: true, childList: true, subtree: true });
      }
    }

    if (pathRoot === '/incidents') {
      remakePageHeadingPrefixInSentenceCase();
      addIncidentTypeToPageHeading(pathRoot);
      addAffectedComponentsHeading();
    }
  }

})();
