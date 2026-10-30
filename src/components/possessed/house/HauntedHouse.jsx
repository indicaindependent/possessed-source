import { memo } from 'react';
import { ROOM_ORDER } from '@/lib/possessed/layout';
import HouseRoom from '@/components/possessed/house/HouseRoom';
import Roof from '@/components/possessed/house/Roof';
import Pumpkin from '@/components/possessed/house/Pumpkin';
import GhostFace from '@/components/possessed/art/GhostFace';

export default memo(HauntedHouse);

// Play grid: one room per row on portrait phones (keeps every prop >=44px with a readable label),
// 2x2 when there is width (md+) or on short landscape screens.
// decorative: non-interactive backdrop, always 2x2 and unlabeled so it stays legible when small.
function HauntedHouse({ interactive = false, disabledAll = false, decorative = false, propStates, clue, celebrate, onPick, className = '' }) {
  const grid = decorative ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 short:grid-cols-2 short:grid-rows-2';
  return (
    <div className={`relative mx-auto flex w-full min-w-0 max-w-5xl flex-col ${className}`}>
      <Roof />
      <div className={`siding grid min-h-0 flex-1 ${grid} gap-1.5 border-x-[6px] border-[#1b1226] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.6)] md:gap-2.5 md:p-2.5`}>
        {ROOM_ORDER.map((roomId) => (
          <HouseRoom
            key={roomId}
            roomId={roomId}
            interactive={interactive}
            disabledAll={disabledAll}
            labels={!decorative}
            propStates={propStates}
            clueKey={clue?.room === roomId ? clue.key : null}
            onPick={onPick}
          />
        ))}
      </div>
      <div className="pointer-events-none relative h-3 shrink-0 bg-[#1b1226] sm:h-4 short:h-2" aria-hidden="true">
        <Pumpkin className="absolute -top-5 left-1 h-7 w-8 sm:-top-9 sm:h-12 sm:w-14 short:-top-5 short:h-7 short:w-8" />
        <Pumpkin className="absolute -top-4 right-2 h-6 w-7 sm:-top-8 sm:h-10 sm:w-12 short:-top-4 short:h-6 short:w-7" />
      </div>
      {celebrate && (
        <div key={celebrate} className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
          {[8, 28, 48, 68, 86].map((x, i) => (
            <span key={x} className="float-up absolute bottom-0 opacity-0" style={{ left: `${x}%`, animationDelay: `${i * 0.18}s` }}>
              <GhostFace mood="happy" className="h-14 w-12 sm:h-20 sm:w-16" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}