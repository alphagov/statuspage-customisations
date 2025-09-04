import { EOL } from "node:os";
import { localFiles, serverConfig } from "../config.mjs";
import { fileExists, readFile } from './file.mjs';

async function loadLocalCode () {
  let localCode = {}

  // load contents of local code files
  for (const item of localFiles) {
    if (await fileExists(item.filePath)) {
      localCode[item.fileName] = await readFile(item.filePath);
    } else {
      console.error(`${item.filePath} doesn't exist!`);
    }
  }

  const customFooter = `${localCode.customFooterHtml}${EOL}<script>${localCode.customFooterJs}</script>`;

  return {
    'customFooterHTML': customFooter,
    'customCSS': {
      'path': `http://${serverConfig.hostname}:${serverConfig.port}/assets/stylesheets/custom.css`,
      'contents': localCode.customCss
    }
  };

};

export { loadLocalCode }
