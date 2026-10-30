import { Actor } from 'base44:runtime/actors';
import { BALANCE, LIMITS, CODE_RE } from '../../shared/possessedConfig.ts';
import * as G from '../../shared/possessedEngine.ts';
import { identityKey, createLimiter } from '../../shared/possessedActorUtil.ts';
import { reportMatch } from '../../shared/liveMatches.ts';

// A seat is only reclaimed when the verified identity also matches (see identityKey).
const IN_MATCH = new Set(['countdown', 'active', 'intermission']);

const str = (v, max = 64) => (typeof v === 'string' && v.length <= max ? v : undefined);

function sanitize(msg) {
  return {
    type: msg.type,
    actionId: str(msg.actionId, LIMITS.actionIdMax),
    roundId: str(msg.roundId),
    objectId: str(msg.objectId),
    value: typeof msg.value === 'boolean' ? msg.value : undefined,
  };
}

export default class HauntRoom extends Actor {
  tickIntervalMs = 200;
  s = null;
  loaded = false;
  limiter = createLimiter();
  scheduledDeadline = null;
  expireArmed = false;

  shouldTick() { return G.needsTick(this.s); }

  live() { return !!(this.s && this.s.created && !this.s.expired); }

  code() {
    const m = /^haunt-([A-Z0-9]{6})$/.exec(this.instanceId || '');
    return m && CODE_RE.test(m[1]) ? m[1] : null;
  }

  async load() {
    if (this.loaded) return;
    this.s = (await this.storage.get('state')) ?? null;
    this.loaded = true;
  }

  // Tell the live-match registry when a match starts or stops (counts only, for Home).
  async report(active) {
    try { await reportMatch(this.client, this.instanceId, active); } catch { /* presence is best-effort; never block play */ }
  }

  connFor(i) {
    const st = this.s?.seats[i];
    if (!st) return null;
    return this.getConnections().find((c) => c.id === st.connId && (!st.idKey || identityKey(c) === st.idKey)) ?? null;
  }

  // Events are addressed to seats; never broadcast (an unseated socket must learn nothing).
  deliver(out) {
    for (const { to, msg } of out) {
      if (to === 'all') { this.connFor(0)?.send(msg); this.connFor(1)?.send(msg); }
      else if (to === 0 || to === 1) this.connFor(to)?.send(msg);
    }
  }

  sendViews() {
    const now = Date.now();
    for (let i = 0; i < 2; i++) this.connFor(i)?.send(G.view(this.s, i, now));
  }

  // ack: the sender's own actionId, sent after the outcome so the client can clear "pending".
  async commit(out = [], ack = null) {
    this.deliver(out);
    this.sendViews();
    if (ack?.actionId) ack.conn.send({ type: 'ack', actionId: ack.actionId });
    const playing = IN_MATCH.has(this.s.phase);
    const reportNow = playing !== !!this.s.reported;
    if (reportNow) this.s.reported = playing;
    await this.storage.put('state', this.s);
    const d = G.nextDeadline(this.s);
    if (d && d !== this.scheduledDeadline) { this.scheduledDeadline = d; await this.schedule('deadline', d + 100); }
    const anyone = this.s.seats.some((st) => st && st.connected);
    if (!anyone && !this.expireArmed) { this.expireArmed = true; await this.schedule('expire', Date.now() + BALANCE.emptyRoomExpireMs); }
    if (anyone && this.expireArmed) { this.expireArmed = false; await this.cancelSchedule('expire'); }
    if (reportNow) await this.report(playing);
  }

  async handleStart() {
    await this.load();
    if (!this.live()) return;
    // Reconcile after hibernation/eviction: sockets may still be attached without handleConnect.
    const now = Date.now();
    const out = [];
    this.s.seats.forEach((st, i) => {
      if (!st) return;
      const attached = !!this.connFor(i);
      if (st.connected && !attached) out.push(...G.disconnect(this.s, i, now));
      else if (!st.connected && attached) out.push(...G.reconnect(this.s, i, now));
    });
    out.push(...G.advance(this.s, now));
    await this.commit(out);
  }

  async handleConnect(conn) {
    await this.load();
    if (!this.live()) return; // unknown room: wait for hello to decide
    const i = G.seatOf(this.s, conn.id);
    if (i < 0) return;
    if (!this.ownsSeat(conn, i)) {
      conn.send({ type: 'error', code: 'seat_mismatch' });
      conn.reject(4003, 'seat belongs to another player');
      return;
    }
    const now = Date.now();
    await this.commit([...G.advance(this.s, now), ...G.reconnect(this.s, i, now)]);
  }

  ownsSeat(conn, i) {
    const st = this.s.seats[i];
    return !!st && (!st.idKey || st.idKey === identityKey(conn));
  }

