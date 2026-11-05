import { describe, it, expect, afterEach } from 'vitest';
import { RECORD_KEY, readHauntRecord, saveHauntRecord } from '../src/lib/possessed/hauntRecord';
import * as G from '../base44/shared/possessedEngine.ts';
import { BALANCE as B } from '../base44/shared/possessedConfig.ts';

const storage = () => { const values = new Map(); return { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) }; };
const final = (extra = {}) => ({ phase: 'final', recordId: 'ACDEFG:m1r2-unique', you: 0, winner: 0, practice: false, practiceLevel: null, results: [{ round: 1, ghostSeat: 0, outcome: 'survived', survivalMs: 60000, tauntsFired: 3 }, { round: 2, ghostSeat: 1, outcome: 'caught', survivalMs: 14000, tauntsFired: 4 }], ...extra });
afterEach(() => G.setRandom(Math.random));
describe('local Haunt record', () => {
  it('stays absent before a complete final and writes only the requested key', () => {
    const s = storage();
    expect(readHauntRecord(s)).toBeNull();
    expect(saveHauntRecord(final({ phase: 'intermission' }), s)).toBeNull();
    expect(saveHauntRecord(final({ results: [] }), s)).toBeNull();
    expect(s.getItem(RECORD_KEY)).toBeNull();
    expect(saveHauntRecord(final(), s)).toMatchObject({ matchesPlayed: 1, bestSurvivalMs: 60000, fastestCatchMs: 14000, tauntsFired: 3 });
    expect(s.getItem(RECORD_KEY)).not.toBeNull();
  });
  it('counts reconnects and remounts once, rematches separately, preserves best times', () => {
    const s = storage(); saveHauntRecord(final(), s); saveHauntRecord(final(), s);
    expect(readHauntRecord(s).matchesPlayed).toBe(1);
    saveHauntRecord(final({ recordId: 'ACDEFG:m2r2-unique', results: [{ ghostSeat: 0, survivalMs: 30000, outcome: 'caught', tauntsFired: 1 }, { ghostSeat: 1, survivalMs: 10000, outcome: 'caught' }] }), s);
    expect(readHauntRecord(s)).toMatchObject({ matchesPlayed: 2, bestSurvivalMs: 60000, fastestCatchMs: 10000, tauntsFired: 4 });
  });
  it.each(['restless', 'haunted', 'possessed'])('counts only wins over the %s House, not draws or human matches', (level) => {
    const s = storage();
    saveHauntRecord(final({ practice: true, practiceLevel: level }), s);
    saveHauntRecord(final({ recordId: 'draw', practice: true, practiceLevel: level, winner: 'draw' }), s);
    saveHauntRecord(final({ recordId: 'loss', practice: true, practiceLevel: level, winner: 1 }), s);
    saveHauntRecord(final({ recordId: 'human', practiceLevel: level }), s);
    expect(readHauntRecord(s).housesBeaten[level]).toBe(1);
    expect(readHauntRecord(s).matchesPlayed).toBe(4);
  });
  it('uses the correct seat after roles swap and never treats survival as a catch', () => {
    const s = storage(); saveHauntRecord(final({ you: 1 }), s);
    expect(readHauntRecord(s)).toMatchObject({ bestSurvivalMs: 14000, fastestCatchMs: null, tauntsFired: 4 });
  });
  it('engine counts only accepted taunts and provides a stable final identity', () => {
    G.setRandom(() => 0);
    const s = G.newState('ACDEFG'); G.join(s, 'a', 'a', 'A'); G.join(s, 'b', 'b', 'B');
    G.act(s, 0, { type: 'ready', actionId: 'r0' }, 0); G.act(s, 1, { type: 'ready', actionId: 'r1' }, 0); G.advance(s, B.countdownMs);
    const taunt = (seat, id, ms) => G.act(s, seat, { type: 'taunt', sound: 'creak', actionId: id, roundId: s.roundId }, B.countdownMs + ms);
    taunt(0, 't1', 1000); taunt(0, 't1', 1000); taunt(0, 't2', 2000); taunt(1, 'bad', 3000); taunt(0, 't3', 11000);
    G.advance(s, B.countdownMs + 60000); expect(s.results[0].tauntsFired).toBe(2);
    G.act(s, 0, { type: 'ready', actionId: 'r2' }, 63000); G.act(s, 1, { type: 'ready', actionId: 'r3' }, 63000);
    G.advance(s, 126000);
    expect(s.results[1].tauntsFired).toBe(0);
    const v = G.view(s, 0, 126000);
    expect(v.recordId).toBeTruthy(); expect(G.view(s, 0, 126001).recordId).toBe(v.recordId);
  });
});