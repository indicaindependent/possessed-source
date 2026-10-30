import { useEffect } from 'react';
import { sfx } from '@/lib/possessed/audio';
import { objectName } from '@/lib/possessed/layout';

export default function CountdownOverlay({ ms, round, role, objectId }) {
  const n = Math.max(1, Math.ceil(ms / 1000));
  useEffect(() => { sfx.tick(); }, [n]);
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4" role="status">
      <div className="max-w-sm rounded-3xl border border-parchment/15 bg-ink/90 px-6 py-5 text-center shadow-2xl">
        <p className="text-sm font-extrabold uppercase tracking-widest text-parchment/70">Round {round} begins in</p>
        <p key={n} className="countdown-num font-display text-7xl font-black text-pumpkin">{n}</p>
        <p className="mt-1 text-base font-bold text-parchment">
          {role === 'ghost'
            ? `You are the Ghost. You start inside the ${objectName(objectId)}. Stay hidden!`
            : 'You are the Hunter. Tap an object to investigate it.'}
        </p>
      </div>
    </div>
  );
}