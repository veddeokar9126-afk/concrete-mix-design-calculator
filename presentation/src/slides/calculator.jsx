import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Head, Kicker, Num, fmt, Seg, Tick, PRINT } from '../deck/ui.jsx';
import { useShared } from '../deck/store.js';
import { CALC_BASE, PRESETS, runCalc, M40_BASE_RESULT, SITE_URL } from '../data.js';
import { ORDINARY_GRADES, CEMENT_TYPES, IS456_TABLE_3_EXPOSURE, PLACING_METHODS } from '../../../src/lib/tables.js';
import siteShot from '../assets/site-screenshot.jpg';

/* ================================================================== */
/* QR code, drawn from the matrix so it needs no network                */
/* ================================================================== */

export function QR({ text = SITE_URL, size = 360, dark = '#0f1417', light = '#ffffff' }) {
  const qr = useMemo(() => QRCode.create(text, { errorCorrectionLevel: 'M' }), [text]);
  const n = qr.modules.size;
  const q = 2; /* quiet zone */
  let d = '';
  for (let r = 0; r < n; r += 1)
    for (let c = 0; c < n; c += 1) if (qr.modules.get(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
  return (
    <svg className="qr" width={size} height={size} viewBox={`0 0 ${n + 2 * q} ${n + 2 * q}`} shapeRendering="crispEdges" role="img" aria-label={`QR code for ${text}`}>
      <rect width={n + 2 * q} height={n + 2 * q} fill={light} />
      <path d={d} fill={dark} />
    </svg>
  );
}

/* ================================================================== */
/* 10  Live mini calculator                                           */
/* ================================================================== */

const SEG_COLORS = {
  ca: 'var(--m-ca)',
  fa: 'var(--m-fa)',
  water: 'var(--m-water)',
  cement: 'var(--m-cement)',
  chem: 'var(--m-chem)',
  air: 'var(--m-air)',
};

function Delta({ v, base, dp = 0 }) {
  const d = v - base;
  if (!Number.isFinite(d) || Math.abs(d) < 10 ** -dp / 2) return <span className="delta same">as Annex A</span>;
  return (
    <span className={`delta ${d > 0 ? 'up' : 'down'}`}>
      {d > 0 ? '▲' : '▼'} {fmt(Math.abs(d), dp)}
    </span>
  );
}

function Out({ label, value, dp = 0, unit, base, sub }) {
  return (
    <div className="out">
      <span className="out-l">{label}</span>
      <b>
        <Num value={value} dp={dp} />
      </b>
      <span className="out-u">{unit}</span>
      {sub ? <span className="out-sub">{sub}</span> : <Delta v={value} base={base} dp={dp} />}
    </div>
  );
}

const CHECK_LABEL = {
  minCementitious: 'Min cement',
  maxCement: 'Max cement 450',
  wc: 'Max w/c',
  minGrade: 'Min grade',
};

export function CalcSlide() {
  const [inp, setInp] = useShared('calc', { ...CALC_BASE });
  const [preset, setPreset] = useShared('calcPreset', 'annexA');
  const res = useMemo(() => runCalc(inp), [inp]);
  const base = M40_BASE_RESULT;
  const set = (patch) => {
    setPreset(null);
    setInp({ ...inp, ...patch });
  };
  const applyPreset = (p) => {
    setPreset(p.id);
    setInp({ ...CALC_BASE, ...p.patch });
  };
  const notice = PRESETS.find((p) => p.id === preset)?.notice;
  const ok = res.ok !== false && !res.errors?.length;

  return (
    <>
      <div className="calc-head">
        <div>
          <Kicker>08 · Live demo · the real engine</Kicker>
          <h1 className="title">Change an input, watch the mix respond</h1>
        </div>
      </div>
      <div className="presets">
        {PRESETS.map((p) => (
          <button type="button" key={p.id} className={`chip ${preset === p.id ? 'on' : ''}`} onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className={`notice ${notice ? '' : 'empty'}`}>{notice || 'Custom inputs: compare with the M40 Annex A mix shown by the ▲▼ marks.'}</div>

      <div className="calc">
        <div className="calc-in">
          <div className="ci-row">
            <span>Grade</span>
            <select value={inp.fck} onChange={(e) => set({ fck: Number(e.target.value) })} aria-label="Grade">
              {ORDINARY_GRADES.map((g) => (
                <option key={g} value={g}>M{g}</option>
              ))}
            </select>
          </div>
          <div className="ci-row">
            <span>Cement</span>
            <select
              value={inp.cementType}
              onChange={(e) => set({ cementType: e.target.value, cementSG: CEMENT_TYPES[e.target.value].sg })}
              aria-label="Cement type"
            >
              {Object.entries(CEMENT_TYPES).map(([k, c]) => (
                <option key={k} value={k}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="ci-row">
            <span>Exposure</span>
            <select value={inp.exposure} onChange={(e) => set({ exposure: e.target.value })} aria-label="Exposure">
              {Object.entries(IS456_TABLE_3_EXPOSURE).map(([k, x]) => (
                <option key={k} value={k}>{x.label}</option>
              ))}
            </select>
          </div>
          <div className="ci-row">
            <span>Slump, mm</span>
            <Seg size="sm" options={[50, 75, 100, 125, 150]} value={Number(inp.slump)} onChange={(s) => set({ slump: s })} label="Slump" />
          </div>
          <div className="ci-row">
            <span>Aggregate</span>
            <Seg size="sm" options={[10, 20, 40].map((m) => ({ value: m, label: `${m} mm` }))} value={inp.msa} onChange={(m) => set({ msa: m })} label="Aggregate size" />
          </div>
          <div className="ci-row">
            <span>Sand zone</span>
            <Seg size="sm" options={['I', 'II', 'III', 'IV']} value={inp.faZone} onChange={(z) => set({ faZone: z })} label="Sand zone" />
          </div>
          <div className="ci-row">
            <span>Placing</span>
            <Seg
              size="sm"
              options={[
                { value: 'chute', label: 'Chute' },
                { value: 'pumping', label: 'Pumping' },
              ]}
              value={inp.placing === 'pumping' ? 'pumping' : 'chute'}
              onChange={(p) => set({ placing: p, pumpableReduction: PLACING_METHODS[p].caReduction })}
              label="Placing"
            />
          </div>
          <div className="ci-row">
            <span>Superplasticizer</span>
            <Seg
              size="sm"
              options={[
                { value: 'superplasticizer', label: 'On · 1 %, −23 %' },
                { value: 'none', label: 'Off' },
              ]}
              value={inp.chemType === 'none' ? 'none' : 'superplasticizer'}
              onChange={(c) => set({ chemType: c })}
              label="Admixture"
            />
          </div>
          <div className="ci-row">
            <span>w/c</span>
            <div className="wc-ctl">
              <Seg
                size="sm"
                options={[
                  { value: 'auto', label: 'Auto (Fig. 1)' },
                  { value: 'manual', label: 'Manual' },
                ]}
                value={inp.wcMode}
                onChange={(m) => set({ wcMode: m })}
                label="w/c mode"
              />
              {inp.wcMode === 'manual' && (
                <span className="stepper">
                  <button type="button" onClick={() => set({ wcManual: Math.max(0.25, Math.round((inp.wcManual - 0.01) * 100) / 100) })} aria-label="Decrease w/c">
                    −
                  </button>
                  <code>{Number(inp.wcManual).toFixed(2)}</code>
                  <button type="button" onClick={() => set({ wcManual: Math.min(0.65, Math.round((inp.wcManual + 0.01) * 100) / 100) })} aria-label="Increase w/c">
                    +
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {ok ? (
          <div className="calc-out">
            <div className="outs">
              <Out label="Target f′ck" value={res.targetStrength} dp={2} unit="N/mm²" base={base.targetStrength} />
              <Out
                label="Free w/c"
                value={res.wc}
                dp={2}
                unit={`by ${res.wcGovernedBy === 'Figure 1' ? 'Fig. 1' : 'IS 456'}`}
                sub={res.wcGovernedBy !== 'Figure 1' ? `Fig. 1 gave ${res.wcSelected.toFixed(2)}` : null}
                base={base.wc}
              />
              <Out label="Water" value={res.water} unit="kg/m³" base={base.water} />
              <Out label="Cement" value={res.ssd.cement} unit="kg/m³" base={base.ssd.cement} />
              <Out label="Coarse agg." value={res.ssd.ca} unit="kg/m³ SSD" base={base.ssd.ca} />
              <Out label="Fine agg." value={res.ssd.fa} unit="kg/m³ SSD" base={base.ssd.fa} />
            </div>
            <div className="ratio-row">
              <div className="ratio">
                <span>Mix ratio C : FA : CA</span>
                <b>
                  1 : {res.ratio.fa.toFixed(2)} : {res.ratio.ca.toFixed(2)}
                </b>
              </div>
              <div className="density">
                <span>Fresh density</span>
                <b>
                  <Num value={res.density} /> <small>kg/m³</small>
                </b>
              </div>
            </div>
            <div className="m3bar" aria-label="Volume of each material in one cubic metre">
              {res.segments.map((s) => (
                <span key={s.key} style={{ flexGrow: s.volume, background: SEG_COLORS[s.key] || 'var(--m-cement)' }} className={`seg-${s.key}`}>
                  {s.volume > 0.09 && (
                    <em>
                      {s.label.replace(' aggregate', ' agg.')} {s.volume.toFixed(3)}
                    </em>
                  )}
                </span>
              ))}
            </div>
            <div className="checks">
              {['minCementitious', 'maxCement', 'wc', 'minGrade'].map((id) => {
                const c = res.checks.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <div key={id} className={`check ${c.pass ? 'pass' : c.warnOnly ? 'warn' : 'fail'}`}>
                    <Tick ok={c.pass} />
                    <span>
                      <b>{CHECK_LABEL[id]}</b>
                      <small>{c.detail}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="calc-out error">{(res.errors || []).join(' ')}</div>
        )}
      </div>
    </>
  );
}

/* ================================================================== */
/* 11  Handoff to the full live demo                                   */
/* ================================================================== */

const DEMO_STEPS = [
  'Open the site: Section 2, M40 inputs as in Annex A',
  'Change grade, exposure and slump: watch the 1 m³ panel and the checks',
  'Figure 1 plot: digitised 0.35 with the ±0.01 band; enter 0.36 by hand',
  'Calculation sheet: every line with its clause and substitution',
  'Verification tab: Annex A 14/14, all six annexes 83/83',
  'Print report: the A4 sheet we submit',
];

export function DemoSlide() {
  const [checked, setChecked] = useShared('demoChecks', []);
  const [mode, setMode] = useShared('demoMode', 'shot');
  const [probe, setProbe] = useState(PRINT ? 'offline' : 'checking');

  useEffect(() => {
    if (PRINT) return undefined;
    if (!navigator.onLine) {
      setProbe('offline');
      return undefined;
    }
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 4000);
    fetch(SITE_URL, { mode: 'no-cors', cache: 'no-store', signal: ac.signal })
      .then(() => {
        setProbe('online');
        setMode('live');
      })
      .catch(() => setProbe('offline'))
      .finally(() => clearTimeout(to));
    return () => {
      clearTimeout(to);
      ac.abort();
    };
  }, [setMode]);

  const live = mode === 'live' && probe === 'online';
  const toggle = (k) => setChecked(checked.includes(k) ? checked.filter((x) => x !== k) : [...checked, k]);

  return (
    <>
      <Head kicker="09 · Full demo" title="Now on the real site" />
      <div className="demo">
        <div className="demo-left">
          <div className="demo-qr">
            <QR size={250} />
            <div>
              <Kicker>Try it yourself</Kicker>
              <code className="url">veddeokar9126-afk.github.io/
                <br />
                concrete-mix-design-calculator</code>
            </div>
          </div>
          <ol className="demo-list">
            {DEMO_STEPS.map((d, k) => (
              <li key={d} className={checked.includes(k) ? 'done' : ''}>
                <button type="button" onClick={() => toggle(k)} aria-pressed={checked.includes(k)}>
                  <span className="box">{checked.includes(k) ? '✓' : k + 1}</span>
                  {d}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="demo-right">
          <div className="browser">
            <div className="browser-bar">
              <i />
              <i />
              <i />
              <span>{SITE_URL.replace('https://', '')}</span>
              <button type="button" className="chip xs" disabled={probe !== 'online'} onClick={() => setMode(live ? 'shot' : 'live')}>
                {probe === 'checking' ? 'checking network…' : probe === 'online' ? (live ? 'Live site · show screenshot' : 'Screenshot · show live') : 'Offline · screenshot'}
              </button>
            </div>
            <div className="browser-view">
              {live ? (
                <iframe title="Live calculator" src={SITE_URL} loading="eager" />
              ) : (
                <img src={siteShot} alt="Screenshot of the calculator" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
