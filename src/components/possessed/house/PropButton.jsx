import { memo } from 'react';
import { PROP_ART } from '@/components/possessed/art/propArt';
import { OBJECTS, roomName } from '@/lib/possessed/layout';
import useArtFrame from '@/lib/possessed/useArtFrame';
import PropOverlays from '@/components/possessed/house/PropOverlays';

const EMPTY = {};

// Memoized: a prop only re-renders when its own state changes (taps, marks), never for the clock.
function PropButton({ id, interactive, disabled, label: showLabel = true, state = EMPTY, onPick }) {
  const Art = PROP_ART[id];
  const obj = OBJECTS[id];
  const { boxRef, artRef, style } = useArtFrame();
  const label = `${obj.name}, ${roomName(obj.room)}${state.possessed ? ' (you are possessing this)' : ''}`;

  return (
    <button
      type="button"
      tabIndex={interactive ? 0 : -1}
      aria-hidden={interactive ? undefined : true}
      aria-label={label}
      aria-busy={state.pending ? true : undefined}
      aria-disabled={!interactive || disabled ? 'true' : undefined}
      onClick={() => interactive && !disabled && onPick?.(id)}
      className={`prop-btn relative flex h-full min-h-[44px] min-w-[44px] flex-1 basis-0 flex-col items-center justify-end rounded-xl px-0.5 pb-1 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-pumpkin ${
        interactive && !disabled ? 'cursor-pointer' : 'cursor-default'
      } ${state.pending ? 'bg-parchment/10' : ''}`}
    >
      <span ref={boxRef} className="relative w-full min-h-0 flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className={`prop-art absolute inset-0 h-full w-full ${state.possessed ? 'possessed-art' : ''} ${state.ripple ? 'rippling-art' : ''}`}>
          <g className={state.empty ? 'knock' : undefined}>
            <g ref={artRef} className={`idle idle-${id}`}><Art /></g>
          </g>
        </svg>
        <span className="pointer-events-none absolute" style={style}>
          {state.possessed && <span className="possessed-frame absolute inset-0 rounded-lg border-[3px] border-dashed border-spectral" aria-hidden="true" />}
          <PropOverlays state={state} />
        </span>
      </span>
      {showLabel && (
        <span className="mt-0.5 max-w-full text-center text-[12px] font-extrabold leading-tight text-parchment drop-shadow-[0_1px_1px_rgba(0,0,0,.9)] sm:text-sm">
          {obj.name}
        </span>
      )}
    </button>
  );
}

export default memo(PropButton);