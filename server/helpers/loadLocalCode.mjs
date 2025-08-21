import { EOL } from "node:os";
import { localFiles } from "../config.mjs";
import { fileExists, readFile } from './file.mjs';

async function loadLocalCode () {
  let localCode = {}

  // test that files actually exist
  for (const item of localFiles) {
    if (await fileExists(item.filePath)) {
      localCode[item.fileName] = await readFile(item.filePath);
    } else {
      console.log(`${item.filePath} doesn't exist!`);
    }
  }

  const customFooter = `${localCode.customFooterHtml}${EOL}<script>${localCode.customFooterJs}</script>`;

  return {
    'customFooterHTML': customFooter,
    'customCSS': {
      'path': 'http://localhost:3000/assets/stylesheets/custom.css',
      'contents': localCode.customCss
    }
  };

};

export { loadLocalCode }
