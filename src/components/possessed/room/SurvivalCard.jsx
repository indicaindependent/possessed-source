import { Crown } from 'lucide-react';
import { objectName } from '@/lib/possessed/layout';
import { secs } from '@/lib/possessed/format';

export default function SurvivalCard({ r, name, digits, winner }) {
  return (
    <div className={`rounded-xl p-3 ${winner ? 'bg-pumpkin/15 ring-2 ring-pumpkin' : 'bg-plum/60'}`}>
      <p className="flex items-center gap-1 truncate text-sm font-extrabold text-parchment/80">
        {winner && <Crown className="h-4 w-4 shrink-0 text-pumpkin" aria-label="Winner" />}
        {name}
      </p>
      <p className={`font-display text-3xl font-black tabular-nums ${winner ? 'text-pumpkin' : 'text-parchment'}`}>
        {secs(r.survivalMs, digits)}<span className="ml-0.5 text-base">s</span>
      </p>
      <p className="text-[13px] font-bold leading-snug text-parchment/70">
        {r.outcome === 'caught' ? 'Caught in the' : 'Survived in the'} {objectName(r.hidingObject)}
      </p>
    </div>
  );
}