import { secs } from '@/lib/possessed/format';

// Two bars on one scale; the longer survival (the winner) is highlighted.
export default function SurvivalBars({ rows, roundMs, digits }) {
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2">
          <span className="w-20 shrink-0 truncate text-sm font-extrabold text-parchment">{r.name}</span>
          <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-parchment/10">
            <span className={`absolute inset-y-0 left-0 rounded-full ${r.winner ? 'bg-pumpkin' : 'bg-parchment/40'}`} style={{ width: `${Math.min(100, (r.ms / roundMs) * 100)}%` }} />
          </span>
          <span className={`w-14 shrink-0 text-right text-sm font-extrabold tabular-nums ${r.winner ? 'text-pumpkin' : 'text-parchment/80'}`}>{secs(r.ms, digits)} s</span>
        </div>
      ))}
    </div>
  );
}