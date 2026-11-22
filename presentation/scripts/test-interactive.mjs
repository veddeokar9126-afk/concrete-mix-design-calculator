// Click every interactive control in the built deck (offline) and check
// that what the slides show equals what the engine computes directly.
//   node presentation/scripts/test-interactive.mjs   (after npm run present:build)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { designMix, fig1WaterCementRatio } from '../../src/lib/mixDesign.js';
import { VERIFICATION_CASES } from '../../src/lib/verification.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.resolve(here, '../dist/index.html')).href;

let fails = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!cond) fails += 1;
};
const n = (s) => Number(String(s).replace(/[^0-9.\-]/g, ''));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
await ctx.setOffline(true);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_INTERNET_DISCONNECTED') && errors.push(m.text()));
const go = async (label) => {
  await page.evaluate((l) => (window.location.hash = `#/${l}`), label);
  await page.waitForTimeout(400);
};
const S = '.stage ';

await page.goto(url + '#/01');
await page.evaluate(() => document.fonts.ready);

/* ---------- keyboard and hash ---------- */
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
ok((await page.evaluate(() => location.hash)) === '#/02', 'ArrowRight moves to slide 02 and updates the hash');
await page.keyboard.press('Space');
await page.waitForTimeout(200);
ok(await page.locator(S + '.problem.is-calc').count() === 1, 'Space reveals the calculator half of slide 02');
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(200);
ok(await page.locator(S + '.problem.is-hand').count() === 1, 'ArrowLeft steps back to "By hand"');
await page.locator(S + 'button:has-text("With our calculator")').click();
await page.waitForTimeout(200);
ok(await page.locator(S + '.problem.is-calc').count() === 1, 'Toggle button switches before/after');
await page.keyboard.press('b');
await page.waitForTimeout(200);
ok((await page.evaluate(() => location.hash)) === '#/B1', 'B jumps to the backup slides');
await page.keyboard.press('1');
await page.keyboard.press('2');
await page.keyboard.press('Enter');
await page.waitForTimeout(200);
ok((await page.evaluate(() => location.hash)) === '#/12', '"12 Enter" jumps to slide 12');

/* ---------- 06 scope cards ---------- */
await go('06');
for (const name of ['High strength', 'Self-compacting', 'Mass concrete', 'Ordinary & standard']) {
  await page.locator(S + `.scope-card:has-text("${name}")`).click();
  await page.waitForTimeout(150);
  ok(await page.locator(S + `.scope-card.on:has-text("${name}")`).count() === 1, `Scope card "${name}" selects`);
}
await page.locator(S + '.scope-card:has-text("High strength")').click();
ok((await page.locator(S + '.scope-detail').innerText()).includes('Table 8'), 'Section 3 detail mentions Table 8');
await page.locator(S + '.scope-card:has-text("Ordinary & standard")').click();

/* ---------- 07 procedure ---------- */
await go('07');
const A = designMix(VERIFICATION_CASES[0].input);
const procExpect = [
  [2, A.targetStrength.toFixed(2)],
  [4, A.wc.toFixed(2)],
  [5, String(A.water)],
  [6, String(A.ssd.cement)],
  [7, A.caVolFraction.toFixed(3)],
  [8, A.volumes.vAgg.toFixed(3)],
  [10, String(A.field.water)],
];
for (const [k, want] of procExpect) {
  await page.locator(S + `.proc li:nth-child(${k}) button`).click();
  await page.waitForTimeout(250);
  const got = (await page.locator(S + '.pd-num').innerText()).replace(/,/g, '');
  ok(got === want, `Procedure step ${k} shows ${want} (got ${got})`);
}
ok((await page.evaluate(() => location.hash)) === '#/07', 'Clicking procedure steps stays on slide 07');

/* ---------- 08 Figure 1 ---------- */
await go('08');
const read2 = async () => n(await page.locator(S + '.read.c2 b').innerText());
ok((await read2()).toFixed(3) === fig1WaterCementRatio(2, 48.25).wc.toFixed(3), 'Fig. 1 at 48.25 shows the engine reading for Curve 2');
await page.locator(S + 'input[type=range]').fill('30');
await page.waitForTimeout(200);
ok((await read2()).toFixed(3) === fig1WaterCementRatio(2, 30).wc.toFixed(3), `Fig. 1 slider to 30 shows ${fig1WaterCementRatio(2, 30).wc.toFixed(3)}`);
ok((await page.locator(S + '.fig1-out').innerText()).includes('durability governs'), 'At 30 N/mm², Severe: durability governs');
await page.locator(S + '.dur-pick button:has-text("Mild")').click();
await page.waitForTimeout(150);
ok((await page.locator(S + '.dur-lab').textContent()).includes('0.55'), 'Exposure Mild moves the IS 456 line to 0.55');
await page.locator(S + 'button:has-text("Reset to M40")').click();
await page.locator(S + '.dur-pick button:text-is("Severe")').click();
ok(await page.locator(S + '.is-read').count() === 1, 'Reset shows the "IS reads 0.36" marker');

