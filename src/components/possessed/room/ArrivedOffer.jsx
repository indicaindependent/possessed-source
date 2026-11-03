import { Zap } from 'lucide-react';

// A real player matched while you practiced: one tap to go face them.
export default function ArrivedOffer({ onFace }) {
  return (
    <button type="button" onClick={onFace}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-pumpkin bg-pumpkin/15 px-3 py-2 font-display text-lg font-black text-pumpkin focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment">
      <Zap className="h-5 w-5 shrink-0" aria-hidden="true" /> A player arrived. Face them now
    </button>
  );
}