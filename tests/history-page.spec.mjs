import { expect, browser, $ } from '@wdio/globals';
import { serverConfig } from '../server/config.mjs';

describe('History page', () => {

  beforeAll( async () => {
    await browser.url(`http://${serverConfig.hostname}:${serverConfig.port}/history`);
  });

  describe('skip link', () => {
    it('should exist and link to the correct element that has the required ID', async () => {
      const $skiplink = $('.govuk-skip-link');
      await expect($skiplink).toBeExisting();
      await expect($skiplink).toHaveAttribute('href', '#main-content');
      await expect($('.months-container')).toHaveId('main-content');
    });
  });

  describe("page heading", () => {
    it('should be a H1', async () => {
      const $heading = $('.container > .font-x-largest');
      await expect(await $heading.getTagName()).toBe('h1');
    });

    it('should not be in Title Case', async () => {
      const $heading = $('.container > .font-x-largest');
      await expect(/^\s*(?:\s*[A-Z][a-z]*\s*\b)+\s*$/.test(await $heading.getText())).not.toBeTruthy();
    });
  });
  
  describe("incident list headings", () => {
    it('should be H2s instead of H4s and not in Title Case', async () => {
      for await (const el of $$('.month-title')) {
        await expect(await el.getTagName()).toBe('h2');
      }
    });
  });

  describe("incident list date format", () => {
    it('should be DD MMM', async () => {
      // we change the date format from MMM DD to DD MMM
      for await (const el of $$('.incident-data > .secondary')) {
        await expect(/^(([0-9])|([0-2][0-9])|([3][0-1]))\ (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(await el.getText())).toBeTruthy();
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
      for await (const el of $$('.incident-data > a')) {
        const impactLevelClass = (await el.getAttribute('class')).split(" ")[0]
        const incidentDescriptorElemement = await el.nextElement()
        const elementAria = await el.getAttribute('aria-describedby')
        const descriptorElementAria = await incidentDescriptorElemement.getAttribute('id')

        await expect(await incidentDescriptorElemement.getText()).toBe(incidentLevelMap[impactLevelClass])
        await expect(await elementAria).toBe(descriptorElementAria)
      }
    });
  });
});
