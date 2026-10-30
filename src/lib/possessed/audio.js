// Tiny Web Audio synth. The context is created only inside a user gesture (unlockAudio).
let ctx = null;
let master = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem('possessed:muted') === '1';

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function setAudioMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.6;
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
  knock: play(() => { tone(150, { dur: 0.14, gain: 0.35, to: 70 }); tone(150, { at: 0.17, dur: 0.14, gain: 0.3, to: 70 }); }),
  chime: play(() => { tone(1046, { dur: 1.2, gain: 0.14 }); tone(1568, { at: 0.02, dur: 1, gain: 0.07 }); tone(784, { at: 0.2, dur: 1.1, gain: 0.1 }); }),
  caught: play(() => { [523, 659, 784, 1046].forEach((f, i) => tone(f, { at: i * 0.08, dur: 0.35, type: 'triangle', gain: 0.18 })); tone(1568, { at: 0.36, dur: 0.8, gain: 0.1 }); }),
  survived: play(() => { tone(330, { dur: 1.1, to: 660, gain: 0.14, attack: 0.15 }); tone(495, { at: 0.25, dur: 1, to: 880, gain: 0.08, attack: 0.15 }); }),
  move: play(() => tone(520, { dur: 0.3, to: 980, gain: 0.08 })),
  ripple: play(() => tone(880, { dur: 0.4, to: 440, gain: 0.06 })),
  searched: play(() => noise({ dur: 0.2, from: 900, to: 500, gain: 0.06 })),
  go: play(() => { tone(784, { dur: 0.25, gain: 0.14 }); tone(1175, { at: 0.1, dur: 0.4, gain: 0.12 }); }),
  tick: play(() => tone(660, { dur: 0.09, gain: 0.07, type: 'square' })),
};