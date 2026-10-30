import { Eye } from 'lucide-react';
import { ROOMS } from '@/lib/possessed/layout';
import PropButton from '@/components/possessed/house/PropButton';

export default function HouseRoom({ roomId, interactive, disabledAll, labels = true, propStates, clueKey, onPick }) {
  const room = ROOMS[roomId];
  const clued = Boolean(clueKey);
  return (
    <section
      aria-label={`${room.name}${clued ? ', clue: the Ghost is in this room' : ''}`}
      className={`wall-${roomId} relative flex min-h-0 flex-col overflow-hidden rounded-md`}
    >
      <div className="candle-glow pointer-events-none absolute -top-6 right-6 h-24 w-24" aria-hidden="true" />
      {clued && <div key={clueKey} className="clue-room pointer-events-none absolute inset-0 z-20 rounded-md" aria-hidden="true" />}
      <div className="relative z-10 flex items-center gap-2 px-2 pt-1.5">
        <h3 className="rounded bg-ink/80 px-2 py-0.5 font-display text-sm font-bold text-parchment sm:text-base">{room.name}</h3>
        {clued && (
          <span className="fade-up flex items-center gap-1 rounded-full bg-pumpkin px-2 py-0.5 text-[12px] font-extrabold uppercase text-ink sm:text-[13px]">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Ghost sensed
          </span>
        )}
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 items-stretch gap-1 px-1 pb-1 sm:gap-3 sm:px-3">
        {room.objects.map((id) => (
          <PropButton key={id} id={id} interactive={interactive} disabled={disabledAll} label={labels} state={propStates?.[id]} onPick={onPick} />
        ))}
      </div>
      <div className="floorboards h-2.5 shrink-0 sm:h-3.5" aria-hidden="true" />
    </section>
  );
}