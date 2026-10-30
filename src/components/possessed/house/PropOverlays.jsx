import GhostFace from '@/components/possessed/art/GhostFace';

function Badge({ children, tone = 'parchment', k }) {
  const tones = {
    parchment: 'bg-parchment text-ink',
    mint: 'bg-spectral text-ink',
    amber: 'bg-pumpkin text-ink',
    ink: 'bg-ink text-parchment border border-parchment/40',
  };
  return (
    <span key={k} className={`pop-in absolute left-1/2 top-0 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-extrabold uppercase tracking-wide shadow-lg sm:text-[13px] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function PropOverlays({ state }) {
  return (
    <>
      {state.ripple && (
        <span key={state.ripple} className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="ripple-ring absolute aspect-square h-[80%] rounded-full border-4 border-spectral" />
          <span className="ripple-ring r2 absolute aspect-square h-[80%] rounded-full border-2 border-spectral/70" />
        </span>
      )}
      {state.caught && (
        <span className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
          <GhostFace mood="oops" className="ghost-rise h-[85%] w-auto drop-shadow-[0_0_16px_rgba(141,243,209,.8)]" />
        </span>
      )}
      {state.survivedHere && (
        <span className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
          <GhostFace mood="happy" className="ghost-rise ghost-bob h-[85%] w-auto drop-shadow-[0_0_16px_rgba(141,243,209,.8)]" />
        </span>
      )}
      {state.possessed && <Badge tone="mint">You're here</Badge>}
      {state.caught && <Badge tone="amber">Caught!</Badge>}
      {state.survivedHere && <Badge tone="mint">Hid here</Badge>}
      {state.empty && <Badge k={state.empty} tone="parchment">Empty</Badge>}
      {state.searched && !state.possessed && <Badge k={state.searched} tone="ink">Searched</Badge>}
      {state.ripple && !state.possessed && !state.empty && <Badge k={state.ripple} tone="mint">Ripple</Badge>}
    </>
  );
}