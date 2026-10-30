// Pure, authoritative POSSESSED state machine. No I/O: the HauntRoom actor feeds it
// wall-clock `now` and delivers the returned events. Every function returns a list of
// { to: 'all' | 0 | 1, msg } envelopes addressed to SEATS (never to raw connections).
import { BALANCE as B, OBJECT_IDS, ROOM_OF, LIMITS } from './possessedConfig.ts';

let rand = Math.random;
export function setRandom(fn) { rand = fn; }

const OBJ = new Set(OBJECT_IDS);
const IN_PLAY = new Set(['countdown', 'active', 'intermission']);
const DEDUP = new Set(['investigate', 'possess', 'ready', 'rematch', 'back_to_lobby']);

const ev = (to, kind, extra = {}) => ({ to, msg: { type: 'ev', kind, ...extra } });

export function newState(code) {
  return {
    v: 1, created: true, expired: false, code, phase: 'lobby', seats: [null, null],
    matchNo: 0, firstGhost: null, round: 0, roundId: null, ghostSeat: null, ghostObject: null,
    moveReadyAt: 0, charges: 0, regenStart: null, activeElapsed: 0, runningSince: null,
    countdownEndsAt: null, paused: false, nextClue: 0, lastClue: null,
    results: [], winner: null, notice: null, abandonedBy: null, recent: [],
  };
}

export const seatOf = (s, connId) => s.seats.findIndex((x) => x && x.connId === connId);
export const hunterSeat = (s) => (s.ghostSeat == null ? null : 1 - s.ghostSeat);
export const activeNow = (s, now) =>
  s.activeElapsed + (s.runningSince != null ? Math.max(0, now - s.runningSince) : 0);

export function settleCharges(s, a) {
  while (s.regenStart != null && s.charges < B.maxCharges && a - s.regenStart >= B.chargeRegenMs) {
    s.charges += 1;
    s.regenStart += B.chargeRegenMs;
  }
  if (s.charges >= B.maxCharges) { s.charges = B.maxCharges; s.regenStart = null; }
}

export function cleanName(raw, seat) {
  const n = String(raw ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, LIMITS.nameMax);
  return n || (seat === 0 ? 'Guest A' : 'Guest B');
}

const resetFlags = (s) => { for (const st of s.seats) if (st) { st.ready = false; st.rematch = false; } };

function resetToLobby(s) {
  Object.assign(s, {
    phase: 'lobby', round: 0, roundId: null, ghostSeat: null, ghostObject: null, results: [], winner: null,
    paused: false, runningSince: null, activeElapsed: 0, countdownEndsAt: null, lastClue: null, abandonedBy: null,
  });
  resetFlags(s);
}

// ---------- seats ----------
export function join(s, connId, idKey, rawName) {
  const existing = seatOf(s, connId);
  if (existing >= 0) return { seat: existing, events: [] };
  if (s.phase !== 'lobby' && s.phase !== 'abandoned') return { error: 'in_progress' };
  const free = s.seats.indexOf(null);
  if (free < 0) return { error: 'full' };
  s.seats[free] = { connId, idKey, name: cleanName(rawName, free), ready: false, rematch: false, connected: true, graceUntil: null };
  s.notice = null;
  return { seat: free, events: [ev(1 - free, 'friend_joined')] };
}

function pause(s, now) {
  if (s.paused) return;
  if (s.phase === 'active') { s.activeElapsed = activeNow(s, now); s.runningSince = null; }
  s.paused = true;
}

function resume(s, now) {
  s.paused = false;
  if (s.phase === 'active') s.runningSince = now;
  if (s.phase === 'countdown') s.countdownEndsAt = now + B.countdownMs; // restart the full countdown
}

export function disconnect(s, i, now) {
  const st = s.seats[i];
  if (!st || !st.connected) return [];
  st.connected = false;
  st.graceUntil = now + B.reconnectGraceMs;
  st.ready = false;
  st.rematch = false;
  if (s.phase === 'countdown' || s.phase === 'active') pause(s, now);
  return [ev(1 - i, 'friend_disconnected')];
}

export function reconnect(s, i, now) {
  const st = s.seats[i];
  if (!st || st.connected) return [];
  st.connected = true;
  st.graceUntil = null;
  const out = [ev(1 - i, 'friend_back')];
  if (s.paused && s.seats.every((x) => x && x.connected)) { resume(s, now); out.push(ev('all', 'resumed')); }
  return out;
}

function vacate(s, i) {
  const name = s.seats[i]?.name ?? 'Your friend';
  s.seats[i] = null;
  const out = [];
  if (IN_PLAY.has(s.phase)) {
    Object.assign(s, { phase: 'abandoned', paused: false, runningSince: null, ghostObject: null, countdownEndsAt: null, winner: null, abandonedBy: name, notice: 'abandoned' });
    out.push(ev('all', 'abandoned', { name }));
  } else {
    if (s.phase === 'final') resetToLobby(s);
    s.notice = 'friend_left';
    out.push(ev('all', 'friend_left', { name }));
  }
  resetFlags(s);
  return out;
}

