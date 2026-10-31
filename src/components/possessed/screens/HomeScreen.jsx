import { useEffect, useRef, useState } from 'react';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import JoinPanel from '@/components/possessed/screens/JoinPanel';
import HowToPlay from '@/components/possessed/screens/HowToPlay';
import LivePresence from '@/components/possessed/screens/LivePresence';
import QuickMatch from '@/components/possessed/screens/QuickMatch';
import SoundToggle from '@/components/possessed/screens/SoundToggle';
import { openMatchmaker, searchMatch, useMatchmaker } from '@/lib/possessed/matchmaker';

// Entry first: name + Quick Match + Play with a friend sit near the top at every size; the house is a backdrop.
export default function HomeScreen({ initialCode = '', busy, error, onCreate, onJoin, onQuickMatch, autoSearch = false, prefs }) {
  const [name, setName] = useState(() => sessionStorage.getItem('possessed:name') || '');
  const [joining, setJoining] = useState(Boolean(initialCode));
  const saveName = (v) => { setName(v); sessionStorage.setItem('possessed:name', v); };
  const search = useMatchmaker((s) => s.search);
  const latest = useRef({});
  latest.current = { name, onQuickMatch };

  useEffect(() => {
    const close = openMatchmaker((code) => latest.current.onQuickMatch(code, latest.current.name.trim()));
    if (autoSearch) searchMatch();
    return close;
  }, []);

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center gap-5 px-4 pb-8 pt-[max(env(safe-area-inset-top),1rem)] lg:flex-row lg:items-center lg:gap-12 lg:px-8 short:flex-row short:items-start short:gap-4 short:pb-4 short:pt-3">
      <div className="relative z-10 w-full max-w-md shrink-0 lg:w-[440px] short:w-[340px]">
        {prefs && (
          <div className="mb-0.5 flex justify-end">
            <SoundToggle prefs={prefs} />
          </div>
        )}
        <header className="text-center lg:text-left short:text-left">
          <h1 className="title-emboss font-display text-[2.6rem] font-black leading-[1.02] tracking-[-0.02em] text-parchment sm:text-6xl short:text-3xl">Possessed</h1>
          <p className="mt-0.5 font-body text-base font-extrabold italic tracking-[0.015em] text-spectral drop-shadow-[0_2px_10px_rgba(141,243,209,.25)] sm:text-lg short:text-sm">“One of these things is you.”</p>
          <LivePresence />
        </header>
        <section className="panel-surface fade-up mt-2 rounded-2xl border border-parchment/20 bg-ink/88 p-4 backdrop-blur-md sm:p-5 short:mt-1 short:p-3">
          <JoinPanel
            name={name} onName={saveName} joining={joining} setJoining={setJoining}
            initialCode={initialCode} busy={busy} error={error}
            onCreate={() => onCreate(name.trim())} onJoin={(code) => onJoin(code, name.trim())}
            searching={search !== 'idle'}
            quick={<QuickMatch search={search} onInvite={() => onCreate(name.trim())} />}
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