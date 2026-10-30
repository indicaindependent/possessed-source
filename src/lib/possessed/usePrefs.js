import { useEffect, useState } from 'react';
import { setAudioMuted, unlockAudio } from '@/lib/possessed/audio';

const systemReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export default function usePrefs() {
  const [muted, setMuted] = useState(() => localStorage.getItem('possessed:muted') === '1');
  const [reducedMotion, setReduced] = useState(() => {
    const saved = localStorage.getItem('possessed:motion');
    return saved ? saved === 'reduced' : systemReduced();
  });

  useEffect(() => {
    setAudioMuted(muted);
    localStorage.setItem('possessed:muted', muted ? '1' : '0');
  }, [muted]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    localStorage.setItem('possessed:motion', reducedMotion ? 'reduced' : 'full');
  }, [reducedMotion]);

  return {
    muted,
    reducedMotion,
    toggleMute: () => { unlockAudio(); setMuted((m) => !m); },
    toggleMotion: () => setReduced((r) => !r),
  };
}