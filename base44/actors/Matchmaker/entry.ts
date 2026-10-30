import { Actor } from 'base44:runtime/actors';
import { identityKey, createLimiter } from '../../shared/possessedActorUtil.ts';
import { generateRoomCode } from '../../shared/possessedRoomCode.ts';
import { countActiveMatches } from '../../shared/liveMatches.ts';

// One fixed instance ("global"). Every Home-screen tab holds one socket here.
// Messages OUT carry only counts, your own queue status, and your own room code:
// never another player's identity key, connection id, seat or anything about a game.
const MM = {
  staleMs: 45000,          // a searcher silent this long is pruned (clients ping every 10s)
  matchRefreshMs: 15000,   // how often the "matches in progress" count is re-read
  maxConns: 2000,
  recentCodes: 500,
};

export default class Matchmaker extends Actor {
  queue = [];               // FIFO: { idKey, connId, since, seen }  (one entry per identity)
  loaded = false;
  limiter = createLimiter();
  matches = null;           // null = unknown (registry unreachable)
  matchesAt = 0;
  recent = [];

  async load() {
    if (this.loaded) return;
    this.loaded = true;
    const saved = await this.storage.get('mm');
    const now = Date.now();
    if (saved) {
      this.queue = (saved.queue ?? []).map((e) => ({ ...e, seen: now }));
      this.recent = saved.recent ?? [];
    }
  }

  save() {
    return this.storage.put('mm', {
      queue: this.queue.map(({ idKey, connId, since }) => ({ idKey, connId, since })),
      recent: this.recent,
    });
  }

  attached(connId, idKey, except = null) {
    return this.getConnections().find((c) => c !== except && c.id === connId && identityKey(c) === idKey) ?? null;
  }

  prune(now) {
    const n = this.queue.length;
    this.queue = this.queue.filter((e) => now - e.seen <= MM.staleMs && this.attached(e.connId, e.idKey));
    return this.queue.length !== n;
  }

  counts(except = null) {
    const people = new Set();
    for (const c of this.getConnections()) {
      if (c === except) continue;
      const k = identityKey(c);
      if (k) people.add(k);
    }
    const m = this.matches;
    return { type: 'counts', online: people.size + 2 * (m ?? 0), searching: this.queue.length, matches: m };
  }

  broadcastCounts(except = null) {
    const msg = this.counts(except);
    for (const c of this.getConnections()) if (c !== except) c.send(msg);
  }

  async refreshMatches(now) {
    if (now - this.matchesAt < MM.matchRefreshMs) return false;
    this.matchesAt = now;
    const before = this.matches;
    try { this.matches = await countActiveMatches(this.client, now); } catch { this.matches = null; }
    return before !== this.matches;
  }

  freshCode() {
    let code = generateRoomCode();
    while (this.recent.includes(code)) code = generateRoomCode();
    this.recent.push(code);
    if (this.recent.length > MM.recentCodes) this.recent.splice(0, this.recent.length - MM.recentCodes);
    return code;
  }

  // Pair the two oldest waiting identities. Each learns only its own new room code.
  pair(now) {
    this.prune(now);
    let paired = 0;
    while (this.queue.length >= 2) {
      const [a, b] = this.queue.splice(0, 2);
      if (a.idKey === b.idKey) { this.queue.unshift(b); continue; } // cannot happen (one entry per identity)
      const code = this.freshCode();
      this.attached(a.connId, a.idKey)?.send({ type: 'match', code });
      this.attached(b.connId, b.idKey)?.send({ type: 'match', code });
      paired += 1;
    }
    return paired;
  }

  async handleStart() {
    await this.load();
    if (this.prune(Date.now())) await this.save();
  }

  async handleConnect(conn) {
    await this.load();
    if (!identityKey(conn)) { conn.reject(4001, 'no identity'); return; }
    if (this.getConnections().length > MM.maxConns) { conn.reject(4002, 'busy'); return; }
    await this.refreshMatches(Date.now());
    this.broadcastCounts();
  }

  async handleMessage(conn, msg) {
    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return;
    if (!this.limiter.allow(conn.id)) {
      if (msg.type !== 'ping') conn.send({ type: 'error', code: 'rate_limited' });
      return;
    }
    await this.load();
    const key = identityKey(conn);
    if (!key) return;
    const now = Date.now();
    const mine = this.queue.find((e) => e.idKey === key && e.connId === conn.id);

    if (msg.type === 'ping') {
      if (mine) mine.seen = now;
      const changed = this.prune(now);
      const matchesChanged = await this.refreshMatches(now);
      if (changed) await this.save();
      if (changed || matchesChanged) this.broadcastCounts();
      else conn.send(this.counts());
      if (mine) conn.send({ type: 'queued' });
      return;
    }
    if (msg.type === 'search') {
      // Same identity in another tab: that tab's entry is replaced, never duplicated.
      const other = this.queue.find((e) => e.idKey === key && e.connId !== conn.id);
      if (other) this.attached(other.connId, other.idKey)?.send({ type: 'replaced' });
      this.queue = this.queue.filter((e) => e.idKey !== key);
      this.queue.push({ idKey: key, connId: conn.id, since: now, seen: now });
      conn.send({ type: 'queued' });
      this.pair(now);
      await this.save();
      this.broadcastCounts();
      return;
    }
    if (msg.type === 'cancel') {
      this.queue = this.queue.filter((e) => !(e.idKey === key && e.connId === conn.id));
      conn.send({ type: 'cancelled' });
      await this.save();
      this.broadcastCounts();
    }
  }

  async handleClose(conn) {
    this.limiter.forget(conn.id);
    await this.load();
    const key = identityKey(conn);
    if (key && this.attached(conn.id, key, conn)) return; // the SDK already reopened this tab's socket
    const n = this.queue.length;
    this.queue = this.queue.filter((e) => !(e.idKey === key && e.connId === conn.id));
    if (this.queue.length !== n) await this.save();
    this.broadcastCounts(conn);
  }
}