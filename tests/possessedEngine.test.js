// Unit tests for the authoritative POSSESSED engine (base44/shared/possessedEngine.ts).
// Harness-agnostic: export default receives the engine module (G), config (C) and an assert fn.
export default function tests(G, C, assert) {
  const B = C.BALANCE;
  const T0 = 1_000_000;
  let seed = 1;
  const seeded = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  function lobby() {
    G.setRandom(seeded);
    const s = G.newState('ACDEFG');
    G.join(s, 'conn-a', 'a:alice', 'Alice');
    G.join(s, 'conn-b', 'a:bob', 'Bob');
    return s;
  }
  let aid = 0;
  const A = (s, seat, type, extra = {}, now = T0) => G.act(s, seat, { type, actionId: `x${++aid}`, roundId: s.roundId, ...extra }, now);
  function started(now = T0) {
    const s = lobby();
    A(s, 0, 'ready', { value: true }, now);
    A(s, 1, 'ready', { value: true }, now);
    G.advance(s, now + B.countdownMs);
    return s;
  }
  const at = (ms) => T0 + B.countdownMs + ms; // wall time for an active-ms offset
  const roles = (s) => ({ ghost: s.ghostSeat, hunter: 1 - s.ghostSeat });
  const other = (s, id) => C.OBJECT_IDS.find((o) => o !== id);

  return [
    ['two ready players start the same round', () => {
      const s = lobby();
      A(s, 0, 'ready', { value: true });
      assert(s.phase === 'lobby', 'one ready player must not start');
      A(s, 1, 'ready', { value: true });
      assert(s.phase === 'countdown', 'countdown after both ready');
      const v0 = G.view(s, 0, T0); const v1 = G.view(s, 1, T0);
      assert(v0.roundId === v1.roundId && v0.round === 1, 'same round id');
      assert(new Set([v0.role, v1.role]).size === 2, 'one ghost one hunter');
      G.advance(s, T0 + B.countdownMs - 1);
      assert(s.phase === 'countdown', 'still counting at 2.999s');
      G.advance(s, T0 + B.countdownMs);
      assert(s.phase === 'active', 'active after 3s');
    }],
    ['never starts with only one human', () => {
      G.setRandom(seeded);
      const s = G.newState('ACDEFG');
      G.join(s, 'conn-a', 'a:alice', 'Alice');
      A(s, 0, 'ready', { value: true });
      assert(s.phase === 'lobby', 'stays in lobby');
    }],
    ['a third player is refused', () => {
      const s = lobby();
      assert(G.join(s, 'conn-c', 'a:carol', 'Carol').error === 'full', 'full in lobby');
      A(s, 0, 'ready'); A(s, 1, 'ready');
      assert(G.join(s, 'conn-c', 'a:carol', 'Carol').error === 'in_progress', 'refused mid-match');
    }],
    ['hunter cannot move the ghost or set a score', () => {
      const s = started(); const { hunter } = roles(s); const before = s.ghostObject;
      const out = A(s, hunter, 'possess', { objectId: other(s, before) }, at(1000));
      assert(s.ghostObject === before, 'ghost unchanged');
      assert(out.some((e) => e.msg.reason === 'not_ghost'), 'rejected not_ghost');
      A(s, hunter, 'set_score', { survivalMs: 60000 }, at(1000));
      G.act(s, hunter, { type: 'investigate', actionId: 'q1', roundId: s.roundId, objectId: other(s, before), survivalMs: 99999, charges: 99 }, at(1000));
      assert(s.results.length === 0 && s.charges === 2, 'extra fields ignored, one charge used');
    }],
    ['ghost cannot investigate or alter the timer', () => {
      const s = started(); const { ghost } = roles(s);
      const out = A(s, ghost, 'investigate', { objectId: s.ghostObject }, at(1000));
      assert(out.some((e) => e.msg.reason === 'not_hunter') && s.phase === 'active', 'ghost investigate rejected');
      A(s, ghost, 'set_time', { activeMs: 59000 }, at(1000));
      assert(G.activeNow(s, at(1000)) === 1000, 'timer unchanged');
    }],
    ['hunter payloads contain no hidden possession state', () => {
      for (let k = 0; k < 30; k++) {
        const s = started(); const { ghost, hunter } = roles(s);
        const hv = JSON.stringify(G.view(s, hunter, at(500)));
        assert(!hv.includes(s.ghostObject) && !('ghost' in JSON.parse(hv)), 'hunter view leaks location');
        const dest = C.OBJECT_IDS.find((o) => o !== s.ghostObject);
        const out = A(s, ghost, 'possess', { objectId: dest }, at(600));
        const toHunter = JSON.stringify(out.filter((e) => e.to === hunter || e.to === 'all'));
        assert(!toHunter.includes(dest), 'move destination leaked to hunter');
        assert(!JSON.stringify(G.view(s, hunter, at(700))).includes(dest), 'hunter view leaks after move');
        assert(JSON.stringify(G.view(s, ghost, at(700))).includes(dest), 'ghost sees own object');
      }
    }],
    ['near-simultaneous move vs investigate resolve in server order', () => {
      const s1 = started(); const r1 = roles(s1); const old1 = s1.ghostObject;
      A(s1, r1.ghost, 'possess', { objectId: other(s1, old1) }, at(2000));
      A(s1, r1.hunter, 'investigate', { objectId: old1 }, at(2000));
      assert(s1.phase === 'active' && s1.results.length === 0, 'move first: investigation finds empty');
      const s2 = started(); const r2 = roles(s2); const old2 = s2.ghostObject;
      A(s2, r2.hunter, 'investigate', { objectId: old2 }, at(2000));
      const out = A(s2, r2.ghost, 'possess', { objectId: other(s2, old2) }, at(2000));
      assert(s2.results.length === 1 && s2.results[0].outcome === 'caught', 'investigate first: caught');
      assert(out.some((e) => e.msg.reason === 'not_active'), 'late move rejected');
    }],
    ['repeated and stale messages do not duplicate actions', () => {
      const s = started(); const { hunter } = roles(s); const empty = other(s, s.ghostObject);
      const msg = { type: 'investigate', actionId: 'dup-1', roundId: s.roundId, objectId: empty };
      G.act(s, hunter, msg, at(1000)); G.act(s, hunter, msg, at(1001)); G.act(s, hunter, msg, at(1002));
      assert(s.charges === 2, `duplicate consumed charges: ${s.charges}`);
      const out = G.act(s, hunter, { ...msg, actionId: 'stale-1', roundId: 'm0r9-old' }, at(1003));
      assert(s.charges === 2 && out.some((e) => e.msg.reason === 'stale_round'), 'stale rejected');
    }],
    ['clues reveal the authoritative room at the right time, once', () => {
      const s = started(); const { ghost } = roles(s);
      assert(G.advance(s, at(11999)).length === 0, 'no clue before 12s');
      const room1 = C.ROOM_OF[s.ghostObject];
      const c1 = G.advance(s, at(12000)).find((e) => e.msg.kind === 'clue');
      assert(c1 && c1.msg.room === room1 && c1.to === 'all', 'first clue room');
      assert(G.advance(s, at(12100)).length === 0, 'clue not replayed');
      const dest = C.OBJECT_IDS.find((o) => C.ROOM_OF[o] !== room1);
      A(s, ghost, 'possess', { objectId: dest }, at(23999));
      const c2 = G.advance(s, at(24000)).find((e) => e.msg.kind === 'clue');
      assert(c2.msg.room === C.ROOM_OF[dest], 'second clue uses current room');
      const moveAfter = C.OBJECT_IDS.find((o) => C.ROOM_OF[o] !== C.ROOM_OF[dest]);
      const s2 = started(); const g2 = roles(s2).ghost; const r0 = C.ROOM_OF[s2.ghostObject];
      const far = C.OBJECT_IDS.find((o) => C.ROOM_OF[o] !== r0);
      A(s2, g2, 'possess', { objectId: far }, at(12500)); // move arrives after the 12s mark
      const cl = s2.lastClue;
      assert(cl && cl.room === r0 && cl.index === 0, 'clue evaluated before a later-arriving move');
      assert(moveAfter, 'sanity');
    }],
    ['round expiry and capture cannot conflict', () => {
      const s = started(); const { hunter } = roles(s); const spot = s.ghostObject;
      const out = A(s, hunter, 'investigate', { objectId: spot }, at(60000));
      assert(s.results.length === 1 && s.results[0].outcome === 'survived' && s.results[0].survivalMs === 60000, 'expiry wins at 60s');
      assert(out.some((e) => e.msg.reason === 'not_active'), 'late catch rejected');
      assert(out.filter((e) => e.msg.kind === 'round_end').length === 1, 'single result');
      const s2 = started(); const h2 = roles(s2).hunter;
      A(s2, h2, 'investigate', { objectId: s2.ghostObject }, at(59999));
      G.advance(s2, at(70000));
      assert(s2.results.length === 1 && s2.results[0].survivalMs === 59999, 'capture at 59.999s stands');
    }],
    ['roles swap with completely fresh private state', () => {
      const s = started(); const first = s.ghostSeat; const oldRound = s.roundId;
      const empty = other(s, s.ghostObject);
      A(s, 1 - first, 'investigate', { objectId: empty }, at(1000));
      A(s, first, 'possess', { objectId: empty === s.ghostObject ? C.OBJECT_IDS[5] : empty }, at(1500));
      G.advance(s, at(60000));
      assert(s.phase === 'intermission' && s.ghostObject === null, 'intermission clears location');
      A(s, 0, 'ready', {}, at(61000));
      assert(s.phase === 'intermission', 'needs both');
      A(s, 1, 'ready', {}, at(61000));
      assert(s.phase === 'countdown' && s.round === 2 && s.ghostSeat === 1 - first, 'swapped');
      assert(s.charges === B.maxCharges && s.regenStart === null && s.moveReadyAt === B.startMoveReadyMs, 'fresh charges/cooldown');
      assert(s.nextClue === 0 && s.lastClue === null && s.activeElapsed === 0 && s.roundId !== oldRound, 'fresh clues/clock/round');
      const out = G.act(s, s.ghostSeat === 0 ? 1 : 0, { type: 'investigate', actionId: 'old', roundId: oldRound, objectId: 'globe' }, at(61000) + 3000);
      assert(out.some((e) => e.msg.reason === 'stale_round' || e.msg.reason === 'not_active'), 'old round rejected');
    }],
    ['scoring: higher time wins, equal is a draw', () => {
      assert(G.decideWinner([{ ghostSeat: 0, survivalMs: 60000 }, { ghostSeat: 1, survivalMs: 60000 }]) === 'draw', 'two full survivals draw');
      assert(G.decideWinner([{ ghostSeat: 0, survivalMs: 23471 }, { ghostSeat: 1, survivalMs: 23470 }]) === 0, '1ms decides');
      assert(G.decideWinner([{ ghostSeat: 1, survivalMs: 10000 }, { ghostSeat: 0, survivalMs: 10000 }]) === 'draw', 'equal draw');
    }],
    ['both players must agree to rematch', () => {
      const s = started();
      G.advance(s, at(60000)); A(s, 0, 'ready', {}, at(61000)); A(s, 1, 'ready', {}, at(61000));
      G.advance(s, at(61000) + 3000 + 60000);
      assert(s.phase === 'final' && s.winner === 'draw', `final draw (${s.phase}, ${s.winner})`);
      A(s, 0, 'rematch', { value: true }, at(200000));
      assert(s.phase === 'final', 'one request not enough');
      A(s, 1, 'rematch', { value: true }, at(200000));
      assert(s.phase === 'countdown' && s.matchNo === 2 && s.results.length === 0 && s.round === 1, 'rematch reset');
    }],
    ['disconnect pauses time, charges and cooldown; reconnect resumes', () => {
      const s = started(); const { ghost, hunter } = roles(s);
      A(s, ghost, 'possess', { objectId: other(s, s.ghostObject) }, at(9000)); // ready again at active 17000
      A(s, hunter, 'investigate', { objectId: s.ghostObject === 'globe' ? 'teapot' : 'globe' }, at(9500));
      G.disconnect(s, hunter, at(10000));
      assert(s.paused && G.activeNow(s, at(14000)) === 10000, 'clock frozen');
      const rej = A(s, ghost, 'possess', { objectId: 'mirror' }, at(14000));
      assert(rej.some((e) => e.msg.reason === 'paused'), 'no moves while paused');
      assert(G.advance(s, at(19000)).every((e) => e.msg.kind !== 'abandoned'), 'within grace');
      G.reconnect(s, hunter, at(19000));
      assert(!s.paused && G.activeNow(s, at(20000)) === 11000, 'resumes from frozen time');
      const hv = G.view(s, hunter, at(20000));
      assert(hv.hunter.charges === 2 && hv.hunter.regenElapsedMs === 1500, `charge regen frozen (${JSON.stringify(hv.hunter)})`);
      const gv = G.view(s, ghost, at(20000));
      assert(gv.ghost.moveReadyInMs === 6000, `cooldown frozen (${gv.ghost.moveReadyInMs})`);
    }],
    ['no reconnect within 10s abandons with no winner', () => {
      const s = started(); const { hunter } = roles(s);
      G.disconnect(s, hunter, at(5000));
      G.advance(s, at(5000) + B.reconnectGraceMs - 1);
      assert(s.phase === 'active', 'still waiting');
      G.advance(s, at(5000) + B.reconnectGraceMs);
      assert(s.phase === 'abandoned' && s.winner === null && s.seats[hunter] === null, 'abandoned');
      assert(s.ghostObject === null, 'location cleared');
    }],
    ['disconnect during countdown restarts the countdown on return', () => {
      const s = lobby(); A(s, 0, 'ready'); A(s, 1, 'ready');
      G.disconnect(s, 1, T0 + 1000);
      G.advance(s, T0 + 5000);
      assert(s.phase === 'countdown' && s.paused, 'countdown paused');
      G.reconnect(s, 1, T0 + 6000);
      G.advance(s, T0 + 8999);
      assert(s.phase === 'countdown', 'restarted full 3s');
      G.advance(s, T0 + 9000);
      assert(s.phase === 'active', 'starts after fresh countdown');
    }],
    ['hibernation round-trip restores state without replaying clues or results', () => {
      const s = started();
      G.advance(s, at(12500));
      const revived = JSON.parse(JSON.stringify(s));
      assert(G.advance(revived, at(13000)).length === 0, 'no replayed clue');
      const ev = G.advance(revived, at(25000));
      assert(ev.filter((e) => e.msg.kind === 'clue').length === 1 && revived.lastClue.index === 1, 'next clue only');
      G.advance(revived, at(60000));
      const again = JSON.parse(JSON.stringify(revived));
      assert(G.advance(again, at(61000)).length === 0 && again.results.length === 1, 'no duplicate result');
    }],
    ['backgrounded tab: charges and cooldowns derive from server time', () => {
      const s = started(); const { hunter } = roles(s);
      const empties = C.OBJECT_IDS.filter((o) => o !== s.ghostObject);
      A(s, hunter, 'investigate', { objectId: empties[0] }, at(1000));
      A(s, hunter, 'investigate', { objectId: empties[1] }, at(1000));
      A(s, hunter, 'investigate', { objectId: empties[2] }, at(1000));
      const noCharge = A(s, hunter, 'investigate', { objectId: empties[3] }, at(1100));
      assert(noCharge.some((e) => e.msg.reason === 'no_charges'), 'rejected with 0 charges');
      let v = G.view(s, hunter, at(6000));
      assert(v.hunter.charges === 1 && v.hunter.regenElapsedMs === 0, `one regen at 5s (${JSON.stringify(v.hunter)})`);
      v = G.view(s, hunter, at(40000));
      assert(v.hunter.charges === 3 && v.hunter.regenElapsedMs === null, 'full after long gap, max 3');
    }],
    ['ghost move cooldown is enforced', () => {
      const s = started(); const { ghost } = roles(s);
      const a = other(s, s.ghostObject);
      A(s, ghost, 'possess', { objectId: a }, at(1000));
      const r = A(s, ghost, 'possess', { objectId: other(s, a) === a ? 'globe' : other(s, a) }, at(8999));
      assert(r.some((e) => e.msg.reason === 'cooldown'), 'cooldown rejected');
      const b = C.OBJECT_IDS.find((o) => o !== a);
      A(s, ghost, 'possess', { objectId: b }, at(9000));
      assert(s.ghostObject === b, 'moves when ready');
      const same = A(s, ghost, 'possess', { objectId: b }, at(30000));
      assert(same.some((e) => e.msg.reason === 'same_object'), 'same object rejected');
    }],
    ['leaving mid-match abandons; leaving in lobby frees the seat', () => {
      const s = lobby();
      G.leave(s, 1);
      assert(s.phase === 'lobby' && s.seats[1] === null && s.notice === 'friend_left', 'lobby leave');
      const s2 = started(); G.leave(s2, 0);
      assert(s2.phase === 'abandoned' && s2.winner === null, 'mid-match leave abandons');
    }],
  ];
}