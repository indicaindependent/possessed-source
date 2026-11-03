import { describe, it, expect } from 'vitest';
import { finalLine, shareText } from '../src/lib/possessed/format.js';

describe('final copy', () => {
  it('practice lines', () => {
    expect(finalLine({ won: true, practice: true, gap: '12.3' })).toBe('You beat the House by 12.3 s.');
    expect(finalLine({ won: false, practice: true, gap: '8.1' })).toBe('The House got you by 8.1 s.');
  });
  it('match lines', () => {
    expect(finalLine({ won: true, gap: '12' })).toBe('You lasted 12 s longer.');
    expect(finalLine({ won: false, gap: '12' })).toBe('They lasted 12 s longer.');
    expect(finalLine({ draw: true })).toMatch(/exactly as long/);
  });
  it('share copy matches outcome', () => {
    expect(shareText({ won: true, mineMs: 41200, gap: '3' })).toMatch(/hid for 41.2 s .* beat my rival by 3 s/);
    expect(shareText({ won: false, practice: true, mineMs: 9000, gap: '8.1' })).toMatch(/lost to the House by 8.1 s/);
    expect(shareText({ draw: true, mineMs: 60000 })).toMatch(/tied with my rival/);
  });
});