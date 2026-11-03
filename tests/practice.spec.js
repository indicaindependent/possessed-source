import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import HauntRoom from '../base44/actors/HauntRoom/entry.ts';
import * as G from '../base44/shared/possessedEngine.ts';
import { botGhostDecide, botHunterDecide } from '../base44/shared/possessedBot.ts';
import { BALANCE as B, ROOM_OF } from '../base44/shared/possessedConfig.ts';

let t = 1_700_000_000_000;
const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
beforeEach(() => { vi.spyOn(Date, 'now').mockImplementation(() => t); G.setRandom(seeded(7)); });
afterEach(() => vi.restoreAllMocks());

function activeRound(ghostSeat) {
  const s = G.newState('ACDEFG');
  G.join(s, 'a', 'ka', 'A'); G.join(s, 'b', 'kb', 'B');
  G.act(s, 0, { type: 'ready', actionId: 'r0' }, 0);
  G.act(s, 1, { type: 'ready', actionId: 'r1' }, 0);
  if (s.ghostSeat !== ghostSeat) { s.firstGhost = 1 - s.firstGhost; s.ghostSeat = ghostSeat; }
  G.advance(s, B.countdownMs);
  return s;
}
// Run a policy over a round, applying each action through the engine; returns [activeMs, action][].
function run(decide, ghostSeat, seed) {
  const s = activeRound(ghostSeat);
  const rng = seeded(seed);
  const log = [];
  for (let now = B.countdownMs; s.phase === 'active'; now += 200) {
    G.advance(s, now);
    const a = decide(s, now, rng);
    if (a) { log.push([G.activeNow(s, now), a]); G.act(s, 1, { ...a, actionId: `bot-${log.length}` }, now); }
  }
  return { s, log };
}

test('bot policies are deterministic under a seeded rng', () => {
  G.setRandom(seeded(3)); const g1 = run(botGhostDecide, 1, 11).log;
  G.setRandom(seeded(3)); const g2 = run(botGhostDecide, 1, 11).log;
  expect(g1).toEqual(g2);
  G.setRandom(seeded(3)); const h1 = run(botHunterDecide, 0, 5).log;
  G.setRandom(seeded(3)); const h2 = run(botHunterDecide, 0, 5).log;
  expect(h1).toEqual(h2);
});

test('bot ghost: waits 14s+, never moves in the last 6s, taunts exactly once', () => {
  for (let seed = 1; seed < 20; seed++) {
    const { log } = run(botGhostDecide, 1, seed);
    const moves = log.filter(([, a]) => a.type === 'possess');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0][0]).toBeGreaterThanOrEqual(14000);
    for (const [ms] of moves) expect(ms).toBeLessThan(B.roundMs - 6000);
    const taunts = log.filter(([, a]) => a.type === 'taunt');
    expect(taunts.length).toBe(1);
    expect(taunts[0][0]).toBeGreaterThanOrEqual(15000);
    expect(taunts[0][0]).toBeLessThanOrEqual(40200);
  }
});

test('bot hunter: no blind search before 10s, then only inside the latest clue room, one per 8s', () => {
  for (let seed = 1; seed < 20; seed++) {
    const s0 = activeRound(0);
    const rng = seeded(seed);
    let last = -1e9;
    for (let now = B.countdownMs; s0.phase === 'active'; now += 200) {
      G.advance(s0, now);
      const a = botHunterDecide(s0, now, rng);
      if (!a) continue;
      const ms = G.activeNow(s0, now);
      expect(ms - last).toBeGreaterThanOrEqual(8000);
      if (s0.lastClue?.room) expect(ROOM_OF[a.objectId]).toBe(s0.lastClue.room);
      else if (s0.lastClue) expect(s0.lastClue.props).toContain(a.objectId);
      else expect(ms).toBeGreaterThanOrEqual(10000);
      last = ms;
      G.act(s0, 1, { ...a, actionId: `h${now}` }, now);
    }
  }
});

test('bot hunter: a Ghost that never moves survives at least 20s (fixed seed)', () => {
  G.setRandom(seeded(7));
  const { s, log } = run(botHunterDecide, 0, 5);
  expect(s.results[0].survivalMs).toBeGreaterThanOrEqual(20000);
  for (let i = 1; i < log.length; i++) expect(log[i][0] - log[i - 1][0]).toBeGreaterThanOrEqual(8000);
});

