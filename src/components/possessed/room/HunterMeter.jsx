import { Flashlight, FlashlightOff } from 'lucide-react';
import { secs } from '@/lib/possessed/format';

export default function HunterMeter({ charges, max, refill, regenMs }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${charges} of ${max} investigation charges`}>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (i < charges
          ? <Flashlight key={i} className="h-5 w-5 text-pumpkin" />
          : <FlashlightOff key={i} className="h-5 w-5 text-parchment/35" />))}
      </div>
      <span className="whitespace-nowrap text-sm font-extrabold text-parchment">{charges}/{max}<span className="hidden sm:inline"> charges</span></span>
      {refill != null && (
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-parchment/80">
          <span className="h-2 w-10 overflow-hidden rounded-full bg-parchment/15" aria-hidden="true">
            <span className="block h-full bg-pumpkin" style={{ width: `${(refill / regenMs) * 100}%` }} />
          </span>
          +1 in {secs(regenMs - refill)}s
        </span>
      )}
    </div>
  );
}