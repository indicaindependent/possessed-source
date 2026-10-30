// Simulation tests for the Matchmaker actor and quick-match rooms, using the same mock
// Actor base as the HauntRoom sims. They do NOT replace a two-browser network test.
import { test, beforeEach, afterEach, vi, expect } from 'vitest';
import Matchmaker from '../base44/actors/Matchmaker/entry.ts';
import HauntRoom from '../base44/actors/HauntRoom/entry.ts';
import { CODE_RE, BALANCE } from '../base44/shared/possessedConfig.ts';

let t = 1_700_000_000_000;
beforeEach(() => { vi.spyOn(Date, 'now').mockImplementation(() => t); });
afterEach(() => vi.restoreAllMocks());

function env(instanceId) {
  const store = new Map();
  return {
    instanceId, conns: new Map(), wakes: new Map(),
    storage: {
      get: async (k) => (store.has(k) ? JSON.parse(store.get(k)) : undefined),
      put: async (k, v) => { store.set(k, JSON.stringify(v)); },
      delete: async (k) => store.delete(k),
      deleteAll: async () => store.clear(),
    },
  };
}
// In-memory LiveMatch table standing in for the service-role entities client.
function fakeClient() {
  const rows = [];
  const match = (r, q) => Object.entries(q).every(([k, v]) => (v && typeof v === 'object' && '$gt' in v ? r[k] > v.$gt : r[k] === v));
  const LiveMatch = {
    rows,
    filter: async (q) => rows.filter((r) => match(r, q)),
    count: async (q) => rows.filter((r) => match(r, q)).length,
    create: async (d) => { const r = { id: `r${rows.length}`, ...d }; rows.push(r); return r; },
    update: async (id, d) => Object.assign(rows.find((r) => r.id === id), d),
  };
  return { asServiceRole: { entities: { LiveMatch } } };
}
const boot = (Cls, e, client) => { const a = new Cls(); a.__env = e; a.client = client; return a; };
const conn = (id, who) => ({ id, identity: { type: 'anonymous', anonymousId: who }, sent: [], send(m) { this.sent.push(JSON.parse(JSON.stringify(m))); }, reject(c) { this.rejected = c; } });
const open = async (a, e, c) => { e.conns.set(c.id + c.identity.anonymousId, c); await a.handleConnect(c); };
const close = async (a, e, c) => { e.conns.delete(c.id + c.identity.anonymousId); await a.handleClose(c); };
const matches = (c) => c.sent.filter((m) => m.type === 'match');
const lastCounts = (c) => [...c.sent].reverse().find((m) => m.type === 'counts');

async function mm() {
  const e = env('global'); const client = fakeClient(); const a = boot(Matchmaker, e, client);
  await a.handleStart();
  return { e, a, client };
}

test('pairs two players with one fresh valid code, each told only their own assignment', async () => {
  const { e, a } = await mm();
  const A = conn('tab-a', 'anon-a'); const B = conn('tab-b', 'anon-b'); const W = conn('tab-w', 'anon-w');
  await open(a, e, A); await open(a, e, B); await open(a, e, W);
  await a.handleMessage(A, { type: 'search' });
  expect(matches(A)).toHaveLength(0);
  await a.handleMessage(B, { type: 'search' });
  expect(matches(A)).toHaveLength(1);
  expect(matches(B)).toHaveLength(1);
  expect(matches(A)[0].code).toBe(matches(B)[0].code);
  expect(CODE_RE.test(matches(A)[0].code)).toBe(true);
  expect(matches(W)).toHaveLength(0); // a bystander learns nothing about the code
  expect(lastCounts(W).searching).toBe(0);
});

test('same identity in two tabs never matches itself; the second tab replaces the first entry', async () => {
  const { e, a } = await mm();
  const A1 = conn('tab-1', 'anon-same'); const A2 = conn('tab-2', 'anon-same');
  await open(a, e, A1); await open(a, e, A2);
  await a.handleMessage(A1, { type: 'search' });
  await a.handleMessage(A2, { type: 'search' });
  expect(matches(A1).length + matches(A2).length).toBe(0);
  expect(A1.sent.some((m) => m.type === 'replaced')).toBe(true);
  expect(lastCounts(A2).searching).toBe(1);
  const B = conn('tab-b', 'anon-b'); await open(a, e, B);
  await a.handleMessage(B, { type: 'search' });
  expect(matches(A2)).toHaveLength(1);
  expect(matches(A1)).toHaveLength(0);
});

test('cancel and socket close remove the player from the queue immediately', async () => {
  const { e, a } = await mm();
  const A = conn('tab-a', 'anon-a'); const B = conn('tab-b', 'anon-b'); const C = conn('tab-c', 'anon-c');
  await open(a, e, A); await open(a, e, B); await open(a, e, C);
  await a.handleMessage(A, { type: 'search' });
  await a.handleMessage(A, { type: 'cancel' });
  expect(lastCounts(C).searching).toBe(0);
  await a.handleMessage(B, { type: 'search' });
  await close(a, e, B);
  expect(lastCounts(C).searching).toBe(0);
  await a.handleMessage(C, { type: 'search' });
  expect(matches(A).length + matches(B).length + matches(C).length).toBe(0);
});

