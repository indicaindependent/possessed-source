import { describe, it, expect, vi, beforeAll } from 'vitest';

// Minimal fake Web Audio: counts contexts, started looping sources and oscillators.
const counts = { contexts: 0, loops: 0, oscillators: 0 };
const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
const node = (extra = {}) => ({ connect: (n) => n, disconnect() {}, gain: param(), frequency: param(), delayTime: param(), Q: param(), ...extra });
class FakeCtx {
  constructor() { counts.contexts++; this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 8000; this.destination = node(); }
  resume() { this.state = 'running'; this.onstatechange?.(); return Promise.resolve(); }
  close() { return Promise.resolve(); }
  createGain() { return node(); }
  createBiquadFilter() { return node(); }
  createDelay() { return node(); }
  createBuffer(_c, len) { const d = new Float32Array(len); return { getChannelData: () => d }; }
  createBufferSource() { const s = node({ loop: false, start: () => { if (s.loop) counts.loops++; }, stop() {} }); return s; }
  createOscillator() { return node({ start: () => { counts.oscillators++; }, stop() {} }); }
}

let audio;
let intervalSpy;
beforeAll(async () => {
  globalThis.window = { AudioContext: FakeCtx };
  intervalSpy = vi.spyOn(globalThis, 'setInterval');
  audio = await import('@/lib/possessed/audio');
});

describe('audio start is idempotent', () => {
  it('unlockAudio twice + startAmbient twice yields exactly one running source', async () => {
    audio.unlockAudio();
    audio.unlockAudio();
    audio.startAmbient();
    audio.startAmbient();
    audio.attemptAutoplay();
    await Promise.resolve();
    expect(counts.contexts).toBe(1);
    expect(counts.loops).toBe(1); // one wind loop
    expect(counts.oscillators).toBe(1); // its single LFO; music voices are only scheduled on ticks
    expect(intervalSpy).toHaveBeenCalledTimes(1); // one music scheduler
    expect(audio.getAudioRunning()).toBe(true);
    clearInterval(globalThis.__possessedMusic.timer);
  });
});