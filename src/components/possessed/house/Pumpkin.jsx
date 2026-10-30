export default function Pumpkin({ className = '' }) {
  return (
    <svg viewBox="0 0 60 50" className={className} aria-hidden="true">
      <path d="M30 8 Q32 2 37 3" stroke="#3E6D6A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="18" cy="30" rx="13" ry="17" fill="#E8892B" />
      <ellipse cx="42" cy="30" rx="13" ry="17" fill="#E8892B" />
      <ellipse cx="30" cy="30" rx="13" ry="19" fill="#FFAD42" />
      <g className="flicker">
        <path d="M20 26 L25 21 L27 28 Z M40 26 L35 21 L33 28 Z" fill="#FFF0D4" />
        <path d="M19 35 Q30 44 41 35 L37 37 L34 34 L30 38 L26 34 L23 37 Z" fill="#FFF0D4" />
      </g>
    </svg>
  );
}