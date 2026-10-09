const BANNER_CONTAINER_SELECTOR = '#cpt-notification-container'

function bannerMatchingAjaxMessage (ajaxMessage) {
  const matches = $.grep($('.cpt-notification'), (el) => {
    return $(el).find('.cpt-notification-message').text().trim() === ajaxMessage
  })

  return (matches.length > 0) ? $(matches[matches.length - 1]) : null
}

function removeBannersForResourse (resourcePath) {
  $(`.cpt-notification[data-resource="${resourcePath}"]`).remove()
}

function addResourceMetaToBanner ($banner, resourcePath) {
  $banner.attr('data-resource', resourcePath) // set as attribute to allow targeting by CSS selector
}

function linkMessageToField ($banner, message, $formField) {
  $banner.find('.cpt-notification-message').html(`<a href="#${$formField.attr('id')}">${message}</a>`)
}

function bindRefocusOfField ($bannerWithMessage, $formField) {
  const refocusField = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if ( // Test for API namespace before calling
      (!!window.SP) && (!!window.SP.currentPage) &&
      (!!window.SP.currentPage.updatesDropdown) && (!!window.SP.currentPage.updatesDropdown.show)
    ) {
      window.SP.currentPage.updatesDropdown.isOpen && window.SP.currentPage.updatesDropdown.show()
    }
    $formField.focus()
  }

  $bannerWithMessage.find('.cpt-notification__close-btn').on('click', refocusField)
  $bannerWithMessage.find('.cpt-notification-message a').on('click', refocusField)
}

function addErrorMessageToField (message, $formField) {
  const errorId = `${$formField.attr('id')}-error`
  const $form = $($formField.get(0).form)
  $formField.before(`
    <p class="validation-error" id="${errorId}">
      <span class="visually-hidden">Error: </span>${message}
    </p>
  `)
  $formField.attr('aria-describedby', errorId)
}

function removeErrorMessageFromField ($formField) {
  $formField.siblings('.validation-error').remove()
  $formField.removeAttr('aria-describedby')
}

function bindCustomBehavioursToFormResponses () {
  ['email', 'sms', 'webhook'].forEach(channel => {
    const $form = $(`#subscribe-form-${channel}`)

    if ($form.length > 0) {
      // all responses to forms see to come from a 200, including validation errors
      $form.on('ajax:success', function (evt, data) {
        if (Object.prototype.hasOwnProperty.call(data, 'text')) {
          // add custom behaviours if banner message matches that in the AJAX response
          const $bannerWithMessage = bannerMatchingAjaxMessage(data.text)

          if ($bannerWithMessage !== null) {
            const $formField = $form.find('#email, #phone-number, #email-webhooks')

            removeBannersForResourse($form.attr('action'))

            if ($formField.length > 0) {
              addResourceMetaToBanner($bannerWithMessage, $form.attr('action'))

              if (data.type === 'error') {
                linkMessageToField($bannerWithMessage, data.text, $formField)
                addErrorMessageToField(data.text, $formField)
                bindRefocusOfField($bannerWithMessage, $formField)
              }
            }
          }
        }
      })

      $form.on('ajax:beforeSend', function (xhr, settings) {
        const $submitBtn = $(`#subscribe-btn-${channel}`)
        const $formField = $form.find('#email, #phone-number, #email-webhooks')

        if (($formField.length > 0) && ($submitBtn.length > 0)) {
          // Remove any errors from previous submissions
          $(`.cpt-notification.error[data-resource="${$form.attr('action')}"]`).remove()
          removeErrorMessageFromField($formField)

          // Submit buttons with this attribute will cause warning banners to be added with their text
          const noticeText = $submitBtn.attr('data-long-running-notice-text')

          if (noticeText !== undefined) {
            // If the banner gets added, mark it as related to resource the form POSTs to
            const $bannerWithMessage = bannerMatchingAjaxMessage(noticeText)

            if ($bannerWithMessage) {
              addResourceMetaToBanner($bannerWithMessage, $form.attr('action'))
            }
          }
        }
      })
    }
  })
}

