import { useCallback, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { useMatchmaker, cancelMatch } from '@/lib/possessed/matchmaker';
import Elapsed from '@/components/possessed/screens/Elapsed';

function OthersSearching() {
  const searching = useMatchmaker((s) => s.counts?.searching);
  if (searching == null) return null;
  const others = Math.max(0, searching - 1);
  return <p className="text-sm font-bold text-parchment/75">{others === 0 ? 'No one else is searching right now.' : `${others} other ${others === 1 ? 'player is' : 'players are'} searching.`}</p>;
}

export default function SearchingPanel({ since, onInvite }) {
  const [long, setLong] = useState(false);
  const markLong = useCallback(() => setLong(true), []);
  return (
    <div className="space-y-2.5 rounded-xl border-2 border-pumpkin/60 bg-plum/50 p-3" role="status">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-parchment">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-pumpkin" aria-hidden="true" />
        Searching for a player… <Elapsed since={since} onLong={markLong} />
      </p>
      <OthersSearching />
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