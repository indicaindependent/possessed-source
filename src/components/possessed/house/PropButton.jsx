import { PROP_ART } from '@/components/possessed/art/propArt';
import { OBJECTS, roomName } from '@/lib/possessed/layout';
import PropOverlays from '@/components/possessed/house/PropOverlays';

export default function PropButton({ id, interactive, disabled, state = {}, onPick }) {
  const Art = PROP_ART[id];
  const obj = OBJECTS[id];
  const label = `${obj.name}, ${roomName(obj.room)}${state.possessed ? ' (you are possessing this)' : ''}`;

  return (
    <button
      type="button"
      tabIndex={interactive ? 0 : -1}
      aria-hidden={interactive ? undefined : true}
      aria-label={label}
      aria-disabled={!interactive || disabled ? 'true' : undefined}
      onClick={() => interactive && !disabled && onPick?.(id)}
      className={`prop-btn relative flex h-full min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-end rounded-xl px-0.5 pb-1 outline-none focus-visible:ring-4 focus-visible:ring-pumpkin ${
        interactive && !disabled ? 'cursor-pointer' : 'cursor-default'
      } ${state.possessed ? 'outline-dashed outline-[3px] outline-offset-[-3px] outline-spectral' : ''}`}
    >
      <span className="relative w-full min-h-0 flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className={`prop-art absolute inset-0 h-full w-full ${state.possessed ? 'possessed-art' : ''}`}>
          <Art />
        </svg>
        <PropOverlays state={state} />
      </span>
      <span className="mt-0.5 max-w-full text-center text-[12px] font-extrabold leading-tight text-parchment drop-shadow-[0_1px_1px_rgba(0,0,0,.9)] sm:text-sm">
        {obj.name}
      </span>
    </button>
  );
}