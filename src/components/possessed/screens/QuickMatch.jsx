import { Loader2, Zap } from 'lucide-react';
import { useMatchmaker, searchMatch } from '@/lib/possessed/matchmaker';
import SearchingPanel from '@/components/possessed/screens/SearchingPanel';

export default function QuickMatch({ search, onInvite }) {
  const since = useMatchmaker((s) => s.since);
  const error = useMatchmaker((s) => s.error);
  if (search === 'searching') return <SearchingPanel since={since} onInvite={onInvite} />;
  const busy = search === 'requesting';
  return (
    <div className="space-y-2">
      <button type="button" onClick={searchMatch} disabled={busy}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-pumpkin px-4 font-display text-xl font-bold text-ink shadow-[0_6px_0_#b86f17] transition active:translate-y-1 active:shadow-[0_2px_0_#b86f17] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-70">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Zap className="h-5 w-5" aria-hidden="true" />}
        {busy ? 'Joining the queue…' : 'Quick Match'}
      </button>
      {error && <p role="alert" className="text-sm font-bold text-pumpkin">{error}</p>}
    </div>
  );
}