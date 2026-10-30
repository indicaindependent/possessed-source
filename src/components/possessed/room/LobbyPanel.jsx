import InviteBox from '@/components/possessed/room/InviteBox';
import SeatList from '@/components/possessed/room/SeatList';
import BigButton from '@/components/possessed/room/BigButton';

export default function LobbyPanel({ view, d, act }) {
  const me = view.seats[view.you];
  const friend = view.seats[1 - view.you];
  let hint = 'Both players must be ready to begin.';
  if (!friend) hint = 'Share the code or link. The game starts when both players are ready.';
  else if (friend.ready && !me.ready) hint = `${friend.name} is ready and waiting for you.`;
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold text-parchment">The haunt is open</h2>
      <InviteBox code={view.code} />
      {view.notice === 'friend_left' && <p className="text-sm font-bold text-pumpkin">Your friend left. Invite someone new with the same code.</p>}
      <SeatList view={view} d={d} field="ready" yes="Ready" no="Not ready" />
      <BigButton pressed={me.ready} tone={me.ready ? 'mint' : 'amber'} onClick={() => act('ready', { value: !me.ready })}>
        {me.ready ? 'Ready! (tap to undo)' : "I'm ready"}
      </BigButton>
      <p className="text-center text-sm font-medium text-parchment/75">{hint}</p>
    </div>
  );
}