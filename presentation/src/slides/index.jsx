/**
 * The running order. `target` is the time budget in seconds; the main
 * slides add up to exactly 600 s (10:00). `steps` is how many clicks the
 * slide reveals before moving on. Notes are written to be spoken.
 */
import { TitleSlide, ProblemSlide, CubeSlide } from './intro.jsx';
import { TimelineSlide, ArchitectureSlide, ScopeSlide } from './develop.jsx';
import { ProcedureSlide, Fig1Slide, DurabilitySlide } from './procedure.jsx';
import { CalcSlide, DemoSlide } from './calculator.jsx';
import { VerificationSlide, HandSlide, FeaturesSlide, LimitsSlide, ConclusionSlide } from './results.jsx';
import { QASlide, WcSlide, WhatIfSlide, SectionsSlide } from './backup.jsx';

export const SECTIONS = [
  { name: 'Intro + how we built it', from: 0, to: 200 },
  { name: 'Procedure + live calculator', from: 200, to: 460 },
  { name: 'Verification + wrap-up', from: 460, to: 600 },
];

const MAIN = [
  {
    id: 'title',
    title: 'Title',
    Component: TitleSlide,
    dark: true,
    presenter: 1,
    target: 20,
    steps: 0,
    notes: [
      'Good afternoon. We are Group 08: Ved, Vikas, Vishandeep, Yamini and Yash.',
      'Our project is a concrete mix design calculator. It follows IS 10262 : 2019 for proportioning, and checks every mix against the durability limits of IS 456 : 2000.',
      'In ten minutes we will show how we built it, how to use it step by step, and how we checked that it is correct.',
    ],
  },
  {
    id: 'problem',
    title: 'The problem',
    Component: ProblemSlide,
    presenter: 1,
    target: 35,
    steps: 1,
    notes: [
      'Designing even one mix by hand means about eight table lookups, plus reading a value off a graph, plus a long chain of arithmetic.',
      'One slip, say in the cement volume, flows into both aggregate masses. And if the grade, exposure or slump changes, you start again.',
      '[Click] With our calculator you enter the inputs once. You get the full working in under a second, every step shows its clause, and the IS 456 limits are checked for you.',
    ],
  },
  {
    id: 'cube',
    title: 'Mix design in one picture',
    Component: CubeSlide,
    presenter: 1,
    target: 40,
    steps: 5,
    notes: [
      'The whole idea of mix design fits in one cubic metre. This is the absolute volume method: every material takes up its solid volume, which is its mass divided by specific gravity times 1000.',
      '[Click] First, 1 % entrapped air for 20 mm aggregate. [Click] Then cement, 412 kg, which is 0.143 cubic metre. [Click] Then water, 148 kg, and a small amount of superplasticizer.',
      '[Click] Whatever is left, 0.695 cubic metre, must be aggregate. [Click] We split it into fine and coarse aggregate using Table 5. That gives the full mix, with a fresh density of about 2446 kg per cubic metre.',
    ],
  },
  {
    id: 'develop',
    title: 'How we developed it',
    Component: TimelineSlide,
    presenter: 1,
    target: 60,
    steps: 7,
    notes: [
      'This is how we built it, in seven stages.',
      '[1] First we studied IS 10262, IS 456 and IS 383 clause by clause and listed every table and check. [Click] [2] Then we typed every table into one data file, tables.js. For example, this is Table 5 for coarse aggregate volume, with the 2019 values.',
      '[Click] [3] Figure 1 is a graph, not a table, so we digitised its three curves at every 0.01 of w/c from 0.25 to 0.65. That is 123 points. The calculator finds w/c by inverse interpolation between the two points on either side.',
      '[Click] [4] The engine is plain JavaScript functions: inputs in, a clause-by-clause sheet out. [Click] [5] On top we built the interface in React and Vite. [Click] [6] We verified it against all six worked examples in the standard.',
      '[Click] [7] It is hosted free on GitHub Pages. Every time we push code, GitHub Actions runs the verification first; if any number drifts from the standard, it does not deploy. [Click] There is no backend; everything runs in the browser.',
    ],
  },
  {
    id: 'arch',
    title: 'Architecture',
    Component: ArchitectureSlide,
    presenter: 1,
    target: 25,
    steps: 2,
    notes: [
      'The structure is simple. On the left are the inputs: mix data, material test results and admixtures.',
      '[Click] They go into one engine, in the folder src/lib. Each file has one job: the tables, the main procedure, self-compacting concrete, moisture correction, aggregate grading and verification.',
      '[Click] Out come the calculation sheet, the durability checks, the proportions and ratio, grading, batch quantities, trial mixes and a printed report.',
    ],
  },
  {
    id: 'scope',
    title: 'Scope',
    Component: ScopeSlide,
    presenter: 1,
    target: 20,
    steps: 0,
    notes: [
      'IS 10262 has four design sections, and the calculator covers all four.',
      'Section 2 is normal grades, M10 to M60, which is what we will demo. [Click Section 3] High strength, M65 to M100, takes w/c from Table 8 instead of Figure 1. Self-compacting concrete is Section 4, and mass concrete with 80 or 150 mm aggregate is Section 5.',
      'Now [next presenter] will show the procedure.',
    ],
  },
  {
    id: 'procedure',
    title: 'The procedure',
    Component: ProcedureSlide,
    presenter: 2,
    target: 75,
    steps: 10,
    notes: [
      'Here is the procedure for using it. Each step is tied to a clause. I will use the M40 example from Annex A. Click through quickly; one line per step.',
      '1, Inputs: M40, PPC, 20 mm, zone II sand, slump 75, severe exposure. 2, Target strength: the higher of 40 + 1.65 × 5 and 40 + 6.5, so 48.25. 3, Air: 1 % from Table 3.',
      '4, w/c: from Figure 1 at 48.25 we get 0.36, below the IS 456 limit of 0.45, so we adopt 0.36. 5, Water: 186 from Table 4, plus 3 % for the extra slump, minus 23 % for the superplasticizer, gives 148.',
      '6, Cement: 148 divided by 0.36 is 412, between the minimum 320 and the maximum 450. 7, Coarse aggregate: 0.62 from Table 5, corrected for the lower w/c, gives 0.648.',
      '8 and 9, absolute volumes leave 0.695 cubic metre of aggregate: 1234 kg coarse and 648 kg fine. 10, Our aggregate is dry, so it absorbs 12 kg of water; we add 160. 11, Finally, trial mixes at plus and minus 10 % w/c, then cube tests.',
    ],
  },
  {
    id: 'fig1',
    title: 'Figure 1, live',
    Component: Fig1Slide,
    presenter: 2,
    target: 40,
    steps: 0,
    notes: [
      'This is Figure 1, drawn from our digitised data. The slider is the target strength. Drag it and you can see the w/c on each of the three curves; curve 2 is for OPC 43 and PPC.',
      'The red zone is not allowed by IS 456 for the chosen exposure. If the curve gives a w/c inside it, durability governs. [Try dragging down to about 27 to show this.]',
      'Reset to 48.25. Our curve gives 0.3497, the standard reads 0.36 by eye. Both sit inside the ±0.01 band, which is the normal accuracy of reading a printed graph. That is why our report said 0.35 and the code says 0.36.',
    ],
  },
  {
    id: 'durability',
    title: 'Durability',
    Component: DurabilitySlide,
    presenter: 2,
    target: 25,
    steps: 0,
    notes: [
      'IS 456 Table 5 gives three limits for each exposure condition: minimum cement, maximum w/c and minimum grade. Click through: mild 300, 0.55, M20, up to extreme 360, 0.40, M40.',
      'Table 6 adjusts the minimum cement for aggregate size: plus 40 kg for 10 or 12.5 mm, minus 30 kg for 40 mm. And for any exposure, more than 450 kg of cement needs special care.',
    ],
  },
  {
    id: 'calc',
    title: 'Live mini calculator',
    Component: CalcSlide,
    presenter: 2,
    target: 90,
    steps: 0,
    notes: [
      'This panel runs the real engine from our calculator. It is not a copy. Start with M40 Annex A: 412 cement, 1234 coarse, 648 fine, all checks pass.',
      'Exposure to Extreme: the limits tighten, but strength still governs, so the mix does not change. Slump 75 to 125: water goes up 3 % per 25 mm, so cement goes up too.',
      '20 to 10 mm: more water, and the minimum cement rises by 40 kg. Cement crosses 450 and the check turns red. Chute to pumping: coarse aggregate drops by 10 % to make it pumpable.',
      'Last, M20 in Severe: Figure 1 gives 0.54, IS 456 caps it at 0.45, and M20 fails the minimum grade of M30. The calculator flags it immediately.',
    ],
  },
  {
    id: 'demo',
    title: 'Full demo',
    Component: DemoSlide,
    presenter: 2,
    target: 30,
    steps: 0,
    notes: [
      'This QR code and link open the full calculator; you can try it on your phone.',
      'If there is time, or if you ask, we will switch to the live site and go through this checklist: change inputs, the Figure 1 plot, the calculation sheet, the Verification tab and the printed report. If the Wi-Fi fails, the screenshot shows the same page.',
      'Now [next presenter] will show how we verified it.',
    ],
  },
  {
    id: 'verify',
    title: 'Verification',
    Component: VerificationSlide,
    presenter: 3,
    target: 50,
    steps: 1,
    notes: [
      'How do we know it is correct? IS 10262 has six worked examples, Annexes A to F. We built all six into the calculator and compare every printed value.',
      'This is Annex A, the M40 example. All fourteen values match exactly, from 48.25 target strength to 160 kg of water to add for dry aggregate.',
      '[Click] Across all six annexes, 83 out of 83 values agree and 62 match exactly. The rest differ only by how the standard itself rounds: under 1 kg in Sections 2, 3 and 5; Annex E rounds each volume first, so it is 3 kg off. This check runs automatically before every deploy.',
    ],
  },
  {
    id: 'hand',
    title: 'Hand vs calculator',
    Component: HandSlide,
    presenter: 3,
    target: 35,
    steps: 1,
    notes: [
      'We also designed the M40 by hand for our report. We read 0.35 from the graph and got 423 kg cement and a ratio of 1 : 1.52 : 2.91. The calculator in auto mode reads 0.35 too and gives exactly the same.',
      '[Click] The standard reads 0.36. If we type 0.36 into the calculator, it gives 412, 1234 and 648, exactly Annex A. So both are right; the only difference is reading the graph, within ±0.01.',
    ],
  },
  {
    id: 'features',
    title: 'Extra features',
    Component: FeaturesSlide,
    presenter: 3,
    target: 30,
    steps: 0,
    notes: [
      'Some extra features. Aggregate grading: blending 20 mm and 10 mm fractions 60 : 40 lands inside the IS 383 band, as Annex A says.',
      'Batch quantities in 50 kg bags: 8.24 bags per cubic metre. Trial mixes at plus and minus 10 % w/c. Standard deviation from your own cube results. Saved designs with JSON export, a methodology tab, and a printed A4 report.',
    ],
  },
  {
    id: 'limits',
    title: 'Limitations',
    Component: LimitsSlide,
    presenter: 3,
    target: 25,
    steps: 0,
    notes: [
      'It has limits. It gives the first trial mix only; cube tests must confirm it. Figure 1 is a printed graph, so any reading carries about ±0.01.',
      'The admixture water reduction depends on the product and must come from trials. And the specific gravities, absorption and cement strength must come from lab tests on the actual materials.',
    ],
  },
  {
    id: 'end',
    title: 'Conclusion',
    Component: ConclusionSlide,
    dark: true,
    presenter: 3,
    target: 20,
    steps: 0,
    notes: [
      'To conclude: our calculator follows IS 10262 step by step for all four sections, applies IS 456 automatically, reproduces the standard’s own examples, and matches our hand design.',
      'The QR code opens it. Thank you. We are happy to take questions.',
    ],
  },
];

