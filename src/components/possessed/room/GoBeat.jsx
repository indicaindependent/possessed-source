// 400 ms "GO!" after the 3-2-1, then a fade (never a hard unmount mid-frame).
export default function GoBeat({ stamp }) {
  if (!stamp) return null;
  return (
    <div key={stamp} className="go-beat pointer-events-none absolute inset-0 z-40 flex items-center justify-center" aria-hidden="true">
      <span className="absolute inset-0 rounded-xl border-4 border-spectral shadow-[inset_0_0_40px_rgba(141,243,209,.5)]" />
      <span className="title-emboss font-display text-8xl font-black uppercase text-spectral short:text-6xl">Go!</span>
    </div>
  );
}