import React from 'react';
import { Head, Kicker, R, Num, fmt, Tick } from '../deck/ui.jsx';
import { M40, M40_AUTO, HAND, IS_ANNEX_A, VERIFY_A, VERIFY_ALL, VERIFY_TOTALS, GRADING, BATCH_1M3, FIG1_READINGS, SITE_URL } from '../data.js';
import { QR } from './calculator.jsx';

/* ================================================================== */
/* 12  Verification                                                    */
/* ================================================================== */

const SHORT = [
  'Target strength f′ck',
  'Entrapped air, %',
  'Free w/c',
  'Water',
  'Cement',
  'CA volume fraction',
  'FA volume fraction',
  'All-in aggregate, m³',
  'Coarse agg., SSD',
  'Fine agg., SSD',
  'Admixture',
  'Fine agg., dry',
  'Coarse agg., dry',
  'Water to add',
];

const dpOf = (n) => {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
};

const CASE_NAME = {
  A: 'M40 · PPC',
  B: 'M40 · fly ash',
  C: 'M40 · GGBS',
  D: 'M70 · high strength',
  E: 'M30 · self-compacting',
  F: 'M15 · mass concrete',
};

export function VerificationSlide({ step }) {
  return (
    <>
      <Head kicker="10 · Verification" title="It reproduces the standard's own worked examples" />
      <div className="verify">
        <div className="vt">
          <div className="vt-cap">
            <b>IS 10262 Annex A</b> · M40 with PPC · {VERIFY_A.exact} / {VERIFY_A.total} exact
          </div>
          <table>
            <thead>
              <tr>
                <th>Clause</th>
                <th>Quantity</th>
                <th className="r">IS code</th>
                <th className="r">Ours</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {VERIFY_A.rows.map((r, k) => (
                <tr key={k} className={k === 11 ? 'sep' : ''} style={{ '--k': k }}>
                  <td className="mono">{r.ref}</td>
                  <td>{SHORT[k]}</td>
                  <td className="r mono">{fmt(r.std, dpOf(r.std))}</td>
                  <td className="r mono strong">{fmt(r.calc, dpOf(r.std))}</td>
                  <td>
                    <Tick ok={r.exact} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <R at={1} step={step} className="vsum">
          <div className="vbig">
            <div>
              <b>
                <Num value={VERIFY_TOTALS.passed} />
                <small>/{VERIFY_TOTALS.total}</small>
              </b>
              <span>values agree, all six annexes</span>
            </div>
            <div>
              <b>
                <Num value={VERIFY_TOTALS.exact} />
                <small>/{VERIFY_TOTALS.total}</small>
              </b>
              <span>reproduce the printed figure exactly</span>
            </div>
          </div>
          <div className="vbars">
            {VERIFY_ALL.map((c) => (
              <div key={c.id}>
                <span className="vb-name">
                  <b>{c.id}</b> {CASE_NAME[c.id]}
                </span>
                <span className="vb-bar">
                  <i className="agree" style={{ width: '100%' }} />
                  <i className="exact" style={{ width: `${(c.exact / c.total) * 100}%` }} />
                </span>
                <code>
                  {c.exact}/{c.total}
                </code>
              </div>
            ))}
            <div className="vb-key">
              <span><i className="exact" /> exact</span>
              <span><i className="agree" /> within the standard's rounding</span>
            </div>
          </div>
          <p className="vnote">
            The rest differ only by how the standard rounds: under 1 kg/m³ in Sections 2, 3 and 5. Annex E rounds each volume
            before subtracting (737 vs 734 kg). <code>npm run verify</code> runs before every deploy.
          </p>
        </R>
      </div>
    </>
  );
}

/* ================================================================== */
/* 13  Our hand calculation vs the calculator                          */
/* ================================================================== */

const r2 = (x) => `1 : ${x.ratio.fa.toFixed(2)} : ${x.ratio.ca.toFixed(2)}`;
const HV_ROWS = [
  ['Target f′ck, N/mm²', HAND.targetStrength.toFixed(2), M40_AUTO.targetStrength.toFixed(2), M40.targetStrength.toFixed(2), IS_ANNEX_A.targetStrength.toFixed(2)],
  ['Free w/c', HAND.wc.toFixed(2), M40_AUTO.wc.toFixed(2), M40.wc.toFixed(2), IS_ANNEX_A.wc.toFixed(2)],
  ['Water, kg', HAND.water, M40_AUTO.water, M40.water, IS_ANNEX_A.water],
  ['Cement, kg', HAND.cement, M40_AUTO.ssd.cement, M40.ssd.cement, IS_ANNEX_A.cement],
  ['Coarse agg., kg', fmt(HAND.ca), fmt(M40_AUTO.ssd.ca), fmt(M40.ssd.ca), fmt(IS_ANNEX_A.ca)],
  ['Fine agg., kg', HAND.fa, M40_AUTO.ssd.fa, M40.ssd.fa, IS_ANNEX_A.fa],
  ['Admixture, kg', HAND.chem.toFixed(2), M40_AUTO.ssd.chem.toFixed(2), M40.ssd.chem.toFixed(2), IS_ANNEX_A.chem.toFixed(2)],
  ['Mix ratio', HAND.ratio, r2(M40_AUTO), r2(M40), '1 : 1.57 : 3.00'],
];

export function HandSlide({ step }) {
  return (
    <>
      <Head kicker="11 · Our M40 by hand" title="Same inputs, same answer, at either reading of Figure 1" />
      <div className={`hv ${step >= 1 ? 'both' : ''}`}>
        <table>
          <thead>
            <tr>
              <th />
              <th className="g1">
                Our hand calculation
                <small>report · w/c read as 0.35</small>
              </th>
              <th className="g1">
                Calculator, w/c auto
                <small>digitised curve: {FIG1_READINGS[0].digitised.toFixed(4)} → 0.35</small>
              </th>
              <th className="g2">
                Calculator, w/c 0.36
                <small>entered by hand</small>
              </th>
              <th className="g2">
                IS 10262 Annex A
                <small>as printed</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {HV_ROWS.map(([label, ...cells]) => (
              <tr key={label}>
                <th>{label}</th>
                {cells.map((c, k) => (
                  <td key={k} className={k < 2 ? 'g1' : 'g2'}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hv-notes">
          <div className="hv-note g1">
            <Tick />
            <span>
              Hand = calculator at <b>0.35</b>. They match within rounding, so our hand working is right.
            </span>
          </div>
          <R at={1} step={step} className="hv-note g2">
            <Tick />
            <span>
              Calculator = IS Annex A at <b>0.36</b>, all 14 values. The only difference is how Figure 1 is read: ±0.01 by eye.
            </span>
          </R>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 14  Extra features                                                 */
/* ================================================================== */

function GradingChart() {
  const rows = GRADING.compliance.rows.filter((r) => r.limit);
  const W = 560;
  const H = 250;
  const xs = rows.map((r) => r.sieve);
  const lx = (s) => Math.log(s);
  const minX = lx(Math.min(...xs));
  const maxX = lx(Math.max(...xs));
  const x = (s) => 50 + ((lx(s) - minX) / (maxX - minX)) * (W - 80);
  const y = (p) => H - 40 - (p / 100) * (H - 60);
  const sorted = [...rows].sort((a, b) => a.sieve - b.sieve);
  const band =
    sorted.map((r, k) => `${k ? 'L' : 'M'}${x(r.sieve)} ${y(r.limit.max)}`).join(' ') +
    ' ' +
    [...sorted].reverse().map((r) => `L${x(r.sieve)} ${y(r.limit.min)}`).join(' ') +
    ' Z';
  const line = sorted.map((r, k) => `${k ? 'L' : 'M'}${x(r.sieve)} ${y(r.combined)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="grading-chart" aria-label="Combined grading inside the IS 383 band">
      <path d={band} className="gband" />
      <path d={line} className="gline" />
      {sorted.map((r) => (
        <g key={r.sieve}>
          <circle cx={x(r.sieve)} cy={y(r.combined)} r="6" className="gpt" />
          <text x={x(r.sieve)} y={H - 12} textAnchor="middle">{r.sieve}</text>
        </g>
      ))}
    </svg>
  );
}

export function FeaturesSlide() {
  const t = M40.trials;
  return (
    <>
      <Head kicker="12 · Beyond the mix" title="What else the calculator does" />
      <div className="bento">
        <div className="tile big">
          <Kicker>Aggregate grading · cl. 5.6</Kicker>
          <h3>
            {GRADING.proportions.join(' : ')} blend of 20–10 and 10–4.75 mm {GRADING.compliance.conforms ? 'lies inside' : 'checked against'} IS 383 Table 7
          </h3>
          <GradingChart />
          <span className="tile-foot">Annex A's own sieve analysis · % passing vs sieve, mm</span>
        </div>
        <div className="tile">
          <Kicker>Batch quantities</Kicker>
          <b className="tile-num">{BATCH_1M3.bags.toFixed(2)}</b>
          <span>bags of 50 kg cement per m³, for any batch volume</span>
        </div>
        <div className="tile">
          <Kicker>Trial mixes · cl. 5.8</Kicker>
          <div className="trials">
            <span><code>{t[1].wc.toFixed(3)}</code>{t[1].cementitious} kg</span>
            <span className="mid"><code>{t[0].wc.toFixed(3)}</code>{t[0].cementitious} kg</span>
            <span><code>{t[2].wc.toFixed(3)}</code>{t[2].cementitious} kg</span>
          </div>
          <span>w/c ± 10 % around the design</span>
        </div>
        <div className="tile">
          <Kicker>Standard deviation · cl. 4.2.1.2</Kicker>
          <div className="formula small">S = √( Σ(x − x̄)² ⁄ (n − 1) )</div>
          <span>from 30 or more cube results, or two groups pooled</span>
        </div>
        <div className="tile">
          <Kicker>Saved designs</Kicker>
          <b className="tile-word">JSON</b>
          <span>kept in the browser, export and import</span>
        </div>
        <div className="tile">
          <Kicker>Methodology tab</Kicker>
          <b className="tile-word">4 sections</b>
          <span>each step explained against its clause</span>
        </div>
        <div className="tile">
          <Kicker>Printed report</Kicker>
          <b className="tile-word">A4</b>
          <span>inputs, full sheet, proportions, checks, grading, trials</span>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 15  Limitations                                                     */
/* ================================================================== */

const LIMITS = [
  ['First trial mix only', 'The output is where trials start. Cube tests at 7 and 28 days confirm it (cl. 5.8).'],
  ['Figure 1 is a printed graph', 'Any reading, by eye or digitised, carries about ±0.01 on w/c. Manual entry is allowed.'],
  ['Admixture water reduction', 'Depends on the product and the cement. We used 23 %; it must come from trials.'],
  ['Material data from tests', 'Specific gravity, absorption, moisture (IS 2386 Part 3) and cement strength (IS 4031 Part 6).'],
];

export function LimitsSlide() {
  return (
    <>
      <Head kicker="13 · Limitations" title="What the calculator does not replace" />
      <div className="limits">
        {LIMITS.map(([a, b], k) => (
          <div className="limit" key={a}>
            <span className="lim-n">{k + 1}</span>
            <b>{a}</b>
            <p>{b}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================================================== */
/* 16  Conclusion                                                      */
/* ================================================================== */

export function ConclusionSlide() {
  return (
    <div className="concl">
      <div className="concl-left">
        <Kicker className="light">14 · Conclusion</Kicker>
        <ul>
          <li>
            <b>Follows IS 10262 : 2019 step by step</b>, all four sections, M10 to M100, with IS 456 limits applied
            automatically.
          </li>
          <li>
            <b>Matches the standard:</b> Annex A exactly (14/14), all six annexes {VERIFY_TOTALS.passed}/{VERIFY_TOTALS.total}.
          </li>
          <li>
            <b>Matches our hand design</b> of M40: 1 : 1.52 : 2.91 at w/c 0.35; 1 : 1.57 : 3.00 at the IS reading of 0.36.
          </li>
          <li>
            <b>Free and open</b>: runs in any browser, checked before every deploy.
          </li>
        </ul>
        <div className="questions">Questions?</div>
      </div>
      <div className="concl-right">
        <div className="qr-card">
          <QR size={340} />
          <code>{SITE_URL.replace('https://', '')}</code>
        </div>
        <div className="thanks">Thank you · Group 08</div>
      </div>
    </div>
  );
}
