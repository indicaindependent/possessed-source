// Same building as HauntedHouse: low full-width roof with round window and chimney at ~80%,
// 2x2 near-square rooms (Attic, Library / Parlor, Kitchen) on dark siding, same palette, lights off.
// Windows sit where each real room's candle glow is (upper right).
const ROOMS = [
  { x: 14, y: 64, fill: '#3a2a3e', win: 'intro-win-attic' },
  { x: 204, y: 64, fill: '#1f3439', win: 'intro-win-library' },
  { x: 14, y: 232, fill: '#4a2a49', win: null },
  { x: 204, y: 232, fill: '#3b2f45', win: null },
];

export default function IntroScene() {
  return (
    <svg viewBox="0 0 400 420" className="absolute inset-x-0 bottom-[4%] mx-auto h-auto max-h-[78dvh] w-[92%] max-w-3xl" aria-hidden="true">
      <circle className="intro-moon" cx="372" cy="18" r="13" fill="#FFF0D4" />
      <rect x="312" y="10" width="24" height="48" fill="#2b1d3a" />
      <polygon points="8,58 200,8 392,58" fill="#241830" />
      <circle className="intro-win-attic" cx="200" cy="42" r="10" fill="#FFAD42" />
      <rect x="0" y="58" width="400" height="344" fill="#2b1d3a" stroke="#1b1226" strokeWidth="6" />
      {ROOMS.map((r) => (
        <g key={`${r.x}-${r.y}`}>
          <rect x={r.x} y={r.y} width="182" height="160" rx="4" fill={r.fill} opacity="0.35" />
          <rect x={r.x} y={r.y + 152} width="182" height="8" fill="#4b2a1e" opacity="0.5" />
          {r.win && <rect className={r.win} x={r.x + 124} y={r.y + 14} width="36" height="32" rx="3" fill="#FFAD42" />}
        </g>
      ))}
      <rect x="138" y="246" width="36" height="32" rx="3" fill="#0d0b16" />
      <g className="intro-eyes" fill="#8DF3D1">
        <ellipse cx="150" cy="262" rx="3" ry="4" />
        <ellipse cx="162" cy="262" rx="3" ry="4" />
      </g>
      <rect x="0" y="400" width="400" height="14" fill="#1b1226" />
      <rect className="intro-fog" x="-20" y="384" width="440" height="36" rx="18" fill="#FFF0D4" opacity="0.08" />
    </svg>
  );
}