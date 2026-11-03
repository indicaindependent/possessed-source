import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// After 8 s with no answer, say so plainly and offer Retry / Leave.
export default function Connecting({ code, onCancel, onRetry }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t); }, []);
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center" role="status">
      {!slow && <Loader2 className="h-10 w-10 animate-spin text-spectral" aria-hidden="true" />}
      <p className="font-display text-2xl font-bold text-parchment">{slow ? 'The house is not answering.' : 'Opening the haunt…'}</p>
      <p className="font-mono text-xl font-bold tracking-[0.25em] text-pumpkin">{code}</p>
      {slow && <p className="max-w-xs text-sm font-bold text-parchment/80">Check your connection, then try again.</p>}
      <div className="flex gap-3">
        {slow && (
          <button type="button" onClick={onRetry} className="h-12 rounded-xl bg-pumpkin px-5 font-display font-black text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment">
            Retry
          </button>
        )}
        <button type="button" onClick={onCancel} className="h-12 rounded-xl px-5 font-bold text-parchment/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pumpkin">
          {slow ? 'Leave' : 'Cancel'}
        </button>
      </div>
    </main>
  );
}