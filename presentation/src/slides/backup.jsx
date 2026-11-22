import React from 'react';
import { Head, Tick } from '../deck/ui.jsx';
import { M40, M40_AUTO, FIG1_READINGS, CALC_BASE, PRESETS, runCalc } from '../data.js';
import { SECTIONS_INFO } from './develop.jsx';

/* ================================================================== */
/* B1  Likely viva questions                                          */
/* ================================================================== */

export const QA = [
  ['Why is f′ck the higher of fck + 1.65S and fck + X?', 'So that no more than 5 % of results fall below fck, while X sets a floor when S is small (cl. 4.2).'],
  ['Why 0.36 in the code but 0.35 in our report?', 'Figure 1 is a graph. The code reads 0.36 by eye; our digitised curve gives 0.3497. Both lie within ±0.01.'],
  ['Which governs, Figure 1 or IS 456?', 'Whichever w/c is lower. For M40 Severe: 0.36 < 0.45, so strength governs.'],
  ['What if cement comes out below the minimum?', 'It is raised to the IS 456 minimum and the water is kept the same, so the actual w/c drops.'],
  ['What if cement exceeds 450 kg/m³?', 'IS 456 cl. 8.2.4.2 warns of shrinkage, heat and ASR. Use more superplasticizer, larger aggregate, or fly ash / GGBS.'],
  ['Why reduce coarse aggregate for pumping?', 'More mortar makes the mix flow through the pipe without blocking: up to 10 % less CA (cl. 5.5.2).'],
  ['Why correct for moisture?', 'Dry aggregate absorbs mixing water. We add it back: 148 + 12 = 160 kg for Annex A.'],
  ['How do you know the calculator is right?', `It reproduces all six IS annex examples: 83/83 values agree, Annex A exactly.`],
];

export function QASlide() {
  return (
    <>
      <Head kicker="Backup B1" title="Likely viva questions" />
      <div className="qa">
        {QA.map(([q, a]) => (
          <div key={q}>
            <b>{q}</b>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================================================== */
/* B2  0.35 vs 0.36                                                    */
/* ================================================================== */

export function WcSlide() {
  return (
    <>
      <Head kicker="Backup B2" title="0.35 or 0.36? Reading a printed graph" />
      <div className="wc">
        <table className="wc-table">
          <thead>
            <tr>
              <th>Annex</th>
              <th className="r">Target f′ck</th>
              <th className="r">IS reads</th>
              <th className="r">Digitised Curve 2</th>
              <th className="r">Difference</th>
            </tr>
          </thead>
          <tbody>
            {FIG1_READINGS.map((x) => (
              <tr key={x.annex}>
                <td>{x.annex}</td>
                <td className="r mono">{x.target.toFixed(2)}</td>
                <td className="r mono">{x.printed.toFixed(2)}</td>
                <td className="r mono">{x.digitised.toFixed(4)}</td>
                <td className="r mono">{(x.printed - x.digitised > 0 ? '+' : '−') + Math.abs(x.printed - x.digitised).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="wc-points">
          <p>
            <b>The scatter runs both ways</b> (+0.010, +0.005, −0.010), so it is eye-reading of a printed graph, not an
            error in our digitisation.
          </p>
          <p>
            The calculator shows its reading, shades the <b>±0.01 band</b>, and lets you type the w/c you read. With 0.36 it
            reproduces Annex A exactly.
          </p>
        </div>
        <div className="wc-both">
          <div>
            <span>w/c 0.35 · our report, calculator auto</span>
            <b>
              {M40_AUTO.ssd.cement} / {M40_AUTO.ssd.ca} / {M40_AUTO.ssd.fa}
            </b>
            <small>cement / CA / FA kg · 1 : {M40_AUTO.ratio.fa.toFixed(2)} : {M40_AUTO.ratio.ca.toFixed(2)}</small>
          </div>
          <div>
            <span>w/c 0.36 · IS Annex A, our lectures</span>
            <b>
              {M40.ssd.cement} / {M40.ssd.ca} / {M40.ssd.fa}
            </b>
            <small>cement / CA / FA kg · 1 : {M40.ratio.fa.toFixed(2)} : {M40.ratio.ca.toFixed(2)}</small>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* B3  What-if table                                                   */
/* ================================================================== */

const EXTRA = [
  { label: 'No superplasticizer', patch: { chemType: 'none' } },
  { label: 'w/c auto (0.35)', patch: { wcMode: 'auto' } },
  { label: 'OPC 53 (Curve 3), auto', patch: { cementType: 'opc53', cementSG: 3.15, wcMode: 'auto' } },
];

export function WhatIfSlide() {
  const cases = [...PRESETS.map((p) => ({ label: p.label, patch: p.patch })), ...EXTRA].map((c) => ({
    ...c,
    r: runCalc({ ...CALC_BASE, ...c.patch }),
  }));
  return (
    <>
      <Head kicker="Backup B3" title="What-if: one change at a time from Annex A" />
      <table className="whatif">
        <thead>
          <tr>
            <th>Change</th>
            <th className="r">w/c</th>
            <th className="r">Water</th>
            <th className="r">Cement</th>
            <th className="r">CA</th>
            <th className="r">FA</th>
            <th className="r">Ratio</th>
            <th>IS 456 checks</th>
          </tr>
        </thead>
        <tbody>
          {cases.map(({ label, r }) => {
            const fails = r.checks.filter((c) => !c.pass);
            return (
              <tr key={label}>
                <td>{label}</td>
                <td className="r mono">
                  {r.wc.toFixed(2)}
                  {r.wcGovernedBy !== 'Figure 1' && <sup>456</sup>}
                </td>
                <td className="r mono">{r.water}</td>
                <td className="r mono">{r.ssd.cement}</td>
                <td className="r mono">{r.ssd.ca}</td>
                <td className="r mono">{r.ssd.fa}</td>
                <td className="r mono">
                  1 : {r.ratio.fa.toFixed(2)} : {r.ratio.ca.toFixed(2)}
                </td>
                <td>
                  {fails.length === 0 ? (
                    <span className="ok-txt">
                      <Tick /> all pass
                    </span>
                  ) : (
                    fails.map((c) => (
                      <span key={c.id} className="bad-txt">
                        <Tick ok={false} /> {c.id === 'maxCement' ? '> 450 kg' : c.id === 'minGrade' ? 'min grade' : c.id === 'minCementitious' ? 'min cement' : 'w/c'}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="whatif-note">kg/m³, aggregates SSD. <sup>456</sup> w/c capped by IS 456 Table 5. Every row computed live by the calculator's engine.</p>
    </>
  );
}

/* ================================================================== */
/* B4  The four sections side by side                                  */
/* ================================================================== */

export function SectionsSlide() {
  const rowNames = SECTIONS_INFO[0].rows.map((r) => r[0]);
  return (
    <>
      <Head kicker="Backup B4" title="How the four sections differ" />
      <table className="sections">
        <thead>
          <tr>
            <th />
            {SECTIONS_INFO.map((s) => (
              <th key={s.id}>
                <code>{s.no}</code>
                <b>{s.name}</b>
                <small>{s.grades}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowNames.map((_, k) => (
            <tr key={k}>
              <th>{['Ratio · target', 'Water · air · powder', 'Coarse aggregate', 'Special checks'][k]}</th>
              {SECTIONS_INFO.map((s) => (
                <td key={s.id}>{s.rows[k][1]}</td>
              ))}
            </tr>
          ))}
          <tr>
            <th>Worked example</th>
            {SECTIONS_INFO.map((s) => (
              <td key={s.id}>{s.annex}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}
