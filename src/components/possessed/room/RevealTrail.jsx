import { useId } from 'react';

export default function RevealTrail({ path, points, step, reduced }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible text-primary" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {path.map((stop, i) => {
        const p = points[stop.object], prev = points[path[i - 1]?.object];
        if (!p || !prev || (!reduced && i > step + 1)) return null;
        const d = `M${prev.x},${prev.y} L${p.x},${p.y}`;
        const drawing = !reduced && i === step + 1;
        return <g key={i}>
          <defs><mask id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><path d={d} pathLength="1" fill="none" stroke="white" strokeWidth="4" strokeDasharray="1" className={drawing ? 'reveal-draw' : undefined} /></mask></defs>
          <path d={d} fill="none" stroke="currentColor" strokeWidth=".7" strokeDasharray=".5 1.6" strokeLinecap="round" mask={`url(#${id}-${i})`} />
        </g>;
      })}
      {path.map((stop, i) => {
        const p = points[stop.object];
        return p && (reduced || i <= step) ? <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="currentColor" /> : null;
      })}
    </svg>
  );
}