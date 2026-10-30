import { Repeat } from 'lucide-react';
import RoundResult from '@/components/possessed/room/RoundResult';
import SeatList from '@/components/possessed/room/SeatList';
import BigButton from '@/components/possessed/room/BigButton';
import { secs } from '@/lib/possessed/format';

export default function IntermissionPanel({ view, d, act }) {
  const r = view.results[0];
  const me = view.seats[view.you];
  const wasGhost = r.ghostSeat === view.you;
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold text-parchment">Round 1 complete</h2>
      <RoundResult r={r} you={view.you} />
      <div className="flex items-start gap-3 rounded-xl border border-spectral/40 p-3">
        <Repeat className="mt-0.5 h-5 w-5 shrink-0 text-spectral" aria-hidden="true" />
        <div>
          <p className="text-base font-extrabold text-parchment">Roles swap! You'll be the {wasGhost ? 'Hunter' : 'Ghost'} next.</p>
          <p className="text-sm font-medium text-parchment/80">
            {wasGhost ? `Catch your friend before ${secs(r.survivalMs, 2)}s to win.` : `Survive longer than ${secs(r.survivalMs, 2)}s to win.`}
          </p>
        </div>
      </div>
      <SeatList view={view} d={d} field="ready" yes="Ready" no="Not ready" />
      <BigButton pressed={me.ready} tone={me.ready ? 'mint' : 'amber'} onClick={() => act('ready', { value: !me.ready })}>
        {me.ready ? 'Ready! (tap to undo)' : 'Ready for round 2'}
      </BigButton>
    </div>
  );
}