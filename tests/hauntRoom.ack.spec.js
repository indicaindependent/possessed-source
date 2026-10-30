// Actor-level regressions (mock runtime, fake clock): acks, rejection ids, replaced-socket close races.
import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import HauntRoom from '../base44/actors/HauntRoom/entry.ts';
import * as G from '../base44/shared/possessedEngine.ts';

let t = 1_700_000_000_000;
beforeEach(() => { vi.spyOn(Date, 'now').mockImplementation(() => t); G.setRandom(() => 0.3); });
afterEach(() => vi.restoreAllMocks());

function room() {
  const store = new Map();
  const e = {
    instanceId: 'haunt-ACDEFG', conns: new Map(), wakes: new Map(),
    storage: {
      get: async (k) => (store.has(k) ? JSON.parse(store.get(k)) : undefined),
      put: async (k, v) => { store.set(k, JSON.stringify(v)); },
      deleteAll: async () => store.clear(),
    },
  };
  const a = new HauntRoom(); a.__env = e;
  let n = 0;
  const conn = (id, who) => ({ id, key: ++n, identity: { type: 'anonymous', anonymousId: who }, sent: [], send(m) { this.sent.push(JSON.parse(JSON.stringify(m))); }, reject(c) { this.rejected = c; } });
  const open = async (c) => { e.conns.set(c.key, c); await a.handleConnect(c); };
  const close = async (c) => { e.conns.delete(c.key); await a.handleClose(c); };
  return { a, conn, open, close };
}
async function twoReady(r) {
  const A = r.conn('tab-a', 'anon-a'); const B = r.conn('tab-b', 'anon-b');
  await r.open(A); await r.a.handleMessage(A, { type: 'hello', intent: 'create', name: 'Mabel' });
  await r.open(B); await r.a.handleMessage(B, { type: 'hello', intent: 'join', name: 'Pete' });
  return { A, B };
}
const last = (c) => [...c.sent].reverse().find((m) => m.type === 'state');

test('ack goes only to the sender, after the outcome state', async () => {
  const r = room(); const { A, B } = await twoReady(r);
  await r.a.handleMessage(A, { type: 'ready', actionId: 'act-1', value: true });
  const i = A.sent.findIndex((m) => m.type === 'ack' && m.actionId === 'act-1');
  expect(i).toBeGreaterThan(-1);
  expect(A.sent.slice(0, i).some((m) => m.type === 'state' && m.seats[0].ready)).toBe(true);
  expect(B.sent.some((m) => m.type === 'ack')).toBe(false);
});

test('rejections carry the actionId so the client clears exactly that pending tap', async () => {
  const r = room(); const { A } = await twoReady(r);
  await r.a.handleMessage(A, { type: 'investigate', actionId: 'act-9', objectId: 'globe', roundId: 'x' });
  expect(A.sent.some((m) => m.kind === 'rejected' && m.actionId === 'act-9' && m.reason === 'not_active')).toBe(true);
});

test('old socket closing AFTER its replacement opened does not disconnect the seat', async () => {
  const r = room(); const { A, B } = await twoReady(r);
  const A2 = r.conn('tab-a', 'anon-a'); // SDK reconnect: same seat credential + identity
  await r.open(A2);
  await r.close(A);
  expect(last(B).seats[0].connected).toBe(true);
  expect(B.sent.some((m) => m.kind === 'friend_disconnected')).toBe(false);
});

test('old socket closing BEFORE the replacement: brief drop keeps Ready and resumes on return', async () => {
  const r = room(); const { A, B } = await twoReady(r);
  await r.a.handleMessage(A, { type: 'ready', actionId: 'r1', value: true });
  await r.close(A);
  expect(last(B).seats[0]).toMatchObject({ connected: false, ready: true });
  t += 4000;
  const A2 = r.conn('tab-a', 'anon-a');
  await r.open(A2);
  expect(last(A2).seats[0]).toMatchObject({ connected: true, ready: true });
  await r.a.handleMessage(B, { type: 'ready', actionId: 'r2', value: true });
  expect(last(B).phase).toBe('countdown');
});

test('hunter never receives the ghost object, acks or seat credentials of the ghost', async () => {
  const r = room(); const { A, B } = await twoReady(r);
  await r.a.handleMessage(A, { type: 'ready', actionId: 'r1', value: true });
  await r.a.handleMessage(B, { type: 'ready', actionId: 'r2', value: true });
  t += 3000; await r.a.handleTick();
  const ghost = last(A).role === 'ghost' ? A : B; const hunter = ghost === A ? B : A;
  const secret = last(ghost).ghost.objectId;
  const dest = ['globe', 'teapot'].find((o) => o !== secret);
  await r.a.handleMessage(ghost, { type: 'possess', actionId: 'g-1', objectId: dest, roundId: last(ghost).roundId });
  const seen = JSON.stringify(hunter.sent);
  expect(seen.includes(`"${dest}"`)).toBe(false);
  expect(seen.includes('g-1')).toBe(false);
  expect(seen.includes(ghost.id)).toBe(false);
  expect(hunter.sent.some((m) => m.type === 'state' && m.ghost)).toBe(false);
});