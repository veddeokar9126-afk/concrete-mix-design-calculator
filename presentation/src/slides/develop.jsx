import React from 'react';
import { Head, Kicker, R, Num, fmt } from '../deck/ui.jsx';
import { useShared } from '../deck/store.js';
import { FIG_1_CURVES, FIG_1_WC_AXIS, TABLE_5_CA_VOLUME } from '../../../src/lib/tables.js';
import { ENGINE_FILES, ENGINE_LINES, VERIFY_ALL, VERIFY_TOTALS } from '../data.js';
import siteShot from '../assets/site-screenshot.jpg';

/* ================================================================== */
/* 4  How we developed it                                             */
/* ================================================================== */

const MILESTONES = [
  { key: 'study', title: 'Study the codes', short: 'IS 10262 · 456 · 383' },
  { key: 'tables', title: 'Encode the tables', short: 'tables.js' },
  { key: 'fig1', title: 'Digitise Figure 1', short: '3 curves × 41 points' },
  { key: 'engine', title: 'Write the engine', short: 'pure functions' },
  { key: 'ui', title: 'Build the interface', short: 'React + Vite' },
  { key: 'verify', title: 'Verify', short: '6 IS annex examples' },
  { key: 'deploy', title: 'Deploy', short: 'GitHub Pages' },
];

function MiniFig1() {
  const W = 520;
  const H = 300;
  const x = (wc) => 40 + ((wc - 0.25) / 0.4) * (W - 60);
  const y = (f) => H - 30 - ((f - 15) / 60) * (H - 50);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mini-fig1" aria-label="Digitised Figure 1 points">
      <line x1="40" y1={H - 30} x2={W - 10} y2={H - 30} className="ax" />
      <line x1="40" y1="10" x2="40" y2={H - 30} className="ax" />
      {[1, 2, 3].map((c) => (
        <g key={c} className={`c${c}`}>
          {FIG_1_CURVES[c].map((f, i) => (
            <circle key={i} cx={x(FIG_1_WC_AXIS[i])} cy={y(f)} r="3.2" />
          ))}
        </g>
      ))}
      <text x={W - 10} y={H - 6} textAnchor="end">w/c 0.25 → 0.65</text>
      <text x="48" y="24">N/mm²</text>
    </svg>
  );
}

