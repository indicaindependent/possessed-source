import { Ghost, Search, Repeat } from 'lucide-react';

const RULES = [
  { icon: Ghost, text: 'Ghost: hide in the furniture.' },
  { icon: Search, text: 'Hunter: search before time runs out.' },
  { icon: Repeat, text: 'Swap roles. Longer survival wins.' },
];

export default function HowToPlay() {
  return (
    <section className="mt-4 rounded-2xl bg-ink/70 px-4 py-3 short:mt-3" aria-labelledby="how-to-play">
      <h2 id="how-to-play" className="text-sm font-extrabold uppercase tracking-wider text-parchment/75">How to play</h2>
      <ol className="mt-2 space-y-1.5">
        {RULES.map(({ icon: Icon, text }, i) => (
          <li key={text} className="flex items-center gap-3 text-base font-medium text-parchment">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-extrabold text-pumpkin">{i + 1}</span>
            <Icon className="h-4 w-4 shrink-0 text-spectral" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ol>
    </section>
  );
}