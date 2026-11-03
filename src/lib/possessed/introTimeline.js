// "The House Wakes": one clock, pure. The overlay steps it every frame; tests step it directly.
export const END_MS = 12000;
export const REDUCED_END_MS = 3000;

// [ms, act] — each act becomes an `act-<name>` class on the overlay root and stays on.
const CUES = [
  [0, 'stars'], [400, 'moon'], [1500, 'hint'], [1600, 'flash1'], [3000, 'warm'], [3400, 'rock'],
  [4200, 'eyes'], [5400, 'beam'], [6200, 'freeze'], [6800, 'shut'], [7400, 'beamoff'], [7900, 'reopen'], [8400, 'hold'],
  [9300, 'pull'], [9800, 'title'], [10600, 'tag'], [11600, 'out'],
];
// Reduced motion: three cross-faded stills; no push, no shake, no flash.
const REDUCED_CUES = [
  [0, 'stars'], [0, 'moon'], [0, 'still1'], [1000, 'still2'], [1000, 'warm'], [1000, 'eyes'],
  [1500, 'hint'], [2000, 'still3'], [2000, 'title'], [2000, 'tag'], [2600, 'out'],
];
const SOUNDS = [
  [0, 'wind'], [0, 'drone'], [1900, 'thunder'], [2500, 'wind'], [3400, 'creak'], [5000, 'wind'],
  [5400, 'sweep'], [6000, 'drone'], [7900, 'knock'], [8400, 'duck'], [9300, 'unduck'],
  [9800, 'thunder'], [9800, 'thump'], [9850, 'creak'], [10700, 'heartbeat'], [11300, 'heartbeat'],
];
const REDUCED_SOUNDS = [[0, 'wind'], [0, 'drone'], [1000, 'creak'], [2000, 'thump'], [2200, 'heartbeat']];

export const allActs = (reduced) => (reduced ? REDUCED_CUES : CUES).map((c) => c[1]);

export function createTimeline(reduced = false) {
  const cues = reduced ? REDUCED_CUES : CUES;
  const sounds = reduced ? REDUCED_SOUNDS : SOUNDS;
  const end = reduced ? REDUCED_END_MS : END_MS;
  let ci = 0, si = 0, skipped = false;
  return {
    end,
    step(t) {
      const fired = [], played = [];
      while (ci < cues.length && cues[ci][0] <= t) fired.push(cues[ci++][1]);
      while (si < sounds.length && sounds[si][0] <= t) played.push(sounds[si++][1]);
      return { fired, sounds: played, done: skipped || t >= end };
    },
    skip() {
      const fired = cues.slice(ci).map((c) => c[1]);
      ci = cues.length; si = sounds.length; skipped = true;
      return { fired, sounds: [], done: true };
    },
  };
}

const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
const clamp01 = (p) => Math.min(1, Math.max(0, p));
const FLASH = [0, 0.85, 0, 0.6, 0];
function flashAt(t, start) {
  const p = (t - start) / 240;
  if (p < 0 || p >= 1) return 0;
  const x = p * (FLASH.length - 1), i = Math.floor(x);
  return FLASH[i] + (FLASH[i + 1] - FLASH[i]) * (x - i);
}

// Continuous values: push (0 = whole house, 1 = framed on the Parlor), flash opacity, beam offset (% of its width).
export function introVars(t, reduced = false) {
  if (reduced) return { push: 0, flash: 0, beam: -200 };
  let push = 0;
  if (t >= 400 && t < 9300) push = ease(clamp01((t - 400) / 5000));
  else if (t >= 9300) push = 1 - ease(clamp01((t - 9300) / 1000));
  const flash = Math.max(flashAt(t, 1600), flashAt(t, 9800));
  const beam = t >= 5400 && t <= 7400 ? -100 + ((t - 5400) / 2000) * 330 : -200;
  return { push, flash, beam };
}

// Push-in target from measured boxes (viewport px; house = the camera element unscaled, origin top-left).
// Scale fits the Parlor with margin; translate centres it, clamped so the house never leaves an empty edge.
// Phones: Parlor ~88% of the width, centred at 52% height; the house may slide down (fog covers its edge).
export const framingOpts = (vw) => (vw < 768 ? { fill: 0.88, cy: 0.52, clampY: false } : {});
export function pushFraming({ vw, vh, house, parlor, max = 1.9, fill = 0.86, cy = 0.5, clampY = true }) {
  const scale = Math.min(max, (fill * vw) / parlor.w, (fill * vh) / parlor.h);
  const axis = (v, c, h0, hs, p0, ps, clamp) => {
    const want = v * c - h0 - (p0 + ps / 2 - h0) * scale;
    if (!clamp) return want;
    const a = -h0, b = v - h0 - hs * scale;
    return Math.min(Math.max(want, Math.min(a, b)), Math.max(a, b));
  };
  return {
    scale,
    tx: axis(vw, 0.5, house.x, house.w, parlor.x, parlor.w, true),
    ty: axis(vh, cy, house.y, house.h, parlor.y, parlor.h, clampY),
  };
}
export const camAt = (f, push) => ({ cam: 1 + (f.scale - 1) * push, tx: f.tx * push + 0, ty: f.ty * push + 0 });

// Animated acts and their elapsed time at t (ms since the cue), shared by the live run and the frozen fixture.
// The rocking loop is paused at 'freeze', so its elapsed time stops there.
export const ANIMATED_ACTS = ['stars', 'flash1', 'eyes', 'rock', 'reopen', 'pull', 'title', 'tag'];
const HOLDS = { rock: 'freeze' };
const cueAt = (act, reduced) => (reduced ? REDUCED_CUES : CUES).find((c) => c[1] === act)?.[0];
export function elapsedSince(act, t, reduced = false) {
  const at = cueAt(act, reduced);
  if (at == null || t < at) return null;
  const stop = HOLDS[act] && cueAt(HOLDS[act], reduced);
  return (stop != null && t >= stop ? stop : t) - at;
}

// The tap-to-enter gate only exists to unlock sound on a first visit; Replay never shows it.
export const needsGate = ({ replay = false, audioRunning = false }) => !replay && !audioRunning;