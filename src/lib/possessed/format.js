export const secs = (ms, digits = 1) => (Math.max(0, ms ?? 0) / 1000).toFixed(digits);

// Enough precision that two different server times never look identical.
export function precisionFor(a, b) {
  if (a === b) return 2;
  return secs(a, 2) === secs(b, 2) ? 3 : 2;
}

// Round-2 instructions from round 1's result. Scoring is "longer survival wins, equal is a draw",
// so a full-length survival can only be TIED by the next Ghost, never beaten.
export function nextRoundGoal(r, roundMs, nextIsGhost) {
  const t = secs(r.survivalMs, 2);
  const full = secs(roundMs, 0);
  if (r.survivalMs >= roundMs) {
    return nextIsGhost
      ? `They survived the full ${full}s. Survive all ${full}s to draw; that can't be beaten.`
      : `Catch your friend at any point to win. If they also survive all ${full}s, it's a draw.`;
  }
  return nextIsGhost
    ? `Survive longer than ${t}s to win. Exactly ${t}s is a draw.`
    : `Catch your friend before ${t}s to win.`;
}

export const REJECT_TEXT = {
  no_charges: 'No charges left. Wait for a refill.',
  cooldown: "Your next move isn't ready yet.",
  same_object: "You're already possessing that.",
  paused: 'The game is paused.',
  not_active: 'The round is not running.',
  rate_limited: 'Easy there, slow down a little.',
};

export const ERROR_TEXT = {
  not_found: 'No haunt found with that code. Check the letters and try again.',
  expired: 'That haunt has expired. Create a new one.',
  full: 'That haunt already has two players.',
  in_progress: 'That haunt already has two players and a match underway.',
  invalid_code: "That room code isn't valid.",
  seat_mismatch: 'That seat belongs to someone else.',
  code_taken: "Couldn't find a free room code. Please try again.",
};