test('stale entries are pruned by timeout and after hibernation when the socket is gone', async () => {
  const { e, a, client } = await mm();
  const A = conn('tab-a', 'anon-a'); const B = conn('tab-b', 'anon-b'); const C = conn('tab-c', 'anon-c');
  await open(a, e, A); await open(a, e, B); await open(a, e, C);
  await a.handleMessage(A, { type: 'search' });
  t += 46000; // A never pinged
  await a.handleMessage(C, { type: 'ping' });
  expect(lastCounts(C).searching).toBe(0);
  await a.handleMessage(B, { type: 'search' });
  e.conns.delete(B.id + B.identity.anonymousId); // socket died while the room slept
  const revived = boot(Matchmaker, e, client); await revived.handleStart();
  await revived.handleMessage(C, { type: 'search' });
  expect(matches(B).length + matches(C).length).toBe(0);
  expect(lastCounts(C).searching).toBe(1);
});

test('three waiting players produce one match and one remaining searcher', async () => {
  const { e, a } = await mm();
  const P = ['a', 'b', 'c'].map((x) => conn(`tab-${x}`, `anon-${x}`));
  for (const p of P) await open(a, e, p);
  for (const p of P) await a.handleMessage(p, { type: 'search' });
  expect(P.map((p) => matches(p).length)).toEqual([1, 1, 0]);
  expect(lastCounts(P[2]).searching).toBe(1);
});

test('presence counts rise and fall; matches reported by HauntRoom are counted', async () => {
  const { e, a, client } = await mm();
  const A = conn('tab-a', 'anon-a'); const B = conn('tab-b', 'anon-b');
  await open(a, e, A);
  expect(lastCounts(A)).toMatchObject({ online: 1, searching: 0, matches: 0 });
  await open(a, e, B);
  expect(lastCounts(A).online).toBe(2);
  await a.handleMessage(A, { type: 'search' });
  expect(lastCounts(B).searching).toBe(1);

  // A quick-match room: both arrive Ready, the match starts and is reported.
  const re = env('haunt-ACDEFG'); const room = boot(HauntRoom, re, client);
  const X = conn('x', 'anon-x'); const Y = conn('y', 'anon-y');
  await open(room, re, X); await room.handleMessage(X, { type: 'hello', intent: 'quick', name: 'X' });
  await open(room, re, Y); await room.handleMessage(Y, { type: 'hello', intent: 'quick', name: 'Y' });
  expect([...Y.sent].reverse().find((m) => m.type === 'state').phase).toBe('countdown');
  t += 16000; await a.handleMessage(B, { type: 'ping' });
  expect(lastCounts(B)).toMatchObject({ matches: 1, online: 4 });

  await room.handleMessage(X, { type: 'leave' }); // abandoned: no longer in progress
  t += 16000; await a.handleMessage(B, { type: 'ping' });
  expect(lastCounts(B).matches).toBe(0);
  await close(a, e, A);
  expect(lastCounts(B)).toMatchObject({ online: 1, searching: 0 });
});

test('quick intent never joins a private haunt, and private codes stay private', async () => {
  const client = fakeClient();
  const re = env('haunt-ACDEFH'); const room = boot(HauntRoom, re, client);
  const H = conn('h', 'anon-h'); const Q = conn('q', 'anon-q');
  await open(room, re, H); await room.handleMessage(H, { type: 'hello', intent: 'create' });
  await open(room, re, Q); await room.handleMessage(Q, { type: 'hello', intent: 'quick' });
  expect(Q.sent.some((m) => m.type === 'error' && m.code === 'code_taken')).toBe(true);
  expect(client.asServiceRole.entities.LiveMatch.rows.every((r) => !JSON.stringify(r).includes('ACDEFH'))).toBe(true);
});

test('matchmaker messages carry no identity keys, connection ids, seats or game secrets', async () => {
  const { e, a } = await mm();
  const P = ['a', 'b', 'c'].map((x) => conn(`tab-${x}`, `anon-${x}`));
  for (const p of P) await open(a, e, p);
  for (const p of P) { await a.handleMessage(p, { type: 'search' }); await a.handleMessage(p, { type: 'ping' }); }
  const allowed = new Set(['counts', 'queued', 'match', 'cancelled', 'replaced', 'error']);
  for (const p of P) {
    const text = JSON.stringify(p.sent);
    for (const q of P) expect(text.includes(q.identity.anonymousId) || text.includes(q.id)).toBe(false);
    expect(/ghost|seat|objectId|idKey/i.test(text)).toBe(false);
    expect(p.sent.every((m) => allowed.has(m.type))).toBe(true);
  }
});

test('matchmaker rate-limits floods', async () => {
  const { e, a } = await mm();
  const A = conn('tab-a', 'anon-a'); await open(a, e, A);
  for (let i = 0; i < 60; i++) await a.handleMessage(A, { type: 'cancel' });
  expect(A.sent.some((m) => m.type === 'error' && m.code === 'rate_limited')).toBe(true);
});

test('a matched opponent who never arrives leaves the other in a lobby, reported as no match', async () => {
  const client = fakeClient();
  const re = env('haunt-ACDEFJ'); const room = boot(HauntRoom, re, client);
  const X = conn('x', 'anon-x');
  await open(room, re, X); await room.handleMessage(X, { type: 'hello', intent: 'quick' });
  const v = [...X.sent].reverse().find((m) => m.type === 'state');
  expect(v.phase).toBe('lobby');
  expect(v.seats[v.you].ready).toBe(true);
  expect(client.asServiceRole.entities.LiveMatch.rows).toHaveLength(0);
  expect(BALANCE.countdownMs).toBeGreaterThan(0);
});