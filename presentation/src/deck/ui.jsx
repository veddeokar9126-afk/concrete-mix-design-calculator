import React, { useEffect, useRef, useState } from 'react';

const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
export const PRINT = qs.has('print');
export const AUDIENCE = qs.has('audience');

export const reducedMotion = () =>
  PRINT ||
  (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** Reveal wrapper: shown once the slide's step reaches `at`. */
export function R({ at = 1, step, as: Tag = 'div', className = '', style, children, ...rest }) {
  const shown = step >= at;
  return (
    <Tag className={`rv ${shown ? 'in' : ''} ${className}`} style={style} aria-hidden={!shown} {...rest}>
      {children}
    </Tag>
  );
}

/** Count a number up to its value; re-animates from the old value on change. */
export function useCountUp(value, duration = 700) {
  const [shown, setShown] = useState(reducedMotion() ? value : 0);
  const from = useRef(reducedMotion() ? value : 0);
  useEffect(() => {
    if (reducedMotion() || !Number.isFinite(value)) {
      setShown(value);
      from.current = value;
      return undefined;
    }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - (1 - k) ** 3;
      setShown(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);
  return shown;
}

export const fmt = (v, dp = 0) =>
  Number.isFinite(v)
    ? v.toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : '—';

export function Num({ value, dp = 0, className = '' }) {
  const v = useCountUp(value);
  return <span className={`num ${className}`}>{fmt(v, dp)}</span>;
}

export function Kicker({ children, className = '' }) {
  return <div className={`kicker ${className}`}>{children}</div>;
}

/** Standard slide header. */
export function Head({ kicker, title, lede }) {
  return (
    <header className="head">
      <Kicker>{kicker}</Kicker>
      <h1 className="title">{title}</h1>
      {lede && <p className="lede">{lede}</p>}
    </header>
  );
}

export function Seg({ options, value, onChange, size = '', label }) {
  return (
    <div className={`seg ${size}`} role="group" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        return (
          <button
            key={String(v)}
            type="button"
            className={value === v ? 'on' : ''}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

/** Measure an element's width so a 1920 x 1080 slide can be scaled into it. */
export function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export function Scaled({ children, className = '' }) {
  const [ref, w] = useWidth();
  const s = w / 1920;
  return (
    <div ref={ref} className={`scaled ${className}`} style={{ height: w * (1080 / 1920) }}>
      <div className="scaled-inner" style={{ transform: `scale(${s})` }}>
        {w > 0 && children}
      </div>
    </div>
  );
}

export const Tick = ({ ok = true }) => (
  <span className={`tick ${ok ? 'ok' : 'bad'}`} aria-label={ok ? 'pass' : 'fail'}>
    {ok ? '✓' : '✗'}
  </span>
);
