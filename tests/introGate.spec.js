import { describe, it, expect } from 'vitest';
import { introMode, markIntroSeen } from '@/lib/possessed/introGate';

const store = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

describe('intro gate', () => {
  it('plays on first load, not on the second', () => {
    const s = store();
    expect(introMode({ storage: s })).toBe('full');
    markIntroSeen(s);
    expect(introMode({ storage: s })).toBe('none');
  });
  it('never plays when arriving with a room code', () => {
    expect(introMode({ storage: store(), search: '?room=ABCDEF' })).toBe('none');
  });
  it('never plays off the home route', () => {
    expect(introMode({ storage: store(), pathname: '/og-card' })).toBe('none');
    expect(introMode({ storage: store(), pathname: '/dev/fixture' })).toBe('none');
  });
  it('uses the fade under reduced motion', () => {
    expect(introMode({ storage: store(), reducedMotion: true })).toBe('fade');
  });
});