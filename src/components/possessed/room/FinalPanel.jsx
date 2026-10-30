import { Home, Plus } from 'lucide-react';
import SeatList from '@/components/possessed/room/SeatList';
import BigButton from '@/components/possessed/room/BigButton';
import PrimaryAction from '@/components/possessed/room/PrimaryAction';
import GhostFace from '@/components/possessed/art/GhostFace';
import SurvivalCard from '@/components/possessed/room/SurvivalCard';
import ShareResult from '@/components/possessed/room/ShareResult';
import { precisionFor, secs } from '@/lib/possessed/format';

export default function FinalPanel({ view, act, pending, onLeave, onNewHaunt }) {
  const [r1, r2] = view.results;
  const me = view.seats[view.you];
  const digits = precisionFor(r1.survivalMs, r2.survivalMs);
  const draw = view.winner === 'draw';
  const winnerName = draw ? null : (view.winner === view.you ? 'You' : view.seats[view.winner]?.name ?? 'Your friend');
  const mine = view.results.find((r) => r.ghostSeat === view.you);
  const nameOf = (r) => (r.ghostSeat === view.you ? 'You' : r.ghostName);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <GhostFace mood={draw ? 'oops' : 'happy'} className="h-14 w-12 shrink-0" />
        <h2 className="font-display text-3xl font-black text-parchment">
          {draw ? "It's a draw!" : <><span className="text-pumpkin">{winnerName}</span> {winnerName === 'You' ? 'win!' : 'wins!'}</>}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[r1, r2].map((r) => (
          <SurvivalCard key={r.round} r={r} name={nameOf(r)} digits={digits} winner={!draw && r.ghostSeat === view.winner} />
        ))}
      </div>
      <p className="text-sm font-bold text-parchment/85">
        {nameOf(r1)} survived {secs(r1.survivalMs, digits)} s, {nameOf(r2)} survived {secs(r2.survivalMs, digits)} s.
      </p>
      <SeatList view={view} field="rematch" yes="Wants a rematch" no="Deciding" />
      <PrimaryAction>
        <BigButton pressed={me.rematch} busy={pending?.type === 'rematch'} tone={me.rematch ? 'mint' : 'amber'} onClick={() => act('rematch', { value: !me.rematch })}>
          {me.rematch ? 'Rematch requested' : 'Rematch'}
        </BigButton>
      </PrimaryAction>
      <div className="grid grid-cols-3 gap-2">
        <ShareResult survivalMs={mine?.survivalMs ?? 0} />
        <BigButton compact tone="ghost" onClick={onNewHaunt}><Plus className="h-5 w-5" aria-hidden="true" />New haunt</BigButton>
        <BigButton compact tone="ghost" onClick={onLeave}><Home className="h-5 w-5" aria-hidden="true" />Home</BigButton>
      </div>
    </div>
  );
}