import http from 'node:http';
import nunjucks from 'nunjucks';
import { loadTemplates } from './helpers/loadTemplates.mjs';
import { loadLocalCode } from './helpers/loadLocalCode.mjs';
import { serverConfig } from './config.mjs';

async function serveLocal () {
  
  // get generated templates and local customisation files
  let templates = await loadTemplates();
  let localCode = await loadLocalCode();

  // start server
  const server = http.createServer((req, res) => {
    console.log('request url:', req.url);
    if (req.url in templates) {
      res.write(nunjucks.renderString(templates[req.url], localCode));
      res.end();
    } else {
      if (req.url.includes('custom.css')) {
        res.write(localCode.customCSS.contents);
        res.end()
      } else {
        res.statusCode = 404;
        res.end(`No page found for ${req.url}`);
      }
    }
  });

  const PORT = serverConfig.port;
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

}

await serveLocal();