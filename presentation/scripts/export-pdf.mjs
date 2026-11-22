// Static PDF backup of the deck: every slide fully revealed, interactive
// slides frozen in their default M40 state, one 1920 x 1080 page each.
//   npm run present:pdf      (builds first, then runs this)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = path.resolve(here, '../dist/index.html');
const out = path.resolve(here, '../Mix_Design_Presentation_G-8.pdf');
if (!fs.existsSync(html)) {
  console.error('Build the deck first: npm run present:build');
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
await context.setOffline(true);
const page = await context.newPage();
await page.goto(pathToFileURL(html).href + '?print');
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.__deckReady === true, null, { timeout: 15000 });
await page.waitForTimeout(500);
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: out,
  width: '1920px',
  height: '1080px',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log('PDF written:', out);
