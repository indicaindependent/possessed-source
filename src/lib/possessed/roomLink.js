// Framework-free connection controller for one HauntRoom seat (one per mounted player).
// The SDK socket already reconnects itself (with backoff) and detects half-open sockets,
// so this layer never opens a second socket. It only:
//  - probes the seat while the tab is visible (a throttled background timer proves nothing),
//  - reports truthful status from replies, and re-attaches if the SDK closed the
//    connection permanently (documented: connect() returns a fresh one after close),
//  - tracks ONE pending action until the server acks/rejects it or it times out.
export const TICK_MS = 1000;
export const PROBE_MS = 3000;
export const STALE_MS = 6000;
export const ACK_TIMEOUT_MS = 5000;
const BACKOFF_MS = [2000, 4000, 8000, 16000, 30000];

export function createRoomLink({
  ref, connId, hello, onState, onEvent, onFatal, onStatus, onPending,
  now = () => Date.now(), log = () => {}, newId = () => crypto.randomUUID().slice(0, 18),
}) {
  let conn = null;
  let sub = null;
  let status = 'connecting';
  let seated = false;
  let fatal = false;
  let stopped = false;
  let awaitingSince = null; // first unanswered probe sent while visible
  let lastProbe = 0;
  let recheckAt = 0;
  let backoff = 0;
  let pending = null;

  const setStatus = (s) => {
    if (s === status) return;
    log(`status ${status} -> ${s}`);
    status = s;
    onStatus?.(s);
  };
  const settle = (outcome, reason) => {
    if (!pending) return;
    const p = pending;
    pending = null;
    log(`action ${p.type} ${outcome}${reason ? ` (${reason})` : ''} after ${Math.round(now() - p.sentAt)}ms`);
    onPending?.(null, { ...p, outcome, reason, rttMs: now() - p.sentAt });
  };
  const sayHello = () => conn?.send(hello());

  function receive(from, msg) {
    if (from !== conn || fatal || stopped || !msg || typeof msg !== 'object') return; // stale socket callbacks
    awaitingSince = null;
    backoff = 0;
    if (msg.type === 'state') {
      seated = true;
      setStatus('online');
      onState?.(msg);
    } else if (msg.type === 'ev') {
      if (seated) setStatus('online');
      if (msg.kind === 'rejected' && pending && msg.actionId === pending.actionId) settle('rejected', msg.reason);
      onEvent?.(msg);
    } else if (msg.type === 'ack') {
      if (pending && msg.actionId === pending.actionId) settle('ok');
    } else if (msg.type === 'pong') {
      if (msg.seated === false) sayHello();
      else if (seated) setStatus('online');
    } else if (msg.type === 'error') {
      if (msg.code === 'not_seated') { sayHello(); return; }
      fatal = true;
      settle('error', msg.code);
      onFatal?.(msg.code);
    }
  }

  function attach(c) {
    sub?.unsubscribe();
    conn = c;
    sub = c.subscribe((msg) => receive(c, msg));
  }

  // The SDK closes a connection for good only on unrecoverable failures; then connect()
  // hands back a new one. Same object = the SDK is still (re)dialing on its own.
  function reattachIfClosed() {
    const c = ref.connect({ id: connId });
    if (c === conn) return false;
    log('connection was closed by the SDK; attached a fresh one');
    attach(c);
    sayHello();
    return true;
  }

  return {
    start() {
      attach(ref.connect({ id: connId }));
      awaitingSince = now();
      lastProbe = now();
      sayHello();
    },
    tick(visible) {
      if (fatal || stopped) return;
      const t = now();
      if (pending && t - pending.sentAt > ACK_TIMEOUT_MS) settle('timeout');
      if (!visible) { awaitingSince = null; return; }
      if (t - lastProbe >= PROBE_MS) {
        conn?.send({ type: 'ping' });
        lastProbe = t;
        if (awaitingSince == null) awaitingSince = t;
      }
      if (awaitingSince != null && t - awaitingSince > STALE_MS) {
        setStatus(seated ? 'reconnecting' : 'connecting');
        settle('offline');
        if (t >= recheckAt) {
          reattachIfClosed();
          recheckAt = t + BACKOFF_MS[Math.min(backoff, BACKOFF_MS.length - 1)];
          backoff += 1;
        }
      }
    },
    // Foreground return: ask for a fresh snapshot and judge only the reply.
    visible() {
      if (fatal || stopped) return;
      reattachIfClosed();
      awaitingSince = now();
      lastProbe = now();
      conn?.send({ type: 'sync' });
    },
    act(type, payload = {}) {
      if (fatal || stopped || status !== 'online') return { ok: false, reason: 'offline' };
      if (pending) return { ok: false, reason: 'busy' };
      const actionId = newId();
      pending = { actionId, type, objectId: payload.objectId ?? null, sentAt: now() };
      log(`action ${type} sent`);
      onPending?.(pending, null);
      conn.send({ type, actionId, ...payload });
      return { ok: true, actionId };
    },
    leave() { conn?.send({ type: 'leave' }); },
    stop() {
      stopped = true;
      pending = null;
      sub?.unsubscribe();
      conn?.close();
      conn = null;
    },
    get status() { return status; },
    get pending() { return pending; },
  };
}