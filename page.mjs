import puppeteer from 'puppeteer';
import * as fs from 'fs';

const baseUrl = 'https://status.notifications.service.gov.uk'
const pages = {
    'index': '/',
    'history': '/history',
  }

const customJS = fs.readFile('./custom-footer.js', 'utf8', (data) => {
  return data;
});

const outputPage = async (filename, content) => { 
   fs.writeFile(filename, content,(err) => err && console.error(err));
}


const getPageMarkup = async (url, pageName) => {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage();
    await page.goto(url);
    await page.evaluate((customJS) => {

      // replace css file link with local one
      var externalCSS = document.querySelector('link[href*="external"]')
      externalCSS.setAttribute('href', 'custom.css')
      //inject local js file
      const scriptElement = document.querySelector('.custom-footer-container > script');
      scriptElement.innerHTML = customJS;
    },customJS);

    const content = await page.content();
    await outputPage(`${pageName}.html`, content);
    await browser.close();
}

for (const page in pages) {
  await getPageMarkup(`${baseUrl}${pages[page]}`, page);
}