// "The House": a server-side practice opponent. No I/O; the caller feeds G.act with the result.
// Planning memory lives in s.bot (serialized with the room) and resets every round.
// The hunter policy aims only from what a human hunter's view shows (lastClue, charges). It reads
// ghostObject for one thing only: to deliberately miss (an easing handicap for new players).
import { BALANCE as B, OBJECT_IDS, ROOMS, ROOM_OF, TAUNTS } from './possessedConfig.ts';
import { activeNow, settleCharges, hunterSeat } from './possessedEngine.ts';
import { housePolicy } from './possessedDifficulty.ts';

export const BOT_SEAT = 1;
const between = (rng, lo, hi) => lo + rng() * (hi - lo);
const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];

function memory(s, rng) {
  if (!s.bot || s.bot.roundId !== s.roundId) {
    s.bot = {
      roundId: s.roundId,
      stillUntil: between(rng, ...housePolicy(s.practiceLevel).ghostWaitMs),
      namedRooms: Object.fromEntries(Object.keys(ROOMS).map((room) => [room, -1])),
      ghostClueIdx: -1, movedClueIdx: -1,
      tauntAt: between(rng, 15000, 40000), taunted: false,
      searched: [], clueIdx: -1, nextSearchAt: 1e12, lastSearchAt: -1e9, missNext: false,
    };
  }
  return s.bot;
}

const live = (s) => s.phase === 'active' && !s.paused && s.roundId;

export function botGhostDecide(s, now, rng) {
  if (!live(s) || s.ghostSeat !== BOT_SEAT) return null;
  const m = memory(s, rng);
  const a = activeNow(s, now);
  const policy = housePolicy(s.practiceLevel);
  if (s.lastClue && s.lastClue.index !== m.ghostClueIdx) {
    m.ghostClueIdx = s.lastClue.index;
    m.namedRooms ??= Object.fromEntries(Object.keys(ROOMS).map((room) => [room, -1]));
    if (s.lastClue.room) m.namedRooms[s.lastClue.room] = s.lastClue.atMs;
  }
  if (policy.moveAfterClue && m.ghostClueIdx >= 0 && m.ghostClueIdx !== m.movedClueIdx && a >= s.moveReadyAt) {
    const rooms = Object.keys(ROOMS).filter((room) => room !== ROOM_OF[s.ghostObject]);
    const oldest = Math.min(...rooms.map((room) => m.namedRooms[room]));
    const target = pick(rng, rooms.filter((room) => m.namedRooms[room] === oldest));
    m.movedClueIdx = m.ghostClueIdx;
    return { type: 'possess', roundId: s.roundId, objectId: pick(rng, ROOMS[target]) };
  }
  if (!m.taunted && a >= m.tauntAt && a >= (s.tauntReadyAt ?? 0)) {
    m.taunted = true;
    return { type: 'taunt', roundId: s.roundId, sound: pick(rng, TAUNTS) };
  }
  if (policy.moveAfterClue || a < m.stillUntil || a < s.moveReadyAt || a >= B.roundMs - 6000) return null;
  const others = OBJECT_IDS.filter((id) => id !== s.ghostObject);
  const clueRoom = s.lastClue?.room;
  const away = others.filter((id) => ROOM_OF[id] !== clueRoom);
  const pool = clueRoom && away.length && rng() < 0.7 ? away : others;
  m.stillUntil = a + between(rng, ...policy.ghostWaitMs);
  return { type: 'possess', roundId: s.roundId, objectId: pick(rng, pool) };
}

export function botHunterDecide(s, now, rng) {
  if (!live(s) || hunterSeat(s) !== BOT_SEAT) return null;
  const m = memory(s, rng);
  const a = activeNow(s, now);
  const policy = housePolicy(s.practiceLevel);
  if (s.lastClue && s.lastClue.index !== m.clueIdx) {
    m.clueIdx = s.lastClue.index;
    m.nextSearchAt = a + between(rng, ...policy.firstSearchMs);
    m.missNext = rng() < policy.wrongFirstGuess;
  }
  if (a < m.nextSearchAt || a - m.lastSearchAt < policy.searchIntervalMs) return null;
  settleCharges(s, a);
  if (s.charges <= 0) return null;
  if (!s.lastClue) return null; // never search blind: the first search waits for the first clue
  const { room: clueRoom, props = [] } = s.lastClue;
  const room = clueRoom ? ROOMS[clueRoom].filter((id) => !props.includes(id)) : props;
  const fresh = room.filter((id) => !m.searched.includes(id));
  let pool = fresh.length ? fresh : room;
  if (m.missNext) {
    m.missNext = false;
    const wrong = pool.filter((id) => id !== s.ghostObject);
    const anyWrong = room.filter((id) => id !== s.ghostObject);
    pool = wrong.length ? wrong : anyWrong.length ? anyWrong : pool;
  }
  m.nextSearchAt = a + policy.searchIntervalMs;
  const objectId = pick(rng, pool);
  m.searched.push(objectId);
  m.lastSearchAt = a;
  return { type: 'investigate', roundId: s.roundId, objectId };
}

export const botDecide = (s, now, rng) => botGhostDecide(s, now, rng) ?? botHunterDecide(s, now, rng);