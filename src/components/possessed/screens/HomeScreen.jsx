import { useState } from 'react';
import { Users } from 'lucide-react';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import JoinPanel from '@/components/possessed/screens/JoinPanel';
import HowToPlay from '@/components/possessed/screens/HowToPlay';

// Entry first: name + Create/Join sit near the top at every size; the house is a backdrop beside/below.
export default function HomeScreen({ initialCode = '', busy, error, onCreate, onJoin }) {
  const [name, setName] = useState(() => sessionStorage.getItem('possessed:name') || '');
  const [joining, setJoining] = useState(Boolean(initialCode));
  const saveName = (v) => { setName(v); sessionStorage.setItem('possessed:name', v); };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center gap-5 px-4 pb-8 pt-[max(env(safe-area-inset-top),1rem)] lg:flex-row lg:items-center lg:gap-12 lg:px-8 short:flex-row short:items-start short:gap-4 short:pb-4 short:pt-3">
      <div className="relative z-10 w-full max-w-md shrink-0 lg:w-[440px] short:w-[340px]">
        <header className="text-center lg:text-left short:text-left">
          <h1 className="font-display text-4xl font-black tracking-tight text-parchment drop-shadow-[0_4px_20px_rgba(141,243,209,.25)] sm:text-6xl short:text-3xl">Possessed</h1>
          <p className="font-display text-base font-bold italic text-spectral sm:text-lg short:text-sm">“One of these things is you.”</p>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-bold text-parchment/90 lg:justify-start short:justify-start short:text-[13px]">
            <Users className="h-4 w-4 shrink-0 text-pumpkin" aria-hidden="true" />
            2 players online. Create a haunt, then invite a friend.
          </p>
        </header>
        <section className="fade-up mt-3 rounded-2xl border border-parchment/15 bg-ink/85 p-4 shadow-2xl backdrop-blur-md sm:p-5 short:mt-2 short:p-3">
          <JoinPanel
            name={name} onName={saveName} joining={joining} setJoining={setJoining}
            initialCode={initialCode} busy={busy} error={error}
            onCreate={() => onCreate(name.trim())} onJoin={(code) => onJoin(code, name.trim())}
          />
        </section>
        <HowToPlay />
      </div>
      <div className="pointer-events-none relative z-0 h-[300px] w-full max-w-xl opacity-90 sm:h-[380px] lg:h-[560px] lg:max-w-none lg:flex-1 short:sticky short:top-3 short:h-[calc(100dvh-1.5rem)] short:flex-1" aria-hidden="true">
        <HauntedHouse decorative className="h-full" />
      </div>
    </main>
  );
}