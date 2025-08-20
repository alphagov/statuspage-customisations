import path from 'node:path';

const statusPageBaseUrl = 'https://status.notifications.service.gov.uk/';
const serverConfig = {
  directory: path.resolve('./server'),
  // configure local server if required 
  hostname: 'localhost',
  port: 3000
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
    remoteUrl: `${statusPageBaseUrl}incidents/2wryjrq3v9mt`,
    localUrl: '/incidents',
    localFileName: path.join(serverConfig.directory,'incident.html')
  }
]

// array of local customisation files
const localFiles = [
  {
    fileName: "customFooterHtml",
    filePath: path.resolve('./custom-footer.html'),
  },
  {
    fileName: "customFooterJs",
    filePath: path.resolve('./custom-footer.js'),
  },
  {
    fileName: "customCss",
    filePath: path.resolve('./custom.css'),
  }
]

export { pages, localFiles, statusPageBaseUrl, serverConfig }
