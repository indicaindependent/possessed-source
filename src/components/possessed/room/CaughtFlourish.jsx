// A short stamped "CAUGHT!" over the top of the house when a round ends in a catch.
export default function CaughtFlourish({ stamp }) {
  if (!stamp) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[18%] z-40 flex justify-center" aria-hidden="true">
      <span key={stamp} className="caught-stamp rounded-2xl border-4 border-pumpkin bg-ink/90 px-6 py-2 font-display text-5xl font-black uppercase tracking-wider text-pumpkin shadow-2xl sm:text-7xl">
        Caught!
      </span>
    </div>
  );
}