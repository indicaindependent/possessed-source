import { useState } from 'react';
import { Ghost, Search, Repeat } from 'lucide-react';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import JoinPanel from '@/components/possessed/screens/JoinPanel';

const RULES = [
  { icon: Ghost, text: 'Hide inside an object.' },
  { icon: Search, text: 'Find your friend before they move.' },
  { icon: Repeat, text: 'Swap roles. Survive longer to win.' },
];

export default function HomeScreen({ initialCode = '', busy, error, onCreate, onJoin }) {
  const [name, setName] = useState(() => sessionStorage.getItem('possessed:name') || '');
  const [joining, setJoining] = useState(Boolean(initialCode));
  const saveName = (v) => { setName(v); sessionStorage.setItem('possessed:name', v); };

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-4 pb-4 pt-6">
      <header className="relative z-10 text-center">
        <h1 className="font-display text-5xl font-black tracking-tight text-parchment drop-shadow-[0_4px_20px_rgba(141,243,209,.25)] sm:text-7xl">Possessed</h1>
        <p className="mt-1 font-display text-lg font-bold italic text-spectral sm:text-xl">“One of these things is you.”</p>
      </header>

      <div className="pointer-events-none relative z-0 -my-2 flex w-full max-w-3xl flex-1 items-center opacity-90" aria-hidden="true">
        <HauntedHouse className="h-[42vh] min-h-[260px] md:h-[46vh]" />
      </div>

      <section className="fade-up relative z-10 w-full max-w-md rounded-2xl border border-parchment/15 bg-ink/85 p-4 shadow-2xl backdrop-blur-md sm:p-5">
        <ol className="mb-4 space-y-1.5">
          {RULES.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-3 text-base font-medium text-parchment">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-extrabold text-pumpkin">{i + 1}</span>
              <Icon className="h-4 w-4 shrink-0 text-spectral" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ol>
        <JoinPanel
          name={name} onName={saveName} joining={joining} setJoining={setJoining}
          initialCode={initialCode} busy={busy} error={error}
          onCreate={() => onCreate(name.trim())} onJoin={(code) => onJoin(code, name.trim())}
        />
      </section>
    </main>
  );
}