import { BALANCE } from './possessedConfig.ts';

export const HOUSE_POLICIES = {
  restless: { firstSearchMs: [8000, 11000], wrongFirstGuess: .6, searchIntervalMs: 10000, chargeRegenMs: 10000, ghostWaitMs: [26000, 34000], moveAfterClue: false },
  haunted: { firstSearchMs: [5000, 8000], wrongFirstGuess: .4, searchIntervalMs: 8000, chargeRegenMs: BALANCE.chargeRegenMs, ghostWaitMs: [14000, 22000], moveAfterClue: false },
  possessed: { firstSearchMs: [3000, 5000], wrongFirstGuess: .15, searchIntervalMs: 6000, chargeRegenMs: 6000, ghostWaitMs: [0, 0], moveAfterClue: true },
};
export const normalizeDifficulty = (level) => Object.hasOwn(HOUSE_POLICIES, level) ? level : 'haunted';
export const housePolicy = (level) => HOUSE_POLICIES[normalizeDifficulty(level)];