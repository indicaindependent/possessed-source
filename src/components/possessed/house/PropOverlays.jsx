import GhostFace from '@/components/possessed/art/GhostFace';

function Badge({ children, tone = 'parchment', k }) {
  const tones = {
    parchment: 'bg-parchment text-ink',
    mint: 'bg-spectral text-ink',
    amber: 'bg-pumpkin text-ink',
    ink: 'bg-ink text-parchment border border-parchment/40',
  };
  return (
    <span key={k} className={`pop-in absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-extrabold uppercase tracking-wide shadow-lg sm:text-[13px] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function PropOverlays({ state }) {
  return (
    <>
      {state.ripple && (
        <span key={state.ripple} className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="ripple-ring absolute aspect-square h-full rounded-full border-4 border-spectral shadow-[0_0_18px_rgba(141,243,209,.8)]" />
          <span className="ripple-ring r2 absolute aspect-square h-full rounded-full border-[3px] border-spectral/80" />
        </span>
      )}
      {state.empty && (
        <span key={state.empty} className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3" aria-hidden="true">
          {[18, 38, 60, 80].map((x, i) => (
            <span key={x} className="dust-puff absolute bottom-0 h-3 w-3 rounded-full bg-parchment/60" style={{ left: `${x}%`, animationDelay: `${i * 0.05}s` }} />
          ))}
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