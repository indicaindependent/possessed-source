import { describe, it, expect, afterEach } from 'vitest';
import * as G from '../base44/shared/possessedEngine.ts';
import { BALANCE as B, ROOM_OF } from '../base44/shared/possessedConfig.ts';
import resultReveals from '../src/lib/possessed/resultReveals';

const now = (ms) => B.countdownMs + ms;
function setup() {
  G.setRandom(() => 0);
  const s = G.newState('ACDEFG');
  G.join(s, 'a', 'a', 'A'); G.join(s, 'b', 'b', 'B');
  G.act(s, 0, { type: 'ready', actionId: 'a' }, 0); G.act(s, 1, { type: 'ready', actionId: 'b' }, 0);
  G.advance(s, B.countdownMs);
  return s;
}
const move = (s, objectId, ms) => G.act(s, s.ghostSeat, { type: 'possess', objectId, roundId: s.roundId, actionId: `move${ms}` }, now(ms));
const caught = (s, ms) => G.act(s, 1 - s.ghostSeat, { type: 'investigate', objectId: s.ghostObject, roundId: s.roundId, actionId: `catch${ms}` }, now(ms));
const stop = (object, fromMs, toMs) => ({ object, room: ROOM_OF[object], fromMs, toMs });
afterEach(() => G.setRandom(Math.random));
describe('sealed haunting path', () => {
  it('closes the starting possession at survival without movement', () => {
    const s = setup(), start = s.ghostObject;
    const out = G.advance(s, now(B.roundMs));
    expect(s.results[0].path).toEqual([stop(start, 0, B.roundMs)]);
    expect(out.find((e) => e.msg.kind === 'round_result').msg.result.path).toEqual(s.results[0].path);
    expect(out.find((e) => e.msg.kind === 'round_end').msg.result).not.toHaveProperty('path');
  });
  it('records two relocations with contiguous active-time boundaries', () => {
    const s = setup(), start = s.ghostObject;
    move(s, 'portrait', 14000); move(s, 'teapot', 28000);
    G.advance(s, now(B.roundMs));
    expect(s.results[0].path).toEqual([stop(start, 0, 14000), stop('portrait', 14000, 28000), stop('teapot', 28000, B.roundMs)]);
  });
  it('closes at a catch mid-cooldown, excludes rejected moves and paused time', () => {
    const s = setup(), start = s.ghostObject;
    move(s, 'portrait', 14000); move(s, 'teapot', 14001);
    G.disconnect(s, 0, now(15000)); G.reconnect(s, 0, now(20000));
    caught(s, 21000);
    expect(s.results[0].path).toEqual([stop(start, 0, 14000), stop('portrait', 14000, 16000)]);
  });
  it('never serializes any path in either active seat view, including round two', () => {
    const s = setup(); move(s, 'portrait', 14000);
    for (const seat of [0, 1]) expect(JSON.stringify(G.view(s, seat, now(14000)))).not.toContain('path');
    caught(s, 15000);
    G.act(s, 0, { type: 'ready', actionId: 'a2' }, now(16000)); G.act(s, 1, { type: 'ready', actionId: 'b2' }, now(16000));
    G.advance(s, now(16000) + B.countdownMs);
    for (const seat of [0, 1]) expect(JSON.stringify(G.view(s, seat, now(20000)))).not.toContain('path');
    expect(G.resultEvents(s)).toEqual([]);
    const out = G.advance(s, now(16000) + B.countdownMs + B.roundMs);
    expect(out.find((e) => e.msg.kind === 'final').msg.results.every((r) => r.path.length > 0)).toBe(true);
  });
  it('reattaches terminal events for both seats and reconnects, never to active state', () => {
    const s = setup(); caught(s, 1000);
    for (const seat of [0, 1]) {
      const cache = resultReveals(); G.resultEvents(s).forEach((e) => cache.receive(e.msg));
      expect(cache.attach(G.view(s, seat, now(1000))).results[0].path).toEqual(s.results[0].path);
      expect(cache.attach({ ...G.view(s, seat, now(1000)), phase: 'active' }).results[0]).not.toHaveProperty('path');
    }
  });
});