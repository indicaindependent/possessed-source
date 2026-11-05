import RoomPresence from '@/components/possessed/room/RoomPresence';
import { levelName } from '@/components/possessed/screens/HouseDifficulty';

// Shown during a practice match: who you're playing, and that real players are one tap away.
export default function PracticeChip({ level = 'haunted' }) {
  return (
    <div className="mx-1.5 mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 sm:mx-auto sm:max-w-5xl">
      <span className="rounded-full bg-pumpkin px-2.5 py-0.5 text-[12px] font-extrabold text-ink">Practice vs The House ({levelName(level)}). Real players: Quick Match</span>
      <RoomPresence />
    </div>
  );
}