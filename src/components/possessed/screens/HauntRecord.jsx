import { useEffect, useState } from 'react';
import { RECORD_KEY, readHauntRecord } from '@/lib/possessed/hauntRecord';
import { HOUSE_LEVELS, levelName } from '@/components/possessed/screens/HouseDifficulty';
import { secs } from '@/lib/possessed/format';

export default function HauntRecord() {
  const [record, setRecord] = useState(() => readHauntRecord());
  useEffect(() => {
    const update = (event) => { if (event.type === 'possessed:record' || event.key === RECORD_KEY) setRecord(readHauntRecord()); };
    window.addEventListener('storage', update);
    window.addEventListener('possessed:record', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('possessed:record', update); };
  }, []);
  if (!record?.matchesPlayed) return null;
  const entries = [['Matches played', record.matchesPlayed], ['Best survival as Ghost', `${secs(record.bestSurvivalMs, 2)} s`], ['Fastest catch as Hunter', record.fastestCatchMs == null ? 'Not yet' : `${secs(record.fastestCatchMs, 2)} s`], ['Taunts fired', record.tauntsFired]];
  return <section className="mt-4 rounded-xl border border-border bg-background/80 p-4" aria-labelledby="haunt-record-title">
    <h2 id="haunt-record-title" className="font-display text-lg font-bold text-primary">Haunt record</h2>
    <dl className="mt-3 grid grid-cols-2 gap-3">
      {entries.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-bold tabular-nums text-foreground">{value}</dd></div>)}
    </dl>
    <p className="mt-3 text-xs font-bold text-muted-foreground">Houses beaten</p>
    <dl className="mt-1 grid grid-cols-3 gap-2">
      {HOUSE_LEVELS.map((level) => <div key={level}><dt className="text-xs text-muted-foreground">{levelName(level)}</dt><dd className="font-bold tabular-nums text-accent">{record.housesBeaten[level]}</dd></div>)}
    </dl>
  </section>;
}