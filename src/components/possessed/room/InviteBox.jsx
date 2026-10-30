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
    <div className="flex items-center gap-3 rounded-xl bg-plum/60 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-parchment/70">Room code</p>
        <p className="font-mono text-3xl font-bold tracking-[0.25em] text-pumpkin">{code}</p>
      </div>
      <button type="button" onClick={copy}
        className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-parchment px-3 text-sm font-extrabold text-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pumpkin">
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Link copied' : 'Copy invite link'}</span>
      </button>
    </div>
  );
}