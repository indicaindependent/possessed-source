import { secs } from '@/lib/possessed/format';

// Stamped "CAUGHT!" over the house, with the survival time sliding in beneath it.
export default function CaughtFlourish({ stamp }) {
  if (!stamp) return null;
  return (
    <div key={stamp.stamp} className="pointer-events-none absolute inset-x-0 top-[18%] z-40 flex flex-col items-center gap-2" aria-hidden="true">
      <span className="caught-stamp rounded-2xl border-4 border-pumpkin bg-ink/90 px-6 py-2 font-display text-5xl font-black uppercase tracking-wider text-pumpkin shadow-2xl sm:text-7xl">
        Caught!
      </span>
      {stamp.ms != null && (
        <span className="slide-in rounded-full bg-ink/90 px-4 py-1 font-display text-xl font-bold tabular-nums text-parchment shadow-xl">
          Survived {secs(stamp.ms, 2)} s
        </span>
      )}
    </div>
  );
}