/**
 * Every formula used in the design, in symbols, with the values of the
 * current design substituted and the result on the right.
 */
import React from 'react';
import { trim, num } from '../lib/format.js';
import { TABLE_5_REFERENCE_WC, TABLE_10_REFERENCE_WCM } from '../lib/tables.js';

const f = (v, dp = 4) => trim(v, dp);

function groups(result) {
  const i = result.input;
  const scc = result.section === 'scc';
  const high = result.section === 'highStrength';
  const mineral = result.usesMineral;
  const { S, X, byS, byX } = result.targetStrengthParts;
  const v = result.volumes;
  const s = result.ssd;
  const ratio = mineral ? result.wcm : result.wc;
  const r0 = high ? TABLE_10_REFERENCE_WCM : TABLE_5_REFERENCE_WC;
  const vPaste = v.vCement + v.vM1 + v.vM2 + v.vWater + v.vChem;
  const redPct = i.chemType === 'none' ? 0 : Number(i.chemWaterReduction) || 0;

  const out = [];

  out.push({
    title: 'Target strength',
    rows: [
      {
        name: 'Standard deviation, S',
        formula: '30 or more results: S = √[ Σ(xᵢ − x̄)² / (n − 1) ];  fewer than 30: S from Table 2',
        sub: i.sdMode === 'manual' ? 'calculated from the cube results' : 'Table 2 value used',
        value: S,
        unit: 'N/mm²',
      },
      {
        name: 'Two groups combined',
        formula: 'S = √[ ((n₁ − 1)s₁² + (n₂ − 1)s₂²) / (n₁ + n₂ − 2) ]',
      },
      {
        name: 'Target mean strength, first expression',
        formula: "f′ck = fck + 1.65 S",
        sub: `${i.fck} + 1.65 × ${f(S, 2)}`,
        value: byS,
        unit: 'N/mm²',
      },
      {
        name: 'Target mean strength, second expression',
        formula: "f′ck = fck + X",
        sub: `${i.fck} + ${X}`,
        value: byX,
        unit: 'N/mm²',
      },
      {
        name: 'Target mean strength adopted',
        formula: "f′ck = max(fck + 1.65 S, fck + X)",
        sub: `max(${f(byS, 2)}, ${f(byX, 2)})`,
        value: result.targetStrength,
        unit: 'N/mm²',
        emph: true,
      },
    ],
  });

  out.push({
    title: high ? 'Water-cementitious materials ratio' : 'Water-cement ratio',
    rows: [
      {
        name: high ? 'Ratio for the target strength' : 'Ratio read from the graph',
        formula: high ? "w/cm = Table 8 (f′ck, msa)" : `w/c = Figure 1, Curve ${result.curve} at f′ck`,
        sub: `at f′ck = ${f(result.targetStrength, 2)} N/mm²`,
        value: result.wcSelected,
      },
      {
        name: 'Ratio adopted, durability check',
        formula: 'w/c = min(w/c from strength, w/c max of IS 456 Table 5)',
        sub: `min(${f(result.wcSelected)}, ${result.maxWC})`,
        value: result.wc,
        emph: true,
      },
    ],
  });

  out.push({
    title: 'Water and cementitious content',
    rows: [
      !scc && {
        name: 'Water content',
        formula: 'W = W₀ × [1 + 0.03 × (slump − 50) / 25] × (1 − R / 100)',
        sub: `W₀ from Table ${high ? 7 : result.section === 'mass' ? 12 : 4}, slump = ${i.slump} mm, R = ${redPct} %`,
        value: result.water,
        unit: 'kg/m³',
      },
      scc && {
        name: 'Water content',
        formula: 'W chosen from the typical range of clause 8.3 (b), 150 to 210 kg/m³',
        sub: 'to suit the slump flow class',
        value: result.water,
        unit: 'kg/m³',
      },
      {
        name: 'Cement / cementitious content',
        formula: 'C = W / (w/c),  and  C ≥ minimum of IS 456 Table 5',
        sub: `${result.water} / ${f(result.wc)}, minimum ${result.minCementitious}`,
        value: result.cementitious,
        unit: 'kg/m³',
        emph: true,
      },
      mineral && {
        name: 'Mineral admixture',
        formula: 'M = C × p / 100',
        sub: `${result.cementitious} × ${i.mineralPct} / 100`,
        value: s.mineral1 + (s.mineral2 || 0),
        unit: 'kg/m³',
      },
      mineral && {
        name: 'Cement (OPC)',
        formula: 'OPC = C − M',
        sub: `${result.cementitious} − ${f(s.mineral1 + (s.mineral2 || 0), 2)}`,
        value: s.cement,
        unit: 'kg/m³',
      },
      mineral && {
        name: 'Water-cementitious materials ratio',
        formula: 'w/cm = W / C',
        sub: `${result.water} / ${result.cementitious}`,
        value: result.wcm,
      },
      s.chem > 0 && {
        name: 'Chemical admixture',
        formula: 'A = C × dosage / 100',
        sub: `${result.cementitious} × ${i.chemDosage} / 100`,
        value: s.chem,
        unit: 'kg/m³',
      },
    ],
  });

  if (!scc) {
    out.push({
      title: 'Proportion of coarse and fine aggregate',
      rows: [
        {
          name: 'Coarse aggregate volume fraction',
          formula: `Vca = Vca,table + (${r0.toFixed(2)} − ${mineral ? 'w/cm' : 'w/c'}) / 0.05 × 0.01`,
          sub: `ratio = ${f(ratio)}${Number(i.pumpableReduction) > 0 ? `, less ${i.pumpableReduction} % for pumping` : ''}`,
          value: result.caVolFraction,
        },
        {
          name: 'Fine aggregate volume fraction',
          formula: 'Vfa = 1 − Vca',
          sub: `1 − ${result.caVolFraction}`,
          value: result.faVolFraction,
        },
      ],
    });
  }

  out.push({
    title: 'Absolute volumes per cubic metre',
    rows: [
      {
        name: 'Absolute volume of any ingredient',
        formula: 'V = Mass / (Specific gravity × 1000)',
      },
      {
        name: 'Volume of cement',
        formula: 'Vc = C / (SGc × 1000)',
        sub: `${f(s.cement, 2)} / (${i.cementSG} × 1000)`,
        value: f(v.vCement, 5),
        unit: 'm³',
      },
      {
        name: 'Volume of water',
        formula: 'Vw = W / (1 × 1000)',
        sub: `${result.water} / 1000`,
        value: f(v.vWater, 5),
        unit: 'm³',
      },
      v.vChem > 0 && {
        name: 'Volume of chemical admixture',
        formula: 'Vad = A / (SGad × 1000)',
        value: f(v.vChem, 5),
        unit: 'm³',
      },
      {
        name: 'Volume of all in aggregate',
        formula: 'Va = (1 − Vair) − (Vc + Vm + Vw + Vad)',
        sub: scc ? 'Vca + Vfa' : `(1 − ${f(v.air, 4)}) − ${f(vPaste, 5)}`,
        value: f(v.vAgg, 5),
        unit: 'm³',
        emph: true,
      },
      scc && {
        name: 'Water to powder ratio, by volume',
        formula: 'Vw / Vpowder, required 0.85 to 1.10',
        value: result.scc.waterPowderRatio,
      },
    ],
  });

  out.push({
    title: 'Aggregate masses',
    rows: [
      {
        name: 'Coarse aggregate',
        formula: scc ? 'CA = Vca × SGca × 1000' : 'CA = Va × Vca × SGca × 1000',
        sub: scc
          ? `${f(v.vCA, 4)} × ${i.caSG} × 1000`
          : `${f(v.vAgg, 4)} × ${result.caVolFraction} × ${i.caSG} × 1000`,
        value: s.ca,
        unit: 'kg/m³',
        emph: true,
      },
      {
        name: 'Fine aggregate',
        formula: scc ? 'FA = Vfa × SGfa × 1000' : 'FA = Va × Vfa × SGfa × 1000',
        sub: scc
          ? `${f(v.vFA, 4)} × ${i.faSG} × 1000`
          : `${f(v.vAgg, 4)} × ${result.faVolFraction} × ${i.faSG} × 1000`,
        value: s.fa,
        unit: 'kg/m³',
        emph: true,
      },
    ],
  });

  if (i.aggCondition === 'dry') {
    out.push({
      title: 'Correction for dry aggregate',
      rows: [
        { name: 'Dry aggregate mass', formula: 'M_dry = M_ssd / (1 + absorption / 100)' },
        { name: 'Water absorbed', formula: 'ΔW = M_ssd − M_dry' },
        {
          name: 'Water to be added',
          formula: 'W_added = W + ΔW_ca + ΔW_fa',
          value: result.field.water,
          unit: 'kg/m³',
        },
      ],
    });
  } else if (i.aggCondition === 'wet') {
    out.push({
      title: 'Correction for wet aggregate',
      rows: [
        { name: 'Free surface moisture', formula: 'm_free = moisture − absorption  (%)' },
        { name: 'Wet aggregate mass', formula: 'M_wet = M_ssd × (1 + m_free / 100)' },
        {
          name: 'Water to be added',
          formula: 'W_added = W − (M_wet,ca − M_ssd,ca) − (M_wet,fa − M_ssd,fa)',
          value: result.field.water,
          unit: 'kg/m³',
        },
      ],
    });
  }

  out.push({
    title: 'Mix ratio, density and batching',
    rows: [
      {
        name: 'Mix ratio by mass',
        formula: 'C : FA : CA = 1 : FA / C : CA / C',
        sub: `1 : ${s.fa} / ${result.cementitious} : ${s.ca} / ${result.cementitious}`,
        value: result.ratio.label,
        text: true,
        emph: true,
      },
      {
        name: 'Fresh density',
        formula: 'ρ = C + M + W + FA + CA + A',
        value: result.density,
        unit: 'kg/m³',
      },
      {
        name: 'Trial mixes 3 and 4',
        formula: 'w/c = w/c adopted × (1 ∓ 0.10)',
        sub: `${f(ratio)} × 0.9 and ${f(ratio)} × 1.1`,
      },
      {
        name: 'Batch quantity',
        formula: 'Quantity = quantity per m³ × volume of batch',
      },
      {
        name: 'Number of cement bags',
        formula: 'Bags = cement mass / 50',
      },
    ],
  });

  return out.map((g) => ({ ...g, rows: g.rows.filter(Boolean) }));
}

function show(row) {
  if (row.value === undefined) return '';
  if (row.text || typeof row.value === 'string') return row.value;
  return Math.abs(row.value) >= 100 ? num(row.value, Number.isInteger(row.value) ? 0 : 2) : trim(row.value, 4);
}

export default function FormulaSheet({ result }) {
  return (
    <div className="formulas">
      {groups(result).map((g, n) => (
        <div className="calcstep" key={g.title}>
          <span className="clause">F{n + 1}</span>
          <div className="ct">
            <h3>{g.title}</h3>
            {g.rows.map((row, m) => (
              <div className={`calcline${row.emph ? ' emph' : ''}`} key={m}>
                <span className="cl">
                  {row.name}
                  <span className="formula">{row.formula}</span>
                  {row.sub && <span className="ce">{row.sub}</span>}
                </span>
                <span className="cv">
                  {show(row)}
                  {row.unit && row.value !== undefined && <em>{row.unit}</em>}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
