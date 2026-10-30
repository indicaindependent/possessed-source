import { useSyncExternalStore } from 'react';
import { base44 } from '@/api/base44Client';

// One Matchmaker socket while the Home screen is mounted. State lives in a tiny external
// store so the live counts re-render only the components that show them.
const PING_MS = 10000;
const COUNTS_STALE_MS = 25000;
const QUEUE_TIMEOUT_MS = 8000;

let state = { counts: null, search: 'idle', since: null, error: null };
let conn = null;
let sub = null;
let timer = null;
let countsAt = 0;
let requestedAt = 0;
let onMatch = null;
const listeners = new Set();

function set(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function receive(msg) {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'counts') {
    countsAt = Date.now();
    const { online, searching, matches } = msg;
    if ([online, searching].every(Number.isFinite)) set({ counts: { online, searching, matches: Number.isFinite(matches) ? matches : null } });
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

function tick() {
  const now = Date.now();
  if (state.counts && now - countsAt > COUNTS_STALE_MS) set({ counts: null }); // unreachable: hide, never show stale
  if (state.search === 'requesting' && now - requestedAt > QUEUE_TIMEOUT_MS) {
    set({ search: 'idle', error: "Couldn't reach matchmaking. Check your connection and try again." });
  }
}

export function openMatchmaker(handleMatch) {
  onMatch = handleMatch;
  if (conn) return closeMatchmaker;
  conn = base44.actors.Matchmaker('global').connect({ id: crypto.randomUUID() });
  sub = conn.subscribe(receive);
  conn.send({ type: 'ping' });
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
  sub?.unsubscribe();
  conn?.close();
  conn = null; sub = null; timer = null; onMatch = null;
  state = { counts: null, search: 'idle', since: null, error: null };
}

export function searchMatch() {
  if (!conn || state.search !== 'idle') return;
  requestedAt = Date.now();
  set({ search: 'requesting', error: null });
  conn.send({ type: 'search' });
}

export function cancelMatch() {
  conn?.send({ type: 'cancel' });
  set({ search: 'idle', since: null });
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useMatchmaker = (select) => useSyncExternalStore(subscribe, () => select(state));