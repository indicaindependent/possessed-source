// Client connection controller: background/foreground, stale socket callbacks, SDK-closed
// connections, and pending-action handling. Uses fake SDK connections (NOT a live network test).
import { test, expect } from 'vitest';
import { createRoomLink, STALE_MS, ACK_TIMEOUT_MS, PROBE_MS } from '../src/lib/possessed/roomLink.js';

function fakeConn() {
  return {
    sent: [], subs: new Set(), closed: false,
    send(m) { if (!this.closed) this.sent.push(m); },
    subscribe(fn) { this.subs.add(fn); return { unsubscribe: () => this.subs.delete(fn) }; },
    close() { this.closed = true; this.subs.clear(); },
    emit(m) { for (const f of [...this.subs]) f(m); },
  };
}
function setup() {
  let t = 0;
  const made = [];
  const ref = { connect() { const c = made[made.length - 1]; if (c && !c.closed) return c; const n = fakeConn(); made.push(n); return n; } };
  const log = { states: [], events: [], statuses: [], settled: [], fatal: [] };
  let n = 0;
  const link = createRoomLink({
    ref, connId: 'seat-cred', hello: () => ({ type: 'hello', intent: 'join' }),
    onState: (m) => log.states.push(m), onEvent: (m) => log.events.push(m), onFatal: (c) => log.fatal.push(c),
    onStatus: (s) => log.statuses.push(s), onPending: (_p, done) => { if (done) log.settled.push(done); },
    now: () => t, newId: () => `a${++n}`,
  });
  const advance = (ms, visible = true) => { for (let i = 0; i < ms; i += 1000) { t += 1000; link.tick(visible); } };
  return { link, made, log, advance, conn: () => made[made.length - 1], state: { type: 'state', phase: 'active' } };
}
const online = (s) => { s.link.start(); s.conn().emit(s.state); };

test('one socket per player: start opens exactly one connection and says hello once', () => {
  const s = setup(); online(s);
  expect(s.made.length).toBe(1);
  expect(s.conn().sent.filter((m) => m.type === 'hello').length).toBe(1);
  expect(s.link.status).toBe('online');
});

test('a long background period is not treated as a dead socket', () => {
  const s = setup(); online(s);
  s.advance(120000, false); // throttled/hidden tab: no replies, but nothing is judged
  expect(s.link.status).toBe('online');
  expect(s.made.length).toBe(1);
  s.link.visible();
  expect(s.conn().sent.at(-1).type).toBe('sync');
  s.conn().emit(s.state); // reply arrives
  s.advance(STALE_MS + 2000);
  s.conn().emit(s.state);
  expect(s.log.statuses).not.toContain('reconnecting');
  expect(s.made.length).toBe(1);
});

test('an unanswered visible probe shows reconnecting, drops pending and refuses (never queues) actions', () => {
  const s = setup(); online(s);
  expect(s.link.act('investigate', { objectId: 'globe' }).ok).toBe(true);
  s.advance(STALE_MS + PROBE_MS + 1000);
  expect(s.link.status).toBe('reconnecting');
  expect(s.log.settled.at(-1).outcome).toBe('offline');
  const before = s.conn().sent.length;
  expect(s.link.act('investigate', { objectId: 'teapot' })).toEqual({ ok: false, reason: 'offline' });
  expect(s.conn().sent.slice(before).some((m) => m.type === 'investigate')).toBe(false);
  s.conn().emit(s.state);
  expect(s.link.status).toBe('online');
});

test('stale callbacks from a replaced connection are ignored', () => {
  const s = setup(); online(s);
  const old = s.conn();
  const oldListeners = [...old.subs];
  old.closed = true; // the SDK gave up on this connection
  s.link.visible();
  expect(s.made.length).toBe(2);
  expect(s.conn().sent.some((m) => m.type === 'hello')).toBe(true);
  const states = s.log.states.length;
  oldListeners.forEach((f) => f({ type: 'error', code: 'expired' }));
  oldListeners.forEach((f) => f(s.state));
  expect(s.log.states.length).toBe(states);
  expect(s.log.fatal).toEqual([]);
});

test('reattach checks back off instead of looping', () => {
  const s = setup(); online(s);
  s.advance(STALE_MS + PROBE_MS + 1000);
  const c = s.conn(); let checks = 0;
  const orig = c.closed;
  s.advance(30000);
  expect(orig).toBe(false);
  checks = s.made.length; // same SDK connection is still redialing: no new sockets
  expect(checks).toBe(1);
});

test('pending: duplicate taps blocked, ack clears, mismatched ack ignored', () => {
  const s = setup(); online(s);
  const r = s.link.act('possess', { objectId: 'globe', roundId: 'r' });
  expect(s.link.act('possess', { objectId: 'teapot', roundId: 'r' })).toEqual({ ok: false, reason: 'busy' });
  expect(s.conn().sent.filter((m) => m.type === 'possess').length).toBe(1);
  s.conn().emit({ type: 'ack', actionId: 'nope' });
  expect(s.link.pending).not.toBeNull();
  s.conn().emit({ type: 'ack', actionId: r.actionId });
  expect(s.link.pending).toBeNull();
  expect(s.log.settled.at(-1).outcome).toBe('ok');
});

test('pending: server rejection with matching actionId and timeout both clear it', () => {
  const s = setup(); online(s);
  const r = s.link.act('investigate', { objectId: 'globe' });
  s.conn().emit({ type: 'ev', kind: 'rejected', reason: 'no_charges', actionId: r.actionId });
  expect(s.log.settled.at(-1)).toMatchObject({ outcome: 'rejected', reason: 'no_charges' });
  s.link.act('investigate', { objectId: 'teapot' });
  for (let i = 0; i < ACK_TIMEOUT_MS / 1000 + 1; i += 1) { s.advance(1000); s.conn().emit(s.state); }
  expect(s.log.settled.at(-1).outcome).toBe('timeout');
  expect(s.link.pending).toBeNull();
});

test('no actions before the seat is confirmed', () => {
  const s = setup(); s.link.start();
  expect(s.link.act('ready', { value: true })).toEqual({ ok: false, reason: 'offline' });
});