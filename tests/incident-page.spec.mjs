import { expect, browser, $ } from '@wdio/globals';
import { serverConfig } from '../server/config.mjs';

describe('History page', () => {

  beforeAll( async () => {
    await browser.url(`http://${serverConfig.hostname}:${serverConfig.port}/incidents`);
  });

  describe('skip link', () => {
    it('should exist and link to the correct element that has the required ID', async () => {
      const $skiplink = $('.govuk-skip-link');
      await expect($skiplink).toBeExisting();
      await expect($skiplink).toHaveAttribute('href', '#main-content');
      await expect($('.incident-updates-container')).toHaveId('main-content');
    });
  });

  describe('page subheading', () => {
    it('is not in Title Case', async () => {
      // by default the text before the link says "Incident Report"
      // below is the shortcut to test if the text manipulation output is correct
      await expect(await $('.subheader').getText()).toContain('Incident report for GOV.UK Notify');
    });
  });

  describe('affected components section', () => {
    it('is preceded by a visually hidden heading that says "Components affected"', async () => {
      const componentAffectedSection = $('.components-affected > h2');
      await expect(await componentAffectedSection.getText()).toContain('Components affected');
    });
  });

  // TODO: test subscribe to this incident button aria and text, but we'd need an ongoing incident
});