export const leave = (s, i) => (s.seats[i] ? vacate(s, i) : []);

// ---------- match flow ----------
function setupRound(s, round, now) {
  Object.assign(s, {
    round, ghostSeat: round === 1 ? s.firstGhost : 1 - s.firstGhost,
    ghostObject: OBJECT_IDS[Math.floor(rand() * OBJECT_IDS.length) % OBJECT_IDS.length],
    charges: B.startCharges, regenStart: null, moveReadyAt: B.startMoveReadyMs,
    activeElapsed: 0, runningSince: null, nextClue: 0, lastClue: null, paused: false,
    roundId: `m${s.matchNo}r${round}-${Math.floor(rand() * 1e9).toString(36)}`,
    phase: 'countdown', countdownEndsAt: now + B.countdownMs,
  });
  resetFlags(s);
  return [ev('all', 'round_setup', { round })];
}

function startMatch(s, now) {
  s.matchNo += 1;
  s.firstGhost = rand() < 0.5 ? 0 : 1;
  Object.assign(s, { results: [], winner: null, notice: null, abandonedBy: null });
  return setupRound(s, 1, now);
}

export function decideWinner(results) {
  const [r1, r2] = results;
  if (!r1 || !r2) return null;
  if (r1.survivalMs === r2.survivalMs) return 'draw';
  return r1.survivalMs > r2.survivalMs ? r1.ghostSeat : r2.ghostSeat;
}

function endRound(s, outcome, survivalMs) {
  if (s.phase !== 'active' || s.results.some((r) => r.round === s.round)) return [];
  const result = {
    round: s.round, ghostSeat: s.ghostSeat, ghostName: s.seats[s.ghostSeat]?.name ?? 'Ghost',
    outcome, survivalMs: Math.round(survivalMs), hidingObject: s.ghostObject, hidingRoom: ROOM_OF[s.ghostObject],
  };
  s.results.push(result);
  Object.assign(s, { activeElapsed: survivalMs, runningSince: null, ghostObject: null, paused: false });
  resetFlags(s);
  if (s.round === 1) s.phase = 'intermission';
  else { s.phase = 'final'; s.winner = decideWinner(s.results); }
  return [ev('all', 'round_end', { result })];
}

export function advance(s, now) {
  const out = [];
  if (!s || !s.created || s.expired) return out;
  for (let i = 0; i < 2; i++) {
    const st = s.seats[i];
    if (st && !st.connected && st.graceUntil != null && now >= st.graceUntil) out.push(...vacate(s, i));
  }
  if (s.phase === 'countdown' && !s.paused && now >= s.countdownEndsAt) {
    Object.assign(s, { phase: 'active', runningSince: s.countdownEndsAt, activeElapsed: 0, countdownEndsAt: null });
    out.push(ev('all', 'go', { round: s.round }));
  }
  if (s.phase === 'active') {
    const a = Math.min(activeNow(s, now), B.roundMs);
    while (s.nextClue < B.clueTimesMs.length && B.clueTimesMs[s.nextClue] <= a) {
      s.lastClue = { index: s.nextClue, room: ROOM_OF[s.ghostObject], atMs: B.clueTimesMs[s.nextClue] };
      s.nextClue += 1;
      out.push(ev('all', 'clue', { ...s.lastClue }));
    }
    if (activeNow(s, now) >= B.roundMs) out.push(...endRound(s, 'survived', B.roundMs));
  }
  return out;
}

