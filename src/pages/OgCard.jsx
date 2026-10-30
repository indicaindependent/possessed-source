import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useSize } from '@/hooks/use-size';
import ShareCard from '@/components/possessed/og/ShareCard';

// Utility route. Normal visits get a responsive, scaled preview clearly labelled as NOT the game.
// /og-card?export=1 renders the exact 1200x630 card alone, for capturing a new share image.
export default function OgCard() {
  const box = useRef(null);
  const size = useSize(box);
  if (new URLSearchParams(window.location.search).get('export') === '1') return <ShareCard />;
  const scale = size ? Math.min(1, size.width / 1200) : 0;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-parchment sm:text-3xl">Share image preview, not the game</h1>
          <p className="text-sm font-medium text-parchment/80">This is how links to POSSESSED look when shared (1200 × 630).</p>
        </div>
        <Link to="/" className="flex h-12 items-center gap-2 rounded-xl bg-pumpkin px-5 font-display text-lg font-bold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment">
          <Play className="h-5 w-5" aria-hidden="true" /> Play POSSESSED
        </Link>
      </header>
      <div ref={box} className="w-full overflow-hidden rounded-xl border border-parchment/15" style={{ height: 630 * scale }}>
        {scale > 0 && <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}><ShareCard /></div>}
      </div>
    </main>
  );
}