function MilestoneDetail({ k }) {
  switch (k) {
    case 'study':
      return (
        <div className="md md-study">
          <div className="md-text">
            <h3>We read the standards clause by clause</h3>
            <p>Listed every table, graph and check that a mix design uses, and the order the code applies them in.</p>
          </div>
          <div className="books">
            <div className="book b1"><b>IS 10262 : 2019</b><span>the procedure · Tables 1–15 · Fig. 1 · Annexes A–F</span></div>
            <div className="book b2"><b>IS 456 : 2000</b><span>durability · Tables 3, 5, 6 · cl. 8.2.4.2</span></div>
            <div className="book b3"><b>IS 383 : 2016</b><span>aggregate grading · Table 7 · sand zones</span></div>
          </div>
        </div>
      );
    case 'tables':
      return (
        <div className="md">
          <div className="md-text">
            <h3>Every table typed into one data file</h3>
            <p>IS 10262 Tables 1–15, IS 456 Tables 3, 5 and 6, IS 383 Table 7. One source of truth, checked against the PDF.</p>
          </div>
          <pre className="code">
            <span className="cm">{'// src/lib/tables.js  ·  IS 10262 : 2019, Table 5'}</span>
            {'\nexport const '}
            <b>TABLE_5_CA_VOLUME</b>
            {' = {\n'}
            {Object.entries(TABLE_5_CA_VOLUME).map(([size, z]) => (
              <span key={size}>
                {`  ${size.padStart(2)}: { I: ${z.I.toFixed(2)}, II: ${z.II.toFixed(2)}, III: ${z.III.toFixed(2)}, IV: ${z.IV.toFixed(2)} },\n`}
              </span>
            ))}
            {'};'}
          </pre>
        </div>
      );
    case 'fig1':
      return (
        <div className="md">
          <div className="md-text">
            <h3>Figure 1 is a graph, so we digitised it</h3>
            <p>
              Each curve stored at every 0.01 of w/c from 0.25 to 0.65: <b>3 × 41 = 123 points</b>. The calculator finds
              w/c by <b>inverse interpolation</b> between the two points either side of the target strength.
            </p>
            <div className="formula small">w/c = x<sub>i</sub> + 0.01 × (y<sub>i</sub> − f′ck) / (y<sub>i</sub> − y<sub>i+1</sub>)</div>
          </div>
          <MiniFig1 />
        </div>
      );
    case 'engine':
      return (
        <div className="md">
          <div className="md-text">
            <h3>The engine is plain functions, no UI</h3>
            <p>
              Inputs go in, a full calculation sheet comes out: every line carries its clause and the substituted
              expression. About <b>{fmt(Math.round(ENGINE_LINES / 100) * 100)}</b> lines of JavaScript.
            </p>
          </div>
          <pre className="code">
            <span className="cm">{'// src/lib/mixDesign.js'}</span>
            {'\nconst out = '}
            <b>designMix</b>
            {'(input);\n\nout.targetStrength  '}<span className="cm">{'// 48.25'}</span>
            {'\nout.wc              '}<span className="cm">{'// 0.36'}</span>
            {'\nout.ssd             '}<span className="cm">{'// cement, water, FA, CA'}</span>
            {'\nout.field           '}<span className="cm">{'// after moisture correction'}</span>
            {'\nout.checks          '}<span className="cm">{'// IS 456 pass / fail'}</span>
            {'\nout.steps           '}<span className="cm">{'// clause-by-clause sheet'}</span>
          </pre>
        </div>
      );
    case 'ui':
      return (
        <div className="md">
          <div className="md-text">
            <h3>A worksheet anyone can use</h3>
            <p>React + Vite. Inputs sectioned by clause, a live 1 m³ breakdown, Figure 1 with the design point, and a printable report.</p>
          </div>
          <img className="md-shot" src={siteShot} alt="The calculator's mix design page" />
        </div>
      );
    case 'verify':
      return (
        <div className="md">
          <div className="md-text">
            <h3>Checked against the standard itself</h3>
            <p>
              All six worked examples of IS 10262 (Annexes A–F) are built in. <code>npm run verify</code> compares{' '}
              {VERIFY_TOTALS.total} printed values with ours.
            </p>
          </div>
          <div className="mini-verify">
            {VERIFY_ALL.map((c) => (
              <div key={c.id}>
                <b>Annex {c.id}</b>
                <span className="bar">
                  <i style={{ width: `${(c.exact / c.total) * 100}%` }} />
                </span>
                <code>
                  {c.passed}/{c.total}
                </code>
              </div>
            ))}
          </div>
        </div>
      );
    case 'deploy':
      return (
        <div className="md">
          <div className="md-text">
            <h3>Free hosting, with a safety gate</h3>
            <p>Every push to GitHub runs the verification first. If any value drifts from the standard, the site is not deployed.</p>
          </div>
          <div className="pipeline">
            {['git push', 'npm ci', 'npm run verify', 'npm run build', 'GitHub Pages'].map((x, k) => (
              <React.Fragment key={x}>
                {k > 0 && <span className="pl-arrow">→</span>}
                <span className={`pl-step ${x === 'npm run verify' ? 'gate' : ''}`}>{x}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function TimelineSlide({ step, setStep }) {
  const cur = Math.min(step, MILESTONES.length - 1);
  return (
    <>
      <Head kicker="03 · How we developed it" title="From the code book to a verified web app" />
      <ol className="timeline">
        {MILESTONES.map((m, k) => (
          <li key={m.key} className={`${k < cur ? 'done' : ''} ${k === cur ? 'cur' : ''}`}>
            <button type="button" onClick={() => setStep(k)}>
              <span className="tl-dot">{k + 1}</span>
              <span className="tl-title">{m.title}</span>
              <span className="tl-short">{m.short}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="tl-detail" key={cur}>
        <MilestoneDetail k={MILESTONES[cur].key} />
      </div>
      <R at={7} step={step} className="nobackend">
        <b>No backend.</b> The whole calculator runs in the browser. Nothing is sent anywhere.
      </R>
    </>
  );
}

/* ================================================================== */
/* 5  Architecture                                                    */
/* ================================================================== */

export function ArchitectureSlide({ step }) {
  return (
    <>
      <Head kicker="04 · Architecture" title="Inputs → one engine → every output" />
      <div className="arch">
        <div className="arch-col">
          <Kicker>Inputs</Kicker>
          <div className="arch-card">
            <h4>Mix data</h4>
            <p>grade · cement · aggregate size · exposure · slump · placing · sand zone · site control</p>
          </div>
          <div className="arch-card">
            <h4>Material tests</h4>
            <p>specific gravities · absorption · moisture · cement strength</p>
          </div>
          <div className="arch-card">
            <h4>Admixtures</h4>
            <p>superplasticizer dose and water cut · fly ash · GGBS · silica fume</p>
          </div>
        </div>
        <R at={1} step={step} className="arch-flow">
          <span />
        </R>
        <R at={1} step={step} className="arch-engine">
          <Kicker className="light">Engine · src/lib</Kicker>
          <ul>
            {ENGINE_FILES.map((f) => (
              <li key={f.file}>
                <code>{f.file}</code>
                <span>{f.role}</span>
              </li>
            ))}
          </ul>
          <div className="arch-pure">pure functions · no React · no server</div>
        </R>
        <R at={2} step={step} className="arch-flow">
          <span />
        </R>
        <R at={2} step={step} className="arch-col arch-outs">
          <Kicker>Outputs</Kicker>
          {[
            ['Calculation sheet', 'every line with its clause'],
            ['Durability checks', 'IS 456 pass / fail'],
            ['Proportions', 'kg/m³ and mix ratio'],
            ['Aggregate grading', 'blend to IS 383'],
            ['Batch quantities', 'any volume, 50 kg bags'],
            ['Trial mixes', 'w/c ± 10 %'],
            ['Printed A4 report', 'for submission'],
          ].map(([a, b]) => (
            <div className="arch-out" key={a}>
              <b>{a}</b>
              <span>{b}</span>
            </div>
          ))}
        </R>
      </div>
    </>
  );
}

/* ================================================================== */
/* 6  Scope: the four sections of IS 10262                            */
/* ================================================================== */

export const SECTIONS_INFO = [
  {
    id: 's2',
    no: 'Section 2',
    name: 'Ordinary & standard',
    grades: 'M10 – M60',
    annex: 'Annexes A, B, C · M40',
    rows: [
      ['w/c from', 'Figure 1, curve picked by cement type; then the IS 456 limit, lower governs'],
      ['Water · air', 'Table 4 (208 / 186 / 165 kg for 10 / 20 / 40 mm) · air from Table 3'],
      ['Coarse aggregate', 'Table 5 at w/c 0.50, ±0.01 per 0.05 · up to −10 % for pumping'],
      ['Special checks', 'IS 456 min cement (+ Table 6), max w/c, min grade, 450 kg cap'],
    ],
  },
  {
    id: 's3',
    no: 'Section 3',
    name: 'High strength',
    grades: 'M65 – M100',
    annex: 'Annex D · M70',
    rows: [
      ['w/cm from', 'Table 8, interpolated by target strength and aggregate size (not Fig. 1)'],
      ['Water · air', 'Table 7 (200 / 195 / 186 kg for 10 / 12.5 / 20 mm) · air from Table 6'],
      ['Coarse aggregate', 'Table 10 at w/cm 0.30 · up to −5 % for pumping'],
      ['Special checks', 'Table 9 mineral dosages: fly ash 15–30 %, silica fume 5–10 %, GGBS 25–50 %'],
    ],
  },
  {
    id: 's4',
    no: 'Section 4',
    name: 'Self-compacting',
    grades: 'SCC',
    annex: 'Annex E · M30',
    rows: [
      ['w/c from', 'Figure 1, as Section 2'],
      ['Water · powder', 'Water 150–210 kg, powder 400–600 kg (cl. 8.3); sand supplies the missing fines'],
      ['Coarse aggregate', 'Whatever volume is left: found by subtraction, not from a table'],
      ['Special checks', 'Water/powder by volume 0.85–1.10 · slump flow SF1–SF3 · V1/V2 · SR1/SR2 · L-box ≥ 0.8'],
    ],
  },
  {
    id: 's5',
    no: 'Section 5',
    name: 'Mass concrete',
    grades: '40 / 80 / 150 mm',
    annex: 'Annex F · M15',
    rows: [
      ['Target', '+20 % (80 mm) or +25 % (150 mm) for wet-sieved cubes, cl. 9.2; not used for w/c, cl. 9.5'],
      ['Water · air', 'Table 12 (165 / 145 / 125 kg) · air from Table 11'],
      ['Coarse aggregate', 'Table 13 · combined grading against Table 14'],
      ['Special checks', 'Mortar content against Table 15 (cl. 9.10)'],
    ],
  },
];

export function ScopeSlide() {
  const [sel, setSel] = useShared('scope', 's2');
  const cur = SECTIONS_INFO.find((s) => s.id === sel);
  return (
    <>
      <Head kicker="05 · Scope" title="All four design sections of IS 10262" lede="Click a section to see how its procedure differs." />
      <div className="scope-cards">
        {SECTIONS_INFO.map((s) => (
          <button type="button" key={s.id} className={`scope-card ${sel === s.id ? 'on' : ''}`} onClick={() => setSel(s.id)}>
            <code>{s.no}</code>
            <b>{s.name}</b>
            <span className="sc-grade">{s.grades}</span>
            <span className="sc-annex">{s.annex}</span>
          </button>
        ))}
      </div>
      <div className="scope-detail" key={sel}>
        {cur.rows.map(([a, b]) => (
          <div key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </div>
        ))}
      </div>
    </>
  );
}
