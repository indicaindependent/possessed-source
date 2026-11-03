import { describe, it, expect } from 'vitest';
import { createTimeline, introVars, allActs, needsGate, pushFraming, camAt, elapsedSince, END_MS, REDUCED_END_MS } from '@/lib/possessed/introTimeline';
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
  it('camera is fully pushed in by 5.4 s, holds to 9.3 s, and is pulled back by 10.3 s', () => {
    expect(introVars(5400).push).toBeCloseTo(1);
    expect(introVars(8400).push).toBe(1);
    expect(introVars(10300).push).toBeCloseTo(0);
    expect(introVars(1660).flash).toBeGreaterThan(0.5);
  });
  it('elapsed since a cue matches the fixture delay; the rocking loop stops counting at freeze', () => {
    expect(elapsedSince('rock', 6000)).toBe(2600);
    expect(elapsedSince('rock', 7000)).toBe(2800);
    expect(elapsedSince('title', 10000)).toBe(200);
    expect(elapsedSince('pull', 9000)).toBe(null);
  });
  // Stage model: house box is min(vw, 0.8vh*1.15) wide minus 4px padding each side, aspect 1.15, centred at 55% height;
  // Parlor is the bottom-left room of the 2x2 grid below the roof.
  const stage = (vw, vh) => {
    const w = Math.min(vw, 0.8 * vh * 1.15) - 8, h = w / 1.15;
    const house = { x: (vw - w) / 2, y: 0.55 * vh - h / 2, w, h };
    return { vw, vh, house, parlor: { x: house.x + 0.015 * w, y: house.y + 0.52 * h, w: 0.475 * w, h: 0.38 * h } };
  };
  it.each([[360, 780], [390, 844], [1440, 900]])('push-in at %ix%i keeps the whole Parlor on screen with no empty edge', (vw, vh) => {
    const s = stage(vw, vh);
    const f = pushFraming(s);
    expect(f.scale).toBeLessThanOrEqual(1.9);
    expect(f.scale).toBeLessThanOrEqual((0.86 * vw) / s.parlor.w + 1e-9);
    expect(f.scale).toBeLessThanOrEqual((0.86 * vh) / s.parlor.h + 1e-9);
    const map = (x, h0, t) => h0 + t + (x - h0) * f.scale;
    const L = map(s.parlor.x, s.house.x, f.tx), R = map(s.parlor.x + s.parlor.w, s.house.x, f.tx);
    const T = map(s.parlor.y, s.house.y, f.ty), B = map(s.parlor.y + s.parlor.h, s.house.y, f.ty);
    expect(L).toBeGreaterThanOrEqual(0); expect(R).toBeLessThanOrEqual(vw);
    expect(T).toBeGreaterThanOrEqual(0); expect(B).toBeLessThanOrEqual(vh);
    // No empty edge: a house wider/taller than the screen covers it; a smaller one stays fully inside.
    const hl = map(s.house.x, s.house.x, f.tx), hr = hl + s.house.w * f.scale;
    if (s.house.w * f.scale >= vw) { expect(hl).toBeLessThanOrEqual(0); expect(hr).toBeGreaterThanOrEqual(vw); }
    else { expect(hl).toBeGreaterThanOrEqual(0); expect(hr).toBeLessThanOrEqual(vw); }
    const ht = map(s.house.y, s.house.y, f.ty), hb = ht + s.house.h * f.scale;
    if (s.house.h * f.scale >= vh) { expect(ht).toBeLessThanOrEqual(0); expect(hb).toBeGreaterThanOrEqual(vh); }
    else { expect(ht).toBeGreaterThanOrEqual(0); expect(hb).toBeLessThanOrEqual(vh); }
    expect(camAt(f, 0)).toEqual({ cam: 1, tx: 0, ty: 0 });
  });
  it('reduced motion: 3 s, no push, shake or flash', () => {
    const acts = allActs(true);
    for (const bad of ['flash1', 'rock', 'beam', 'freeze', 'pull', 'reopen']) expect(acts).not.toContain(bad);
    for (let t = 0; t <= REDUCED_END_MS; t += 50) {
      const v = introVars(t, true);
      expect(v.push).toBe(0);
      expect(v.flash).toBe(0);
    }
    expect(createTimeline(true).step(REDUCED_END_MS).done).toBe(true);
  });
});