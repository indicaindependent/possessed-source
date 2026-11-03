import { secs } from '@/lib/possessed/format';

export function scoreLine(h, you) {
  const them = 1 - you;
  return `Match ${h.match}: you ${secs(h.ms[you], 0)} s, them ${secs(h.ms[them], 0)} s`;
}

// Past matches with this opponent (kept by the room across rematches).
export default function ScoreStrip({ view }) {
  const history = view.history || [];
  if (!history.length || view.you == null) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-bold tabular-nums text-parchment/85" aria-label="Score so far">
      {history.map((h) => <li key={h.match} className="rounded-full bg-plum/80 px-2.5 py-0.5">{scoreLine(h, view.you)}</li>)}
    </ul>
  );
}