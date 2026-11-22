import React from 'react';
import { Head, Kicker, Num, fmt, Seg, Tick, PRINT } from '../deck/ui.jsx';
import { useShared } from '../deck/store.js';
import { M40, stepLine, FIG1_READINGS } from '../data.js';
import { fig1WaterCementRatio, fig1Strength } from '../../../src/lib/mixDesign.js';
import {
  FIG_1_CURVES,
  FIG_1_WC_AXIS,
  IS456_TABLE_5,
  IS456_TABLE_6_CEMENT_ADJ,
  IS456_MAX_CEMENT,
} from '../../../src/lib/tables.js';

/* ================================================================== */
/* 7  The procedure, step by step, with the M40 numbers                */
/* ================================================================== */

const i = M40.input;
const tp = M40.targetStrengthParts;
const w4 = stepLine(M40, '5.3', 'Water content from Table');
const wSlump = stepLine(M40, '5.3', 'Adjustment for');
const wRed = stepLine(M40, '5.3', 'Reduction of');
const cRaw = stepLine(M40, '5.4', 'Cement content');
const caBase = stepLine(M40, '5.5', 'Volume of coarse aggregate per unit');
const v = M40.volumes;
const paste = v.vCement + v.vWater + v.vChem;
const caAdj = ((0.5 - M40.wc) / 0.05) * 0.01;
const [t2, t3, t4] = M40.trials;
const minCem = IS456_TABLE_5.reinforced[i.exposure];

export const PROC_STEPS = [
  {
    name: 'Inputs',
    clause: 'cl. 4.1 · Annex A-2',
    lines: [
      `M${i.fck} · PPC (Curve ${M40.curve}) · ${i.msa} mm crushed · Zone ${i.faZone}`,
      `slump ${i.slump} mm · Severe, reinforced · good site control`,
      `superplasticizer ${i.chemDosage} %, ${i.chemWaterReduction} % water cut`,
      `SG cement ${i.cementSG} · CA ${i.caSG} · FA ${i.faSG}`,
    ],
    value: `M${i.fck}`,
    unit: 'design grade',
  },
  {
    name: 'Target strength',
    clause: 'cl. 4.2 · Tables 1, 2',
    lines: [
      `f′ck = fck + 1.65 S = ${i.fck} + 1.65 × ${tp.S} = ${tp.byS.toFixed(2)}`,
      `f′ck = fck + X = ${i.fck} + ${tp.X} = ${tp.byX.toFixed(2)}`,
      'adopt the higher of the two',
    ],
    num: M40.targetStrength,
    dp: 2,
    unit: 'N/mm²',
  },
  {
    name: 'Air',
    clause: 'cl. 5.2 · Table 3',
    lines: [`Table 3, ${i.msa} mm aggregate → ${M40.airPct.toFixed(1)} %`, `V_air = ${v.air.toFixed(2)} m³`],
    num: M40.airPct,
    dp: 1,
    unit: '% of volume',
  },
  {
    name: 'w/c ratio',
    clause: 'cl. 5.1 · Figure 1 · IS 456 T5',
    lines: [
      `Fig. 1, Curve ${M40.curve} at ${M40.targetStrength} → 0.36 (IS reading)`,
      `our digitised curve: ${FIG1_READINGS[0].digitised.toFixed(4)}, within ±0.01`,
      `IS 456, Severe: max ${M40.maxWC} → adopt the lower`,
    ],
    num: M40.wc,
    dp: 2,
    unit: 'free w/c',
  },
  {
    name: 'Water',
    clause: 'cl. 5.3 · Table 4',
    lines: [
      `Table 4, ${i.msa} mm, 50 mm slump: ${w4.value} kg`,
      `slump ${i.slump}: ${w4.value} × 1.03 = ${wSlump.value.toFixed(2)}`,
      `SP −${i.chemWaterReduction} %: ${wSlump.value.toFixed(2)} × 0.77 = ${wRed.value.toFixed(2)} → ${M40.water}`,
    ],
    num: M40.water,
    unit: 'kg/m³',
  },
  {
    name: 'Cement + IS 456',
    clause: 'cl. 5.4 · IS 456 T5, 8.2.4.2',
    lines: [
      `C = W ÷ (w/c) = ${M40.water} ÷ ${M40.wc} = ${cRaw.value.toFixed(2)} → ${M40.ssd.cement}`,
      `≥ ${minCem.minCement} kg minimum for Severe ✓`,
      `≤ ${IS456_MAX_CEMENT} kg maximum ✓`,
    ],
    num: M40.ssd.cement,
    unit: 'kg/m³',
  },
  {
    name: 'CA / FA split',
    clause: 'cl. 5.5 · Table 5',
    lines: [
      `Table 5, ${i.msa} mm, Zone ${i.faZone}: ${caBase.value.toFixed(2)} at w/c 0.50`,
      `+ (0.50 − ${M40.wc}) / 0.05 × 0.01 = +${caAdj.toFixed(3)} → ${M40.caVolFraction.toFixed(3)}`,
      `fine aggregate = 1 − ${M40.caVolFraction.toFixed(3)} = ${M40.faVolFraction.toFixed(3)}`,
    ],
    num: M40.caVolFraction,
    dp: 3,
    unit: 'CA volume fraction',
  },
  {
    name: 'Absolute volumes',
    clause: 'cl. 5.7',
    lines: [
      `cement ${M40.ssd.cement} ÷ ${i.cementSG * 1000} = ${v.vCement.toFixed(4)} m³`,
      `water ${v.vWater.toFixed(3)} · admixture ${M40.ssd.chem} ÷ ${i.chemSG * 1000} = ${v.vChem.toFixed(4)}`,
      `aggregate = 1 − ${v.air.toFixed(2)} − ${paste.toFixed(4)} = ${v.vAgg.toFixed(3)} m³`,
    ],
    num: v.vAgg,
    dp: 3,
    unit: 'm³ of aggregate',
  },
  {
    name: 'SSD mix',
    clause: 'cl. 5.7 · Annex A-9',
    lines: [
      `CA = ${v.vAgg} × ${M40.caVolFraction} × ${i.caSG} × 1000 = ${M40.ssd.ca}`,
      `FA = ${v.vAgg} × ${M40.faVolFraction} × ${i.faSG} × 1000 = ${M40.ssd.fa}`,
      `ratio 1 : ${M40.ratio.fa.toFixed(2)} : ${M40.ratio.ca.toFixed(2)} at w/c ${M40.wc}`,
    ],
    value: `${M40.ssd.ca} · ${M40.ssd.fa}`,
    unit: 'kg/m³ CA · FA',
  },
  {
    name: 'Moisture correction',
    clause: 'Annex A-11, A-12',
    lines: [
      `dry CA: ${M40.ssd.ca} ÷ 1.005 = ${M40.field.ca} · dry FA: ${M40.ssd.fa} ÷ 1.01 = ${M40.field.fa}`,
      `water the dry aggregate absorbs: ${M40.ssd.ca - M40.field.ca} + ${M40.ssd.fa - M40.field.fa} kg`,
      `water to add: ${M40.water} + ${M40.field.water - M40.water} = ${M40.field.water}`,
    ],
    num: M40.field.water,
    unit: 'kg water to add',
  },
  {
    name: 'Trial mixes',
    clause: 'cl. 5.8',
    lines: [
      'Trial 1: as designed · Trial 2: adjust water / admixture to the measured slump',
      `Trial 3: w/c ${t3.wc.toFixed(3)} → cement ${t3.cementitious} kg`,
      `Trial 4: w/c ${t4.wc.toFixed(3)} → cement ${t4.cementitious} kg · then cube tests`,
    ],
    value: '±10 %',
    unit: 'w/c for trials 3, 4',
  },
];
void t2;