function revisedNotify (message, options) {
  const argLenTheSame = (arguments.length === 2)
  const msgTypeTheSame = typeof message === 'string'
  const optTypeTheSame = Object.prototype.toString.call(options) === '[object Object]'
  const originalMethod = revisedNotify.cachedOriginal

  // If API has changed, use original
  if (!(argLenTheSame && msgTypeTheSame && optTypeTheSame) && Object.prototype.hasOwnProperty.call(this, originalMethod)) {
    return this[originalMethod].apply(this, arguments)
  }

  options = $.extend({
    delay: 5e3,
    cssClass: 'success',
    id: 'cpt-notification-' + Math.ceil(1e5 * Math.random()),
    method: 'show',
    autoHide: true
  }, options)

  const methods = {
    show: function () {
      if (message) {
        const headingText = {
          success: 'Success',
          error: 'There is a problem',
          info: 'Status update',
          warning: 'Warning'
        }
        let $container = $(BANNER_CONTAINER_SELECTOR)
        let $banner;

        const $wrapper = $(`
          <div class="cpt-notification flag-message ${options.cssClass}" id="${options.id}" tabindex="-1">
            <div class="cpt-notification__header">
              <h2 class="cpt-notification__heading">${headingText[options.cssClass]}</h2>
              <button class="cpt-notification__close-btn">Close</button>
            </div>
            <p class="cpt-notification-message">${message}</p>
          </div>
        `)

        $('.cpt-notification__close-btn', $wrapper).on('click', e => this.hide())

        if ($container.length === 0) {
          $container = $('<div id="cpt-notification-container"></div>')
        }
        if ($('body > #cpt-notification-container').get(0) === $container.get(0)) {
          $imagesContainer.after($container)
        }
        $container
          .addClass('cpt-notification-container')
          .append($wrapper)

        $banner = $container.find('.cpt-notification')
        $banner.attr('tabindex', '-1')
        $banner.trigger('focus')
      }
    },
    hide: function () {
      $('#' + options.id).addClass('hiding')
      setTimeout(function () {
        methods.remove()
      }, 200)
    },
    remove: function () {
      $('#' + options.id).remove()
    },
    deferred: function () {
      if (options.cssClass) { window.localStorage.setItem('HRBnotifyclass', options.cssClass) }
      if (message !== null) { window.localStorage.setItem('HRBnotify', message) }
    }
  }

  methods[options.method]()
}

revisedNotify.cachedOriginal = '_notify'

// Banners are at the bottom of the document but will appear at the top so put them there
function moveBannerContainer () {
  const imagesContainerSelector = '.images-container'
  const $bannerContainer = $(BANNER_CONTAINER_SELECTOR)

  if ($(`${imagesContainerSelector} + ${BANNER_CONTAINER_SELECTOR}`).length === 0) {
    $(imagesContainerSelector).after($bannerContainer)
  }

  return $bannerContainer
}

// Give banners an ARIA role matching this GOV.UK notification banner variant:
// https://design-system.service.gov.uk/components/notification-banner/#reacting-to-something-the-user-has-done
function updateBannerContainerRole ($bannerContainer) {
  $bannerContainer.attr('role', 'alert')

  return $bannerContainer
}

function reviseBanners (window) {
  // Guard against HRB.utils.notify being removed
  if ((!!window.HRB) && (!!window.HRB.utils) && (!!window.HRB.utils.notify)) {
    window.HRB.utils[revisedNotify.cachedOriginal] = window.HRB.utils.notify // cache original for fallbacks
    window.HRB.utils.notify = revisedNotify

    const $bannerContainer = moveBannerContainer() // move banners to position they appear visually
    updateBannerContainerRole($bannerContainer) // update to role=alert
    // changes to banners that need the AJAX response (needs to run on page load)
    $(bindCustomBehavioursToFormResponses)
  }
}

export { reviseBanners }
