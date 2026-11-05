import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import GhostFace from '@/components/possessed/art/GhostFace';
import RevealTrail from '@/components/possessed/room/RevealTrail';
import useRevealPositions from '@/lib/possessed/useRevealPositions';
import { objectName } from '@/lib/possessed/layout';

const stamp = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
const label = (p) => `${stamp(p.fromMs)} to ${stamp(p.toMs)} ${objectName(p.object)}`;
export default function RevealPlayback({ result, reducedMotion }) {
  const root = useRef(null), points = useRevealPositions(root);
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion || systemReduced;
  const path = result.path, [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced || step >= path.length - 1) return undefined;
    const timer = setTimeout(() => setStep((s) => s + 1), 600);
    return () => clearTimeout(timer);
  }, [step, path.length, reduced]);
  const last = path[path.length - 1], current = path[reduced ? path.length - 1 : step];
  const point = points[current.object], finished = reduced || step === path.length - 1;
  return <>
    <div ref={root} className={`reveal-house calm pointer-events-none relative h-64 ${reduced ? 'reduce-motion' : ''}`}>
      <HauntedHouse decorative className="h-full" propStates={{ [path[0].object]: { revealStart: true }, ...(finished && result.outcome !== 'caught' ? { [last.object]: { revealStart: last.object === path[0].object, revealPulse: true } } : {}) }} />
      <RevealTrail path={path} points={points} step={step} reduced={reduced} />
      {points[path[0].object] && <span className="reveal-start absolute z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/20" style={{ left: `${points[path[0].object].x}%`, top: `${points[path[0].object].y}%` }} />}
      {point && <div className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
        {finished && result.outcome === 'caught' ? <GhostFace mood="oops" className="ghost-rise h-12 w-10" /> : <span className={`block h-8 w-8 rounded-full border-2 border-accent bg-accent/20 ${finished ? 'reveal-survived' : ''}`} />}
      </div>}
      {!reduced && point && <p className="absolute z-40 max-w-[90%] -translate-x-1/2 rounded-md bg-background/95 px-2 py-1 text-center text-xs font-bold text-primary" style={{ left: `${Math.max(35, Math.min(65, point.x))}%`, top: `${Math.min(86, point.y + 7)}%` }}>{label(current)}</p>}
    </div>
    {reduced && <ol className="space-y-1 text-xs text-foreground">{path.map((p, i) => <li key={i}><span className="mr-2 text-primary">{i + 1}.</span>{label(p)}</li>)}</ol>}
    <p className="sr-only">{path.map(label).join('. ')}. {result.outcome === 'caught' ? `Caught in the ${objectName(last.object)}.` : 'Survived.'}</p>
  </>;
}