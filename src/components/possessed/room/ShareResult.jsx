import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import BigButton from '@/components/possessed/room/BigButton';
import CopyFallback from '@/components/possessed/room/CopyFallback';
import copyText from '@/lib/possessed/copyText';

// Copies the result; if the clipboard is blocked, shows the text in a selectable field.
export default function ShareResult({ text }) {
  const [copied, setCopied] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const copy = async () => {
    if (!(await copyText(text))) { setBlocked(true); return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <BigButton compact tone="ghost" onClick={copy}>
        {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Copied!' : 'Share'}</span>
      </BigButton>
      {blocked && <CopyFallback text={text} />}
    </div>
  );
}