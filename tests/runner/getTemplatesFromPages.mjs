import { getTemplateFromPage } from './getTemplateFromPage.mjs';

export default async function getTemplatesFromPages () {

  const templates = {};

  templates['/'] = await getTemplateFromPage('https://status.notifications.service.gov.uk/');
  templates['/history'] = await getTemplateFromPage('https://status.notifications.service.gov.uk/history');
  templates['/incidents/<id>'] = await getTemplateFromPage('https://status.notifications.service.gov.uk/incidents/2wryjrq3v9mt');

  return templates;

}
