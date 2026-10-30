import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import SeatList from '@/components/possessed/room/SeatList';
import BigButton from '@/components/possessed/room/BigButton';
import PrimaryAction from '@/components/possessed/room/PrimaryAction';

const NO_SHOW_MS = 20000;

// Quick-match lobby: both seats arrive already Ready, so normally this shows only for a moment.
export default function QuickLobbyPanel({ view, act, pending, onFindNew }) {
  const me = view.seats[view.you];
  const friend = view.seats[1 - view.you];
  const [noShow, setNoShow] = useState(false);
  const present = !!friend;
  useEffect(() => {
    if (present) { setNoShow(false); return undefined; }
    const t = setTimeout(() => setNoShow(true), NO_SHOW_MS);
    return () => clearTimeout(t);
  }, [present]);
  const gone = view.notice === 'friend_left' || (!friend && noShow);

  if (gone) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-parchment">Opponent left</h2>
        <p className="text-base font-medium text-parchment/85">{view.notice === 'friend_left' ? 'Your opponent left the house.' : "Your opponent didn't arrive."}</p>
        <PrimaryAction>
          <BigButton tone="amber" onClick={onFindNew}><Search className="h-5 w-5" aria-hidden="true" />Search again</BigButton>
        </PrimaryAction>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold text-parchment">{friend ? 'Opponent found' : 'Opponent found. Waiting for them to arrive…'}</h2>
      <SeatList view={view} field="ready" yes="Ready" no="Not ready" />
      <PrimaryAction>
        <BigButton pressed={me.ready} busy={pending?.type === 'ready'} tone={me.ready ? 'mint' : 'amber'} onClick={() => act('ready', { value: !me.ready })}>
          {me.ready ? 'Ready! (tap to undo)' : "I'm ready"}
        </BigButton>
      </PrimaryAction>
      <p className="text-center text-sm font-medium text-parchment/75">The haunt begins when both players are ready.</p>
    </div>
  );
}