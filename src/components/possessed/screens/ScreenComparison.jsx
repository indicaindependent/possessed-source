import { Ghost, Search, Repeat } from 'lucide-react';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';

const STEPS = [[Ghost, 'Hide', '60 s'], [Search, 'Hunt', '3 charges'], [Repeat, 'Swap', 'longer survival wins']];
export default function ScreenComparison() {
  return <section className="mt-4 rounded-xl border border-border bg-background/80 p-3" aria-labelledby="two-screens-title">
    <h2 id="two-screens-title" className="mb-3 text-center font-display text-lg font-bold text-primary">Same house, two screens</h2>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <figure>
        <figcaption className="mb-2 text-center text-sm font-bold text-accent">Your screen</figcaption>
        <div className="comparison-house comparison-ghost calm reduce-motion pointer-events-none h-48" aria-label="Ghost view: You're here in the Rocking chair; the Parlor window is lit">
          <HauntedHouse decorative className="h-full" propStates={{ rocking_chair: { possessed: true } }} />
        </div>
        <p className="mt-2 text-center text-xs text-accent">Rocking chair · You’re here</p>
      </figure>
      <figure>
        <figcaption className="mb-2 text-center text-sm font-bold text-primary">Their screen</figcaption>
        <div className="comparison-house calm reduce-motion pointer-events-none h-48" aria-label="Hunter view: all twelve props neutral">
          <HauntedHouse decorative className="h-full" />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="flex gap-1" role="img" aria-label="3 charges">{[0, 1, 2].map((n) => <span key={n} className="h-2 w-2 rounded-full bg-primary" />)}</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">Clue: the Parlor</span>
        </div>
      </figure>
    </div>
    <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">The server never tells the Hunter's screen where you are.</p>
    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
      {STEPS.map(([Icon, title, detail]) => <div key={title} className="text-center">
        <Icon className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden="true" />
        <p className="text-xs font-bold text-foreground">{title}</p><p className="text-[10px] text-muted-foreground">{detail}</p>
      </div>)}
    </div>
  </section>;
}