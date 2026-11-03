import { Home } from 'lucide-react';

export default function PracticeButton({ onPractice, disabled }) {
  return (
    <div className="space-y-1">
      <button type="button" onClick={onPractice} disabled={disabled}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-spectral px-4 font-display text-xl font-black tracking-[0.01em] text-ink shadow-[var(--shadow-cta-mint)] transition active:translate-y-1 active:shadow-[var(--shadow-cta-mint-active)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-60">
        <Home className="h-5 w-5" aria-hidden="true" /> Play the House now
      </button>
      <p className="text-center text-[13px] font-bold text-parchment/75">Practice against the haunted house itself. No waiting.</p>
    </div>
  );
}