/* ---------- 09 durability ---------- */
await go('09');
const durNums = async () => page.locator(S + '.dur-nums b').allInnerTexts();
await page.locator(S + '.expo:has-text("Extreme")').click();
await page.waitForTimeout(150);
ok(JSON.stringify(await durNums()) === JSON.stringify(['360', '0.40', 'M40']), 'Extreme → 360 / 0.40 / M40');
await page.locator(S + '.t6 button:has-text("10 mm")').click();
await page.waitForTimeout(150);
ok((await durNums())[0] === '400', 'Extreme with 10 mm aggregate → 360 + 40 = 400');
await page.locator(S + '.t6 button:has-text("40 mm")').click();
await page.waitForTimeout(150);
ok((await durNums())[0] === '330', 'Extreme with 40 mm aggregate → 360 − 30 = 330');
await page.locator(S + '.expo:has(b:text-is("Severe"))').click();
await page.locator(S + '.t6 button:has-text("20 mm")').click();

/* ---------- 10 mini calculator ---------- */
await go('10');
const base = { ...VERIFICATION_CASES[0].input, aggCondition: 'ssd' };
const presets = {
  'M40 Annex A': {},
  'Exposure → Extreme': { exposure: 'extreme' },
  'Slump 75 → 125': { slump: 125 },
  '20 → 10 mm aggregate': { msa: 10 },
  'Chute → Pumping': { placing: 'pumping', pumpableReduction: 10 },
  'M20 in Severe': { fck: 20, wcMode: 'auto' },
};
const readCalc = async () => {
  const vals = (await page.locator(S + '.outs .out b').allInnerTexts()).map(n);
  const ratio = (await page.locator(S + '.ratio b').innerText()).replace(/\s+/g, ' ').trim();
  const checks = await page.locator(S + '.check').evaluateAll((els) => els.map((e) => e.className.replace('check ', '')));
  return { vals, ratio, checks };
};
for (const [label, patch] of Object.entries(presets)) {
  await page.locator(S + `.presets button:has-text("${label}")`).click();
  await page.waitForTimeout(250);
  const r = designMix({ ...base, ...patch });
  const want = [r.targetStrength, r.wc, r.water, r.ssd.cement, r.ssd.ca, r.ssd.fa];
  const got = await readCalc();
  ok(
    JSON.stringify(got.vals.map((x) => Number(x.toFixed(2)))) === JSON.stringify(want.map((x) => Number(Number(x).toFixed(2)))),
    `Preset "${label}": ${want.join(' / ')} (shown ${got.vals.join(' / ')})`
  );
  ok(got.ratio === `1 : ${r.ratio.fa.toFixed(2)} : ${r.ratio.ca.toFixed(2)}`, `Preset "${label}" ratio ${got.ratio}`);
  const failing = r.checks.filter((c) => ['minCementitious', 'maxCement', 'wc', 'minGrade'].includes(c.id) && !c.pass).length;
  ok(got.checks.filter((c) => c !== 'pass').length === failing, `Preset "${label}": ${failing} failing check(s) shown`);
}
/* Annex A spelled out */
await page.locator(S + '.presets button:has-text("M40 Annex A")').click();
await page.waitForTimeout(250);
const annex = await readCalc();
ok(JSON.stringify(annex.vals) === JSON.stringify([48.25, 0.36, 148, 412, 1234, 648]), `M40 Annex A preset = 48.25 / 0.36 / 148 / 412 / 1234 / 648 (shown ${annex.vals.join(' / ')})`);
ok(annex.ratio === '1 : 1.57 : 3.00', 'M40 Annex A ratio 1 : 1.57 : 3.00');