test('bot never acts outside the active phase', () => {
  const s = G.newState('ACDEFG');
  const rng = seeded(1);
  G.join(s, 'a', 'ka', 'A'); G.join(s, 'b', 'kb', 'B');
  expect(botGhostDecide(s, 0, rng)).toBeNull();
  expect(botHunterDecide(s, 0, rng)).toBeNull();
  G.act(s, 0, { type: 'ready', actionId: 'r0' }, 0);
  G.act(s, 1, { type: 'ready', actionId: 'r1' }, 0);
  for (let now = 0; now < B.countdownMs; now += 200) {
    expect(botGhostDecide(s, now, rng)).toBeNull();
    expect(botHunterDecide(s, now, rng)).toBeNull();
  }
  G.advance(s, B.countdownMs + 30000);
  G.disconnect(s, 0, B.countdownMs + 30000); // paused
  expect(botGhostDecide(s, B.countdownMs + 60000, rng)).toBeNull();
  expect(botHunterDecide(s, B.countdownMs + 60000, rng)).toBeNull();
});

test('taunt: ghost only, 10s cooldown, hunter hears it without a location', () => {
  const s = activeRound(1);
  const now = B.countdownMs + 1000;
  const r = G.act(s, 0, { type: 'taunt', actionId: 'x1', roundId: s.roundId, sound: 'creak' }, now);
  expect(r.find((e) => e.msg.kind === 'rejected').msg.reason).toBe('not_ghost');
  const ok = G.act(s, 1, { type: 'taunt', actionId: 'x2', roundId: s.roundId, sound: 'giggle' }, now);
  const heard = ok.find((e) => e.msg.kind === 'taunt');
  expect(heard.to).toBe(0);
  expect(heard.msg).not.toHaveProperty('objectId');
  const again = G.act(s, 1, { type: 'taunt', actionId: 'x3', roundId: s.roundId, sound: 'knock' }, now + 5000);
  expect(again.find((e) => e.msg.kind === 'rejected').msg.reason).toBe('taunt_cooldown');
  const later = G.act(s, 1, { type: 'taunt', actionId: 'x4', roundId: s.roundId, sound: 'knock' }, now + 10000);
  expect(later.some((e) => e.msg.kind === 'taunt')).toBe(true);
});

// ---------- the practice room through the actor ----------
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
const human = () => ({ id: 'tab-a', identity: { type: 'anonymous', anonymousId: 'anon-a' }, sent: [], send(m) { this.sent.push(JSON.parse(JSON.stringify(m))); }, reject() {} });
const lastState = (c) => [...c.sent].reverse().find((m) => m.type === 'state');

async function practiceRoom() {
  const e = env('haunt-ACDEFG');
  const a = new HauntRoom(); a.__env = e;
  const A = human();
  e.conns.set('a', A);
  await a.handleConnect(A);
  await a.handleMessage(A, { type: 'hello', intent: 'practice', name: 'Solo' });
  return { e, a, A };
}
async function playUntil(a, phase, limitMs = 200000) {
  for (let i = 0; i < limitMs / 200 && a.s.phase !== phase; i++) { t += 200; await a.handleTick(); }
}

test('practice: a full match runs to final with only Ready from the human', async () => {
  const { a, A } = await practiceRoom();
  const v = lastState(A);
  expect(v.practice).toBe(true);
  expect(v.seats[1].name).toBe('The House');
  expect(a.connFor(1)).toBeNull();
  await a.handleMessage(A, { type: 'ready', actionId: 'r1', value: true });
  expect(a.s.phase).toBe('countdown');
  await playUntil(a, 'intermission');
  expect(a.s.seats[1].ready).toBe(true);
  await a.handleMessage(A, { type: 'ready', actionId: 'r2', value: true });
  await playUntil(a, 'final');
  expect(a.s.phase).toBe('final');
  expect(a.s.results.length).toBe(2);
  expect(lastState(A).phase).toBe('final');
});

test('practice: the bot hunter view has no ghostObject; human leaving ends the room', async () => {
  const { a, A } = await practiceRoom();
  await a.handleMessage(A, { type: 'ready', actionId: 'r1', value: true });
  if (a.s.ghostSeat === 1) { await playUntil(a, 'intermission'); await a.handleMessage(A, { type: 'ready', actionId: 'r2', value: true }); }
  t += 3200; await a.handleTick();
  expect(a.s.ghostSeat).toBe(0);
  const botView = G.view(a.s, 1, t);
  expect(botView.role).toBe('hunter');
  expect(botView.ghost).toBeUndefined();
  expect(JSON.stringify(botView)).not.toContain('"ghostObject"');
  await a.handleMessage(A, { type: 'leave' });
  expect(a.s.expired).toBe(true);
});

test('practice: closing the human socket never touches the bot seat', async () => {
  const { e, a, A } = await practiceRoom();
  e.conns.delete('a');
  await a.handleClose(A);
  expect(a.s.seats[0].connected).toBe(false);
  expect(a.s.seats[1].connected).toBe(true);
});