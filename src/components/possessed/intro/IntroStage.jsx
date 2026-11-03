import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import IntroStars from '@/components/possessed/intro/IntroStars';
import IntroFog from '@/components/possessed/intro/IntroFog';

// The real house in cinematic mode inside a camera wrapper; all motion comes from act classes and CSS vars.
export default function IntroStage() {
  return (
    <>
      <IntroStars />
      <div className="cine-moon moon-glow absolute right-[9%] top-[7%] h-10 w-10 rounded-full bg-parchment sm:h-14 sm:w-14" aria-hidden="true" />
      <div className="cine-stage-house absolute inset-x-0 top-[55%] mx-auto aspect-[1.15] w-full max-w-[min(100vw,calc(80dvh*1.15))] -translate-y-1/2 px-1">
        <div className="cine-cam relative h-full w-full">
          <HauntedHouse cinematic className="h-full" />
          <div className="pointer-events-none absolute left-[1%] top-[51%] h-[46%] w-[48%] overflow-hidden mix-blend-screen" aria-hidden="true">
            <div className="cine-beam h-full w-[45%]" />
          </div>
        </div>
      </div>
      <IntroFog />
      <div className="cine-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
    </>
  );
}