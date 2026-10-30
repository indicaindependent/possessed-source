export function RockingChair() {
  return (
    <g>
      <ellipse cx="50" cy="95" rx="34" ry="3" fill="#000" opacity=".3" />
      <path d="M12 84 Q50 101 88 84" fill="none" stroke="#9A5E35" strokeWidth="5" strokeLinecap="round" />
      <path d="M31 89 L34 62 M69 89 L66 62" stroke="#6B3F2A" strokeWidth="5" strokeLinecap="round" />
      <path d="M32 62 L27 14 M68 62 L73 14" stroke="#6B3F2A" strokeWidth="5" strokeLinecap="round" />
      <path d="M25 16 Q50 3 75 16" fill="none" stroke="#B5743F" strokeWidth="7" strokeLinecap="round" />
      <path d="M40 20 L41 56 M50 16 L50 56 M60 20 L59 56" stroke="#9A5E35" strokeWidth="4" strokeLinecap="round" />
      <path d="M18 46 Q27 40 36 46 M64 46 Q73 40 82 46" fill="none" stroke="#B5743F" strokeWidth="5" strokeLinecap="round" />
      <rect x="26" y="54" width="48" height="10" rx="5" fill="#8F3F5C" />
      <path d="M30 58 H70" stroke="#FFAD42" strokeWidth="1.2" strokeDasharray="2 3" opacity=".7" />
    </g>
  );
}

export function GrandfatherClock() {
  return (
    <g>
      <ellipse cx="50" cy="95" rx="22" ry="3" fill="#000" opacity=".3" />
      <path d="M31 24 Q50 2 69 24 Z" fill="#4B2A1E" />
      <circle cx="50" cy="12" r="2.5" fill="#C9913D" />
      <rect x="31" y="22" width="38" height="31" rx="3" fill="#6B3F2A" />
      <circle cx="50" cy="37.5" r="11.5" fill="#FFF0D4" stroke="#C9913D" strokeWidth="2.5" />
      <path d="M50 37.5 L50 29.5 M50 37.5 L56 40" stroke="#151221" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="35" y="53" width="30" height="34" fill="#4B2A1E" />
      <rect x="41" y="56" width="18" height="27" rx="9" fill="#241830" />
      <g className="pendulum">
        <line x1="50" y1="56" x2="50" y2="74" stroke="#C9913D" strokeWidth="1.6" />
        <circle cx="50" cy="76" r="4.5" fill="#FFAD42" />
      </g>
      <rect x="29" y="87" width="42" height="7" rx="2" fill="#6B3F2A" />
    </g>
  );
}

export function Portrait() {
  return (
    <g>
      <path d="M36 14 L50 4 L64 14" stroke="#C9913D" fill="none" strokeWidth="1.6" />
      <rect x="21" y="13" width="58" height="74" rx="5" fill="#C9913D" />
      <rect x="26" y="18" width="48" height="64" rx="3" fill="#7A5A1E" />
      <ellipse cx="50" cy="50" rx="20" ry="27" fill="#30213F" />
      <path d="M31 76 Q50 54 69 76 Z" fill="#151221" />
      <circle cx="50" cy="47" r="11" fill="#151221" />
      <path d="M40 42 L42 29 L48 37 Z M60 42 L58 29 L52 37 Z" fill="#151221" />
      <g className="portrait-eyes">
        <g className="blink">
          <ellipse cx="45.5" cy="46.5" rx="2.3" ry="2.8" fill="#FFAD42" />
          <ellipse cx="54.5" cy="46.5" rx="2.3" ry="2.8" fill="#FFAD42" />
        </g>
      </g>
      <path d="M43 61 Q50 66 57 61 Q50 70 43 61 Z" fill="#FFF0D4" opacity=".9" />
      <circle cx="21" cy="13" r="3" fill="#FFAD42" /><circle cx="79" cy="13" r="3" fill="#FFAD42" />
      <circle cx="21" cy="87" r="3" fill="#FFAD42" /><circle cx="79" cy="87" r="3" fill="#FFAD42" />
    </g>
  );
}