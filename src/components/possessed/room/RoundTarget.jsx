import { secs } from '@/lib/possessed/format';

// Round 2 only: the time to beat, from round 1's survival. Pumpkin once the clock has passed it.
export default function RoundTarget({ view, activeMs }) {
  const first = view.results?.[0];
  if (view.round !== 2 || !first) return null;
  const t = secs(first.survivalMs, 1);
  const passed = activeMs > first.survivalMs;
  return (
    <span className={`shrink-0 whitespace-nowrap text-[12px] font-extrabold tabular-nums ${passed ? 'text-pumpkin' : 'text-parchment/85'}`}>
      {view.role === 'ghost' ? `Beat ${t} s` : `Catch before ${t} s`}
    </span>
  );
}