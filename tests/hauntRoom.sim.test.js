// Simulation tests for the HauntRoom actor wrapper (base44/actors/HauntRoom/entry.ts):
// a mock Actor base with serialized storage, attached sockets, scheduled wakes and a fake clock.
// This verifies seat ownership, privacy of delivery, reconnects, hibernation and expiry.
// It does NOT replace a real two-browser network test.
export default function simTests(HauntRoom, clock, assert) {
  function env(instanceId) {
    const store = new Map();
    return {
      instanceId,
      conns: new Map(),
      wakes: new Map(),
      storage: {
        get: async (k) => (store.has(k) ? JSON.parse(store.get(k)) : undefined),
        put: async (k, v) => { store.set(k, JSON.stringify(v)); },
        delete: async (k) => store.delete(k),
        deleteAll: async () => store.clear(),
      },
    };
  }
  const boot = (e) => { const a = new HauntRoom(); a.__env = e; return a; };
  function conn(e, id, who) {
    const c = { id, identity: { type: 'anonymous', anonymousId: who }, sent: [], send(m) { this.sent.push(JSON.parse(JSON.stringify(m))); }, reject(code) { this.rejected = code; } };
    return c;
  }
  async function open(a, e, c) { e.conns.set(c.id + c.identity.anonymousId, c); await a.handleConnect(c); }
  async function close(a, e, c) { e.conns.delete(c.id + c.identity.anonymousId); await a.handleClose(c); }
  const lastState = (c) => [...c.sent].reverse().find((m) => m.type === 'state');
  const errors = (c) => c.sent.filter((m) => m.type === 'error').map((m) => m.code);

  async function twoPlayers(code = 'ACDEFG') {
    const e = env(`haunt-${code}`);
    let a = boot(e);
    const A = conn(e, 'tab-a', 'anon-a');
    const Bc = conn(e, 'tab-b', 'anon-b');
    await open(a, e, A); await a.handleMessage(A, { type: 'hello', intent: 'create', name: 'Alice' });
    await open(a, e, Bc); await a.handleMessage(Bc, { type: 'hello', intent: 'join', name: 'Bob' });
    return { e, a, A, B: Bc };
  }
  async function start(ctx) {
    await ctx.a.handleMessage(ctx.A, { type: 'ready', actionId: 'ra', value: true });
    await ctx.a.handleMessage(ctx.B, { type: 'ready', actionId: 'rb', value: true });
    clock.add(3000);
    await ctx.a.handleTick();
    const ghost = lastState(ctx.A).role === 'ghost' ? ctx.A : ctx.B;
    const hunter = ghost === ctx.A ? ctx.B : ctx.A;
    return { ghost, hunter };
  }

  return [
    ['create, join, collision, unknown and full rooms', async () => {
      const ctx = await twoPlayers();
      assert(lastState(ctx.A).seats.filter(Boolean).length === 2, 'two seats');
      const D = conn(ctx.e, 'tab-d', 'anon-d');
      await open(ctx.a, ctx.e, D); await ctx.a.handleMessage(D, { type: 'hello', intent: 'create' });
      assert(errors(D).includes('code_taken'), 'collision detected');
      const Cc = conn(ctx.e, 'tab-c', 'anon-c');
      await open(ctx.a, ctx.e, Cc); await ctx.a.handleMessage(Cc, { type: 'hello', intent: 'join' });
      assert(errors(Cc).includes('full') && !Cc.sent.some((m) => m.type === 'state'), 'third refused, learns nothing');
      const e2 = env('haunt-QQQQQQ'); const a2 = boot(e2); const X = conn(e2, 'x', 'anon-x');
      await open(a2, e2, X); await a2.handleMessage(X, { type: 'hello', intent: 'join' });
      assert(errors(X).includes('not_found'), 'unknown room');
      const e3 = env('haunt-abc'); const a3 = boot(e3); const Y = conn(e3, 'y', 'anon-y');
      await a3.handleMessage(Y, { type: 'hello', intent: 'create' });
      assert(errors(Y).includes('invalid_code'), 'invalid code');
    }],
    ['live round keeps the hidden object away from the hunter socket', async () => {
      const ctx = await twoPlayers(); const r = await start(ctx);
      const secret = lastState(r.ghost).ghost.objectId;
      const st = lastState(r.ghost);
      const dest = ['globe', 'teapot'].find((o) => o !== secret);
      await ctx.a.handleMessage(r.ghost, { type: 'possess', actionId: 'g1', roundId: st.roundId, objectId: dest });
      const hunterText = JSON.stringify(r.hunter.sent);
      assert(!hunterText.includes(`"${dest}"`), 'destination leaked');
      assert(!r.hunter.sent.some((m) => m.type === 'state' && JSON.stringify(m).includes(`"${secret}"`)), 'hidden object in hunter state');
      assert(r.hunter.sent.some((m) => m.kind === 'ripple' && m.objectId === secret), 'ripple on old object');
      assert(!hunterText.includes('tab-a') && !hunterText.includes('anon-'), 'resume credentials leaked');
    }],
    ['refresh reconnect pauses then resumes; impostor cannot reclaim', async () => {
      const ctx = await twoPlayers(); const r = await start(ctx);
      clock.add(2000);
      await close(ctx.a, ctx.e, r.hunter);
      assert(lastState(r.ghost).clock.paused === true, 'paused on disconnect');
      const thief = conn(ctx.e, r.hunter.id, 'anon-thief');
      await open(ctx.a, ctx.e, thief);
      assert(thief.rejected === 4003 && errors(thief).includes('seat_mismatch'), 'impostor rejected');
      clock.add(3000);
      const back = conn(ctx.e, r.hunter.id, r.hunter.identity.anonymousId);
      await open(ctx.a, ctx.e, back);
      const v = lastState(back);
      assert(v && v.clock.paused === false && v.role === 'hunter', 'reclaimed seat');
      assert(Math.abs(v.clock.activeMs - 2000) < 5, `time frozen while away (${v.clock.activeMs})`);
    }],
    ['hibernation rehydrates and reconciles attached sockets', async () => {
      const ctx = await twoPlayers(); const r = await start(ctx);
      clock.add(12500); await ctx.a.handleTick();
      const cluesBefore = r.hunter.sent.filter((m) => m.kind === 'clue').length;
      const revived = boot(ctx.e); // fresh instance, same storage, sockets still attached
      await revived.handleStart();
      clock.add(200); await revived.handleTick();
      assert(r.hunter.sent.filter((m) => m.kind === 'clue').length === cluesBefore, 'clue not replayed');
      const v = lastState(r.hunter);
      assert(v.phase === 'active' && v.seats.every((s) => s.connected), 'still live after wake');
      ctx.e.conns.delete(r.ghost.id + r.ghost.identity.anonymousId); // ghost socket died while asleep
      const revived2 = boot(ctx.e); await revived2.handleStart();
      assert(lastState(r.hunter).clock.paused === true, 'reconciled missing socket as disconnected');
      clock.add(10100); await revived2.handleWake('deadline');
      assert(lastState(r.hunter).phase === 'abandoned', 'abandoned after grace via scheduled wake');
    }],
    ['empty room expires cleanly', async () => {
      const ctx = await twoPlayers();
      await ctx.a.handleMessage(ctx.A, { type: 'leave' });
      await close(ctx.a, ctx.e, ctx.A);
      await ctx.a.handleMessage(ctx.B, { type: 'leave' });
      await close(ctx.a, ctx.e, ctx.B);
      assert(ctx.e.wakes.has('expire'), 'expiry scheduled');
      clock.add(61000); await ctx.a.handleWake('expire');
      const Z = conn(ctx.e, 'tab-z', 'anon-z');
      const fresh = boot(ctx.e); await open(fresh, ctx.e, Z); await fresh.handleMessage(Z, { type: 'hello', intent: 'join' });
      assert(errors(Z).includes('expired'), 'expired room reported');
    }],
    ['rate limiting drops floods', async () => {
      const ctx = await twoPlayers(); await start(ctx);
      for (let i = 0; i < 60; i++) await ctx.a.handleMessage(ctx.A, { type: 'sync' });
      assert(ctx.A.sent.some((m) => m.reason === 'rate_limited'), 'flood limited');
    }],
  ];
}