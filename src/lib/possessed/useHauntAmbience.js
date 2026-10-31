import { useEffect, useRef } from 'react';
import { playAmbientCreak } from '@/lib/possessed/audio';

export default function useHauntAmbience(enabled) {
  const houseRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    let timer;
    let stopSound;
    let inView = false;
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
    if (houseRef.current) observer.observe(houseRef.current);
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (inView && document.visibilityState === 'visible') stopSound = playAmbientCreak();
        schedule();
      }, 18000 + Math.random() * 14000);
    };
    const silenceHidden = () => { if (document.hidden) stopSound?.(); };
    document.addEventListener('visibilitychange', silenceHidden);
    schedule();
    return () => {
      clearTimeout(timer);
      stopSound?.();
      observer.disconnect();
      document.removeEventListener('visibilitychange', silenceHidden);
    };
  }, [enabled]);
  return houseRef;
}