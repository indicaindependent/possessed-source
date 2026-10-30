import BigButton from '@/components/possessed/room/BigButton';
import RoundResult from '@/components/possessed/room/RoundResult';

export default function AbandonedPanel({ view, act, onLeave }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold text-parchment">Match abandoned</h2>
      <p className="text-base font-medium text-parchment/85">
        {view.abandonedBy ?? 'Your friend'} left or didn't reconnect in time. No winner this time.
      </p>
      {view.results.map((r) => <RoundResult key={r.round} r={r} you={view.you} />)}
      <div className="grid grid-cols-2 gap-2">
        <BigButton tone="amber" onClick={() => act('back_to_lobby')}>Back to lobby</BigButton>
        <BigButton tone="ghost" onClick={onLeave}>Leave</BigButton>
      </div>
    </div>
  );
}