// ---------- player actions ----------
export function act(s, i, msg, now) {
  const out = advance(s, now);
  const st = s.seats[i];
  if (!st) return out;
  const reject = (reason) => { out.push(ev(i, 'rejected', { reason, action: msg.type })); return out; };

  if (DEDUP.has(msg.type)) {
    const aid = msg.actionId;
    if (typeof aid !== 'string' || !aid || aid.length > LIMITS.actionIdMax) return reject('bad_action');
    const key = `${i}:${aid}`;
    if (s.recent.includes(key)) return out; // duplicate delivery: no effect
    s.recent.push(key);
    if (s.recent.length > LIMITS.recentActions) s.recent.splice(0, s.recent.length - LIMITS.recentActions);
  }
  const bothConnected = () => s.seats.every((x) => x && x.connected);

  switch (msg.type) {
    case 'ready': {
      if (s.phase !== 'lobby' && s.phase !== 'intermission') return reject('wrong_phase');
      st.ready = msg.value !== false;
      if (bothConnected() && s.seats.every((x) => x.ready)) {
        out.push(...(s.phase === 'lobby' ? startMatch(s, now) : setupRound(s, 2, now)));
      }
      return out;
    }
    case 'rematch': {
      if (s.phase !== 'final') return reject('wrong_phase');
      st.rematch = msg.value !== false;
      if (bothConnected() && s.seats.every((x) => x.rematch)) out.push(...startMatch(s, now));
      return out;
    }
    case 'back_to_lobby': {
      if (s.phase !== 'abandoned') return reject('wrong_phase');
      resetToLobby(s);
      s.notice = null;
      out.push(ev('all', 'lobby'));
      return out;
    }
    case 'investigate':
    case 'possess': {
      if (s.phase !== 'active') return reject('not_active');
      if (s.paused) return reject('paused');
      if (msg.roundId !== s.roundId) return reject('stale_round');
      if (!OBJ.has(msg.objectId)) return reject('bad_object');
      const a = activeNow(s, now);
      if (msg.type === 'investigate') {
        if (i !== hunterSeat(s)) return reject('not_hunter');
        settleCharges(s, a);
        if (s.charges <= 0) return reject('no_charges');
        if (msg.objectId === s.ghostObject) return [...out, ...endRound(s, 'caught', a)];
        if (s.charges === B.maxCharges) s.regenStart = a;
        s.charges -= 1;
        out.push(ev(i, 'empty', { objectId: msg.objectId }));
        out.push(ev(s.ghostSeat, 'searched', { objectId: msg.objectId }));
        return out;
      }
      if (i !== s.ghostSeat) return reject('not_ghost');
      if (msg.objectId === s.ghostObject) return reject('same_object');
      if (a < s.moveReadyAt) return reject('cooldown');
      const from = s.ghostObject;
      s.ghostObject = msg.objectId;
      s.moveReadyAt = a + B.moveCooldownMs;
      out.push(ev(i, 'moved', { objectId: msg.objectId, from }));
      out.push(ev(hunterSeat(s), 'ripple', { objectId: from }));
      return out;
    }
    default:
      return reject('unknown');
  }
}

// ---------- scheduling ----------
export function needsTick(s) {
  if (!s || !s.created || s.expired) return false;
  return s.phase === 'countdown' || s.phase === 'active' || s.seats.some((x) => x && !x.connected);
}

export function nextDeadline(s) {
  if (!s || !s.created || s.expired) return null;
  const c = [];
  for (const st of s.seats) if (st && !st.connected && st.graceUntil) c.push(st.graceUntil);
  if (s.phase === 'countdown' && !s.paused) c.push(s.countdownEndsAt);
  if (s.phase === 'active' && s.runningSince != null) {
    const target = B.clueTimesMs[s.nextClue] ?? B.roundMs;
    c.push(s.runningSince + (Math.min(target, B.roundMs) - s.activeElapsed));
  }
  return c.length ? Math.min(...c) : null;
}

// ---------- role-specific serialization ----------
export function view(s, i, now) {
  const a = Math.min(activeNow(s, now), B.roundMs);
  const inRound = s.phase === 'countdown' || s.phase === 'active';
  const role = s.ghostSeat != null && s.phase !== 'lobby' ? (i === s.ghostSeat ? 'ghost' : 'hunter') : null;
  const v = {
    type: 'state', code: s.code, phase: s.phase, you: i,
    seats: s.seats.map((st, k) => (st ? {
      seat: k, name: st.name, ready: st.ready, rematch: st.rematch, connected: st.connected,
      graceMs: !st.connected && st.graceUntil ? Math.max(0, st.graceUntil - now) : null,
    } : null)),
    matchNo: s.matchNo, round: s.round, roundId: inRound ? s.roundId : null, role, ghostSeat: s.ghostSeat,
    clock: {
      activeMs: a, paused: s.paused, running: s.phase === 'active' && !s.paused,
      countdownMs: s.phase === 'countdown' && !s.paused ? Math.max(0, s.countdownEndsAt - now) : null,
    },
    nextClueAtMs: s.phase === 'active' ? (B.clueTimesMs[s.nextClue] ?? null) : null,
    lastClue: inRound ? s.lastClue : null,
    results: s.results, winner: s.winner, notice: s.notice, abandonedBy: s.abandonedBy,
    balance: {
      roundMs: B.roundMs, countdownMs: B.countdownMs, moveCooldownMs: B.moveCooldownMs, maxCharges: B.maxCharges,
      chargeRegenMs: B.chargeRegenMs, clueDurationMs: B.clueDurationMs, rippleMs: B.rippleMs, reconnectGraceMs: B.reconnectGraceMs,
      clueTimesMs: B.clueTimesMs,
    },
  };
  if (inRound && role === 'ghost') v.ghost = { objectId: s.ghostObject, moveReadyInMs: Math.max(0, s.moveReadyAt - a) };
  if (inRound && role === 'hunter') {
    settleCharges(s, a);
    v.hunter = { charges: s.charges, regenElapsedMs: s.regenStart != null ? a - s.regenStart : null };
  }
  return v;
}