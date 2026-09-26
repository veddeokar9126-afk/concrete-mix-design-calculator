/**
 * The calculation sheet: every step in the order of the standard, with
 * the clause in the margin, the substituted expression under the label
 * and the value on the right.
 */
import React from 'react';
import { trim, num } from '../lib/format.js';
import { Callout } from './fields.jsx';
import Fig1Plot from './Fig1Plot.jsx';

/* Figure 1 is drawn after the step that reads the free water-cement
 * ratio off it; high strength mixes read Table 8 instead. */
const readsFigure1 = (result, step) =>
  result.section !== 'highStrength' && /water-cement ratio/i.test(step.title);

function value(line) {
  if (line.kind === 'text') return line.value;
  const v = Number(line.value);
  if (!Number.isFinite(v)) return String(line.value);
  if (Math.abs(v) >= 100) return num(v, Number.isInteger(v) ? 0 : 2);
  return trim(v, 5);
}

export default function CalculationSheet({ result }) {
  return (
    <div>
      {result.errors.map((e, n) => (
        <Callout key={n} kind="err" title="The mix cannot be proportioned">
          {e}
        </Callout>
      ))}

      {result.steps.map((s, n) => (
        <React.Fragment key={n}>
        <div className="calcstep">
          <span className="clause">{s.clause}</span>
          <div className="ct">
            <h3>
              <span className="stepno">Step {n + 1}</span>
              {s.title}
            </h3>
            {s.lines.map((l, m) => (
              <div className={`calcline${l.emphasis ? ' emph' : ''}`} key={m}>
                <span className="cl">
                  {l.label}
                  {l.expr && <span className="ce">{l.expr}</span>}
                </span>
                <span className="cv">
                  {value(l)}
                  {l.unit && <em>{l.unit}</em>}
                </span>
              </div>
            ))}
            {s.note && <p className="step-note">{s.note}</p>}
          </div>
        </div>
        {readsFigure1(result, s) && (
          <div className="calcstep calcfig">
            <span className="clause">Fig. 1</span>
            <div className="ct">
              <h4 className="fig-title">
                Graph: free water-cement ratio against 28 day compressive strength
              </h4>
              <Fig1Plot activeCurve={result.curve} wc={result.wcSelected} strength={result.targetStrength} />
              <p className="step-note" style={{ marginTop: '0.4rem' }}>
                Figure 1 of IS 10262 : 2019. Curve {result.curve} is in use. The red point is the free
                water-cement ratio of {trim(result.wcSelected, 3)} read at the target strength of{' '}
                {trim(result.targetStrength, 2)} N/mm², before the durability limit of {result.maxWC} is
                applied. The shaded band is the ±0.01 tolerance of reading the printed graph.
              </p>
            </div>
          </div>
        )}
        </React.Fragment>
      ))}

      {result.warnings.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.125rem', marginBottom: '0.6rem' }}>
            Points to carry into the trials
          </h3>
          {result.warnings.map((w, n) => (
            <Callout key={n} kind="warn">
              {w}
            </Callout>
          ))}
        </div>
      )}
    </div>
  );
}
