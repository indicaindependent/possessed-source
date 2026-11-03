// "The House": a server-side practice opponent. No I/O; the caller feeds G.act with the result.
// Planning memory lives in s.bot (serialized with the room) and resets every round.
// The hunter policy reads only what a human hunter's view shows (lastClue, charges), never ghostObject.
import { BALANCE as B, OBJECT_IDS, ROOMS, ROOM_OF, TAUNTS } from './possessedConfig.ts';
import { activeNow, settleCharges, hunterSeat } from './possessedEngine.ts';

export const BOT_SEAT = 1;
const between = (rng, lo, hi) => lo + rng() * (hi - lo);
const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];

function memory(s, rng) {
  if (!s.bot || s.bot.roundId !== s.roundId) {
    s.bot = {
      roundId: s.roundId,
      stillUntil: between(rng, 14000, 22000),
      tauntAt: between(rng, 15000, 40000), taunted: false,
      searched: [], clueIdx: -1, nextSearchAt: 7000, lastSearchAt: -1e9, blindDone: false,
    };
  }
  return s.bot;
}

const live = (s) => s.phase === 'active' && !s.paused && s.roundId;

export function botGhostDecide(s, now, rng) {
  if (!live(s) || s.ghostSeat !== BOT_SEAT) return null;
  const m = memory(s, rng);
  const a = activeNow(s, now);
  if (!m.taunted && a >= m.tauntAt && a >= (s.tauntReadyAt ?? 0)) {
    m.taunted = true;
    return { type: 'taunt', roundId: s.roundId, sound: pick(rng, TAUNTS) };
  }
  if (a < m.stillUntil || a < s.moveReadyAt || a >= B.roundMs - 6000) return null;
  const others = OBJECT_IDS.filter((id) => id !== s.ghostObject);
  const clueRoom = s.lastClue?.room;
  const away = others.filter((id) => ROOM_OF[id] !== clueRoom);
  const pool = clueRoom && away.length && rng() < 0.7 ? away : others;
  m.stillUntil = a + between(rng, 14000, 22000);
  return { type: 'possess', roundId: s.roundId, objectId: pick(rng, pool) };
}

export function botHunterDecide(s, now, rng) {
  if (!live(s) || hunterSeat(s) !== BOT_SEAT) return null;
  const m = memory(s, rng);
  const a = activeNow(s, now);
  if (s.lastClue && s.lastClue.index !== m.clueIdx) {
    m.clueIdx = s.lastClue.index;
    m.nextSearchAt = a + between(rng, 2000, 4000);
  }
  if (a < m.nextSearchAt || a - m.lastSearchAt < 6000) return null;
  settleCharges(s, a);
  if (s.charges <= 0) return null;
  let pool;
  if (s.lastClue) {
    const room = ROOMS[s.lastClue.room];
    const fresh = room.filter((id) => !m.searched.includes(id));
    pool = fresh.length ? fresh : room;
    m.nextSearchAt = a + 6000;
  } else {
    if (m.blindDone) return null;
    m.blindDone = true;
    pool = OBJECT_IDS.filter((id) => !m.searched.includes(id));
    m.nextSearchAt = 1e12; // JSON-safe "never" (until the first clue resets it)
  }
  const objectId = pick(rng, pool);
  m.searched.push(objectId);
  m.lastSearchAt = a;
  return { type: 'investigate', roundId: s.roundId, objectId };
}

export const botDecide = (s, now, rng) => botGhostDecide(s, now, rng) ?? botHunterDecide(s, now, rng);