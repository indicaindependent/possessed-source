// Same building as HauntedHouse: low full-width roof with round window and chimney at 18%,
// 2x2 rooms (Attic, Library / Parlor, Kitchen) on dark siding, same palette, lights off.
const ROOMS = [
  { x: 14, y: 62, fill: '#3a2a3e', win: 'intro-win-attic' },
  { x: 204, y: 62, fill: '#1f3439', win: 'intro-win-library' },
  { x: 14, y: 172, fill: '#4a2a49', win: null },
  { x: 204, y: 172, fill: '#3b2f45', win: null },
];

export default function IntroScene() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-x-0 bottom-[6%] mx-auto w-[92%] max-w-3xl" aria-hidden="true">
      <circle className="intro-moon" cx="372" cy="18" r="13" fill="#FFF0D4" />
      <rect x="312" y="8" width="24" height="50" fill="#2b1d3a" />
      <polygon points="8,58 200,4 392,58" fill="#241830" />
      <circle className="intro-win-attic" cx="200" cy="40" r="10" fill="#FFAD42" />
      <rect x="0" y="58" width="400" height="230" fill="#2b1d3a" stroke="#1b1226" strokeWidth="6" />
      {ROOMS.map((r) => (
        <g key={`${r.x}-${r.y}`}>
          <rect x={r.x} y={r.y} width="182" height="104" rx="4" fill={r.fill} opacity="0.35" />
          <rect x={r.x} y={r.y + 96} width="182" height="8" fill="#4b2a1e" opacity="0.5" />
          {r.win && <rect className={r.win} x={r.x + 130} y={r.y + 10} width="34" height="30" rx="3" fill="#FFAD42" />}
        </g>
      ))}
      <rect x="144" y="186" width="34" height="30" rx="3" fill="#0d0b16" />
      <g className="intro-eyes" fill="#8DF3D1">
        <ellipse cx="155" cy="201" rx="3" ry="4" />
        <ellipse cx="167" cy="201" rx="3" ry="4" />
      </g>
      <rect x="0" y="286" width="400" height="12" fill="#1b1226" />
      <rect className="intro-fog" x="-200" y="262" width="800" height="40" rx="20" fill="#FFF0D4" opacity="0.08" />
    </svg>
  );
}