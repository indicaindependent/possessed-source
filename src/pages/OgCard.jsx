import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import NightSky from '@/components/possessed/house/NightSky';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';

const STATES = { grandfather_clock: { possessed: true } };

// Fixed 1200x630 composition used to produce the social share image.
// /og-card?capture=1 renders it to a PNG and uploads it, then shows the URL.
export default function OgCard() {
  const ref = useRef(null);
  const [url, setUrl] = useState(null);
  const capture = new URLSearchParams(window.location.search).get('capture') === '1';

  useEffect(() => {
    if (!capture) return;
    const t = setTimeout(async () => {
      const canvas = await html2canvas(ref.current, { width: 1200, height: 630, scale: 1, backgroundColor: '#151221', useCORS: true });
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], 'possessed-share.png', { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setUrl(file_url);
    }, 1500);
    return () => clearTimeout(t);
  }, [capture]);

  return (
    <div>
      <div ref={ref} className="relative h-[630px] w-[1200px] overflow-hidden bg-ink">
        <NightSky />
        <div className="relative z-10 flex h-full items-center gap-8 px-14">
          <div className="w-[420px] shrink-0">
            <h1 className="font-display text-[84px] font-black leading-none text-parchment">Possessed</h1>
            <p className="mt-4 font-display text-3xl font-bold italic text-spectral">“One of these things is you.”</p>
            <p className="mt-6 text-xl font-extrabold text-parchment/85">A two-player haunted house game. Hide as the Ghost, hunt as the Hunter.</p>
          </div>
          <HauntedHouse className="h-[540px]" propStates={STATES} />
        </div>
      </div>
      {url && (
        <div className="space-y-2 bg-parchment p-4 text-ink">
          <p className="break-all font-mono text-2xl font-bold">{url}</p>
          <img src={url} alt="Uploaded share preview" className="w-[600px]" />
        </div>
      )}
    </div>
  );
}