import HauntedHouse from '@/components/possessed/house/HauntedHouse';

// First visit only: a real tap unlocks audio so the cinematic plays with sound.
export default function IntroGate({ onEnter }) {
  return (
    <button type="button" onClick={onEnter} className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-ink text-parchment focus-visible:outline-none">
      <div className="pointer-events-none absolute inset-x-0 top-[55%] mx-auto aspect-[1.15] w-full max-w-[min(100vw,calc(80dvh*1.15))] -translate-y-1/2 px-1 opacity-10" aria-hidden="true">
        <HauntedHouse cinematic className="h-full" />
      </div>
      <svg viewBox="0 0 20 40" className="relative h-14 w-7" aria-hidden="true">
        <path className="flicker" d="M10 2 C14 10 16 15 10 24 C4 15 6 10 10 2 Z" fill="#FFAD42" />
        <rect x="7" y="24" width="6" height="14" rx="1" fill="#FFF0D4" opacity=".85" />
      </svg>
      <span className="relative mt-4 font-display text-2xl font-bold sm:text-3xl">Tap to enter the house</span>
      <span className="relative mt-1 font-body text-sm text-parchment/60">sound on</span>
    </button>
  );
}