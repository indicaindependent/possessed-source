import { useEffect, useState } from 'react';

const TARGETS = 'button:not([aria-hidden="true"]), a[href], input';

// DEV-only measurement readout (?probe=1): viewport, horizontal overflow, smallest visible tap target,
// props fully on screen and whether the phase's primary button is visible.
function measure() {
  const vw = window.innerWidth; const vh = window.innerHeight;
  const doc = document.documentElement;
  const visible = (r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  let min = Infinity; let small = 0;
  for (const el of document.querySelectorAll(TARGETS)) {
    if (el.closest('[data-probe]')) continue;
    const r = el.getBoundingClientRect();
    if (!visible(r)) continue;
    const m = Math.min(r.width, r.height);
    min = Math.min(min, m);
    if (m < 44) small += 1;
  }
  const props = [...document.querySelectorAll('.prop-btn')].map((el) => el.getBoundingClientRect());
  const inView = props.filter((r) => r.top >= 0 && r.bottom <= vh + 0.5 && r.left >= 0 && r.right <= vw + 0.5).length;
  const propMin = props.length ? Math.min(...props.map((r) => Math.min(r.width, r.height))) : null;
  const primary = document.querySelector('[data-primary] button');
  const pr = primary?.getBoundingClientRect();
  return {
    vp: `${vw}x${vh}`, overflowX: doc.scrollWidth - doc.clientWidth, minTarget: Math.round(min), under44: small,
    props: `${inView}/${props.length}`, propMin: propMin && Math.round(propMin),
    primary: pr ? (pr.top >= 0 && pr.bottom <= vh ? `visible y${Math.round(pr.top)}` : `offscreen y${Math.round(pr.top)}`) : 'n/a',
  };
}

export default function LayoutProbe() {
  const [m, setM] = useState(null);
  useEffect(() => {
    const run = () => setM(measure());
    const t = setTimeout(run, 1200);
    window.addEventListener('resize', run);
    return () => { clearTimeout(t); window.removeEventListener('resize', run); };
  }, []);
  if (!m) return null;
  return (
    <pre data-probe className="pointer-events-none fixed bottom-1 left-1 z-[100] whitespace-pre-wrap rounded bg-[#000]/80 px-1.5 py-1 font-mono text-[10px] leading-tight text-[#7CFC00]">
      {Object.entries(m).map(([k, v]) => `${k}:${v}`).join(' ')}
    </pre>
  );
}