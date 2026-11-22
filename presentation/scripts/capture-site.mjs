// Captures the live calculator so the demo slide has an offline fallback image.
// Run once while online: node presentation/scripts/capture-site.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const URL = 'https://veddeokar9126-afk.github.io/concrete-mix-design-calculator/';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/site-screenshot.jpg');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
await browser.close();
console.log('saved', out);
