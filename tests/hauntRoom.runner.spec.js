import { test, beforeEach, afterEach, vi } from 'vitest';
import HauntRoom from '../base44/actors/HauntRoom/entry.ts';
import * as G from '../base44/shared/possessedEngine.ts';
import simTests from './hauntRoom.sim.test.js';

let t = 1_700_000_000_000;
const clock = { add: (ms) => { t += ms; } };
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

beforeEach(() => {
  vi.spyOn(Date, 'now').mockImplementation(() => t);
  let seed = 7;
  G.setRandom(() => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; });
});
afterEach(() => vi.restoreAllMocks());

for (const [name, fn] of simTests(HauntRoom, clock, assert)) test(`actor: ${name}`, fn);