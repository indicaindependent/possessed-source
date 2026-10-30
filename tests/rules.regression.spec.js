import { test, expect } from 'vitest';
import { nextRoundGoal } from '../src/lib/possessed/format.js';
import * as G from '../base44/shared/possessedEngine.ts';

const full = { survivalMs: 60000 };

test('after a full 60s survival the next Ghost is told 60s is a DRAW, never "longer than 60s"', () => {
  const ghost = nextRoundGoal(full, 60000, true);
  expect(ghost).toMatch(/Survive all 60s to draw/);
  expect(ghost).not.toMatch(/longer than/);
  expect(nextRoundGoal(full, 60000, false)).toMatch(/draw/);
});

test('a shorter round-1 survival keeps win/draw wording', () => {
  expect(nextRoundGoal({ survivalMs: 35330 }, 60000, true)).toBe('Survive longer than 35.33s to win. Exactly 35.33s is a draw.');
  expect(nextRoundGoal({ survivalMs: 35330 }, 60000, false)).toBe('Catch your friend before 35.33s to win.');
});

test('scoring unchanged: 60 vs 60 is a draw, longer survival wins', () => {
  expect(G.decideWinner([{ survivalMs: 60000, ghostSeat: 0 }, { survivalMs: 60000, ghostSeat: 1 }])).toBe('draw');
  expect(G.decideWinner([{ survivalMs: 60000, ghostSeat: 1 }, { survivalMs: 35330, ghostSeat: 0 }])).toBe(1);
});