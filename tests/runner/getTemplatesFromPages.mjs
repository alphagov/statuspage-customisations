import { getTemplateFromPage } from './getTemplateFromPage.mjs';
import { statusPageUrls } from './variables.mjs';

export default async function getTemplatesFromPages () {

  const templates = {};

  templates['/'] = await getTemplateFromPage(statusPageUrls.base);
  templates['/history'] = await getTemplateFromPage(statusPageUrls.historyPage);
  templates['/incidents/<id>'] = await getTemplateFromPage(statusPageUrls.incidentPage);

  return templates;

}
