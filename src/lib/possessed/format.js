import { ROOM_ORDER, ROOMS } from '@/lib/possessed/layout';

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
  taunt_cooldown: 'Your taunt is still recharging.',
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

// One sentence under the final survival bars. gap is already formatted (e.g. "12.3").
export function finalLine({ draw, won, practice, gap }) {
  if (draw) return practice ? 'You and the House lasted exactly as long.' : 'You both lasted exactly as long.';
  if (practice) return won ? `You beat the House by ${gap} s.` : `The House got you by ${gap} s.`;
  return won ? `You lasted ${gap} s longer.` : `They lasted ${gap} s longer.`;
}

// Share copy, correct for win / loss / draw and practice. Survival is always the sharer's own Ghost round.
export function shareText({ draw, won, practice, mineMs, gap, round }) {
  const t = String(Number((mineMs / 1000).toFixed(2)));
  const foe = practice ? 'the House' : 'my rival';
  const result = draw ? `tied with ${foe}` : won ? `beat ${foe} by ${gap} s` : `lost to ${foe} by ${gap} s`;
  const grid = round ? `${shareGrid(round)}\n` : '';
  return `${grid}I hid for ${t} s as the Ghost in POSSESSED and ${result}. Can you find me? https://possessed.base44.app`;
}

// One line per room, two characters per prop: ▓▓ searched, ░░ untouched, 👻 where the Ghost ended.
export function shareGrid(round) {
  const searched = new Set(round.searched || []);
  return ROOM_ORDER.map((room) => ROOMS[room].objects
    .map((id) => (id === round.hidingObject ? '👻' : searched.has(id) ? '▓▓' : '░░')).join('')).join('\n');
}