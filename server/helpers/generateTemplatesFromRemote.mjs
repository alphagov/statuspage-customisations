import * as cheerio from 'cheerio';
import { pages, statusPageBaseUrl } from "../config.mjs";
import { writeFile } from './file.mjs';

// get remote page source
async function getRemoteSource(url) {
  console.log(`fetching content from ${url}`);
  // get the page markup
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status} returned for request to ${url}`);
  }

  const pageContent = await response.text();
  return pageContent
}

// we modify the page source with a new custom css link href
// and a custom footer Nunjucks variable that we populate with
// local content when serving
async function modifySourceMarkup(source) {
  const $ = cheerio.load(source);

  // re-route all relative requests to https://status.notifications.service.gov.uk
  $('html').prepend(`<base href="${statusPageBaseUrl}" />`);

  // hollow out custom footer container
  const $customFooter = $('.custom-footer-container');
  if ($customFooter.length > 0) {
    console.log('Custom footer found, about to rewrite contents with template variable');
    $customFooter.html('{{ customFooterHTML | safe }}');
  }

  // repoint custom css tag to local URL
  const $cssLinkTag = $('link[href*="external"]')
  if ($cssLinkTag.length > 0) {
    console.log('CSS tag found, about to rewrite href with template variable');
    $cssLinkTag.attr('href', '{{ customCSS.path }}');
  }

  // return modified page HTML
  return $.html();
}

// we have the file to be used as a Nunjucks template that's served
async function generateTemplateFromRemote(item) {
  // get source
  const remoteSource = await getRemoteSource(item.remoteUrl)
  // transform source
  const modifiedSource = await modifySourceMarkup(remoteSource)
  // save file
  await writeFile(item.localFileName, modifiedSource)
}

// used for the npm run refresh script
async function generateAllTemplatesFromRemote() {
  for (const item of pages) {
    await generateTemplateFromRemote(item);
  }
}

export { generateTemplateFromRemote, generateAllTemplatesFromRemote }
