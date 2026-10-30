import { Check } from 'lucide-react';
import { objectName } from '@/lib/possessed/layout';
import { secs } from '@/lib/possessed/format';

export default function GhostMeter({ objectId, readyIn, cooldownMs }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-extrabold text-parchment">Inside: {objectName(objectId)}</span>
      {readyIn > 0 ? (
        <span className="flex items-center gap-1.5 text-[13px] font-bold text-parchment/80">
          <span className="h-2 w-10 overflow-hidden rounded-full bg-parchment/15" aria-hidden="true">
            <span className="block h-full bg-spectral" style={{ width: `${(1 - readyIn / cooldownMs) * 100}%` }} />
          </span>
          Move in {secs(readyIn)}s
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded-full bg-spectral/15 px-2 py-0.5 text-[13px] font-extrabold text-spectral">
          <Check className="h-4 w-4" aria-hidden="true" /> Move ready
        </span>
      )}
    </div>
  );
}