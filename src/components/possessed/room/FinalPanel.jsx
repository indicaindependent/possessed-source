import RoundResult from '@/components/possessed/room/RoundResult';
import SeatList from '@/components/possessed/room/SeatList';
import BigButton from '@/components/possessed/room/BigButton';
import GhostFace from '@/components/possessed/art/GhostFace';
import { precisionFor } from '@/lib/possessed/format';

export default function FinalPanel({ view, d, act, onLeave }) {
  const [r1, r2] = view.results;
  const me = view.seats[view.you];
  const friendName = view.seats[1 - view.you]?.name ?? 'Your friend';
  const digits = precisionFor(r1.survivalMs, r2.survivalMs);
  let title = "It's a draw!";
  if (view.winner === view.you) title = 'You win!';
  else if (view.winner !== 'draw') title = `${friendName} wins!`;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <GhostFace mood={view.winner === 'draw' ? 'oops' : 'happy'} className="ghost-bob h-14 w-12 shrink-0" />
        <div>
          <h2 className="font-display text-3xl font-black text-parchment">{title}</h2>
          <p className="text-sm font-medium text-parchment/80">The longer survival time as Ghost wins. Equal times are a draw.</p>
        </div>
      </div>
      <RoundResult r={r1} you={view.you} digits={digits} />
      <RoundResult r={r2} you={view.you} digits={digits} />
      <SeatList view={view} d={d} field="rematch" yes="Wants a rematch" no="Deciding" />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <BigButton pressed={me.rematch} tone={me.rematch ? 'mint' : 'amber'} onClick={() => act('rematch', { value: !me.rematch })}>
          {me.rematch ? 'Rematch requested' : 'Rematch'}
        </BigButton>
        <div className="w-28"><BigButton tone="ghost" onClick={onLeave}>Leave</BigButton></div>
      </div>
    </div>
  );
}