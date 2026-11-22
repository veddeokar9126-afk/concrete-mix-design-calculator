/**
 * A tiny shared store. Every piece of state that must look the same in
 * the presenter window and the audience window (current slide, reveal
 * step, the mini calculator's inputs, ...) lives here, and is mirrored to
 * the other window with postMessage, which also works from file://.
 */
import { useCallback, useSyncExternalStore } from 'react';

let state = {};
const listeners = new Set();
let peer = null;

const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function post(msg) {
  if (!peer || peer.closed) return;
  try {
    peer.postMessage({ __deck: true, ...msg }, '*');
  } catch {
    /* the other window went away */
  }
}

export function getShared(key) {
  return state[key];
}

export function setShared(key, value, { silent = false } = {}) {
  if (state[key] === value) return;
  state = { ...state, [key]: value };
  emit();
  if (!silent) post({ type: 'set', key, value });
}

export function useShared(key, initial) {
  if (!(key in state)) state[key] = typeof initial === 'function' ? initial() : initial;
  const value = useSyncExternalStore(subscribe, () => state[key]);
  const set = useCallback(
    (v) => setShared(key, typeof v === 'function' ? v(state[key]) : v),
    [key]
  );
  return [value, set];
}

/** Presenter side: open the audience window and keep it in sync. */
export function openAudienceWindow() {
  const url = new URL(window.location.href);
  url.searchParams.set('audience', '1');
  const w = window.open(url.toString(), 'mixdesign-audience', 'popup=yes,width=1280,height=720');
  if (w) peer = w;
  return !!w;
}

export function peerConnected() {
  return !!peer && !peer.closed;
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || !d.__deck) return;
    if (peer && !peer.closed && e.source !== peer) return;
    if (!peer || peer.closed) peer = e.source;
    if (d.type === 'set') setShared(d.key, d.value, { silent: true });
    if (d.type === 'hello') Object.entries(state).forEach(([key, value]) => post({ type: 'set', key, value }));
  });
  if (new URLSearchParams(window.location.search).has('audience') && window.opener) {
    peer = window.opener;
    /* ask the presenter for its full state once we are listening */
    setTimeout(() => post({ type: 'hello' }), 50);
  }
}
