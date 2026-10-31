import { Ghost, Search } from 'lucide-react';
import { objectName, roomName } from '@/lib/possessed/layout';
import { secs } from '@/lib/possessed/format';

export default function RoundResult({ r, you, digits = 2 }) {
  const mine = r.ghostSeat === you;
  const caught = r.outcome === 'caught';
  const Icon = caught ? Search : Ghost;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-parchment/10 bg-plum/70 p-3 shadow-sm">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${caught ? 'text-pumpkin' : 'text-spectral'}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-base font-extrabold text-parchment">
          Round {r.round}: {mine ? 'You' : r.ghostName} hid in the {objectName(r.hidingObject)} ({roomName(r.hidingRoom)})
        </p>
        <p className="text-sm font-bold text-parchment/80">
          {caught ? `Caught after ${secs(r.survivalMs, digits)}s` : `Survived the full ${secs(r.survivalMs, digits)}s!`}
        </p>
      </div>
    </div>
  );
}