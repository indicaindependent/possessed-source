import { Home, Plus, Search } from 'lucide-react';
import SeatList from '@/components/possessed/room/SeatList';
import BigButton from '@/components/possessed/room/BigButton';
import PrimaryAction from '@/components/possessed/room/PrimaryAction';
import GhostFace from '@/components/possessed/art/GhostFace';
import SurvivalCard from '@/components/possessed/room/SurvivalCard';
import ShareResult from '@/components/possessed/room/ShareResult';
import ScoreStrip from '@/components/possessed/room/ScoreStrip';
import SurvivalBars from '@/components/possessed/room/SurvivalBars';
import { precisionFor, secs, finalLine, shareText } from '@/lib/possessed/format';

export default function FinalPanel({ view, act, pending, onLeave, onNewHaunt, quick = false, onFindNew }) {
  if (!view.results || view.results.length < 2) return null; // results not in yet: never crash the screen
  const [r1, r2] = view.results;
  const me = view.seats[view.you];
  const digits = precisionFor(r1.survivalMs, r2.survivalMs);
  const draw = view.winner === 'draw';
  const winnerName = draw ? null : (view.winner === view.you ? 'You' : view.seats[view.winner]?.name ?? 'Your friend');
  const mine = view.results.find((r) => r.ghostSeat === view.you);
  const theirs = view.results.find((r) => r.ghostSeat !== view.you);
  const won = !draw && view.winner === view.you;
  const gap = secs(Math.abs((mine?.survivalMs ?? 0) - (theirs?.survivalMs ?? 0)), digits);
  const nameOf = (r) => (r.ghostSeat === view.you ? 'You' : r.ghostName);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <GhostFace mood={draw ? 'oops' : 'happy'} className="h-14 w-12 shrink-0" />
        <h2 className="title-emboss font-display text-3xl font-black tracking-tight text-parchment">
          {draw ? "It's a draw!" : <><span className="text-pumpkin">{winnerName}</span> {winnerName === 'You' ? 'win!' : 'wins!'}</>}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[r1, r2].map((r) => (
          <SurvivalCard key={r.round} r={r} name={nameOf(r)} digits={digits} winner={!draw && r.ghostSeat === view.winner} />
        ))}
      </div>
      <SurvivalBars roundMs={view.balance.roundMs} digits={digits}
        rows={[r1, r2].map((r) => ({ name: nameOf(r), ms: r.survivalMs, winner: !draw && r.ghostSeat === view.winner }))} />
      <p className="text-sm font-bold text-parchment/85">{finalLine({ draw, won, practice: view.practice, gap })}</p>
      <ScoreStrip view={view} />
      <SeatList view={view} field="rematch" yes="Wants a rematch" no="Deciding" />
      <PrimaryAction>
        <BigButton pressed={me.rematch} busy={pending?.type === 'rematch'} tone={me.rematch ? 'mint' : 'amber'} onClick={() => act('rematch', { value: !me.rematch })}>
          {me.rematch ? 'Rematch requested' : 'Rematch'}
        </BigButton>
      </PrimaryAction>
      <div className="grid grid-cols-3 gap-2">
        <ShareResult text={shareText({ draw, won, practice: view.practice, mineMs: mine?.survivalMs ?? 0, gap, round: mine })} />
        {quick
          ? <BigButton compact tone="ghost" onClick={onFindNew}><Search className="h-5 w-5" aria-hidden="true" />Find new opponent</BigButton>
          : <BigButton compact tone="ghost" onClick={onNewHaunt}><Plus className="h-5 w-5" aria-hidden="true" />New haunt</BigButton>}
        <BigButton compact tone="ghost" onClick={onLeave}><Home className="h-5 w-5" aria-hidden="true" />Home</BigButton>
      </div>
    </div>
  );
}