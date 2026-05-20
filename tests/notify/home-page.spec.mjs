import { expect, browser, $ } from '@wdio/globals';
import { serverConfig } from '../../server/config.mjs';

describe('Homepage', () => {

  beforeAll( async () => {
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
      it("the existing container should be replaced by one that announces errors to assistive technologies", async () => {
        await expect($('#cpt-notification-container')).toHaveAttribute('hidden', '');
        await expect($('#cpt-notification-container__duplicate')).toExist();
        await expect($('#cpt-notification-container__duplicate')).toHaveAttribute('role', 'alert');
      });
    });

    describe("when error messages are added to the page", () => {
      let errorMessage;
      let erroredFieldId;

      beforeEach(async () => {
        await $(function() {
          this.document.getElementById('cpt-notification-container__duplicate').innerHTML = `
            <div class="cpt-notification flag-message error showing show" id="cpt-notification-61169" role="alert">
              <div class="cpt-notification-message">Please enter a valid email that you wish to have updates sent to.</div>
            </div>
          `;
        });
      });

      it("they should appear in the new container (and so be announced to assistive technologies)", async () => {
        const newContainer = await $('#cpt-notification-container__duplicate');

        await expect(newContainer).toHaveText(errorMessage);
        // make sure any attributes that the existing JS uses to identify the error are stripped
      });

      it("they should contain a link to the field at error", async () => {
        await expect($('#cpt-notification-container__duplicate a')).toHaveAttribure('href', `#${erroredFieldId}`);
        await expect($('#cpt-notification-container__duplicate a')).toHaveText(errorMessage);
      });

      it("they should be focused", async () => {
        await expect($('#cpt-notification-container__duplicate')).toBeFocused();
      });

      it("and the 'subscribe to updates' popup is closed, hiding the field with errors, the error message is removed", () => {
        await $('#show-updates-dropdown').click();
        await expect($('#cpt-notification-container__duplicate')
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
})

