import { describe, it, expect } from 'vitest';
import { createTimeline, introVars, allActs, needsGate, END_MS, REDUCED_END_MS } from '@/lib/possessed/introTimeline';
import { introMode, markIntroSeen, INTRO_KEY } from '@/lib/possessed/introGate';

const store = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };
const firedAt = (tl, t) => tl.step(t).fired;

describe('intro timeline', () => {
  it('fires each act boundary exactly at its time, never a frame early', () => {
    const bounds = { 1600: 'flash1', 3400: 'rock', 5400: 'beam', 7900: 'reopen', 9300: 'pull', 9800: 'title', 11600: 'out' };
    for (const [ms, act] of Object.entries(bounds)) {
      const tl = createTimeline();
      expect(firedAt(tl, Number(ms) - 1)).not.toContain(act);
      expect(firedAt(tl, Number(ms))).toContain(act);
    }
  });
  it('finishes at 12 s', () => {
    const tl = createTimeline();
    expect(tl.step(END_MS - 1).done).toBe(false);
    expect(tl.step(END_MS).done).toBe(true);
  });
  it('skip at any time ends in one step with every act applied and no further sounds; marks seen', () => {
    for (const t of [0, 1600, 6200, 11000]) {
      const tl = createTimeline();
      const before = tl.step(t).fired;
      const r = tl.skip();
      expect(r.done).toBe(true);
      expect([...before, ...r.fired].sort()).toEqual([...allActs(false)].sort());
      expect(tl.step(t + 16).sounds).toEqual([]);
    }
    const s = store();
    markIntroSeen(s);
    expect(introMode({ storage: s })).toBe('none');
  });
  it('replay never shows the gate and never clears introSeen', () => {
    const s = store();
    markIntroSeen(s);
    expect(needsGate({ replay: true, audioRunning: false })).toBe(false);
    expect(s.getItem(INTRO_KEY)).toBe('1');
    expect(needsGate({ replay: false, audioRunning: false })).toBe(true);
    expect(needsGate({ replay: false, audioRunning: true })).toBe(false);
  });
  it('camera pushes in to 1.9 on phones / 1.7 on desktop by 5.4 s, and pulls back by 10.3 s', () => {
    expect(introVars(5400).cam).toBeCloseTo(1.9);
    expect(introVars(5400, false, true).cam).toBeCloseTo(1.7);
    expect(introVars(10300).cam).toBeCloseTo(1);
    expect(introVars(1660).flash).toBeGreaterThan(0.5);
  });
  it('reduced motion: 3 s, no push, shake or flash', () => {
    const acts = allActs(true);
    for (const bad of ['flash1', 'rock', 'beam', 'freeze', 'pull', 'reopen']) expect(acts).not.toContain(bad);
    for (let t = 0; t <= REDUCED_END_MS; t += 50) {
      const v = introVars(t, true);
      expect(v.cam).toBe(1);
      expect(v.flash).toBe(0);
    }
    expect(createTimeline(true).step(REDUCED_END_MS).done).toBe(true);
  });
});