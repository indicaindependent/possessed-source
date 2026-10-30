const STARS = [[8, 12], [18, 30], [27, 8], [41, 18], [56, 6], [63, 26], [77, 14], [88, 32], [93, 9], [12, 48], [84, 52], [34, 40]];

export default function NightSky() {
  return (
    <div className="night-sky pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {STARS.map(([x, y], i) => (
        <span key={i} className="absolute rounded-full bg-parchment" style={{ left: `${x}%`, top: `${y}%`, width: i % 3 ? 2 : 3, height: i % 3 ? 2 : 3, opacity: 0.55 }} />
      ))}
      <div className="moon-glow absolute right-[3%] top-[1.5%] h-12 w-12 rounded-full bg-parchment sm:right-[8%] sm:top-[6%] sm:h-20 sm:w-20 md:h-28 md:w-28">
        <span className="absolute left-[22%] top-[30%] h-4 w-4 rounded-full bg-[#eadcbc]" />
        <span className="absolute left-[55%] top-[55%] h-3 w-3 rounded-full bg-[#eadcbc]" />
      </div>
      <svg className="absolute bottom-0 left-0 h-[22vh] w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0 70 Q60 40 120 62 T240 58 T400 50 V100 H0 Z" fill="#1d1630" />
        <path d="M0 85 Q80 66 170 80 T400 74 V100 H0 Z" fill="#120f1c" />
      </svg>
      <div className="fog absolute bottom-[2vh] left-0 h-32 w-[200%] opacity-40"
        style={{ background: 'radial-gradient(ellipse 30% 60% at 25% 60%, rgba(255,240,212,.35), transparent 70%), radial-gradient(ellipse 30% 50% at 75% 50%, rgba(141,243,209,.18), transparent 70%)' }} />
      <div className="fog-slow absolute bottom-0 left-0 h-24 w-[200%] opacity-50"
        style={{ background: 'radial-gradient(ellipse 25% 70% at 40% 80%, rgba(255,240,212,.3), transparent 70%), radial-gradient(ellipse 25% 70% at 90% 80%, rgba(255,240,212,.25), transparent 70%)' }} />
    </div>
  );
}