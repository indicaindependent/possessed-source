import { useRef, useState } from 'react';
import IntroStage from '@/components/possessed/intro/IntroStage';
import IntroTitle from '@/components/possessed/intro/IntroTitle';
import IntroGate from '@/components/possessed/intro/IntroGate';
import useIntroClock from '@/lib/possessed/useIntroClock';
import { getAudioRunning, subscribeAudio, unlockAudio } from '@/lib/possessed/audio';
import { markIntroSeen } from '@/lib/possessed/introGate';
import { needsGate } from '@/lib/possessed/introTimeline';

// mode 'full' = 12 s cinematic, 'fade' = 3 s reduced-motion cut. frozen = fixture time in ms.
export default function IntroOverlay({ mode, replay = false, frozen = null, onDone }) {
  const reduced = mode === 'fade';
  const [started, setStarted] = useState(() => frozen != null || !needsGate({ replay, audioRunning: getAudioRunning() }));
  const root = useRef(null);
  const { acts, skipping } = useIntroClock({ started, reduced, frozen, root, onDone });

  const enter = () => {
    unlockAudio();
    markIntroSeen(window.localStorage);
    let off = () => {};
    const go = () => { off(); clearTimeout(t); setStarted(true); };
    const t = setTimeout(go, 400);
    off = subscribeAudio((on) => on && go());
    if (getAudioRunning()) go();
  };

  if (!started) return <IntroGate onEnter={enter} />;
  return (
    <div ref={root} className={`cine-root fixed inset-0 z-50 overflow-hidden bg-ink ${reduced ? 'cine-reduced' : ''} ${skipping ? 'cine-skip' : ''} ${frozen != null ? 'cine-frozen' : ''} ${acts.map((a) => `act-${a}`).join(' ')}`} aria-hidden="true">
      <IntroStage />
      <div className="cine-flash pointer-events-none absolute inset-0 bg-parchment" />
      <IntroTitle />
      <p className="cine-hint pointer-events-none absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),1.25rem)] text-center font-body text-xs tracking-[0.12em] text-parchment">tap to skip</p>
    </div>
  );
}