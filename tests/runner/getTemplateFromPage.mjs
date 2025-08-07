import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

async function getTemplateFromPage (url) {

  // get the page from https://status.notifications.service.gov.uk
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status} returned for request to ${url}`);
  }
  const pageHTML = await response.text();
  const $ = cheerio.load(pageHTML);

  // re-route all relative requests to https://status.notifications.service.gov.uk
  $('html').prepend(`<base href="https://status.notifications.service.gov.uk" />`);

  // hollow out custom footer container
  const $customFooter = $('.custom-footer-container');
  if ($customFooter.length > 0) {
    console.log('Custom footer found, about to rewrite contents with template literal variable');
    $customFooter.html('{{ customFooterHTML | safe }}');
  }

  // repoint custom css tag to local URL
  const $cssLinkTag = $('link[href*="external"]')
  if ($cssLinkTag.length > 0) {
    console.log('CSS tag found, about to rewrite href with template literal variable');
    $cssLinkTag.attr('href', '{{ customCSS.path }}');
  }

  // return modified page HTML
  return $.html();

}

const routeToFileNameMap = {
  '/': 'index.html',
  '/history': 'history.html',
  '/incidents/<id>': 'incident.html'
};

async function saveTemplate (templateHTML, route) {

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const outputFile = path.join(currentDir, routeToFileNameMap[route]);

  writeFile(outputFile, templateHTML, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Adapted statuspage homepage written to ${outputFile}`);
    }
  });

}

export { saveTemplate, getTemplateFromPage, routeToFileNameMap };