/* individual controls */
await page.locator(S + 'select[aria-label="Grade"]').selectOption('30');
await page.locator(S + 'select[aria-label="Cement type"]').selectOption('opc53');
await page.locator(S + 'select[aria-label="Exposure"]').selectOption('moderate');
await page.locator(S + '[aria-label="Sand zone"] button:has-text("III")').click();
await page.locator(S + '[aria-label="Admixture"] button:has-text("Off")').click();
await page.locator(S + '[aria-label="w/c mode"] button:has-text("Auto")').click();
await page.locator(S + '[aria-label="Aggregate size"] button:has-text("40 mm")').click();
await page.locator(S + '[aria-label="Slump"] button:has-text("100")').click();
await page.waitForTimeout(250);
{
  const r = designMix({ ...base, fck: 30, cementType: 'opc53', cementSG: 3.15, exposure: 'moderate', faZone: 'III', chemType: 'none', wcMode: 'auto', msa: 40, slump: 100 });
  const got = await readCalc();
  const want = [r.targetStrength, r.wc, r.water, r.ssd.cement, r.ssd.ca, r.ssd.fa];
  ok(JSON.stringify(got.vals.map((x) => Number(x.toFixed(2)))) === JSON.stringify(want.map((x) => Number(Number(x).toFixed(2)))), `Custom M30 · OPC 53 · Moderate · Zone III · no SP · 40 mm · slump 100: ${want.join(' / ')}`);
  ok((await page.locator(S + '.notice').innerText()).startsWith('Custom'), 'Custom inputs clear the preset note');
}
await page.locator(S + '[aria-label="w/c mode"] button:has-text("Manual")').click();
await page.locator(S + 'button[aria-label="Increase w/c"]').click();
await page.waitForTimeout(150);
ok((await page.locator(S + '.stepper code').innerText()) === '0.37', 'Manual w/c stepper 0.36 → 0.37');
await page.locator(S + '.presets button:has-text("M40 Annex A")').click();

/* ---------- 11 demo ---------- */
await go('11');
ok(await page.locator(S + '.browser-view img').count() === 1, 'Offline: demo slide shows the screenshot fallback');
ok(await page.locator(S + 'svg.qr').count() === 1, 'QR code renders offline');
await page.locator(S + '.demo-list li:nth-child(2) button').click();
await page.waitForTimeout(100);
ok(await page.locator(S + '.demo-list li.done').count() === 1, 'Checklist item ticks');
await page.locator(S + '.demo-list li:nth-child(2) button').click();

/* ---------- 12, 13 reveal ---------- */
await go('12');
ok(await page.locator(S + '.vsum.in').count() === 0, 'Slide 12 starts with the table only');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
ok(await page.locator(S + '.vsum.in').count() === 1, 'Slide 12 click reveals 83/83 summary');
ok((await page.locator(S + '.vbig b').first().innerText()).replace(/\s/g, '') === '83/83', 'Summary shows 83/83');

/* ---------- presenter, audience window, overview ---------- */
await go('07');
await page.keyboard.press('p');
await page.waitForTimeout(300);
ok(await page.locator('.presenter').count() === 1, 'P opens presenter mode');
ok((await page.locator('.pv-notes').innerText()).length > 100, 'Presenter shows speaker notes');
ok(await page.locator('.pv-next .slide').count() === 1, 'Presenter shows the next-step preview');
ok((await page.locator('.pv-sections').innerText()).includes('10:00'), 'Presenter shows section time targets ending at 10:00');
const [popup] = await Promise.all([ctx.waitForEvent('page'), page.locator('button:has-text("Open audience window")').click()]);
await popup.waitForLoadState();
await popup.waitForTimeout(500);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
const popupStep = await popup.locator('.stage .proc li.cur .pr-n').innerText();
const mainStep = await page.locator('.pv-current .proc li.cur .pr-n').innerText();
ok(popupStep === mainStep, `Audience window follows the presenter (step ${mainStep})`);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
await go('10');
await page.locator('.pv-current .presets button:has-text("M20 in Severe")').click();
await page.waitForTimeout(400);
ok((await popup.locator('.stage .presets .chip.on').innerText()) === 'M20 in Severe', 'Calculator state mirrors to the audience window');
await page.locator('.pv-current .presets button:has-text("M40 Annex A")').click();
await popup.close();
await page.keyboard.press('p');
await page.waitForTimeout(200);
ok(await page.locator('.presenter').count() === 0, 'P closes presenter mode');
await page.keyboard.press('o');
await page.waitForTimeout(400);
ok((await page.locator('.ov-item').count()) === 20, 'O shows all 20 slides');
await page.locator('.ov-item').nth(15).click();
await page.waitForTimeout(200);
ok((await page.evaluate(() => location.hash)) === '#/16', 'Overview click jumps to slide 16');

/* ---------- reload from a hash ---------- */
await page.goto(url + '#/09');
await page.waitForTimeout(300);
ok((await page.locator('.stage .slide').getAttribute('data-slide')) === '09', 'Opening …#/09 lands on slide 09');

console.log(errors.length ? `page errors: ${errors.join(' | ')}` : 'page errors: none');
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
await browser.close();
process.exit(fails || errors.length ? 1 : 0);
