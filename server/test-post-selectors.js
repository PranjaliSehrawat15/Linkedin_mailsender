const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SESSION_FILE = path.join(__dirname, 'session.json');

async function run() {
  if (!fs.existsSync(SESSION_FILE)) {
    console.error('No session.json found');
    return;
  }
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const savedState = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')).storageState;
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    storageState: savedState
  });
  
  const page = await context.newPage();
  
  const keyword = 'Java Developer';
  const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  const mainHTML = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? main.outerHTML : 'No main element';
  });
  
  fs.writeFileSync(path.join(__dirname, 'main.html'), mainHTML);
  console.log('Main element HTML written to main.html');
  
  await browser.close();
}

run().catch(console.error);
