import { useMemo } from 'react';

// One SVG; 24 stars under 480px wide, 60 above, deterministic positions, staggered fade-in.
export default function IntroStars() {
  const stars = useMemo(() => {
    const n = window.innerWidth < 480 ? 24 : 60;
    let s = 17;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    return Array.from({ length: n }, () => ({ x: r() * 100, y: r() * 55, rad: 0.12 + r() * 0.22, d: Math.round(r() * 1400) }));
  }, []);
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {stars.map((st, i) => (
        <circle key={i} className="intro-star" cx={st.x} cy={st.y} r={st.rad} fill="#FFF0D4" style={{ animationDelay: `${st.d}ms` }} />
      ))}
    </svg>
  );
}