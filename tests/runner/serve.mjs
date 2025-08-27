import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import http from 'node:http';
import { EOL } from "node:os";
import nunjucks from 'nunjucks';
import { getTemplateFromPage, saveTemplate } from './getTemplateFromPage.mjs';
import getTemplatesFromPages from './getTemplatesFromPages.mjs';
import { statusPageUrls } from './variables.mjs';

const currentDir = path.dirname(url.fileURLToPath(import.meta.url));
const fileOpts = { 'encoding': 'utf-8' };

async function checkFileExists (filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      console.error(`Trying to find the local HTML, JS and CSS code but failing finding ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(err);
    return false
  }

  return true;
};

async function getPagesAsTemplates () {

  const templates = {};

  templates['/'] = await getTemplateFromPage(statusPageUrls.base);
  templates['/history'] = await getTemplateFromPage(statusPageUrls.historyPage);
  templates['/incidents/<id>'] = await getTemplateFromPage(statusPageUrls.incidentPage);

  return templates;

};

async function getTemplatesFromFiles () {

  const templateStrings = {};

  templateStrings['/'] = await fs.readFile(path.join(currentDir, 'index.html'), fileOpts);
  templateStrings['/history'] = await fs.readFile(path.join(currentDir, 'history.html'), fileOpts);
  templateStrings['/incidents/<id>'] = await fs.readFile(path.join(currentDir, 'incident.html'), fileOpts);

  return templateStrings;

};

async function getLocalCode () {

  const files = {
    'custom-footer.js': path.resolve('../../custom-footer.js'),
    'custom-footer.html': path.resolve('../../custom-footer.html'),
    'custom.css': path.resolve('../../custom.css')
  }

  // test that files actually exist
  for (const [key, filePath] of Object.entries(files)) {
    if (!await checkFileExists(filePath)) {
      console.log(`${filePath} doesn't exist!`);
      return null
    }
  }

  console.log('All local files exist, trying to read them');

  const customFooterHTML = await fs.readFile(files['custom-footer.html'], fileOpts);
  const customFooterJS = await fs.readFile(files['custom-footer.js'], fileOpts);
  const customCSS = await fs.readFile(files['custom.css'], fileOpts);

  const customFooter = `${customFooterHTML}${EOL}<script>${customFooterJS}</script>`;

  return {
    'customFooterHTML': customFooter,
    'customCSS': {
      'path': 'http://localhost:3000/assets/stylesheets/custom.css',
      'contents': customCSS
    }
  };

};

async function getTemplates (opts) {

  let templates;

  if (opts.forceRefresh === true) {
    templates = await getTemplatesFromPages();
    for (const [route, templateString] of Object.entries(templates)) {
      saveTemplate(templateString, route);
    }
  } else {
    // TODO: if template files don't exist, message user and get them from live site
    templates = await getTemplatesFromFiles();
  }

  return templates;

};

async function serveLocal () {

  let templates;
  let localCode = await getLocalCode();

  if (localCode === null) {
    console.error('Local code not found');
    return;
  }

  templates = await getTemplates({ forceRefresh: true });

  // start server
  const server = http.createServer((req, res) => {
    console.log(req.url);
    if (req.url in templates) {
      res.write(nunjucks.renderString(templates[req.url], localCode));
      res.end();
    } else {
      if (req.url === '/assets/stylesheets/custom.css') {
        res.write(localCode.customCSS.contents);
        res.end()
      } else {
        res.statusCode = 404;
        res.end(`No page found for ${req.url}`);
      }
    }
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

}

export { serveLocal, getTemplates, getPagesAsTemplates, getTemplatesFromFiles, getLocalCode };
