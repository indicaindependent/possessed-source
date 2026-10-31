import { Crown } from 'lucide-react';
import { objectName } from '@/lib/possessed/layout';
import { secs } from '@/lib/possessed/format';

export default function SurvivalCard({ r, name, digits, winner }) {
  return (
    <div className={`rounded-xl p-3 ${winner ? 'bg-pumpkin/15 ring-2 ring-pumpkin shadow-sm' : 'border border-parchment/10 bg-plum/70 shadow-sm'}`}>
      <p className="flex items-center gap-1 truncate text-sm font-extrabold text-parchment/90">
        {winner && <Crown className="h-4 w-4 shrink-0 text-pumpkin" aria-label="Winner" />}
        {name}
      </p>
      <p className={`font-display text-3xl font-black tabular-nums tracking-tight ${winner ? 'text-pumpkin' : 'text-parchment'}`}>
        {secs(r.survivalMs, digits)}<span className="ml-0.5 text-base">s</span>
      </p>
      <p className="text-[13px] font-bold leading-snug text-parchment/80">
        {r.outcome === 'caught' ? 'Caught in the' : 'Survived in the'} {objectName(r.hidingObject)}
      </p>
    </div>
  );
}