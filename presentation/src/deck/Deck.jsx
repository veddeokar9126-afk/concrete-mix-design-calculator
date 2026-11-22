import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SLIDES, MAIN_COUNT, SECTIONS } from '../slides/index.jsx';
import { useShared, openAudienceWindow, peerConnected } from './store.js';
import { PRINT, AUDIENCE, Scaled } from './ui.jsx';

/* ------------------------------------------------------------------ */
/* Hash <-> slide                                                      */
/* ------------------------------------------------------------------ */

const labelOf = (i) => SLIDES[i].label;

function parseHash() {
  /* #/10 normally; ?slide=10 too, for links from PowerPoint, which can drop the # part */
  const h = (
    decodeURIComponent(window.location.hash.replace(/^#\/?/, '')) ||
    new URLSearchParams(window.location.search).get('slide') ||
    ''
  ).toUpperCase();
  if (!h) return null;
  const i = SLIDES.findIndex((s) => s.label.toUpperCase() === h || s.label.replace(/^0/, '') === h);
  return i >= 0 ? { index: i, step: 0 } : null;
}

const mmss = (sec) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/* ------------------------------------------------------------------ */
/* One slide, with its frame (footer, counter, progress)               */
/* ------------------------------------------------------------------ */

export function SlideFrame({ index, step, setStep, preview = false, entering = false }) {
  const s = SLIDES[index];
  const C = s.Component;
  const main = index < MAIN_COUNT;
  const progress = main ? (index + 1) / MAIN_COUNT : 1;
  return (
    <section
      className={`slide ${s.dark ? 'dark' : 'paper'} ${entering ? 'enter' : ''} ${preview ? 'preview' : ''}`}
      data-slide={s.label}
      aria-label={`Slide ${s.label}: ${s.title}`}
    >
      <div className="slide-body">
        <C step={step} setStep={setStep || (() => {})} preview={preview} />
      </div>
      {!s.bare && (
        <footer className="chrome">
          <span>Group 08 · Concrete Mix Design Calculator · IS 10262 : 2019</span>
          <span className="chrome-count">
            {main ? (
              <>
                {s.label} <i>/</i> {String(MAIN_COUNT).padStart(2, '0')}
              </>
            ) : (
              <>Backup {s.label}</>
            )}
          </span>
        </footer>
      )}
      {!s.bare && (
        <div className="progress" aria-hidden>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Print mode: every slide, fully revealed, one per page               */
/* ------------------------------------------------------------------ */

function PrintDeck() {
  useEffect(() => {
    document.body.classList.add('print');
    const t = setTimeout(() => {
      window.__deckReady = true;
    }, 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="print-deck">
      {SLIDES.map((s, i) => (
        <div className="print-page" key={s.id}>
          <SlideFrame index={i} step={s.printStep ?? s.steps} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Presenter view                                                      */
/* ------------------------------------------------------------------ */

function useTimer() {
  const load = () => {
    try {
      return JSON.parse(sessionStorage.getItem('deck-timer')) || { start: null, acc: 0 };
    } catch {
      return { start: null, acc: 0 };
    }
  };
  const [t, setT] = useState(load);
  const [, force] = useState(0);
  useEffect(() => {
    try {
      sessionStorage.setItem('deck-timer', JSON.stringify(t));
    } catch {
      /* storage blocked: the timer still works for this session */
    }
  }, [t]);
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(id);
  }, []);
  const running = t.start !== null;
  const elapsed = t.acc + (running ? (Date.now() - t.start) / 1000 : 0);
  const toggle = () =>
    setT((p) => (p.start !== null ? { start: null, acc: p.acc + (Date.now() - p.start) / 1000 } : { ...p, start: Date.now() }));
  const reset = () => setT({ start: null, acc: 0 });
  return { elapsed, running, toggle, reset };
}

function Presenter({ nav, setStep, timer, onExit }) {
  const s = SLIDES[nav.index];
  const nextIdx = nav.step < s.steps ? nav.index : Math.min(nav.index + 1, SLIDES.length - 1);
  const nextStep = nav.step < s.steps ? nav.step + 1 : 0;
  const atEnd = nav.index === SLIDES.length - 1 && nav.step >= s.steps;

  /* time plan */
  let before = 0;
  for (let i = 0; i < Math.min(nav.index, MAIN_COUNT); i += 1) before += SLIDES[i].target;
  const main = nav.index < MAIN_COUNT;
  const endBy = before + (main ? s.target : 0);
  const over = main ? timer.elapsed - endBy : 0;
  const [, rerender] = useState(0);
  useEffect(() => {
    const id = setInterval(() => rerender((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="presenter">
      <header className="pv-top">
        <div className="pv-title">
          <span className="pv-label">{main ? `${s.label} / ${MAIN_COUNT}` : `Backup ${s.label}`}</span>
          <strong>{s.title}</strong>
          {s.presenter && <span className={`pv-who p${s.presenter}`}>Presenter {s.presenter} · {SECTIONS[s.presenter - 1].name}</span>}
          {s.steps > 0 && (
            <span className="pv-steps">
              click {nav.step} of {s.steps}
            </span>
          )}
        </div>
        <div className="pv-actions">
          <button type="button" onClick={() => openAudienceWindow()}>
            {peerConnected() ? 'Audience window open' : 'Open audience window'}
          </button>
          <button type="button" onClick={onExit}>
            Exit presenter (P)
          </button>
        </div>
      </header>

      <div className="pv-grid">
        <div className="pv-current">
          <Scaled>
            <SlideFrame index={nav.index} step={nav.step} setStep={setStep} />
          </Scaled>
        </div>

        <aside className="pv-side">
          <div className="pv-next">
            <div className="pv-cap">{atEnd ? 'End of deck' : nextIdx === nav.index ? 'Next click' : `Next slide · ${SLIDES[nextIdx].title}`}</div>
            <Scaled className="pv-next-slide">
              <SlideFrame index={nextIdx} step={nextStep} preview />
            </Scaled>
          </div>

          <div className="pv-timer">
            <div className="pv-clock">
              <span className={`pv-elapsed ${over > 15 ? 'late' : ''}`}>{mmss(timer.elapsed)}</span>
              <span className="pv-of">/ 10:00</span>
              <button type="button" onClick={timer.toggle}>
                {timer.running ? 'Pause (T)' : timer.elapsed > 0 ? 'Resume (T)' : 'Start (T)'}
              </button>
              <button type="button" onClick={timer.reset}>
                Reset (R)
              </button>
            </div>
            {main && (
              <div className={`pv-pace ${over > 15 ? 'late' : over < -15 ? 'early' : ''}`}>
                This slide: {mmss(s.target)} · finish by {mmss(endBy)} ·{' '}
                {Math.abs(over) <= 15 ? 'on time' : over > 0 ? `${mmss(over)} behind` : `${mmss(-over)} ahead`}
              </div>
            )}
            <div className="pv-sections">
              {SECTIONS.map((sec, k) => {
                const done = Math.min(1, Math.max(0, (timer.elapsed - sec.from) / (sec.to - sec.from)));
                return (
                  <div key={sec.name} className={`pv-sec ${s.presenter === k + 1 ? 'cur' : ''}`}>
                    <span>
                      P{k + 1} {sec.name}
                    </span>
                    <span className="pv-sec-time">
                      {mmss(sec.from)}–{mmss(sec.to)}
                    </span>
                    <i style={{ transform: `scaleX(${done})` }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pv-notes">
            {s.notes.map((p, k) => (
              <p key={k}>{p}</p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview grid                                                       */
/* ------------------------------------------------------------------ */

function Overview({ current, go, onClose }) {
  return (
    <div className="overview" role="dialog" aria-label="All slides">
      <div className="ov-head">
        <strong>All slides</strong>
        <span>Click a slide to jump · O or Esc to close</span>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="ov-grid">
        {SLIDES.map((s, i) => (
          <button type="button" key={s.id} className={`ov-item ${i === current ? 'cur' : ''}`} onClick={() => go(i)}>
            <Scaled>
              <SlideFrame index={i} step={s.steps} preview />
            </Scaled>
            <span className="ov-cap">
              <b>{s.label}</b> {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The deck                                                            */
/* ------------------------------------------------------------------ */

export default function Deck() {
  if (PRINT) return <PrintDeck />;
  return <LiveDeck />;
}

function LiveDeck() {
  const [nav, setNav] = useShared('nav', () => parseHash() ?? { index: 0, step: 0 });
  const [presenter, setPresenter] = useState(false);
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);
  const timer = useTimer();
  const digits = useRef('');
  const digitTimer = useRef(null);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const go = useCallback((index, step = 0) => {
    const i = Math.max(0, Math.min(SLIDES.length - 1, index));
    setNav({ index: i, step: Math.max(0, Math.min(SLIDES[i].steps, step)) });
  }, [setNav]);

  const next = useCallback(() => {
    const s = SLIDES[nav.index];
    if (nav.step < s.steps) setNav({ index: nav.index, step: nav.step + 1 });
    else if (nav.index < SLIDES.length - 1) setNav({ index: nav.index + 1, step: 0 });
  }, [nav, setNav]);

  const prev = useCallback(() => {
    if (nav.step > 0) setNav({ index: nav.index, step: nav.step - 1 });
    else if (nav.index > 0) setNav({ index: nav.index - 1, step: SLIDES[nav.index - 1].steps });
  }, [nav, setNav]);

  const setStep = useCallback((st) => go(nav.index, st), [go, nav.index]);

  /* hash follows the slide */
  useEffect(() => {
    const want = `#/${labelOf(nav.index)}`;
    if (window.location.hash !== want) history.replaceState(null, '', want);
    document.title = `${SLIDES[nav.index].label} · ${SLIDES[nav.index].title} · Group 08`;
  }, [nav.index]);
  useEffect(() => {
    const onHash = () => {
      const p = parseHash();
      if (p && p.index !== nav.index) go(p.index);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [go, nav.index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      const typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
      if (typing) {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        digits.current += k;
        clearTimeout(digitTimer.current);
        digitTimer.current = setTimeout(() => (digits.current = ''), 1500);
        return;
      }
      if (k === 'Enter' && digits.current) {
        e.preventDefault();
        go(Number(digits.current) - 1);
        digits.current = '';
        return;
      }
      switch (k) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          e.preventDefault();
          go(0);
          break;
        case 'End':
          e.preventDefault();
          go(MAIN_COUNT - 1);
          break;
        case 'p':
        case 'P':
          if (!AUDIENCE) setPresenter((v) => !v);
          break;
        case 'o':
        case 'O':
          setOverview((v) => !v);
          break;
        case 'b':
        case 'B':
          go(MAIN_COUNT);
          break;
        case 'f':
        case 'F':
          if (document.fullscreenElement) document.exitFullscreen?.();
          else document.documentElement.requestFullscreen?.().catch(() => {});
          break;
        case 't':
        case 'T':
          timer.toggle();
          break;
        case 'r':
        case 'R':
          if (presenter) timer.reset();
          break;
        case '?':
        case 'h':
        case 'H':
          setHelp((v) => !v);
          break;
        case 'Escape':
          setOverview(false);
          setHelp(false);
          break;
        default:
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, go, presenter, timer]);

  /* start the timer automatically on the first move away from the title */
  const started = useRef(false);
  useEffect(() => {
    if (!started.current && nav.index > 0 && !timer.running && timer.elapsed === 0) {
      started.current = true;
      timer.toggle();
    }
  }, [nav.index, timer]);

  const s = SLIDES[nav.index];

  if (presenter) {
    return (
      <>
        <Presenter nav={nav} setStep={setStep} timer={timer} onExit={() => setPresenter(false)} />
        {overview && <Overview current={nav.index} go={(i) => { go(i); setOverview(false); }} onClose={() => setOverview(false)} />}
      </>
    );
  }

  return (
    <div className="viewport">
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <SlideFrame key={s.id} index={nav.index} step={nav.step} setStep={setStep} entering />
      </div>
      {help && (
        <div className="help" onClick={() => setHelp(false)}>
          <div>
            <h2>Keys</h2>
            <dl>
              <dt>→ Space PgDn</dt><dd>next step / slide</dd>
              <dt>← PgUp</dt><dd>back</dd>
              <dt>P</dt><dd>presenter mode: notes, next slide, timer</dd>
              <dt>T / R</dt><dd>start-pause / reset timer</dd>
              <dt>O</dt><dd>overview of all slides</dd>
              <dt>B</dt><dd>jump to backup slides</dd>
              <dt>F</dt><dd>full screen</dd>
              <dt>12 Enter</dt><dd>go to slide 12</dd>
              <dt>Home / End</dt><dd>first / last main slide</dd>
            </dl>
          </div>
        </div>
      )}
      {overview && <Overview current={nav.index} go={(i) => { go(i); setOverview(false); }} onClose={() => setOverview(false)} />}
    </div>
  );
}
