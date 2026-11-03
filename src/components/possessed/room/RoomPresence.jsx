import { useMatchmaker } from '@/lib/possessed/matchmaker';

// In-room presence: one short line from live counts, nothing when counts are unknown.
export default function RoomPresence() {
  const online = useMatchmaker((s) => s.counts?.online);
  if (online == null) return null;
  return <span className="text-[12px] font-bold tabular-nums text-parchment/80">{online} {online === 1 ? 'player' : 'players'} online</span>;
}