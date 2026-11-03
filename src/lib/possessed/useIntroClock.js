import { useEffect, useRef, useState } from 'react';
import { createTimeline, introVars, allActs, pushFraming, camAt, elapsedSince, ANIMATED_ACTS } from '@/lib/possessed/introTimeline';
import { sfx, setDuck } from '@/lib/possessed/audio';

const SKIP_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
const playCue = (name) => {
  if (name === 'duck') setDuck(0.25);
  else if (name === 'unduck') setDuck(1);
  else sfx[name]?.();
};

// Measures the camera (unscaled via offset boxes) and the Parlor (rect divided by the current scale).
function measure(rootEl, cur) {
  const cam = rootEl.querySelector('.cine-cam');
  const parlor = cam?.querySelector('[data-room="parlor"]');
  if (!cam || !parlor) return null;
  const st = cam.offsetParent.getBoundingClientRect();
  const house = { x: st.left + cam.offsetLeft, y: st.top + cam.offsetTop, w: cam.offsetWidth, h: cam.offsetHeight };
  const cr = cam.getBoundingClientRect(), pr = parlor.getBoundingClientRect();
  const s = cur.cam;
  const p = { x: house.x + (pr.left - cr.left) / s, y: house.y + (pr.top - cr.top) / s, w: pr.width / s, h: pr.height / s };
  return pushFraming({ vw: rootEl.clientWidth, vh: rootEl.clientHeight, house, parlor: p });
}

// One requestAnimationFrame clock drives every act, sound and CSS variable; skip jumps the same clock to its end.
export default function useIntroClock({ started, reduced, frozen, root, onDone }) {
  const [acts, setActs] = useState([]);
  const [skipping, setSkipping] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!started) return;
    const tl = createTimeline(reduced);
    const cur = { cam: 1, push: 0 };
    let framing = { scale: 1, tx: 0, ty: 0 };
    let finished = false, raf = 0, fade = 0;
    const finish = () => { if (finished) return; finished = true; setDuck(1); doneRef.current?.(); };
    const paint = (t) => {
      const s = root.current?.style;
      if (!s) return;
      const v = introVars(t, reduced);
      cur.push = v.push;
      const c = camAt(framing, v.push);
      cur.cam = c.cam;
      s.setProperty('--cam', c.cam); s.setProperty('--tx', `${c.tx}px`); s.setProperty('--ty', `${c.ty}px`);
      s.setProperty('--flash', v.flash); s.setProperty('--beam', v.beam);
    };
    const reframe = () => { if (root.current) framing = measure(root.current, cur) || framing; paint(lastT); };
    let lastT = frozen ?? 0;
    const apply = (t, live) => {
      lastT = t;
      const r = tl.step(t);
      if (r.fired.length) setActs((a) => [...a, ...r.fired]);
      if (live) r.sounds.forEach(playCue);
      paint(t);
      return r.done;
    };
    reframe();
    window.addEventListener('resize', reframe);
    if (frozen != null) {
      // Fixture: pin every timed CSS animation to its exact pose at t (negative delay, paused).
      const s = root.current?.style;
      ANIMATED_ACTS.forEach((a) => s?.setProperty(`--el-${a}`, `${elapsedSince(a, frozen, reduced) ?? 0}ms`));
      apply(frozen, false);
      return () => window.removeEventListener('resize', reframe);
    }

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
      window.removeEventListener('resize', reframe);
      SKIP_EVENTS.forEach((n) => window.removeEventListener(n, skip, { capture: true }));
    };
  }, [started, reduced, frozen, root]);

  return { acts, skipping };
}