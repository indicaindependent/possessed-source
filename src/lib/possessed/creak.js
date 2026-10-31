// Quiet wooden friction, synthesized locally and routed through the existing mute bus.
export default function creak(ctx, master) {
  const t = ctx.currentTime;
  const duration = 1.15;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    const seconds = i / ctx.sampleRate;
    const friction = 0.35 + 0.65 * Math.sin(seconds * 73) ** 2;
    samples[i] = (Math.random() * 2 - 1) * friction * 0.45;
  }
  const rub = ctx.createBufferSource();
  rub.buffer = buffer;
  const wood = ctx.createOscillator();
  wood.type = 'sawtooth';
  wood.frequency.setValueAtTime(137, t);
  wood.frequency.linearRampToValueAtTime(102, t + 0.36);
  wood.frequency.linearRampToValueAtTime(119, t + 0.58);
  wood.frequency.exponentialRampToValueAtTime(76, t + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 2.8;
  filter.frequency.setValueAtTime(540, t);
  filter.frequency.exponentialRampToValueAtTime(310, t + duration);
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, t);
  envelope.gain.exponentialRampToValueAtTime(0.07, t + 0.18);
  envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  rub.connect(filter);
  wood.connect(filter);
  filter.connect(envelope).connect(master);
  rub.onended = () => [rub, wood, filter, envelope].forEach((node) => node.disconnect());
  rub.start(t); wood.start(t);
  wood.stop(t + duration);
  return () => { rub.stop(); wood.stop(); };
}