import { expect, browser, $ } from '@wdio/globals';
import { serverConfig } from '../../server/config.mjs';

describe('Homepage', () => {
  let recaptchaMock;
  let trackSubscriptionAttemptMock;
  let statusMock;
  let emailPostMock;

  const documentRoot = 'https://status.notifications.service.gov.uk';

  beforeAll( async () => {
    /*
     * Statuspage's JS continuously polls the server, for the latest status
     * This can potentially cause reloads, if things have changed so return unchanged status
     */
    const statusMock = await browser.mock(`${documentRoot}/api/v2/status.json`);
    statusMock.respond({
      "page": {
        "id": "RC-zi8XCyzjRNrrfx",
        "name": "GOV.UK Notify",
        "url": "https://status.notifications.service.gov.uk",
        "time_zone": "Europe/London",
        "updated_at": "2026-10-01T12:04:41.463+01:00"
      },
      "status": {
        "indicator": "none",
        "description": "All Systems Operational"
      }
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: 200,
      fetchResponse: false
    });
    /*
     * We don't want Google Recaptcha to run in our tests.
     * But some of statuspage's JS makes use of its JS API, so fake the response and stub the JS API.
     */ 
    recaptchaMock = await browser.mock('https://www.recaptcha.net/recaptcha/enterprise.js');
    recaptchaMock.respond(`
      window.grecaptcha = {
        getPageId: () => 'RC-zi8XCyzjRNrrfx',
        enterprise: {
          getResponse: () => {},
          ready: (cb) => cb && cb(),
          render: () => {},
          reset: () => {}
        }
    }`,
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/javascript; charset=utf-8"
      },
      statusCode: 200,
      fetchResponse: false
    });

    // Also block statuspage's form submission tracking
    trackSubscriptionAttemptMock = await browser.mock(`${documentRoot}/subscriptions/track_attempt`)
    trackSubscriptionAttemptMock.respond("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      fetchResponse: false
    });

    // Responses are set in the tests, to simulate types of banner
    emailPostMock = await browser.mock(`${documentRoot}/subscriptions/new-email`);

    await browser.url(`http://${serverConfig.hostname}:${serverConfig.port}`);
  });

  describe('skip link', () => {
    it('should exist and link to the correct element that has the required ID', async () => {
      const $skiplink = $('.govuk-skip-link');
      await expect($skiplink).toBeExisting();
      await expect($skiplink).toHaveAttribute('href', '#main-content');
      await expect($('.masthead-container + .container')).toHaveId('main-content');
    });
  });

  describe("masthead page name link text", () => {
    it('should say "GOV.UK Notify"', async () => {
       await expect($('.page-name a')).toHaveText('GOV.UK Notify');
    });
  });

  describe("subscribe to updates pop-up", () => {
    it('inputs have the correct autcomplete attribute', async () => {
      await expect($('[name="email"]')).toHaveAttribute('autocomplete', 'email');
      await expect($('[name="phone_country"]')).toHaveAttribute('autocomplete', 'tel-country-code');
      await expect($('[name="phone_number"]')).toHaveAttribute('autocomplete', 'tel-national');
    });
  });

  describe("validation error messages", () => {
    describe("when the page loads", () => {
      let $bannerContainer;

      beforeEach(async () => {
        $bannerContainer = $('#cpt-notification-container');
      });

      it("the banners container should be moved to the place in the page it appears visually", async () => {
        await expect($bannerContainer).toBeExisting();
        await expect($bannerContainer.previousElement()).toHaveElementClass('images-container');
      });

      // We're focusing banners when added to the page so don't want that to happen inside a live region
      // In practice, this causes announcements to be duplicated
      it("the banners container should have its 'status' ARIA role removed", async () => {
        await expect($bannerContainer).not.toHaveComputedRole('status');$
      });
    });

    describe("when error messages are added to the page", () => {
      beforeAll(async () => {
        emailPostMock.respond({
          text: "Please enter a valid email that you wish to have updates sent to.",
          type: "error"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          statusCode: 200,
          fetchResponse: false
        });
        await $("#show-updates-dropdown").click();
        await $("#email").setValue("notify.user");
        await $("#subscribe-btn-email").click();
      });

      it("they should be styled as an error banner", async () => {
        await expect($('.cpt-notification')).toHaveElementClass('error');
      });

      // The approach with the placement of the alert region matches design system's error summary:
      // https://design-system.service.gov.uk/components/error-summary/
      it("they should appear in the new container and wrap their contents in an ARIA alert region", async () => {
        const $banner = await $('.cpt-notification');
        const $bannerContainer = $banner.parentElement();
        await expect($banner).toBeExisting();
        await expect($('.cpt-notification > div')).toHaveComputedRole('alert');
      });

      it("they should be focused", async () => {
        await expect($('.cpt-notification')).toBeFocused();
      });

      it("they should contain a link to the field at error", async () => {
        const $linkToField = await $('.cpt-notification .cpt-notification-message > a');
        await expect($linkToField).toBeExisting();
        await expect($linkToField).toHaveAttribute('href', '#email');
      });

      it("the field at error should have the error added to it as a hint linked to as its accessible description", async () => {
        const $field = $('#email')
        const $fieldHint = await $field.previousElement();
        const fieldHintId = await $fieldHint.getAttribute('id');
        await expect($fieldHint).toHaveText("Error:\nPlease enter a valid email that you wish to have updates sent to.");
        await expect($field).toHaveAttribute('aria-describedby', fieldHintId);
      });

      it("clicking the link to the field at error should focus it", async () => {
        await $('.cpt-notification .cpt-notification-message > a').click();
        await expect($('#email')).toBeFocused();
      });

      it("clicking its close button should make the error banner disappear", async () => {
        await $('.cpt-notification__close-btn').click();
        await expect($('.cpt-notification')).not.toBeExisting();
      });
    });

    describe("when success messages are added to the page", () => {
      beforeAll(async () => {
        // Submit the form again, so we start with an error banner and an error in the form field
        // Note: the response will still use the mock response with type:error
        await $("#subscribe-btn-email").click();

        emailPostMock.respond({
          text: "You've now subscribed to email notifications",
          type: "success"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          statusCode: 200,
          fetchResponse: false
        });
        await $("#email").setValue("notify.user");
        await $("#subscribe-btn-email").click();
      });

      it("existing error banners, and errors in the form field, should be removed", async () => {
        await expect($('.cpt-notification[data-resource="/subscriptions/new-email"]')).toBeExisting();
        await expect($('label[for="email"] + p.error-message')).not.toBeExisting()
      });

      it("they should be styled as a success banner", async () => {
        const $banner = await $('.cpt-notification');
        await expect($banner).toHaveElementClass('success')
      });

      it("clicking its close button should make the notification disappear", async () => {
        await $('.cpt-notification__close-btn').click();
        await expect($('.cpt-notification')).not.toBeExisting();
      });
    });

    describe("when the form for subscribing is set up to warn about a potential long wait for responses", () => {
      const warningText = "Response times are currently over 5 mins, please wait while we deal with your subscription";

      beforeAll(async () => {
        await browser.execute((warningText) => {
          document.getElementById('subscribe-btn-email').setAttribute('data-long-running-notice-text', warningText);
        }, warningText);

        emailPostMock.respond({
          text: "You've now subscribed to email notifications",
          type: "success"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          statusCode: 200,
          fetchResponse: false
        });
        await $("#show-updates-dropdown").click();
        await $("#email").setValue("notify.user");
        await $("#subscribe-btn-email").click();
      });

      it("should show the warning before the request is sent", async () => {
        emailPostMock.on('match', async ({url}) => {
          const $banner = await $('cpt-notification.warning');
          await expect($banner).toBeExisting();
          await expect($banner).toHaveElementClass('warning');
          await expect($banner).toHaveText(warningText);
        });
      });

      it("should remove the warning when the response to the form submission comes", async () => {
        await expect($('.cpt-notification.warning')).not.toBeExisting();
        await expect($('.cpt-notification.success')).toBeExisting();
      });

      it("clicking its close button should make the notification disappear", async () => {
        await $('.cpt-notification__close-btn').click();
        await expect($('.cpt-notification')).not.toBeExisting();
      });
    });
  });

  describe("about this page section", () => {
    it('should have a h1 that says "GOV.UK Notify status page"', async () => {
      const $heading = $('.layout-content > .container h1');
      await expect($heading).toBeExisting();
      await expect($heading).toHaveText('GOV.UK Notify status page');
    });

    it('should has been moved before the page status section', async () => {
      await expect($('.text-section').previousElement()).not.toHaveElementClass('page-status');
      await expect($('.text-section').nextElement()).toHaveElementClass('page-status__heading');
    });
  });

  describe("page status section", () => {
    it('if it exists, the h2 has been converted to a paragraph', async () => {
      if ($('.page-status').length > 0) {
        await expect($('.page-status h2')).not.toExist();
        await expect($('.page-status p')).toExist();
      }
    });

    it('is preceded by a h2 that says "Current status', async () => {
      let $pageStatus = $('.page-status, .unresolved-incidents');
      const $pageStatusHeading = $pageStatus.previousElement();

      await expect(await $pageStatusHeading.getTagName()).toBe('h2');
      await expect(await $pageStatusHeading.getText()).toBe('Current status');
    });
  });

  describe("component status list", () => {
    it('has been converted to an unordered list', async () => {
      await expect(await $('.components-container').getTagName()).toBe('ul');
    });
  });

  describe("component status list items", () => {
    it('have been converted to an a list item and contain component name, status and visually hidden status descriptor', async () => {
      for await (const el of $$('.component-inner-container')) {
         await expect(await el.getTagName()).toBe('li');
         await expect(await el.$('.name')).toBeExisting();
         await expect(await el.$('.component-status')).toBeExisting();
         await expect(await el.$('.component-status span')).toHaveElementClass('govuk-visually-hidden');
         await expect(await el.$('.component-status span')).toHaveText('status:')
      }
    });
  });

  describe("incidents list", () => {
    it('should have a h2 that says "Recent incidents"', async () => {
      await expect($('.incidents-list > h2:first-child')).toHaveText('Recent incidents');
    });
  });

  describe("incident date formats", () => {
    it('should be <DD MMM YYYY>', async () => {
      for await (const el of $$('.status-day > .date')) {
        const isInCorrectFormat = (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(await el.getText()))
        await expect(isInCorrectFormat).toBeTruthy()
      }
    });
  });

  describe("incident list link", () => {
    it('should have incident type descriptor below the link and be linked to it vis aria-describedby ', async () => {
      const incidentLevelMap = {
        'impact-none': 'No incident',
        'impact-maintenance': 'Maintenance',
        'impact-minor': 'Minor incident',
        'impact-major': 'Major incident',
        'impact-critical': 'Critical incident'
      }
      for await (const el of $$('.incidents-list .incident-title')) {
        const impactLevelClass = (await el.getAttribute('class')).split(" ")[1]
        const incidentLink = await el.$('a')
        const incidentDescriptorElemement = await el.$('.incident-level')
        const elementAria = await incidentLink.getAttribute('aria-describedby')
        const descriptorElementAria = await incidentDescriptorElemement.getAttribute('id')

        await expect(await incidentDescriptorElemement.getText()).toBe(incidentLevelMap[impactLevelClass])
        await expect(await elementAria).toBe(descriptorElementAria)
      }
    });
  });

  // these are present on all pages so they'll only be tested once here
  describe("page footer", () => {
    it('should have a hidden h2 that says "Support links"', async () => {
      const $heading = $('.page-footer .page-footer__heading');
      await expect($heading).toBeExisting();
      await expect($heading).toHaveElementClass('govuk-visually-hidden');
      await expect($heading).toHaveText('Support links');
    });
  });

  describe('custom footer', () => {
    it('should exist', async () => {
       await expect($('.custom-footer-container')).toBeExisting();
    });

    it('should contain a link to the accessibility statement', async () => {
      const $link = $('.custom-footer-container a');
      await expect($link).toBeExisting();
      await expect($link).toHaveAttribute('href', 'https://www.notifications.service.gov.uk/accessibility-statement');
    });
  });

  describe("if a notice is in the browser's local storage when the page loads", () => {
    beforeAll(async () => {
      await browser.execute(() => {
        window.localStorage.setItem("HRBnotify", "We are experiencing an issue with our system");
        window.localStorage.setItem("HRBnotifyclass", "info");
      });
      // browser.refresh() just hangs when used so just reload the page manually
      await browser.url(`http://${serverConfig.hostname}:${serverConfig.port}`);
    });

    it("a banner should be shown matching the style and message set in local storage", async () => {
      const $banner = await $('.cpt-notification.info');
      await expect($banner).toBeExisting();
      await expect($banner.$('.cpt-notification-message')).toHaveText('We are experiencing an issue with our system');
    });

  });

})

