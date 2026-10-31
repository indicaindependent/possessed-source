import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function InviteBox({ code }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${window.location.pathname}?room=${code}`;
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-parchment/15 bg-plum/70 p-3 shadow-inner">
      <div className="min-w-0 flex-1 basis-40">
        <p className="text-[12px] font-black uppercase tracking-[0.12em] text-parchment/70">Room code</p>
        <p className="font-mono text-3xl font-bold tabular-nums tracking-[0.25em] text-pumpkin drop-shadow-[0_2px_8px_rgba(255,173,66,0.2)]">{code}</p>
      </div>
      <button type="button" onClick={copy}
        className="flex h-12 shrink-0 grow items-center justify-center gap-2 rounded-xl sm:grow-0 bg-parchment px-3 text-sm font-extrabold text-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pumpkin">
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Link copied' : 'Copy invite link'}</span>
      </button>
    </div>
  );
}