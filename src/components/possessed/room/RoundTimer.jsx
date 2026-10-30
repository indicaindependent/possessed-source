import { secs } from '@/lib/possessed/format';

// Amber + a pulse on every second during the final 10 seconds.
export default function RoundTimer({ remainingMs, final }) {
  const whole = Math.ceil(remainingMs / 1000);
  return (
    <p className="ml-auto shrink-0 leading-none">
      <span
        key={final ? whole : 'calm'}
        className={`inline-block font-display text-2xl font-black tabular-nums sm:text-4xl ${final ? 'timer-pulse text-pumpkin' : 'text-parchment'}`}
      >
        {secs(remainingMs)}
      </span>
      <span className={`ml-1 text-sm font-bold ${final ? 'text-pumpkin' : 'text-parchment/70'}`}>s<span className="hidden sm:inline"> left</span></span>
    </p>
  );
}