const BACKUP = [
  {
    id: 'qa',
    title: 'Likely questions',
    Component: QASlide,
    target: 0,
    steps: 0,
    notes: ['Backup. Use for viva questions. The full list of 15 with answers is in PREP.md.'],
  },
  {
    id: 'wc',
    title: '0.35 vs 0.36',
    Component: WcSlide,
    target: 0,
    steps: 0,
    notes: [
      'Backup, if asked why our report says 0.35. The standard reads its own graph in three examples. Against our digitised curve 2 it is +0.010 in A, +0.005 in E and −0.010 in F.',
      'Because the scatter is both ways, it is eye-reading, not an error in our digitisation. With 0.36 typed in, the calculator gives Annex A exactly.',
    ],
  },
  {
    id: 'whatif',
    title: 'What-if table',
    Component: WhatIfSlide,
    target: 0,
    steps: 0,
    notes: ['Backup. Each row changes one thing from Annex A. Computed live by the engine.'],
  },
  {
    id: 'sections',
    title: 'Four sections compared',
    Component: SectionsSlide,
    target: 0,
    steps: 0,
    notes: ['Backup. How Sections 2 to 5 of IS 10262 differ in where the ratio, water and coarse aggregate come from.'],
  },
];

export const MAIN_COUNT = MAIN.length;

export const SLIDES = [
  ...MAIN.map((s, i) => ({ ...s, label: String(i + 1).padStart(2, '0') })),
  ...BACKUP.map((s, i) => ({ ...s, label: `B${i + 1}`, presenter: null })),
];

if (MAIN.reduce((a, s) => a + s.target, 0) !== 600) {
  console.warn('Slide time targets do not add up to 10:00');
}
