export default function BigButton({ children, onClick, pressed, tone = 'amber', disabled }) {
  const tones = {
    amber: 'bg-pumpkin text-ink shadow-[0_5px_0_#b86f17] active:shadow-[0_1px_0_#b86f17]',
    mint: 'bg-spectral text-ink shadow-[0_5px_0_#4fb894] active:shadow-[0_1px_0_#4fb894]',
    ghost: 'border-2 border-parchment/30 text-parchment hover:bg-parchment/10',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl px-4 font-display text-lg font-bold transition active:translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}