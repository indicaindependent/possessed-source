import { useSyncExternalStore } from 'react';
import { base44 } from '@/api/base44Client';

// One Matchmaker socket for the whole game (home and rooms), so a search keeps running during
// practice. State lives in a tiny external store so counts re-render only what shows them.
const PING_MS = 10000;
const COUNTS_STALE_MS = 25000;
const REATTACH_MS = 40000;
const QUEUE_TIMEOUT_MS = 8000;

let state = { counts: null, search: 'idle', since: null, error: null };
let conn = null;
let sub = null;
let timer = null;
let countsAt = 0;
let requestedAt = 0;
let attachedAt = 0;
let onMatch = null;
const listeners = new Set();

function set(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const num = (v) => (Number.isFinite(v) ? v : null);

function receive(msg) {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'counts') {
    countsAt = Date.now();
    const { online, searching } = msg;
    if ([online, searching].every(Number.isFinite)) set({ counts: { online, searching, matches: num(msg.matches), practice: num(msg.practice) } });
  } else if (msg.type === 'queued') {
    if (state.search === 'requesting') set({ search: 'searching', since: Date.now(), error: null });
  } else if (msg.type === 'cancelled') {
    set({ search: 'idle', since: null });
  } else if (msg.type === 'replaced') {
    set({ search: 'idle', since: null, error: 'You started searching in another tab, so this one stopped.' });
  } else if (msg.type === 'match' && typeof msg.code === 'string' && state.search !== 'idle') {
    set({ search: 'idle', since: null });
    onMatch?.(msg.code);
  }
}

function attach() {
  conn = base44.actors.Matchmaker('global').connect({ id: crypto.randomUUID() });
  sub = conn.subscribe(receive);
  attachedAt = Date.now();
  conn.send({ type: 'ping' });
  if (state.search !== 'idle') { requestedAt = Date.now(); conn.send({ type: 'search' }); }
}

function detach() {
  sub?.unsubscribe();
  conn?.close();
  conn = null; sub = null;
}

function tick() {
  const now = Date.now();
  if (state.counts && now - countsAt > COUNTS_STALE_MS) set({ counts: null }); // unreachable: hide, never show stale
  // A socket that closed for good never answers again: reattach (and re-queue if searching).
  if (now - Math.max(countsAt, attachedAt) > REATTACH_MS) { detach(); attach(); }
  if (state.search === 'requesting' && now - requestedAt > QUEUE_TIMEOUT_MS) {
    set({ search: 'idle', error: "Couldn't reach matchmaking. Check your connection and try again." });
  }
}

export function setMatchHandler(fn) { onMatch = fn; }

export function openMatchmaker(handleMatch) {
  onMatch = handleMatch;
  if (conn) return closeMatchmaker;
  attach();
  let last = Date.now();
  timer = setInterval(() => {
    tick();
    if (Date.now() - last >= PING_MS) { last = Date.now(); conn?.send({ type: 'ping' }); }
  }, 1000);
  return closeMatchmaker;
}

// Closing the socket removes this tab from the queue on the server right away.
export function closeMatchmaker() {
  clearInterval(timer);
  detach();
  timer = null; onMatch = null;
  state = { counts: null, search: 'idle', since: null, error: null };
}

export function searchMatch() {
  if (!conn || state.search !== 'idle') return;
  requestedAt = Date.now();
  set({ search: 'requesting', error: null });
  conn.send({ type: 'search' });
}

export function cancelMatch() {
  if (state.search === 'idle') return;
  conn?.send({ type: 'cancel' });
  set({ search: 'idle', since: null });
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useMatchmaker = (select) => useSyncExternalStore(subscribe, () => select(state));