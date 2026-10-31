import { startMusic } from '@/lib/possessed/music';
import creak from '@/lib/possessed/creak';

// Tiny Web Audio synth. Autoplay is attempted on load; browsers that block it (Safari on iPhone)
// leave the context suspended, so the home screen's speaker button finishes the job on first tap.
let ctx = null;
let master = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem('possessed:muted') === '1';
let running = false;
const listeners = new Set();

export const getAudioRunning = () => running;
export function subscribeAudio(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function setRunning(v) {
  if (v === running) return;
  running = v;
  listeners.forEach((fn) => fn(v));
}

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  // iPhone: play as game audio even when the ring/silent switch is on (Safari 17+).
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.6;
  master.connect(ctx.destination);
  ctx.onstatechange = () => setRunning(ctx.state === 'running');
  startWind();
  startMusic(ctx, master);
  return ctx;
}

// Starts sound without a gesture: allowed on most desktops and Android, blocked (left
// suspended) on iPhone until unlockAudio runs inside a real tap.
export function attemptAutoplay() {
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'running') { setRunning(true); return; }
  Promise.resolve(c.resume()).then(() => setRunning(c.state === 'running')).catch(() => {});
}

// Must be called from a real activation gesture (click / touchend / pointerup / keydown);
// phones do not count pointerdown on touch, so the audio would stay locked.
export function unlockAudio() {
  const c = ensureContext();
  if (!c) return;
  // 'suspended' (autoplay lock) or 'interrupted' (iOS after a call or backgrounding).
  if (c.state === 'running') setRunning(true);
  else c.resume().then(() => setRunning(c.state === 'running')).catch(() => {});
}

// Very quiet looping wind under everything; goes through master, so mute silences it too.
function startWind() {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; data[i] = last * 3.5; }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 900; // phone speakers can't reproduce the old 420 Hz rumble
  const g = ctx.createGain();
  g.gain.value = 0.06;
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.value = 0.09;
  depth.gain.value = 0.035;
  lfo.connect(depth).connect(g.gain);
  src.connect(f).connect(g).connect(master);
  src.start();
  lfo.start();
}

export function setAudioMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.6;
}

// Decorative only: never unlocks audio or bypasses the player's sound preference.
export function playAmbientCreak() {
  if (ctx && !muted && ctx.state === 'running') return creak(ctx, master);
}

function tone(freq, { at = 0, dur = 0.3, type = 'sine', gain = 0.2, to = null, attack = 0.01 } = {}) {
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise({ at = 0, dur = 0.3, from = 1200, to = 300, gain = 0.1 }) {
  const t0 = ctx.currentTime + at;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

const play = (fn) => () => { if (ctx && !muted && ctx.state === 'running') fn(); };

export const sfx = {
  investigate: play(() => noise({ dur: 0.28, from: 1400, to: 400, gain: 0.1 })),
  knock: play(() => [0, 0.17].forEach((at) => { tone(240, { at, dur: 0.14, gain: 0.3, to: 110, type: 'triangle' }); noise({ at, dur: 0.06, from: 2200, to: 900, gain: 0.12 }); })),
  chime: play(() => { tone(1046, { dur: 1.2, gain: 0.14 }); tone(1568, { at: 0.02, dur: 1, gain: 0.07 }); tone(784, { at: 0.2, dur: 1.1, gain: 0.1 }); }),
  caught: play(() => { [523, 659, 784, 1046].forEach((f, i) => tone(f, { at: i * 0.08, dur: 0.35, type: 'triangle', gain: 0.18 })); tone(1568, { at: 0.36, dur: 0.8, gain: 0.1 }); }),
  survived: play(() => { tone(330, { dur: 1.1, to: 660, gain: 0.14, attack: 0.15 }); tone(495, { at: 0.25, dur: 1, to: 880, gain: 0.08, attack: 0.15 }); }),
  move: play(() => tone(520, { dur: 0.3, to: 980, gain: 0.08 })),
  ripple: play(() => tone(880, { dur: 0.4, to: 440, gain: 0.06 })),
  searched: play(() => noise({ dur: 0.2, from: 900, to: 500, gain: 0.06 })),
  go: play(() => { tone(784, { dur: 0.25, gain: 0.14 }); tone(1175, { at: 0.1, dur: 0.4, gain: 0.12 }); }),
  heartbeat: play(() => [[0, 0.4], [0.24, 0.32]].forEach(([at, gain]) => { tone(62, { at, dur: 0.18, gain, to: 45 }); tone(130, { at, dur: 0.14, gain: gain * 0.6, to: 90, type: 'triangle' }); })),
  softTick: play(() => tone(1320, { dur: 0.06, gain: 0.035 })),
  tick: play(() => tone(660, { dur: 0.09, gain: 0.07, type: 'square' })),
};