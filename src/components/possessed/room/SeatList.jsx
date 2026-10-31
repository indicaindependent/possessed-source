import { Check, Hourglass, UserPlus, WifiOff } from 'lucide-react';
import { useDerived } from '@/lib/possessed/clock';

export default function SeatList({ view, field, yes, no }) {
  const d = useDerived(view, view.seats.some((s) => s && !s.connected) ? 250 : 0);
  return (
    <ul className="grid grid-cols-2 gap-2">
      {[view.you, 1 - view.you].map((k) => {
        const s = view.seats[k];
        let icon = UserPlus; let text = 'Waiting for a friend'; let cls = 'text-parchment/60';
        if (s && !s.connected) { icon = WifiOff; text = `Reconnecting ${Math.ceil((d.graceMs[k] ?? 0) / 1000)}s`; cls = 'text-pumpkin'; }
        else if (s && s[field]) { icon = Check; text = yes; cls = 'text-spectral'; }
        else if (s) { icon = Hourglass; text = no; cls = 'text-parchment/75'; }
        const Icon = icon;
        return (
          <li key={k} className="min-w-0 rounded-xl border border-parchment/10 bg-plum/75 px-3 py-2 shadow-sm">
            <p className="truncate text-base font-extrabold tracking-[0.01em] text-parchment">
              {s ? s.name : 'Empty seat'}{k === view.you && <span className="font-medium text-parchment/60"> (you)</span>}
            </p>
            <p className={`mt-0.5 flex items-center gap-1 text-[13px] font-bold tabular-nums ${cls}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {text}
            </p>
          </li>
        );
      })}
    </ul>
  );
}