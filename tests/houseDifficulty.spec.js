import { describe, it, expect, afterEach } from 'vitest';
import { HOUSE_POLICIES, normalizeDifficulty } from '../base44/shared/possessedDifficulty.ts';
import { botGhostDecide, botHunterDecide } from '../base44/shared/possessedBot.ts';
import * as G from '../base44/shared/possessedEngine.ts';
import { BALANCE as B, ROOMS, ROOM_OF } from '../base44/shared/possessedConfig.ts';
import HauntRoom from '../base44/actors/HauntRoom/entry.ts';

function active(level, ghostSeat = 0) {
  G.setRandom(() => 0);
  const s = G.newState('ACDEFG'); s.practice = true; s.practiceLevel = level;
  G.join(s, 'a', 'a', 'A'); G.join(s, 'bot:house', 'bot', 'The House');
  G.act(s, 0, { type: 'ready', actionId: 'a' }, 0); G.act(s, 1, { type: 'ready', actionId: 'b' }, 0);
  s.ghostSeat = ghostSeat; G.advance(s, B.countdownMs);
  return s;
}
const now = (ms) => B.countdownMs + ms;
afterEach(() => G.setRandom(Math.random));

describe('House policies', () => {
  it.each([
    ['restless', [8000, 11000], .6, 10000, 10000, [26000, 34000], false],
    ['haunted', [5000, 8000], .4, 8000, 7000, [14000, 22000], false],
    ['possessed', [3000, 5000], .15, 6000, 6000, [0, 0], true],
  ])('%s has the requested timing, handicap and relocation parameters', (level, firstSearchMs, wrongFirstGuess, searchIntervalMs, chargeRegenMs, ghostWaitMs, moveAfterClue) => {
    expect(HOUSE_POLICIES[level]).toEqual({ firstSearchMs, wrongFirstGuess, searchIntervalMs, chargeRegenMs, ghostWaitMs, moveAfterClue });
  });
  it.each(['restless', 'haunted', 'possessed'])('%s waits for a clue then its configured first-search delay', (level) => {
    const s = active(level), p = HOUSE_POLICIES[level];
    expect(botHunterDecide(s, now(11999), () => 0)).toBeNull();
    G.advance(s, now(12000));
    expect(botHunterDecide(s, now(12000), () => 0)).toBeNull();
    const due = 12000 + p.firstSearchMs[0];
    expect(botHunterDecide(s, now(due - 1), () => 0)).toBeNull();
    const move = botHunterDecide(s, now(due), () => 0);
    expect(move.type).toBe('investigate');
    expect(move.objectId).not.toBe(s.ghostObject); // forced wrong first guess
    expect(s.bot.nextSearchAt).toBe(due + p.searchIntervalMs);
  });
  it.each(['restless', 'haunted', 'possessed'])('%s uses its wrong-first-guess threshold', (level) => {
    const p = HOUSE_POLICIES[level];
    for (const [rng, miss] of [[p.wrongFirstGuess - .001, true], [p.wrongFirstGuess, false]]) {
      const s = active(level); G.advance(s, now(12000));
      botHunterDecide(s, now(12000), () => rng);
      expect(s.bot.missNext).toBe(miss);
    }
  });
  it.each(['restless', 'haunted', 'possessed'])('%s regenerates House charges without changing human charges', (level) => {
    const s = active(level), p = HOUSE_POLICIES[level];
    s.charges = 0; s.regenStart = 0;
    G.settleCharges(s, p.chargeRegenMs - 1); expect(s.charges).toBe(0);
    G.settleCharges(s, p.chargeRegenMs); expect(s.charges).toBe(1);
    expect(G.view(s, 1, now(p.chargeRegenMs)).balance.chargeRegenMs).toBe(p.chargeRegenMs);
    s.ghostSeat = 1; s.charges = 0; s.regenStart = 0;
    G.settleCharges(s, 6999); expect(s.charges).toBe(0);
    G.settleCharges(s, 7000); expect(s.charges).toBe(1);
    s.practice = false; s.ghostSeat = 0;
    expect(G.chargeRegenMs(s)).toBe(B.chargeRegenMs);
  });
  it('Restless relocates rarely, Haunted preserves its current wait', () => {
    for (const [level, wait] of [['restless', 26000], ['haunted', 14000]]) {
      const s = active(level, 1);
      expect(botGhostDecide(s, now(0), () => 0)).toBeNull();
      s.bot.taunted = true;
      expect(botGhostDecide(s, now(wait - 1), () => 0)).toBeNull();
      expect(botGhostDecide(s, now(wait), () => 0).type).toBe('possess');
    }
  });
  it('Possessed relocates immediately after each clue toward a least-recently named room', () => {
    const s = active('possessed', 1), named = Object.fromEntries(Object.keys(ROOMS).map((r) => [r, -1]));
    expect(botGhostDecide(s, now(11999), () => .5)).toBeNull();
    B.clueTimesMs.forEach((ms, index) => {
      G.advance(s, now(ms));
      if (s.lastClue.room) named[s.lastClue.room] = ms;
      const available = Object.keys(ROOMS).filter((room) => room !== ROOM_OF[s.ghostObject]);
      const oldest = Math.min(...available.map((room) => named[room]));
      const move = botGhostDecide(s, now(ms), () => .5);
      expect(move.type).toBe('possess');
      expect(named[ROOM_OF[move.objectId]]).toBe(oldest);
      const events = G.act(s, 1, { ...move, actionId: `move-${index}` }, now(ms));
      expect(events.some((e) => e.msg.kind === 'moved')).toBe(true);
      expect(botGhostDecide(s, now(ms + 1), () => .5)?.type).not.toBe('possess');
    });
  });
  it('invalid or missing levels default to Haunted', () => {
    for (const level of [undefined, null, 'other', '__proto__', {}, 4]) expect(normalizeDifficulty(level)).toBe('haunted');
  });
  it.each(['restless', 'haunted', 'possessed', 'invalid'])('practice hello stores a validated %s level and reconnect cannot change it', async (level) => {
    const a = new HauntRoom(), store = new Map(), sent = [];
    const conn = { id: 'a', identity: { type: 'anonymous', anonymousId: 'a' }, send: (msg) => sent.push(msg), reject() {} };
    a.__env = { instanceId: 'haunt-ACDEFG', conns: new Map([['a', conn]]), wakes: new Map(), storage: { get: async (key) => store.get(key), put: async (key, val) => store.set(key, val), deleteAll: async () => store.clear() } };
    await a.handleMessage(conn, { type: 'hello', intent: 'practice', level });
    expect(a.s.practiceLevel).toBe(normalizeDifficulty(level));
    expect(sent.find((msg) => msg.type === 'state').practiceLevel).toBe(normalizeDifficulty(level));
    await a.handleMessage(conn, { type: 'hello', intent: 'join', level: 'restless' });
    expect(a.s.practiceLevel).toBe(normalizeDifficulty(level));
  });
});