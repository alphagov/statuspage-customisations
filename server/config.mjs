import path from 'node:path';
import fsPromises from 'node:fs/promises';
import { fileExists } from './helpers/file.mjs';


if (process.env.BASE_URL === undefined) {
  throw new ReferenceError('BASE_URL environment variable not set, please add it to the .env file & source it');
}

if (process.env.TEAM === undefined) {
  throw new ReferenceError('TEAM environment variable not set, please add it to the .env file & source it');
}

if (process.env.INCIDENT_SHA === undefined) {
  throw new ReferenceError('INCIDENT_SHA environment variable not set, please add it to the .env file & source it');
}

const statusPageBaseUrl = process.env.BASE_URL;
const team = process.env.TEAM;
const incidentSha = process.env.INCIDENT_SHA
const serverConfig = {
  directory: path.resolve(`./server/${team}`),
  // configure local server if required 
  hostname: 'localhost',
  port: 3000
}

// make team folder if doesn't exist
if (!(await fileExists(path.join(serverConfig.directory)))) {
  throw new ReferenceError(`${serverConfig.directory} folder doesn't exist, please add it, with copies of custom.scss and custom-footer.mjs`);
}

// array of remote sources and their
// mapping to local file names
// add any new pages here
const pages = [
  {
    remoteUrl: statusPageBaseUrl,
    localUrl: '/',
    localFileName: path.join(serverConfig.directory,'index.html')
  },
  {
    remoteUrl: `${statusPageBaseUrl}history/?page=8`,
    localUrl: '/history',
    localFileName: path.join(serverConfig.directory,'history.html')
  },
  {
    // specific incident page
    remoteUrl: `${statusPageBaseUrl}incidents/${incidentSha}`,
    localUrl: '/incidents',
    localFileName: path.join(serverConfig.directory,'incident.html')
  }
]

// array of local customisation files
const localFiles = [
  {
    fileName: "customFooterHtml",
    filePath: path.resolve(`./dist/${team}/custom-footer.html`),
  },
  {
    fileName: "customFooterJs",
    filePath: path.resolve(`./dist/${team}/custom-footer.js`),
  },
  {
    fileName: "customCss",
    filePath: path.resolve(`./dist/${team}/custom.css`),
  }
]

export { pages, localFiles, statusPageBaseUrl, serverConfig }
