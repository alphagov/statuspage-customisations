import { pages } from "../config.mjs";
import { generateTemplateFromRemote } from './generateTemplatesFromRemote.mjs'
import { fileExists, readFile } from './file.mjs';

async function loadTemplates () {
  let templates = {}
  for (const item of pages) {
    if (await fileExists(item.localFileName)) {
      templates[item.localUrl] = await readFile(item.localFileName);
    }
    else {
      console.log(`File '${item.localFileName}' does not exist. Generating it now...`);
      await generateTemplateFromRemote(item);
      console.log(`File '${item.localFileName}' saved. Reading it now...`);
      templates[item.localUrl] = await readFile(item.localFileName);
    }
  }
  return templates
}

export { loadTemplates }
