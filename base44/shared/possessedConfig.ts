// POSSESSED balance + rules configuration.
// These are INITIAL PLAYTEST SETTINGS, not verified perfect balance. Tune here only.
export const BALANCE = {
  roundMs: 60000,            // max active seconds per round (full survival score)
  countdownMs: 3000,         // synchronized pre-round countdown
  moveCooldownMs: 8000,      // Ghost cooldown between possessions
  startMoveReadyMs: 0,       // active ms before the Ghost's first move is allowed
  startCharges: 3,           // Hunter investigation charges at round start
  maxCharges: 3,
  chargeRegenMs: 5000,       // one spent charge regenerates every 5 active seconds
  clueTimesMs: [12000, 24000, 36000, 48000],
  clueDurationMs: 2000,      // room highlight duration (client display)
  rippleMs: 1000,            // ripple on the abandoned object (client display)
  reconnectGraceMs: 10000,   // time to reclaim a seat before the match is abandoned
  emptyRoomExpireMs: 60000,  // a room with nobody connected expires after this
};

export const LIMITS = {
  nameMax: 16,
  actionIdMax: 40,
  recentActions: 64,
  rateBurst: 20,
  rateRefillPerSec: 10,
};

export const ROOMS = {
  parlor: ['rocking_chair', 'grandfather_clock', 'portrait'],
  library: ['bookcase', 'globe', 'typewriter'],
  kitchen: ['cauldron', 'cupboard', 'teapot'],
  attic: ['trunk', 'mirror', 'rocking_horse'],
};

export const OBJECT_IDS = Object.values(ROOMS).flat();

export const ROOM_OF = Object.fromEntries(
  Object.entries(ROOMS).flatMap(([room, ids]) => ids.map((id) => [id, room])),
);

// Six characters, uppercase, no ambiguous glyphs (0/O, 1/I/L, 5/S, 2/Z, 8/B).
export const CODE_RE = /^[ACDEFGHJKMNPQRTUVWXY34679]{6}$/;