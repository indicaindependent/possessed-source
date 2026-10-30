import { useEffect, useState } from 'react';

// Ticks once a second on its own so nothing else re-renders for the clock.
export default function Elapsed({ since, onLong, longAfterMs = 30000 }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = Math.max(0, now - since);
  const long = ms >= longAfterMs;
  useEffect(() => { if (long) onLong?.(); }, [long, onLong]);
  return <span className="tabular-nums">{Math.floor(ms / 1000)}s</span>;
}