function ProcedurePrint() {
  return (
    <>
      <Head kicker="05 · Using it: the procedure" title="Eleven steps, each tied to a clause" />
      <div className="proc-print">
        {PROC_STEPS.map((s, n) => (
          <div key={s.name}>
            <span className="pr-n">{n + 1}</span>
            <div>
              <b>{s.name}</b> <code>{s.clause}</code>
              {s.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <strong>
              {s.num !== undefined ? fmt(s.num, s.dp ?? 0) : s.value}
              <small>{s.unit}</small>
            </strong>
          </div>
        ))}
      </div>
    </>
  );
}

export function ProcedureSlide({ step, setStep }) {
  if (PRINT) return <ProcedurePrint />;
  const cur = PROC_STEPS[Math.min(step, PROC_STEPS.length - 1)];
  const k = Math.min(step, PROC_STEPS.length - 1);
  return (
    <>
      <Head kicker="05 · Using it: the procedure" title="Eleven steps, each tied to a clause" />
      <ol className="proc">
        {PROC_STEPS.map((s, n) => (
          <li key={s.name} className={`${n < k ? 'done' : ''} ${n === k ? 'cur' : ''}`}>
            <button type="button" onClick={() => setStep(n)}>
              <span className="pr-n">{n + 1}</span>
              <span className="pr-name">{s.name}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="proc-detail" key={k}>
        <div className="pd-left">
          <Kicker>
            Step {k + 1} · {cur.clause}
          </Kicker>
          <h2>{cur.name}</h2>
          <div className="pd-lines">
            {cur.lines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
        <div className="pd-value">
          <span className="pd-num">{cur.num !== undefined ? <Num value={cur.num} dp={cur.dp ?? 0} /> : cur.value}</span>
          <span className="pd-unit">{cur.unit}</span>
          <span className="pd-tag">M40 · IS 10262 Annex A</span>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 8  Interactive Figure 1                                            */
/* ================================================================== */

const EXPOSURES = [
  ['mild', 'Mild'],
  ['moderate', 'Moderate'],
  ['severe', 'Severe'],
  ['verySevere', 'Very severe'],
  ['extreme', 'Extreme'],
];

export function Fig1Slide() {
  const [st, set] = useShared('fig1', { target: 48.25, exposure: 'severe' });
  const t = st.target;
  const W = 1060;
  const H = 700;
  const L = 90;
  const B = 70;
  const T = 20;
  const Rr = 30;
  const x = (wc) => L + ((wc - 0.25) / 0.4) * (W - L - Rr);
  const y = (f) => H - B - ((f - 15) / 60) * (H - B - T);
  const reads = [1, 2, 3].map((c) => ({ c, ...fig1WaterCementRatio(c, t) }));
  const r2 = reads[1].wc;
  const maxWC = IS456_TABLE_5.reinforced[st.exposure].maxWC;
  const isAnnexA = Math.abs(t - 48.25) < 0.01;
  const path = (c) => FIG_1_CURVES[c].map((f, k) => `${k ? 'L' : 'M'}${x(FIG_1_WC_AXIS[k]).toFixed(1)} ${y(f).toFixed(1)}`).join(' ');
  const adopted = Math.min(Math.round(r2 * 100) / 100, maxWC);

  return (
    <>
      <Head kicker="06 · Figure 1, live" title="Reading w/c off the strength curves" />
      <div className="fig1">
        <svg viewBox={`0 0 ${W} ${H}`} className="fig1-plot" role="img" aria-label="Figure 1 of IS 10262 with the target strength and readings">
          {[0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65].map((wc) => (
            <g key={wc}>
              <line className="grid" x1={x(wc)} x2={x(wc)} y1={T} y2={H - B} />
              <text className="tick" x={x(wc)} y={H - B + 32} textAnchor="middle">{wc.toFixed(2)}</text>
            </g>
          ))}
          {[20, 30, 40, 50, 60, 70].map((f) => (
            <g key={f}>
              <line className="grid" x1={L} x2={W - Rr} y1={y(f)} y2={y(f)} />
              <text className="tick" x={L - 14} y={y(f) + 8} textAnchor="end">{f}</text>
            </g>
          ))}
          <text className="axl" x={(L + W - Rr) / 2} y={H - 8} textAnchor="middle">free water-cement ratio</text>
          <text className="axl" transform={`translate(24 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle">28-day strength, N/mm²</text>

          {/* durability: everything to the right of the limit is not allowed */}
          <rect className="dur-zone" x={x(maxWC)} y={T} width={W - Rr - x(maxWC)} height={H - B - T} />
          <line className="dur-line" x1={x(maxWC)} x2={x(maxWC)} y1={T} y2={H - B} />
          <text className="dur-lab" x={x(maxWC) + 10} y={T + 30}>IS 456 max {maxWC.toFixed(2)}</text>

          {/* ±0.01 reading band around the Curve 2 reading */}
          <rect className="band" x={x(r2 - 0.01)} y={T} width={x(r2 + 0.01) - x(r2 - 0.01)} height={H - B - T} />

          {[1, 2, 3].map((c) => (
            <path key={c} d={path(c)} className={`curve c${c}`} />
          ))}
          {[1, 2, 3].map((c) => (
            <text key={c} className={`clab c${c}`} x={x(0.585)} y={y(fig1Strength(c, 0.585)) - 14} textAnchor="middle">
              Curve {c}
            </text>
          ))}

          <line className="target" x1={L} x2={W - Rr} y1={y(t)} y2={y(t)} />
          {reads.map((r) =>
            r.clamped ? null : (
              <g key={r.c}>
                <line className={`drop c${r.c}`} x1={x(r.wc)} x2={x(r.wc)} y1={y(t)} y2={H - B} />
                <circle className={`pt c${r.c}`} cx={x(r.wc)} cy={y(t)} r={r.c === 2 ? 11 : 8} />
              </g>
            )
          )}
          {isAnnexA && (
            <g className="is-read">
              <circle cx={x(0.36)} cy={y(t)} r="9" />
              <text x={x(0.36) + 14} y={y(t) + 40}>IS reads 0.36</text>
            </g>
          )}
        </svg>

        <div className="fig1-side">
          <label className="slider">
            <span>
              Target strength f′ck <b><Num value={t} dp={2} /></b> N/mm²
            </span>
            <input
              type="range"
              min="20"
              max="70"
              step="0.25"
              value={t}
              onChange={(e) => set({ ...st, target: Number(e.target.value) })}
              aria-label="Target strength"
            />
          </label>
          <button type="button" className="chip sm" onClick={() => set({ ...st, target: 48.25 })}>
            Reset to M40: 48.25
          </button>

          <div className="reads">
            {reads.map((r) => (
              <div key={r.c} className={`read c${r.c}`}>
                <span>
                  Curve {r.c} <small>{r.c === 1 ? 'OPC 33' : r.c === 2 ? 'OPC 43 · PPC · PSC' : 'OPC 53'}</small>
                </span>
                <b>{r.clamped ? (r.clamped === 'high' ? 'off scale' : '> 0.65') : r.wc.toFixed(3)}</b>
              </div>
            ))}
          </div>

          <div className="dur-pick">
            <span>IS 456 exposure (reinforced)</span>
            <Seg size="sm" options={EXPOSURES.map(([v, l]) => ({ value: v, label: l }))} value={st.exposure} onChange={(e) => set({ ...st, exposure: e })} />
          </div>

          <div className="fig1-out">
            Curve 2 → {reads[1].clamped ? '—' : r2.toFixed(2)} · limit {maxWC.toFixed(2)} → adopt <b>{reads[1].clamped ? '—' : adopted.toFixed(2)}</b>
            <span>{!reads[1].clamped && r2 > maxWC ? 'durability governs' : 'strength governs'}</span>
          </div>

          {isAnnexA && (
            <div className="fig1-note">
              At 48.25 our digitised Curve 2 gives <b>{r2.toFixed(4)}</b>; the standard reads <b>0.36</b> by eye. Both sit
              inside the ±0.01 band.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 9  Durability: IS 456 Table 5 and Table 6                           */
/* ================================================================== */

const EXPO_TEXT = {
  mild: 'Protected against weather; not in a coastal area',
  moderate: 'Sheltered from severe rain; under water; buried in non-aggressive soil',
  severe: 'Severe rain, alternate wetting and drying, sea water, coastal air',
  verySevere: 'Sea-water spray, corrosive fumes, aggressive sub-soil',
  extreme: 'Tidal zone; direct contact with aggressive chemicals',
};

export function DurabilitySlide() {
  const [st, set] = useShared('dur', { exposure: 'severe', msa: 20 });
  const rc = IS456_TABLE_5.reinforced[st.exposure];
  const pl = IS456_TABLE_5.plain[st.exposure];
  const adj = IS456_TABLE_6_CEMENT_ADJ[st.msa];
  return (
    <>
      <Head kicker="07 · Durability" title="IS 456 Table 5: limits for each exposure condition" />
      <div className="expo-row">
        {EXPOSURES.map(([k, l], n) => (
          <button type="button" key={k} className={`expo ${st.exposure === k ? 'on' : ''}`} style={{ '--lvl': n }} onClick={() => set({ ...st, exposure: k })}>
            <b>{l}</b>
            <span>{EXPO_TEXT[k]}</span>
          </button>
        ))}
      </div>
      <div className="dur-nums">
        <div>
          <Kicker>Minimum cement</Kicker>
          <b>
            <Num value={rc.minCement + adj} />
          </b>
          <span>
            kg/m³{adj !== 0 && <> · {rc.minCement} {adj > 0 ? '+' : '−'} {Math.abs(adj)} for {st.msa} mm</>}
          </span>
        </div>
        <div>
          <Kicker>Maximum free w/c</Kicker>
          <b>
            <Num value={rc.maxWC} dp={2} />
          </b>
          <span>lower of this and Fig. 1 governs</span>
        </div>
        <div>
          <Kicker>Minimum grade</Kicker>
          <b>M{rc.minGrade}</b>
          <span>for reinforced concrete</span>
        </div>
      </div>
      <div className="dur-foot">
        <div className="t6">
          <span>
            <b>Table 6</b> size adjustment to minimum cement
          </span>
          <Seg
            size="sm"
            options={[10, 12.5, 20, 40].map((m) => ({ value: m, label: `${m} mm ${IS456_TABLE_6_CEMENT_ADJ[m] > 0 ? '+' : IS456_TABLE_6_CEMENT_ADJ[m] < 0 ? '−' : '±'}${Math.abs(IS456_TABLE_6_CEMENT_ADJ[m])}` }))}
            value={st.msa}
            onChange={(m) => set({ ...st, msa: m })}
          />
        </div>
        <div className="dur-plain">
          Plain concrete: {pl.minCement} kg · w/c {pl.maxWC.toFixed(2)} · {pl.minGrade ? `M${pl.minGrade}` : 'no minimum grade'}
        </div>
        <div className="dur-cap">
          Any exposure: cement over <b>{IS456_MAX_CEMENT} kg/m³</b> needs special care (cl. 8.2.4.2)
        </div>
      </div>
    </>
  );
}
