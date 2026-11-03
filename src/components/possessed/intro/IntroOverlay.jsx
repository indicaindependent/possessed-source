import { useEffect, useRef, useState } from 'react';
import IntroScene from '@/components/possessed/intro/IntroScene';
import { getAudioRunning, sfx } from '@/lib/possessed/audio';

const TITLE = 'Possessed';

// mode 'full' = 4 s sequence, 'fade' = 1 s fade from black. Any input skips to the end.
export default function IntroOverlay({ mode, onDone }) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const finish = useRef(() => {});
  finish.current = () => { if (!done.current) { done.current = true; onDone(); } };

  useEffect(() => {
    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    if (mode === 'full') {
      if (getAudioRunning()) { later(1800, sfx.lowTone); later(2600, sfx.creak); }
      later(3400, () => setLeaving(true));
      later(4000, () => finish.current());
    } else {
      later(1000, () => finish.current());
    }
    const skip = () => finish.current();
    const evs = ['pointerdown', 'keydown', 'touchstart'];
    evs.forEach((e) => window.addEventListener(e, skip, { capture: true }));
    return () => { timers.forEach(clearTimeout); evs.forEach((e) => window.removeEventListener(e, skip, { capture: true })); };
  }, [mode]);

  if (mode === 'fade') return <div className="intro-fade fixed inset-0 z-50 bg-ink" aria-hidden="true" />;
  return (
    <div className={`fixed inset-0 z-50 overflow-hidden bg-ink ${leaving ? 'intro-leave' : ''}`} aria-hidden="true">
      <IntroScene />
      <p className="title-emboss absolute inset-x-0 top-[18%] text-center font-display text-5xl font-black tracking-[-0.02em] text-parchment sm:text-7xl">
        {TITLE.split('').map((c, i) => (
          <span key={i} className="intro-letter inline-block" style={{ animationDelay: `${2600 + i * 70}ms` }}>{c}</span>
        ))}
      </p>
    </div>
  );
}