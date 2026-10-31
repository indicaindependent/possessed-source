export default function IconToggle({ icon: Icon, label, pressed, onClick, slashed = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      title={label}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-parchment/15 bg-plum/85 text-parchment shadow-sm transition hover:bg-plum active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pumpkin"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {slashed && <span className="absolute h-0.5 w-6 rotate-45 rounded bg-pumpkin" aria-hidden="true" />}
    </button>
  );
}