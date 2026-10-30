import { Loader2 } from 'lucide-react';

export default function Connecting({ code, onCancel }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center" role="status">
      <Loader2 className="h-10 w-10 animate-spin text-spectral" aria-hidden="true" />
      <p className="font-display text-2xl font-bold text-parchment">Opening the haunt…</p>
      <p className="font-mono text-xl font-bold tracking-[0.25em] text-pumpkin">{code}</p>
      <button type="button" onClick={onCancel} className="h-12 rounded-xl px-5 font-bold text-parchment/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pumpkin">
        Cancel
      </button>
    </main>
  );
}