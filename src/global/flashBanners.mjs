const BANNER_CONTAINER_SELECTOR = "#cpt-notification-container"

function revisedNotify (message, options) {
  const argLenTheSame = (arguments.length === 2)
  const msgTypeTheSame = typeof message === "string"
  const optTypeTheSame = Object.prototype.toString.call(options) === '[object Object]'
  const originalMethod = revisedNotify.cachedOriginal

  // If API has changed, use original
  if (!(argLenTheSame && msgTypeTheSame && optTypeTheSame) && this.hasOwnProperty(originalMethod)) {
    return this[originalMethod].apply(this, arguments)
  }

  var options = $.extend({
    delay: 5e3,
    cssClass: "success",
    id: "cpt-notification-" + Math.ceil(1e5 * Math.random()),
    method: "show",
    autoHide: true
  }, options);

  const methods = {
    show: function() {
      if (message) {
        const headingText = {
          'success': 'Success',
          'error': 'There is a problem',
          'info': 'Status update',
          'warning': 'Warning'
        }
        let $container = $(BANNER_CONTAINER_SELECTOR)

        const $wrapper = $(`
          <div class="cpt-notification flag-message ${options.cssClass}" id="${options.id}">
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
        $container.addClass('cpt-notification-container')
        $container.append($wrapper)
      }
    },
    hide: function() {
      $("#" + options.id).addClass("hiding")
      setTimeout(function() {
        methods.remove()
      }, 200)
    },
    remove: function() {
      $("#" + options.id).remove()
    },
    deferred: function() {
      if (options.cssClass) { localStorage.setItem("HRBnotifyclass", options.cssClass) }
      if (message !== null) { localStorage.setItem("HRBnotify", message) }
    }
  }

  methods[options.method]()
}

revisedNotify.cachedOriginal = '_notify'

function moveBannerContainer () {
  const imagesContainerSelector = ".images-container"
  const $bannerContainer = $(BANNER_CONTAINER_SELECTOR)

  if ($(`${imagesContainerSelector} + ${BANNER_CONTAINER_SELECTOR}`).length === 0) {
    $(imagesContainerSelector).after($bannerContainer);
  }

  return $bannerContainer
}

function updateBannerContainerAria ($bannerContainer) {
  $bannerContainer.attr('role', 'alert')

  return $bannerContainer
}

function reviseBanners (window) {
  // Guard against HRB.utils.notify being removed
  if ((!!window.HRB) && (!!window.HRB.utils) && (!!window.HRB.utils.notify)) {
    window.HRB.utils[revisedNotify.cachedOriginal] = window.HRB.utils.notify; // cache original for fallbacks
    window.HRB.utils.notify = revisedNotify;

    const $bannerContainer = moveBannerContainer(); // move banners to position they appear visually
    updateBannerContainerAria($bannerContainer) // update to role=alert
  }
}

export { reviseBanners }
