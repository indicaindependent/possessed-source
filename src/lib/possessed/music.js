// Procedural soundtrack: a slow, slightly-off music-box waltz in D minor with an echo.
// Synthesized live (no audio files) and routed through the master gain, so mute silences it.
const BEAT = 0.75; // 80 bpm, 3 beats per bar
const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const hz = (n) => { const [, p, o] = /^([A-G][#b]?)(\d)$/.exec(n); return 440 * 2 ** ((NOTE[p] + (Number(o) + 1) * 12 - 69) / 12); };

// [melody [note, beats]...], bass root, two chord tones played on beats 2 and 3.
const BARS = [
  [[['A4', 1], ['D5', 1], ['F5', 1]], 'D3', ['F3', 'A3']],
  [[['E5', 2], ['D5', 1]], 'D3', ['F3', 'A3']],
  [[['C#5', 1], ['E5', 1], ['A4', 1]], 'A2', ['C#4', 'E4']],
  [[['D5', 3]], 'D3', ['F3', 'A3']],
  [[['A4', 1], ['D5', 1], ['F5', 1]], 'D3', ['F3', 'A3']],
  [[['G5', 2], ['F5', 1]], 'G2', ['Bb3', 'D4']],
  [[['E5', 1], ['C#5', 1], ['E5', 1]], 'A2', ['C#4', 'E4']],
  [[['D5', 3]], 'D3', ['F3', 'A3']],
  [[['F5', 1], ['E5', 1], ['D5', 1]], 'D3', ['F3', 'A3']],
  [[['Bb4', 2], ['A4', 1]], 'Bb2', ['D4', 'F4']],
  [[['G4', 1], ['Bb4', 1], ['E5', 1]], 'G2', ['Bb3', 'D4']],
  [[['A4', 3]], 'A2', ['C#4', 'E4']],
  [[['D5', 1], ['F5', 1], ['A5', 1]], 'D3', ['F3', 'A3']],
  [[['G#5', 2], ['A5', 1]], 'E3', ['G#3', 'B3']],
  [[['E5', 1], ['C#5', 1], ['A4', 1]], 'A2', ['C#4', 'E4']],
  [[['D5', 3]], 'D3', ['F3', 'A3']],
];

function voice(ctx, out, f, t, { type = 'sine', gain, attack = 0.005, decay }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + decay + 0.05);
}

// Music box: bright partials with slightly inharmonic overtones for the "old, haunted" feel.
function chime(ctx, out, f, t) {
  voice(ctx, out, f, t, { gain: 0.16, decay: 1.8 });
  voice(ctx, out, f * 2.01, t, { gain: 0.05, decay: 0.7 });
  voice(ctx, out, f * 3.97, t, { gain: 0.02, decay: 0.3 });
}

function playBar(ctx, out, [melody, bass, chord], t) {
  let at = t;
  for (const [n, beats] of melody) { chime(ctx, out, hz(n), at); at += beats * BEAT; }
  const root = hz(bass);
  voice(ctx, out, root, t, { type: 'triangle', gain: 0.13, attack: 0.04, decay: 3 * BEAT });
  voice(ctx, out, root * 2, t, { gain: 0.04, attack: 0.04, decay: 2 * BEAT }); // octave up so phone speakers carry the bass
  for (const b of [1, 2]) for (const c of chord) voice(ctx, out, hz(c), t + b * BEAT, { gain: 0.035, decay: 0.6 });
}

export function startMusic(ctx, master) {
  // Only one soundtrack may ever run; a leftover loop (e.g. after a code reload) would layer on top and sound faster.
  const prev = globalThis.__possessedMusic;
  if (prev) { clearInterval(prev.timer); prev.ctx.close().catch(() => {}); }
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 4); // gentle fade-in
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.42;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  bus.connect(master);
  bus.connect(delay).connect(wet).connect(master);
  delay.connect(feedback).connect(delay);

  let next = ctx.currentTime + 0.2;
  let bar = 0;
  const timer = setInterval(() => {
    if (ctx.state !== 'running') return;
    if (next < ctx.currentTime) next = ctx.currentTime + 0.05; // resumed after an interruption
    while (next < ctx.currentTime + 0.6) {
      playBar(ctx, bus, BARS[bar], next);
      if (state.intense) intensityLayer(ctx, bus, next);
      next += 3 * BEAT;
      bar = (bar + 1) % BARS.length;
    }
  }, 200);
  const state = { timer, ctx, bus, intense: false };
  globalThis.__possessedMusic = state;
}

// Final-10s layer: a ticking low pulse on every half beat under the waltz.
function intensityLayer(ctx, out, t) {
  for (let i = 0; i < 6; i++) {
    voice(ctx, out, 73.4, t + i * BEAT / 2, { type: 'triangle', gain: i % 2 ? 0.06 : 0.12, attack: 0.01, decay: 0.22 });
  }
}

const live = () => { const m = globalThis.__possessedMusic; return m && m.ctx.state === 'running' ? m : null; };

// Called with the same whole-second tick as sfx.softTick (10..1 in the final stretch, null otherwise).
export function musicFinalTick(second) {
  const m = globalThis.__possessedMusic;
  if (!m) return;
  m.intense = second != null && second <= 10;
  if (second != null && second <= 3 && live()) {
    const t = m.ctx.currentTime;
    const g = 0.18 + (3 - second) * 0.08; // swells toward zero
    voice(m.ctx, m.bus, 55, t, { type: 'sine', gain: g, attack: 0.03, decay: 0.3 });
    voice(m.ctx, m.bus, 50, t + 0.24, { type: 'sine', gain: g * 0.8, attack: 0.03, decay: 0.3 });
  }
}

// Caught/round end: cut the music tail, then fade the waltz back in.
export function musicTail() {
  const m = live();
  if (!m) return;
  m.intense = false;
  const t = m.ctx.currentTime;
  m.bus.gain.cancelScheduledValues(t);
  m.bus.gain.setValueAtTime(m.bus.gain.value || 0.0001, t);
  m.bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  m.bus.gain.setValueAtTime(0.0001, t + 2.5);
  m.bus.gain.exponentialRampToValueAtTime(0.55, t + 5);
}