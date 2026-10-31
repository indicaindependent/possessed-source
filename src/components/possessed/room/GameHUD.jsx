import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import RoleChip from '@/components/possessed/room/RoleChip';
import HunterMeter from '@/components/possessed/room/HunterMeter';
import GhostMeter from '@/components/possessed/room/GhostMeter';
import TimeBar from '@/components/possessed/room/TimeBar';
import RoundTimer from '@/components/possessed/room/RoundTimer';
import { useDerived } from '@/lib/possessed/clock';
import { sfx } from '@/lib/possessed/audio';
import { roomName } from '@/lib/possessed/layout';

function clueText(view, d) {
  if (view.phase === 'countdown') return `First clue at ${Math.round(view.balance.clueTimesMs[0] / 1000)}s`;
  if (d.nextClueIn != null) return `Next clue in ${Math.ceil(d.nextClueIn / 1000)}s`;
  return 'No more clues';
}

// The only component that ticks during play (10x/s); the house never re-renders for the clock.
export default function GameHUD({ view, pulse }) {
  const B = view.balance;
  const d = useDerived(view, view.phase === 'active' && view.clock.running ? 100 : 0);
  const final = view.phase === 'active' && !view.clock.paused && d.remainingMs > 0 && d.remainingMs <= 10000;
  const finalSecond = final ? Math.ceil(d.remainingMs / 1000) : null;
  useEffect(() => { if (finalSecond) sfx.softTick(); }, [finalSecond]);
  return (
    <div className="panel-surface relative mx-1.5 mt-1.5 shrink-0 rounded-xl border border-parchment/15 bg-ink/88 px-2.5 py-1.5 backdrop-blur sm:mx-auto sm:w-full sm:max-w-5xl sm:px-3 sm:py-2 short:mt-1 short:py-1">
      {pulse && <span key={pulse} className="heartbeat pointer-events-none absolute inset-0 rounded-xl" aria-hidden="true" />}
      <div className="flex items-center gap-2">
        <RoleChip role={view.role} />
        <span className="shrink-0 font-display text-sm font-bold tabular-nums tracking-tight text-parchment/80">R{view.round}/2</span>
        <span className="flex min-w-0 items-center gap-1 text-[13px] font-bold tabular-nums text-parchment/85">
          <Eye className="h-4 w-4 shrink-0 text-pumpkin" aria-hidden="true" />
          <span className="truncate">{clueText(view, d)}</span>
        </span>
        <RoundTimer remainingMs={d.remainingMs} final={final} />
      </div>
      <TimeBar activeMs={d.activeMs} roundMs={B.roundMs} clueTimesMs={B.clueTimesMs} />
      <div className="mt-1 flex items-center gap-3 overflow-hidden">
        {view.role === 'ghost'
          ? <GhostMeter objectId={view.ghost?.objectId} readyIn={d.ghostReadyIn} cooldownMs={B.moveCooldownMs} />
          : <HunterMeter charges={d.charges ?? 0} max={B.maxCharges} refill={d.refill} regenMs={B.chargeRegenMs} />}
        {view.lastClue && (
          <span className="ml-auto shrink-0 text-[13px] font-extrabold text-pumpkin">Last clue: {roomName(view.lastClue.room)}</span>
        )}
      </div>
    </div>
  );
}