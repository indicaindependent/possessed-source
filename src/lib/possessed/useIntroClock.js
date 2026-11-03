import { useEffect, useRef, useState } from 'react';
import { createTimeline, introVars, allActs } from '@/lib/possessed/introTimeline';
import { sfx, setDuck } from '@/lib/possessed/audio';

const SKIP_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
const playCue = (name) => {
  if (name === 'duck') setDuck(0.25);
  else if (name === 'unduck') setDuck(1);
  else sfx[name]?.();
};

// One requestAnimationFrame clock drives every act, sound and CSS variable; skip jumps the same clock to its end.
export default function useIntroClock({ started, reduced, frozen, root, onDone }) {
  const [acts, setActs] = useState([]);
  const [skipping, setSkipping] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!started) return;
    const tl = createTimeline(reduced);
    const wide = window.innerWidth >= 768;
    let finished = false, raf = 0, fade = 0;
    const finish = () => { if (finished) return; finished = true; setDuck(1); doneRef.current?.(); };
    const paint = (t) => {
      const v = introVars(t, reduced, wide);
      const s = root.current?.style;
      if (!s) return;
      s.setProperty('--cam', v.cam); s.setProperty('--flash', v.flash); s.setProperty('--beam', v.beam);
    };
    const apply = (t, live) => {
      const r = tl.step(t);
      if (r.fired.length) setActs((a) => [...a, ...r.fired]);
      if (live) r.sounds.forEach(playCue);
      paint(t);
      return r.done;
    };
    if (frozen != null) { apply(frozen, false); return; }

    const t0 = performance.now();
    const loop = () => { if (apply(performance.now() - t0, true)) finish(); else raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    // The skipping input does only the skip: swallow it and the click it would turn into.
    const swallow = (e) => { e.preventDefault(); e.stopPropagation(); };
    const skip = (e) => {
      if (e.cancelable) swallow(e);
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 600);
      if (finished || fade) return;
      cancelAnimationFrame(raf);
      tl.skip();
      setActs(allActs(reduced));
      paint(tl.end);
      setDuck(1);
      setSkipping(true);
      fade = setTimeout(finish, 250);
    };
    SKIP_EVENTS.forEach((n) => window.addEventListener(n, skip, { capture: true, passive: false }));
    return () => {
      cancelAnimationFrame(raf); clearTimeout(fade); setDuck(1);
      SKIP_EVENTS.forEach((n) => window.removeEventListener(n, skip, { capture: true }));
    };
  }, [started, reduced, frozen, root]);

  return { acts, skipping };
}