import { Loader2 } from 'lucide-react';

// busy: this player's request is waiting for the server; the label never claims the outcome.
export default function BigButton({ children, onClick, pressed, tone = 'amber', disabled, busy = false, compact = false }) {
  const size = compact ? 'flex-col gap-0.5 px-1 text-sm sm:flex-row sm:gap-2 sm:text-base' : 'gap-2 px-4 text-lg';
  const tones = {
    amber: 'bg-pumpkin text-ink shadow-[0_5px_0_#b86f17] active:shadow-[0_1px_0_#b86f17]',
    mint: 'bg-spectral text-ink shadow-[0_5px_0_#4fb894] active:shadow-[0_1px_0_#4fb894]',
    ghost: 'border-2 border-parchment/30 text-parchment hover:bg-parchment/10',
  };
  return (
    <button
      type="button"
      onClick={busy ? undefined : onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-busy={busy || undefined}
      className={`flex h-14 w-full items-center justify-center rounded-xl font-display font-bold transition active:translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-50 ${busy ? 'opacity-80' : ''} ${size} ${tones[tone]}`}
    >
      {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}