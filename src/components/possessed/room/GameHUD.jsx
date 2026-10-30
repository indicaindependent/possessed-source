import { Eye } from 'lucide-react';
import RoleChip from '@/components/possessed/room/RoleChip';
import HunterMeter from '@/components/possessed/room/HunterMeter';
import GhostMeter from '@/components/possessed/room/GhostMeter';
import TimeBar from '@/components/possessed/room/TimeBar';
import { secs } from '@/lib/possessed/format';
import { roomName } from '@/lib/possessed/layout';

export default function GameHUD({ view, d, announce }) {
  const B = view.balance;
  return (
    <div className="mx-1.5 mt-1.5 shrink-0 rounded-xl border border-parchment/10 bg-ink/85 px-3 py-2 backdrop-blur sm:mx-auto sm:w-full sm:max-w-5xl">
      <div className="flex items-center gap-2">
        <RoleChip role={view.role} />
        <span className="text-sm font-bold text-parchment/75">Round {view.round}/2</span>
        <p className="ml-auto leading-none">
          <span className="font-display text-3xl font-black tabular-nums text-parchment sm:text-4xl">{secs(d.remainingMs)}</span>
          <span className="ml-1 text-sm font-bold text-parchment/70">s left</span>
        </p>
      </div>
      <TimeBar activeMs={d.activeMs} roundMs={B.roundMs} clueTimesMs={B.clueTimesMs} />
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {view.role === 'ghost'
          ? <GhostMeter objectId={view.ghost?.objectId} readyIn={d.ghostReadyIn} cooldownMs={B.moveCooldownMs} />
          : <HunterMeter charges={d.charges ?? 0} max={B.maxCharges} refill={d.refill} regenMs={B.chargeRegenMs} />}
        <span className="flex items-center gap-1 text-[13px] font-bold text-parchment/80">
          <Eye className="h-4 w-4 text-pumpkin" aria-hidden="true" />
          {d.nextClueIn != null ? `Clue in ${secs(d.nextClueIn)}s` : 'No more clues'}
          {view.lastClue && <span className="text-pumpkin">· Last: {roomName(view.lastClue.room)}</span>}
        </span>
      </div>
      <p aria-live="polite" className="mt-1 min-h-[1.25rem] truncate text-sm font-extrabold text-spectral">{announce.text}</p>
    </div>
  );
}