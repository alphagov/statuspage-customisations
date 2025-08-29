import path from 'node:path';

const statusPageBaseUrl = 'https://status.notifications.service.gov.uk/';
const serverDir = path.resolve('./server');

// array of remote sources and their
// mapping to local file names
// add any new pages here
const pageUrls = [
  {
    remoteUrl: statusPageBaseUrl,
    localUrl: '/',
    localFileName: path.join(serverDir,'index.html')
  },
  {
    remoteUrl: `${statusPageBaseUrl}history/?page=8`,
    localUrl: '/history',
    localFileName: path.join(serverDir,'history.html')
  },
  {
    // specific incident page
    remoteUrl: `${statusPageBaseUrl}incidents/2wryjrq3v9mt`,
    localUrl: '/incidents',
    localFileName: path.join(serverDir,'incident.html')
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

export { pageUrls, localFiles, statusPageBaseUrl }
