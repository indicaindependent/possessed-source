// Two fog bands of soft gradient ellipses (pre-blurred in the fill, no CSS filter), drifting via translateX.
function Band({ className, y, op }) {
  return (
    <svg className={`absolute inset-x-0 h-[30%] w-[200%] ${className}`} style={{ top: y }} viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id={`fog-${className}`}>
          <stop offset="0%" stopColor="#FFF0D4" stopOpacity={op} />
          <stop offset="100%" stopColor="#FFF0D4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[10, 45, 80, 115, 150, 185].map((x) => <ellipse key={x} cx={x} cy="15" rx="28" ry="12" fill={`url(#fog-${className})`} />)}
    </svg>
  );
}

export default function IntroFog() {
  return (
    <div className="cine-fog pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="cine-ground absolute inset-x-0 bottom-0 h-[26%] md:hidden" />
      <Band className="cine-fog-a" y="62%" op="0.12" />
      <Band className="cine-fog-b" y="74%" op="0.2" />
    </div>
  );
}