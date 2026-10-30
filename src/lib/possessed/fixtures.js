// DEV-only static room snapshots for layout checks. Shapes mirror the server's role-specific
// view(); these are fixtures, NOT live games.
const balance = {
  roundMs: 60000, countdownMs: 3000, moveCooldownMs: 8000, maxCharges: 3, chargeRegenMs: 5000,
  clueDurationMs: 2000, rippleMs: 1000, reconnectGraceMs: 10000, clueTimesMs: [12000, 24000, 36000, 48000],
};
const seat = (k, name, extra = {}) => ({ seat: k, name, ready: false, rematch: false, connected: true, graceMs: null, ...extra });
const R1 = { round: 1, ghostSeat: 1, ghostName: 'Pete', outcome: 'survived', survivalMs: 60000, hidingObject: 'bookcase', hidingRoom: 'library' };
const R2 = { round: 2, ghostSeat: 0, ghostName: 'Mabel', outcome: 'caught', survivalMs: 35330, hidingObject: 'trunk', hidingRoom: 'attic' };

export function fixtureView(phase = 'active', role = 'hunter') {
  const ghostSeat = role === 'ghost' ? 0 : 1;
  const base = {
    type: 'state', code: 'U7K6PA', phase, you: 0, seats: [seat(0, 'Mabel'), seat(1, 'Pete', { ready: true })],
    matchNo: 1, round: 0, roundId: null, role: null, ghostSeat: null,
    clock: { activeMs: 0, paused: false, running: false, countdownMs: null },
    nextClueAtMs: null, lastClue: null, results: [], winner: null, notice: null, abandonedBy: null,
    balance, receivedAt: performance.now(),
  };
  if (phase === 'lobby') return base;
  if (phase === 'intermission') return { ...base, round: 1, role: 'hunter', ghostSeat: 1, results: [R1], seats: [seat(0, 'Mabel'), seat(1, 'Pete')] };
  if (phase === 'final') return { ...base, round: 2, role: 'ghost', ghostSeat: 0, results: [R1, R2], winner: 1, seats: [seat(0, 'Mabel'), seat(1, 'Pete', { rematch: true })] };
  const live = phase === 'active';
  const v = {
    ...base, phase: live ? 'active' : 'countdown', round: 1, roundId: 'fixture', role, ghostSeat,
    clock: live ? { activeMs: 26000, paused: false, running: true, countdownMs: null } : { activeMs: 0, paused: false, running: false, countdownMs: 2400 },
    nextClueAtMs: live ? 36000 : null, lastClue: live ? { index: 1, room: 'parlor', atMs: 24000 } : null,
  };
  if (role === 'ghost') v.ghost = { objectId: 'grandfather_clock', moveReadyInMs: live ? 3000 : 0 };
  else v.hunter = { charges: live ? 2 : 3, regenElapsedMs: live ? 1500 : null };
  return v;
}