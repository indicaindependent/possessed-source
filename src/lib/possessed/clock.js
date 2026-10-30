import { useEffect, useState } from 'react';

// Local display clock only. The server decides every result.
export function useNowTick(active, ms = 100) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(performance.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return active ? now : performance.now();
}

// Ticking projection for ONE small component (HUD, countdown, grace timers). ms = 0 stops ticking.
export function useDerived(view, ms) {
  const now = useNowTick(Boolean(view) && ms > 0, ms || 1000);
  return view ? derive(view, now) : null;
}

// Project server-reported durations forward from the moment the snapshot arrived.
export function derive(view, now) {
  const B = view.balance;
  const c = view.clock;
  const el = Math.max(0, now - view.receivedAt);
  const run = c.running ? el : 0;
  const activeMs = Math.min(B.roundMs, c.activeMs + run);
  let charges = null;
  let refill = null;
  if (view.hunter) {
    const h = view.hunter;
    charges = h.charges;
    if (h.regenElapsedMs != null) {
      const t = h.regenElapsedMs + run;
      charges = Math.min(B.maxCharges, h.charges + Math.floor(t / B.chargeRegenMs));
      refill = charges >= B.maxCharges ? null : t % B.chargeRegenMs;
    }
  }
  return {
    activeMs,
    remainingMs: B.roundMs - activeMs,
    countdownMs: c.countdownMs != null ? Math.max(0, c.countdownMs - el) : null,
    ghostReadyIn: view.ghost ? Math.max(0, view.ghost.moveReadyInMs - run) : null,
    charges,
    refill,
    nextClueIn: view.nextClueAtMs != null ? Math.max(0, view.nextClueAtMs - activeMs) : null,
    graceMs: view.seats.map((s) => (s?.graceMs != null ? Math.max(0, s.graceMs - el) : null)),
  };
}