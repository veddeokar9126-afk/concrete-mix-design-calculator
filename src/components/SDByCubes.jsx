/**
 * Standard deviation by number of cube results, clause 4.2.1.
 * Fewer than 30 results: the assumed value of Table 2 (4.2.1.3).
 * 30 or more results: S calculated from the results (4.2.1.1, 4.2.1.2).
 * Both cases are shown side by side so the difference is visible.
 */
import React from 'react';
import { sdSingleGroup } from '../lib/mixDesign.js';
import { assumedSD, valueOfX, TABLE_2_SD } from '../lib/tables.js';
import { num, trim } from '../lib/format.js';

const MIN_RESULTS = 30;

export const parseResults = (text) =>
  String(text ?? '')
    .split(/[\s,;]+/)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);

/** Illustrative cube strengths, repeatable, spread about fck + 8. */
function sampleResults(fck, n) {
  let seed = 7 + n;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: n }, () => {
    const z = (rand() + rand() + rand() + rand() - 2) * 1.73;
    return (fck + 8 + z * 4).toFixed(1);
  }).join(' ');
}

function target(fck, S) {
  const X = valueOfX(fck);
  const byS = fck + 1.65 * S;
  const byX = fck + X;
  return { X, byS, byX, ft: Math.max(byS, byX) };
}

export default function SDByCubes({ input, set, readOnly = false }) {
  const fck = Number(input.fck);
  const results = parseResults(input.sdResults);
  const calc = sdSingleGroup(results);
  const n = results.length;
  const enough = n >= MIN_RESULTS;

  const row = TABLE_2_SD.find((r) => fck <= r.max);
  const sTable = assumedSD(fck, input.siteControl);
  const tTable = target(fck, sTable);
  const tCalc = calc ? target(fck, calc.S) : null;

  const usingCalc = input.sdMode === 'manual';

  const applies = (isCalc) => (n === 0 ? !isCalc : isCalc === enough);

  return (
    <div className="sdcubes">
      {!readOnly && (
        <label className="field wide" style={{ borderBottom: 'none' }}>
          <span className="field-label">
            Cube test results
            <span className="hint">
              28 day cube strengths in N/mm², separated by spaces or commas. {n} entered.
            </span>
          </span>
          <span className="control">
            <textarea
              className="sd-text"
              rows={3}
              value={input.sdResults ?? ''}
              onChange={(e) => set({ sdResults: e.target.value })}
              placeholder="e.g. 31.5 29.8 33.2 30.4 …"
            />
          </span>
          <span className="btnrow" style={{ marginTop: '0.5rem' }}>
            <button className="btn ghost" type="button" onClick={() => set({ sdResults: sampleResults(fck, 20) })}>
              Sample, 20 cubes
            </button>
            <button className="btn ghost" type="button" onClick={() => set({ sdResults: sampleResults(fck, 36) })}>
              Sample, 36 cubes
            </button>
            {n > 0 && (
              <button className="btn ghost" type="button" onClick={() => set({ sdResults: '' })}>
                Clear
              </button>
            )}
          </span>
        </label>
      )}

      <div className="sd-cases">
        <div className={`sd-case${applies(false) ? ' on' : ''}`}>
          <span className="sd-tag">Fewer than 30 cubes · clause 4.2.1.3</span>
          <h4>Assumed S from Table 2</h4>
          <div className="sd-formula">
            S = Table 2 value for {row.grades}
            {input.siteControl === 'fair' ? ' + 1.0 (fair site control, Note 1)' : ' (good site control)'}
          </div>
          <div className="sd-value">
            S = {trim(sTable, 2)} <em>N/mm²</em>
          </div>
          <div className="sd-target">
            f′ck = max({fck} + 1.65 × {trim(sTable, 2)}, {fck} + {tTable.X}) ={' '}
            <strong>{num(tTable.ft, 2)} N/mm²</strong>
          </div>
        </div>

        <div className={`sd-case${applies(true) ? ' on' : ''}`}>
          <span className="sd-tag">30 or more cubes · clause 4.2.1.1, 4.2.1.2</span>
          <h4>S calculated from the test results</h4>
          <div className="sd-formula">S = √[ Σ(xᵢ − x̄)² / (n − 1) ]</div>
          {calc ? (
            <>
              <div className="sd-formula">
                n = {n}, x̄ = {num(calc.mean, 2)} N/mm²
              </div>
              <div className="sd-value">
                S = {num(calc.S, 2)} <em>N/mm²</em>
              </div>
              <div className="sd-target">
                f′ck = max({fck} + 1.65 × {num(calc.S, 2)}, {fck} + {tCalc.X}) ={' '}
                <strong>{num(tCalc.ft, 2)} N/mm²</strong>
              </div>
            </>
          ) : (
            <div className="sd-formula">Enter at least two results to calculate S.</div>
          )}
        </div>
      </div>

      <p className="sd-verdict">
        {n === 0
          ? 'No results entered, so the assumed value of Table 2 applies.'
          : enough
          ? `${n} results entered, which is 30 or more: S should be calculated from the results.`
          : `Only ${n} results entered, fewer than 30: the calculated S is not yet acceptable and the assumed value of Table 2 applies.`}{' '}
        The design currently uses {usingCalc ? `S = ${trim(input.sdManual, 2)} N/mm² from test results` : `the Table 2 value, S = ${trim(sTable, 2)} N/mm²`}.
      </p>

      {!readOnly && (
        <div className="btnrow">
          {enough && calc && !(usingCalc && Number(input.sdManual) === Number(calc.S.toFixed(2))) && (
            <button
              className="btn"
              type="button"
              onClick={() => set({ sdMode: 'manual', sdManual: Number(calc.S.toFixed(2)) })}
            >
              Use calculated S = {num(calc.S, 2)} in the design
            </button>
          )}
          {(!enough || n === 0) && usingCalc && (
            <button className="btn" type="button" onClick={() => set({ sdMode: 'table' })}>
              Use Table 2 value S = {trim(sTable, 2)} in the design
            </button>
          )}
        </div>
      )}
    </div>
  );
}
