/**
 * Every number on the slides comes from the calculator's own engine in
 * ../../src/lib. Nothing here re-implements the procedure; it only calls
 * the engine with the inputs of IS 10262 : 2019, Annex A.
 *
 * The one exception is HAND below: the figures of our own hand
 * calculation, copied from the project report, so they can be compared.
 */
import { designMix, batchQuantities, fig1WaterCementRatio } from '../../src/lib/mixDesign.js';
import { VERIFICATION_CASES, runVerification, runAllVerification } from '../../src/lib/verification.js';
import { initialGradingState } from '../../src/lib/grading.js';
import { combineGrading, gradingCompliance } from '../../src/lib/grading.js';

import tablesSrc from '../../src/lib/tables.js?raw';
import mixSrc from '../../src/lib/mixDesign.js?raw';
import sccSrc from '../../src/lib/sccDesign.js?raw';
import moistureSrc from '../../src/lib/moisture.js?raw';
import gradingSrc from '../../src/lib/grading.js?raw';
import verifySrc from '../../src/lib/verification.js?raw';

export const SITE_URL = 'https://veddeokar9126-afk.github.io/concrete-mix-design-calculator/';
export const REPO_URL = 'https://github.com/veddeokar9126-afk/concrete-mix-design-calculator';

/* ------------------------------------------------------------------ */
/* Annex A, exactly as the verification suite runs it                  */
/* ------------------------------------------------------------------ */

export const ANNEX_A_INPUT = VERIFICATION_CASES[0].input; // w/c entered as 0.36, dry aggregate
export const M40 = designMix(ANNEX_A_INPUT);
/* The same mix with w/c read by the calculator from its digitised curve */
export const M40_AUTO = designMix({ ...ANNEX_A_INPUT, wcMode: 'auto' });
export const FIG1_READING_M40 = fig1WaterCementRatio(M40.curve, M40.targetStrength).wc;

export const VERIFY_A = runVerification(VERIFICATION_CASES[0]);
export const VERIFY_ALL = runAllVerification();
export const VERIFY_TOTALS = VERIFY_ALL.reduce(
  (a, c) => ({ total: a.total + c.total, exact: a.exact + c.exact, passed: a.passed + c.passed }),
  { total: 0, exact: 0, passed: 0 }
);

export const BATCH_1M3 = batchQuantities(M40, 1, false);

/* Clause 5.6 grading blend, opened on Annex A's own sieve analysis */
const g = initialGradingState(20, 'ordinary');
export const GRADING = {
  ...g,
  compliance: gradingCompliance(combineGrading(g.fractions, g.proportions, g.sieves), g.limits),
};

/* Line counts of the engine files, read at build time */
const lines = (s) => s.split('\n').length;
export const ENGINE_FILES = [
  { file: 'tables.js', role: 'IS 10262 Tables 1–15, Figure 1, IS 456 Tables 3, 5, 6, IS 383 Table 7', lines: lines(tablesSrc) },
  { file: 'mixDesign.js', role: 'Sections 2, 3 and 5: the step-by-step engine', lines: lines(mixSrc) },
  { file: 'sccDesign.js', role: 'Section 4: self-compacting concrete', lines: lines(sccSrc) },
  { file: 'moisture.js', role: 'Dry / wet aggregate correction', lines: lines(moistureSrc) },
  { file: 'grading.js', role: 'Combined grading and blend search, cl. 5.6', lines: lines(gradingSrc) },
  { file: 'verification.js', role: 'The six annex examples and their printed values', lines: lines(verifySrc) },
];
export const ENGINE_LINES = ENGINE_FILES.slice(0, 5).reduce((a, f) => a + f.lines, 0);

/* ------------------------------------------------------------------ */
/* Helpers to read the engine's own calculation sheet                  */
/* ------------------------------------------------------------------ */

export function stepLine(result, clause, labelStart) {
  const st = result.steps.find((s) => s.clause === clause);
  return st?.lines.find((l) => String(l.label).startsWith(labelStart));
}

/* ------------------------------------------------------------------ */
/* Our hand calculation, from the project report (w/c read as 0.35)    */
/* ------------------------------------------------------------------ */

export const HAND = {
  targetStrength: 48.25,
  wc: 0.35,
  water: 148,
  cement: 423,
  ca: 1231,
  fa: 641,
  chem: 4.23,
  ratio: '1 : 1.52 : 2.91',
  density: 2447,
};

/* IS 10262 : 2019, Annex A, as printed */
export const IS_ANNEX_A = {
  targetStrength: 48.25,
  wc: 0.36,
  water: 148,
  cement: 412,
  ca: 1234,
  fa: 648,
  chem: 4.12,
};

/* The three places where the standard reads its own Figure 1 */
export const FIG1_READINGS = [
  { annex: 'A, B, C', target: 48.25, curve: 2, printed: 0.36 },
  { annex: 'E', target: 38.25, curve: 2, printed: 0.43 },
  { annex: 'F', target: 20.77, curve: 2, printed: 0.61 },
].map((x) => ({ ...x, digitised: fig1WaterCementRatio(x.curve, x.target).wc }));

/* ------------------------------------------------------------------ */
/* Mini calculator                                                     */
/* ------------------------------------------------------------------ */

export const CALC_BASE = {
  ...ANNEX_A_INPUT,
  aggCondition: 'ssd',
};

export const PRESETS = [
  {
    id: 'annexA',
    label: 'M40 Annex A',
    patch: {},
    notice: 'The IS example: w/c 0.36 entered as the standard reads it. Matches Annex A exactly.',
  },
  {
    id: 'extreme',
    label: 'Exposure → Extreme',
    patch: { exposure: 'extreme' },
    notice: 'Limits tighten to w/c 0.40, 360 kg cement, M40 minimum. Strength still governs, so the mix does not change.',
  },
  {
    id: 'slump',
    label: 'Slump 75 → 125',
    patch: { slump: 125 },
    notice: '+3 % water per extra 25 mm slump. Same w/c, so cement rises with the water.',
  },
  {
    id: 'agg10',
    label: '20 → 10 mm aggregate',
    patch: { msa: 10 },
    notice: 'Smaller aggregate needs more water (Table 4) and +40 kg minimum cement (IS 456 Table 6). Cement crosses 450.',
  },
  {
    id: 'pump',
    label: 'Chute → Pumping',
    patch: { placing: 'pumping', pumpableReduction: 10 },
    notice: 'Coarse aggregate volume cut by 10 % (cl. 5.5.2) for a more workable, pumpable mix.',
  },
  {
    id: 'm20severe',
    label: 'M20 in Severe',
    patch: { fck: 20, wcMode: 'auto' },
    notice: 'Figure 1 gives 0.54, IS 456 caps it at 0.45. And M20 is below the M30 minimum for Severe, so the check fails.',
  },
];

export function runCalc(input) {
  try {
    return designMix(input);
  } catch (e) {
    return { ok: false, errors: [String(e.message || e)] };
  }
}

export const M40_BASE_RESULT = runCalc(CALC_BASE);
