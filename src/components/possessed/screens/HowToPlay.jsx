import { Ghost, Search, Repeat } from 'lucide-react';

const RULES = [
  { icon: Ghost, text: 'Ghost: hide in the furniture.' },
  { icon: Search, text: 'Hunter: search before time runs out.' },
  { icon: Repeat, text: 'Swap roles. Longer survival wins.' },
];

export default function HowToPlay() {
  return (
    <section className="mt-4 rounded-2xl border border-parchment/10 bg-ink/75 px-4 py-3 shadow-lg backdrop-blur-sm short:mt-3" aria-labelledby="how-to-play">
      <h2 id="how-to-play" className="text-[12px] font-black uppercase tracking-[0.14em] text-parchment/70">How to play</h2>
      <ol className="mt-2 space-y-1.5">
        {RULES.map(({ icon: Icon, text }, i) => (
          <li key={text} className="flex items-center gap-3 text-[15px] font-medium leading-snug tracking-[0.005em] text-parchment">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-pumpkin/30 bg-plum font-display text-sm font-bold text-pumpkin">{i + 1}</span>
            <Icon className="h-4 w-4 shrink-0 text-spectral" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ol>
    </section>
  );
}