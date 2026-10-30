import NightSky from '@/components/possessed/house/NightSky';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';

const STATES = { grandfather_clock: { possessed: true } };

// Fixed 1200x630 composition the social share image was produced from.
export default function OgCard() {
  return (
    <div className="relative isolate h-[630px] w-[1200px] overflow-hidden bg-ink">
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
  );
}