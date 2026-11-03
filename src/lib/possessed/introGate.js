export const INTRO_KEY = 'possessed.introSeen';

// 'full' | 'fade' | 'none'. Only the plain home screen, once per device.
export function introMode({ storage, search = '', pathname = '/', reducedMotion = false }) {
  if (pathname !== '/') return 'none';
  if (new URLSearchParams(search).get('room')) return 'none';
  if (storage?.getItem(INTRO_KEY)) return 'none';
  return reducedMotion ? 'fade' : 'full';
}

export function markIntroSeen(storage) {
  storage?.setItem(INTRO_KEY, '1');
}