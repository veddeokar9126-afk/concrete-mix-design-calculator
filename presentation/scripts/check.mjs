// Screenshot every slide of the built deck at 1920 x 1080, offline, and
// report elements that spill outside the slide's content area.
//   node presentation/scripts/check.mjs            (after npm run present:build)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(here, '../dist/index.html');
const outDir = path.resolve(here, '../.shots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
await context.setOffline(true);
const page = await context.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(pathToFileURL(file).href + '#/01');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const labels = await page.evaluate(() => {
  const out = [];
  for (let i = 1; i <= 15; i += 1) out.push(String(i).padStart(2, '0'));
  return [...out, 'B1', 'B2', 'B3', 'B4'];
});

const problems = [];
for (const label of labels) {
  await page.evaluate((l) => (window.location.hash = `#/${l}`), label);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, `${label}-first.png`) });
  // reveal every step on this slide
  for (let k = 0; k < 12; k += 1) {
    const before = await page.evaluate(() => window.location.hash);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
    const after = await page.evaluate(() => window.location.hash);
    if (after !== before) {
      await page.keyboard.press('ArrowLeft');
      break;
    }
  }
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `${label}.png`) });
  const spill = await page.evaluate(() => {
    const body = document.querySelector('.stage .slide-body');
    if (!body) return ['no slide'];
    const s = document.querySelector('.stage').getBoundingClientRect();
    const k = s.width / 1920;
    const b = body.getBoundingClientRect();
    const bad = [];
    body.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (getComputedStyle(el).opacity === '0') return;
      const tol = 3 * k;
      if (r.right > b.right + tol || r.bottom > b.bottom + tol || r.left < b.left - tol || r.top < b.top - tol) {
        bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} → ${Math.round((r.right - b.right) / k)}px right, ${Math.round((r.bottom - b.bottom) / k)}px below`);
      }
      if ((el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) && getComputedStyle(el).overflow === 'hidden' && el.clientHeight > 0) {
        bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} clips its content`);
      }
    });
    return bad.slice(0, 8);
  });
  if (spill.length) problems.push([label, spill]);
}

console.log('console errors:', errors.length ? errors : 'none');
console.log('overflow:', problems.length ? '' : 'none');
for (const [l, s] of problems) console.log(' ', l, '\n    ' + s.join('\n    '));
await browser.close();
