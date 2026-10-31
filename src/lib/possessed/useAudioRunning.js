import { useEffect, useState } from 'react';
import { getAudioRunning, subscribeAudio } from '@/lib/possessed/audio';

// True once the audio context is actually playing; false while a browser autoplay
// block is still in effect (the speaker button then asks for one tap).
export default function useAudioRunning() {
  const [running, setRunning] = useState(getAudioRunning);
  useEffect(() => subscribeAudio(setRunning), []);
  return running;
}