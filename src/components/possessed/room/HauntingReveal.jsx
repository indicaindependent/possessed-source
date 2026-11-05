import { useState } from 'react';
import RevealPlayback from '@/components/possessed/room/RevealPlayback';

export default function HauntingReveal({ results, reducedMotion }) {
  const [replay, setReplay] = useState(0);
  const available = results.filter((r) => r.path?.length);
  if (!available.length) return null;
  return <section className="space-y-2 rounded-xl border border-border bg-card/40 p-3" aria-label="The haunting, revealed">
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-display text-base font-bold text-primary">The haunting, revealed</h3>
      <button type="button" onClick={() => setReplay((n) => n + 1)} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Replay</button>
    </div>
    {available.map((result) => <div key={result.round}>
      {available.length > 1 && <p className="text-xs font-bold text-muted-foreground">Round {result.round} · {result.ghostName}</p>}
      <RevealPlayback key={`${result.round}-${replay}`} result={result} reducedMotion={reducedMotion} />
    </div>)}
  </section>;
}