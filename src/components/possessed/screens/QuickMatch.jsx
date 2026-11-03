import { Loader2, Zap } from 'lucide-react';
import { useMatchmaker, searchMatch } from '@/lib/possessed/matchmaker';
import SearchingPanel from '@/components/possessed/screens/SearchingPanel';
import PracticeButton from '@/components/possessed/screens/PracticeButton';

export default function QuickMatch({ search, onInvite, onPractice }) {
  const since = useMatchmaker((s) => s.since);
  const error = useMatchmaker((s) => s.error);
  const waiting = useMatchmaker((s) => s.counts?.searching);
  if (search === 'searching') return <SearchingPanel since={since} onInvite={onInvite} onPractice={onPractice} />;
  const busy = search === 'requesting';
  return (
    <div className="space-y-2">
      <button type="button" onClick={searchMatch} disabled={busy}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-pumpkin px-4 font-display text-xl font-black tracking-[0.01em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_0_#b86f17] transition active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_0_#b86f17] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-70">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Zap className="h-5 w-5" aria-hidden="true" />}
        {busy ? 'Joining the queue…' : 'Quick Match'}
        {!busy && waiting > 0 && <span className="font-body text-sm font-extrabold">({waiting} waiting)</span>}
      </button>
      <p className="text-center text-[13px] font-bold text-parchment/75">Get paired with the next real player. One hides, one hunts, then you swap.</p>
      {error && <p role="alert" className="text-sm font-bold text-pumpkin">{error}</p>}
      {onPractice && <PracticeButton onPractice={onPractice} disabled={busy} />}
    </div>
  );
}