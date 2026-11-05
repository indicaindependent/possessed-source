import { useCallback, useEffect, useState } from 'react';
import { Home, Loader2, UserPlus } from 'lucide-react';
import { useMatchmaker, cancelMatch } from '@/lib/possessed/matchmaker';
import Elapsed from '@/components/possessed/screens/Elapsed';
import HouseDifficulty from '@/components/possessed/screens/HouseDifficulty';

function OthersSearching() {
  const searching = useMatchmaker((s) => s.counts?.searching);
  if (searching == null) return <p className="text-sm font-bold text-parchment/75">Checking who else is here…</p>;
  const others = Math.max(0, searching - 1);
  return <p className="text-sm font-bold text-parchment/75">{others === 0 ? 'No one else is in the queue yet.' : `${others} other ${others === 1 ? 'player is' : 'players are'} searching.`}</p>;
}

export default function SearchingPanel({ since, onInvite, onPractice, level, onLevelChange }) {
  const [long, setLong] = useState(false);
  const [waited, setWaited] = useState(false);
  const searching = useMatchmaker((s) => s.counts?.searching);
  const markLong = useCallback(() => setLong(true), []);
  useEffect(() => { const t = setTimeout(() => setWaited(true), 8000); return () => clearTimeout(t); }, []);
  const lonely = waited && searching != null && searching <= 1;
  return (
    <div className="space-y-2.5 rounded-xl border-2 border-pumpkin/60 bg-plum/50 p-3" role="status">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-parchment">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-pumpkin" aria-hidden="true" />
        Searching for a player… <Elapsed since={since} onLong={markLong} />
      </p>
      <OthersSearching />
      {lonely && onPractice && (
        <div className="space-y-2">
          <HouseDifficulty value={level} onChange={onLevelChange} />
          <button type="button" onClick={() => onPractice(level)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-spectral px-3 py-2 text-sm font-extrabold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment sm:text-base">
            <Home className="h-4 w-4 shrink-0" aria-hidden="true" /> No one else is here yet. Play the House while you wait?
          </button>
        </div>
      )}
      <div className={`grid gap-2 ${long ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <button type="button" onClick={cancelMatch}
          className="h-12 rounded-xl border-2 border-parchment/30 font-bold text-parchment hover:bg-parchment/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment">
          Cancel
        </button>
        {long && (
          <button type="button" onClick={() => { cancelMatch(); onInvite(); }}
            className="flex h-12 items-center justify-center gap-1.5 rounded-xl border-2 border-spectral px-2 text-sm font-bold text-spectral hover:bg-spectral/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment sm:text-base">
            <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" /> Invite a friend instead
          </button>
        )}
      </div>
    </div>
  );
}