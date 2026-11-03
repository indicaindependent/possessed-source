const TITLE = 'POSSESSED';
const TAG = 'One of these things is you.';

export default function IntroTitle() {
  return (
    <div className="cine-title-wrap pointer-events-none absolute inset-x-0 top-[14%] px-4 text-center">
      <p className="cine-title title-emboss font-display font-black tracking-[-0.01em] text-parchment">
        {TITLE.split('').map((c, i) => (
          <span key={i} className="intro-letter inline-block" style={{ animationDelay: `${i * 70}ms` }}>{c}</span>
        ))}
      </p>
      <p className="mt-2 font-body text-base font-extrabold italic tracking-[0.015em] text-spectral sm:text-xl">
        {TAG.split('').map((c, i) => (
          <span key={i} className="intro-char" style={{ animationDelay: `${i * 25}ms` }}>{c}</span>
        ))}
      </p>
    </div>
  );
}