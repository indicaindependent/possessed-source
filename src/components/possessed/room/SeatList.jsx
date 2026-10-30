import { Check, Hourglass, UserPlus, WifiOff } from 'lucide-react';

export default function SeatList({ view, d, field, yes, no }) {
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
          <li key={k} className="min-w-0 rounded-xl bg-plum/70 px-3 py-2">
            <p className="truncate text-base font-extrabold text-parchment">
              {s ? s.name : 'Empty seat'}{k === view.you && <span className="font-medium text-parchment/60"> (you)</span>}
            </p>
            <p className={`flex items-center gap-1 text-sm font-bold ${cls}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {text}
            </p>
          </li>
        );
      })}
    </ul>
  );
}