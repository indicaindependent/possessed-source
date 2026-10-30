import { Loader2, Wifi, WifiOff } from 'lucide-react';

const STATES = {
  online: { icon: Wifi, text: 'Online', cls: 'text-spectral' },
  reconnecting: { icon: WifiOff, text: 'Reconnecting', cls: 'text-pumpkin' },
  connecting: { icon: Loader2, text: 'Connecting', cls: 'text-parchment/80', spin: true },
};

export default function ConnectionBadge({ status }) {
  const s = STATES[status] ?? STATES.connecting;
  const Icon = s.icon;
  return (
    <span role="status" className={`flex items-center gap-1 text-[13px] font-extrabold ${s.cls}`}>
      <Icon className={`h-4 w-4 ${s.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
      {s.text}
    </span>
  );
}