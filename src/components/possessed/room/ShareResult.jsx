import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import BigButton from '@/components/possessed/room/BigButton';

const trim = (ms) => String(Number((ms / 1000).toFixed(2)));

export default function ShareResult({ survivalMs }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(`I survived ${trim(survivalMs)} s as the Ghost in POSSESSED. Think you can find me? possessed.base44.app`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <BigButton compact tone="ghost" onClick={copy}>
      {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Copied!' : 'Share'}</span>
    </BigButton>
  );
}