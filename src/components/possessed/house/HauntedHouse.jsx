import { memo } from 'react';
import { ROOM_ORDER } from '@/lib/possessed/layout';
import HouseRoom from '@/components/possessed/house/HouseRoom';
import Roof from '@/components/possessed/house/Roof';
import Pumpkin from '@/components/possessed/house/Pumpkin';
import GhostFace from '@/components/possessed/art/GhostFace';

export default memo(HauntedHouse);

function HauntedHouse({ interactive = false, disabledAll = false, propStates, clue, celebrate, onPick, className = '' }) {
  return (
    <div className={`relative mx-auto flex w-full max-w-5xl flex-col ${className}`}>
      <Roof />
      <div className="siding grid min-h-0 flex-1 grid-cols-1 grid-rows-4 gap-1.5 border-x-[6px] border-[#1b1226] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.6)] md:grid-cols-2 md:grid-rows-2 md:gap-2.5 md:p-2.5">
        {ROOM_ORDER.map((roomId) => (
          <HouseRoom
            key={roomId}
            roomId={roomId}
            interactive={interactive}
            disabledAll={disabledAll}
            propStates={propStates}
            clueKey={clue?.room === roomId ? clue.key : null}
            onPick={onPick}
          />
        ))}
      </div>
      <div className="relative h-3 shrink-0 bg-[#1b1226] sm:h-4" aria-hidden="true">
        <Pumpkin className="absolute -top-7 left-1 h-9 w-11 sm:-top-9 sm:h-12 sm:w-14" />
        <Pumpkin className="absolute -top-6 right-2 h-8 w-10 sm:-top-8 sm:h-10 sm:w-12" />
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