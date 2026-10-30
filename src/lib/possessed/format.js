export const secs = (ms, digits = 1) => (Math.max(0, ms ?? 0) / 1000).toFixed(digits);

// Enough precision that two different server times never look identical.
export function precisionFor(a, b) {
  if (a === b) return 2;
  return secs(a, 2) === secs(b, 2) ? 3 : 2;
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