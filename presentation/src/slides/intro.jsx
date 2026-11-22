import React from 'react';
import logo from '../../../src/assets/iit-mandi-logo.png';
import { Head, Kicker, R, Num, fmt, Tick } from '../deck/ui.jsx';
import { M40, stepLine } from '../data.js';

/* ================================================================== */
/* 1  Title                                                           */
/* ================================================================== */

const MEMBERS = [
  ['Ved Deokar', 'B25106'],
  ['Vikas', 'B25107'],
  ['Vishandeep Kaur', 'B25108'],
  ['Yamini', 'B25109'],
  ['Yash Malik', 'B25110'],
];

export function TitleSlide() {
  return (
    <div className="title-slide">
      <div className="ts-left">
        <div className="ts-brand">
          <span className="ts-logo">
            <img src={logo} alt="IIT Mandi logo" />
          </span>
          <div>
            <div className="ts-inst">Indian Institute of Technology Mandi</div>
            <div className="ts-course">CE-203 · Civil Engineering Materials · Course project</div>
          </div>
        </div>
        <h1 className="ts-title">
          Concrete Mix
          <br />
          Design Calculator
        </h1>
        <p className="ts-sub">
          Mix proportioning to <b>IS 10262 : 2019</b>, with the durability checks of <b>IS 456 : 2000</b>
        </p>
        <div className="ts-group">
          <div className="ts-group-tag">Group 08</div>
          <ul>
            {MEMBERS.map(([n, r]) => (
              <li key={r}>
                <span>{n}</span>
                <code>{r}</code>
              </li>
            ))}
          </ul>
        </div>
        <div className="ts-to">
          Submitted to <b>Prof. Needhi Kotoky</b>
        </div>
      </div>
      <div className="ts-right">
        <Cube result={M40} fill={6} compact />
        <div className="ts-cube-cap">one cubic metre of M40, proportioned by our calculator</div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 2  The problem: by hand vs with the calculator                     */
/* ================================================================== */

const LOOKUPS = [
  ['Table 1', 'Factor X'],
  ['Table 2', 'Standard deviation S'],
  ['Table 3', 'Entrapped air'],
  ['Fig. 1', 'w/c read off a graph'],
  ['IS 456 T5', 'Durability limits'],
  ['Table 4', 'Water content'],
  ['Table 5', 'Coarse aggregate volume'],
  ['IS 456 T6', 'Cement size adjustment'],
];

export function ProblemSlide({ step, setStep }) {
  const calc = step >= 1;
  const w = stepLine(M40, '5.3', 'Adjustment for');
  const arithmetic = [
    `40 + 1.65 × 5 = 48.25`,
    `186 × 1.03 = ${fmt(w.value, 2)}`,
    `${fmt(w.value, 2)} × 0.77 = 147.52 → 148`,
    `148 / 0.36 = 411.11 → 412`,
    `0.62 + (0.50 − 0.36)/0.05 × 0.01 = 0.648`,
    `412 / 2880 = 0.1431`,
    `1 − 0.01 − 0.2947 = 0.695`,
    `0.695 × 0.648 × 2.74 × 1000 = 1234`,
    `0.695 × 0.352 × 2.65 × 1000 = 648`,
  ];
  return (
    <>
      <Head kicker="01 · The problem" title="One mix by hand: eight lookups, a graph and long arithmetic" />
      <div className="toggle-row">
        <div className="big-toggle" role="group" aria-label="Before or after">
          <button type="button" className={!calc ? 'on' : ''} onClick={() => setStep(0)}>
            By hand
          </button>
          <button type="button" className={calc ? 'on' : ''} onClick={() => setStep(1)}>
            With our calculator
          </button>
        </div>
      </div>
      <div className={`problem ${calc ? 'is-calc' : 'is-hand'}`}>
        <div className="pb-hand">
          <div className="pb-lookups">
            {LOOKUPS.map(([t, d], k) => (
              <div className="lookup" key={t} style={{ '--k': k }}>
                <code>{t}</code>
                <span>{d}</span>
              </div>
            ))}
          </div>
          <div className="pb-tape">
            {arithmetic.map((l, k) => (
              <div key={k} className={k === 5 ? 'slip' : ''}>
                {l}
              </div>
            ))}
            <div className="pb-slip-note">One slip in a volume flows into both aggregate masses</div>
          </div>
          <div className="pb-stat">Redo all of it for every change of grade, exposure, slump or trial</div>
        </div>
        <div className="pb-calc">
          <div className="pb-calc-card">
            <Kicker>Enter once</Kicker>
            <div className="pb-inputs">
              {['M40', 'PPC', '20 mm', 'Zone II', 'Slump 75', 'Severe', 'SP 1 %'].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <div className="pb-arrow">↓ under one second</div>
            <div className="pb-out">
              <div>
                <b>1 : {M40.ratio.fa.toFixed(2)} : {M40.ratio.ca.toFixed(2)}</b>
                <span>w/c {M40.wc} · cement {M40.ssd.cement} kg/m³</span>
              </div>
              <ul>
                <li><Tick /> every step printed with its clause</li>
                <li><Tick /> IS 456 limits checked automatically</li>
                <li><Tick /> same inputs, same answer, every time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 3  The 1 m3 cube, filled layer by layer                            */
/* ================================================================== */

const MAT = {
  air: { label: 'Entrapped air', color: 'var(--m-air)' },
  cement: { label: 'Cement', color: 'var(--m-cement)' },
  water: { label: 'Water', color: 'var(--m-water)' },
  chem: { label: 'Admixture', color: 'var(--m-chem)' },
  fa: { label: 'Fine aggregate', color: 'var(--m-fa)' },
  ca: { label: 'Coarse aggregate', color: 'var(--m-ca)' },
};

/* fill order: the order the procedure finds them in */
export function cubeLayers(result) {
  const v = result.volumes;
  return [
    { key: 'air', vol: v.air, mass: null, at: 1 },
    { key: 'cement', vol: v.vCement, mass: result.ssd.cement, at: 2 },
    { key: 'water', vol: v.vWater, mass: result.ssd.water, at: 3 },
    { key: 'chem', vol: v.vChem, mass: result.ssd.chem, at: 3 },
    { key: 'fa', vol: v.vFA, mass: result.ssd.fa, at: 5 },
    { key: 'ca', vol: v.vCA, mass: result.ssd.ca, at: 5 },
  ];
}

export function Cube({ result, fill, compact = false }) {
  const layers = cubeLayers(result);
  /* stack bottom to top: ca, fa, chem, water, cement, air */
  const order = ['ca', 'fa', 'chem', 'water', 'cement', 'air'];
  const S = 500;
  const X0 = 50;
  const Y0 = 690;
  const DX = 210;
  const DY = -120;
  const MIN = 6;
  let y = 0;
  const geo = order.map((k) => {
    const l = layers.find((x) => x.key === k);
    const h = Math.max(MIN, l.vol * S);
    const g = { ...l, y0: y, y1: y + h };
    y += h;
    return g;
  });
  const scaleY = S / y; /* keep the stack exactly one cube high */
  const yb = (f) => Y0 - f * scaleY;
  const aggTop = yb(geo[1].y1);
  return (
    <svg className={`cube ${compact ? 'compact' : ''}`} viewBox="0 0 800 720" role="img" aria-label="One cubic metre of concrete divided into its materials">
      {/* back edges of the glass box */}
      <g className="cube-back">
        <path d={`M${X0 + DX} ${Y0 + DY} V${Y0 - S + DY} M${X0 + DX} ${Y0 + DY} H${X0 + S + DX} M${X0 + DX} ${Y0 + DY} L${X0} ${Y0}`} />
      </g>
      {geo.map((g) => {
        const y0 = yb(g.y0);
        const y1 = yb(g.y1);
        const shown = fill >= g.at;
        const c = MAT[g.key].color;
        return (
          <g key={g.key} className={`layer ${shown ? 'in' : ''} l-${g.key}`}>
            <rect x={X0} y={y1} width={S} height={y0 - y1} fill={c} />
            <polygon points={`${X0 + S},${y0} ${X0 + S + DX},${y0 + DY} ${X0 + S + DX},${y1 + DY} ${X0 + S},${y1}`} fill={c} />
            <polygon className="shade" points={`${X0 + S},${y0} ${X0 + S + DX},${y0 + DY} ${X0 + S + DX},${y1 + DY} ${X0 + S},${y1}`} />
            <polygon points={`${X0},${y1} ${X0 + DX},${y1 + DY} ${X0 + S + DX},${y1 + DY} ${X0 + S},${y1}`} fill={c} />
            <polygon className="hilite" points={`${X0},${y1} ${X0 + DX},${y1 + DY} ${X0 + S + DX},${y1 + DY} ${X0 + S},${y1}`} />
          </g>
        );
      })}
      {/* the space left for aggregate, before it is filled */}
      {!compact && (
        <g className={`agg-gap ${fill >= 4 && fill < 5 ? 'in' : ''}`}>
          <rect x={X0 + 8} y={aggTop + 8} width={S - 16} height={Y0 - aggTop - 16} />
          <text x={X0 + S / 2} y={(aggTop + Y0) / 2 - 10} textAnchor="middle" className="gap-big">
            {result.volumes.vAgg.toFixed(3)} m³
          </text>
          <text x={X0 + S / 2} y={(aggTop + Y0) / 2 + 34} textAnchor="middle" className="gap-small">
            left for aggregate
          </text>
        </g>
      )}
      {/* front edges */}
      <g className="cube-edges">
        <rect x={X0} y={Y0 - S} width={S} height={S} />
        <path d={`M${X0} ${Y0 - S} l${DX} ${DY} h${S} l${-DX} ${-DY} M${X0 + S + DX} ${Y0 - S + DY} v${S} l${-DX} ${-DY}`} />
      </g>
      {!compact && (
        <g className="cube-dims">
          <text x={X0 + S / 2} y={Y0 + 30} textAnchor="middle">1 m</text>
          <text x={X0 + S + DX / 2 + 22} y={Y0 + DY / 2 + 22} textAnchor="middle">1 m</text>
          <text x={X0 - 14} y={Y0 - S / 2} textAnchor="end">1 m</text>
        </g>
      )}
    </svg>
  );
}

export function CubeSlide({ step }) {
  const layers = cubeLayers(M40);
  const paste = M40.volumes.vCement + M40.volumes.vWater + M40.volumes.vChem;
  return (
    <>
      <Head
        kicker="02 · The idea"
        title="Mix design is filling one cubic metre"
        lede="Absolute volume method: V = mass ÷ (SG × 1000). What is left after air and paste is aggregate."
      />
      <div className="cube-layout">
        <div className="cube-wrap">
          <Cube result={M40} fill={step} />
        </div>
        <div className="cube-legend">
          {layers.map((l) => (
            <R key={l.key} at={l.at} step={step} className={`cl-row ${l.key === 'chem' ? 'tiny' : ''}`}>
              <i style={{ background: MAT[l.key].color }} className={l.key === 'air' ? 'air' : ''} />
              <span className="cl-name">{MAT[l.key].label}</span>
              <span className="cl-vol">{l.vol.toFixed(l.vol < 0.01 ? 4 : 3)} m³</span>
              <span className="cl-mass">{l.mass === null ? '—' : `${fmt(l.mass, l.mass < 10 ? 2 : 0)} kg`}</span>
            </R>
          ))}
          <R at={4} step={step} className="cl-sum">
            1 − {M40.volumes.air.toFixed(2)} (air) − {paste.toFixed(4)} (paste) = <b>{M40.volumes.vAgg.toFixed(3)} m³</b> of aggregate,
            split {M40.caVolFraction.toFixed(3)} coarse : {M40.faVolFraction.toFixed(3)} fine
          </R>
          <R at={5} step={step} className="cl-total">
            <span>Fresh density</span>
            <b>
              <Num value={M40.density} /> kg/m³
            </b>
            <span className="cl-note">M40, IS 10262 Annex A, w/c {M40.wc}</span>
          </R>
        </div>
      </div>
    </>
  );
}