  async handleMessage(conn, msg) {
    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return;
    if (!this.limiter.allow(conn.id)) {
      if (msg.type !== 'ping') conn.send({ type: 'ev', kind: 'rejected', reason: 'rate_limited', actionId: str(msg.actionId, LIMITS.actionIdMax) ?? null });
      return;
    }
    await this.load();
    const now = Date.now();
    if (msg.type === 'hello') return this.hello(conn, msg, now);
    if (!this.live()) {
      conn.send({ type: msg.type === 'ping' ? 'pong' : 'error', code: this.s?.expired ? 'expired' : 'not_found', seated: false });
      return;
    }
    const i = G.seatOf(this.s, conn.id);
    if (i < 0 || !this.ownsSeat(conn, i)) {
      conn.send(msg.type === 'ping' ? { type: 'pong', seated: false } : { type: 'error', code: 'not_seated' });
      return;
    }
    // Self-heal: a message proves this seat's socket is alive (covers close/connect reordering).
    const heal = this.s.seats[i].connected ? [] : G.reconnect(this.s, i, now);
    if (msg.type === 'ping') {
      conn.send({ type: 'pong', seated: true });
      if (heal.length) await this.commit(heal);
      return;
    }
    if (msg.type === 'sync') return this.commit([...heal, ...G.advance(this.s, now)]);
    if (msg.type === 'leave') {
      const out = [...heal, ...G.leave(this.s, i)];
      conn.send({ type: 'left' });
      return this.commit(out);
    }
    const clean = sanitize(msg);
    await this.commit([...heal, ...G.act(this.s, i, clean, now)], { conn, actionId: clean.actionId });
  }

  async hello(conn, msg, now) {
    const code = this.code();
    if (!code) { conn.send({ type: 'error', code: 'invalid_code' }); return; }
    if (this.s?.expired) { conn.send({ type: 'error', code: 'expired' }); return; }
    // 'quick': a Matchmaker-assigned code. Either matched player may arrive first, so it
    // creates-or-joins, but only ever a quick room (never someone's private haunt).
    const intent = msg.intent === 'create' || msg.intent === 'quick' ? msg.intent : 'join';
    if (!this.live()) {
      if (intent === 'join') { conn.send({ type: 'error', code: 'not_found' }); return; }
      this.s = G.newState(code);
      if (intent === 'quick') this.s.quick = true;
    } else {
      const existing = G.seatOf(this.s, conn.id);
      if (existing >= 0) {
        if (!this.ownsSeat(conn, existing)) { conn.send({ type: 'error', code: 'seat_mismatch' }); return; }
        return this.commit([...G.advance(this.s, now), ...G.reconnect(this.s, existing, now)]);
      }
      if (intent === 'create' || (intent === 'quick' && !this.s.quick)) { conn.send({ type: 'error', code: 'code_taken' }); return; }
    }
    const pre = G.advance(this.s, now);
    const r = G.join(this.s, conn.id, identityKey(conn), msg.name);
    if (r.error) { conn.send({ type: 'error', code: r.error }); return; }
    // Quick match: arriving counts as Ready, through the normal rule (the countdown starts
    // only when both seats are connected and ready).
    const auto = this.s.quick && this.s.phase === 'lobby'
      ? G.act(this.s, r.seat, { type: 'ready', actionId: `auto-${crypto.randomUUID().slice(0, 12)}`, value: true }, now)
      : [];
    await this.commit([...pre, ...r.events, ...auto]);
  }

  async handleClose(conn) {
    this.limiter.forget(conn.id);
    await this.load();
    if (!this.live()) return;
    const i = G.seatOf(this.s, conn.id);
    if (i < 0 || !this.ownsSeat(conn, i)) return; // an impostor's socket closing must not affect the seat
    // The client already reopened a fresh socket for this seat: the old one closing is not a disconnect.
    if (this.getConnections().some((c) => c !== conn && c.id === conn.id && this.ownsSeat(c, i))) return;
    const now = Date.now();
    await this.commit([...G.advance(this.s, now), ...G.disconnect(this.s, i, now)]);
  }

  async handleTick() {
    if (!this.live()) return;
    const out = G.advance(this.s, Date.now());
    if (out.length) await this.commit(out);
  }

  async handleWake(key) {
    await this.load();
    if (!this.s || this.s.expired) return;
    if (key === 'deadline') {
      this.scheduledDeadline = null;
      if (this.live()) await this.commit(G.advance(this.s, Date.now()));
      return;
    }
    if (key === 'expire') {
      this.expireArmed = false;
      if (this.s.seats.some((st, i) => st && this.connFor(i))) return;
      const wasReported = !!this.s.reported;
      await this.storage.deleteAll();
      this.s = { created: true, expired: true };
      await this.storage.put('state', this.s);
      if (wasReported) await this.report(false);
      for (const c of this.getConnections()) c.send({ type: 'error', code: 'expired' });
    }
  }
}