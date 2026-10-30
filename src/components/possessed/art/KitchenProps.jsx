export function Cauldron() {
  return (
    <g>
      <g className="flicker">
        <path d="M36 95 Q40 82 45 89 Q50 72 55 89 Q60 82 64 95 Z" fill="#FFAD42" />
        <path d="M44 95 Q47 86 50 90 Q53 86 56 95 Z" fill="#FFF0D4" opacity=".8" />
      </g>
      <path d="M26 82 L22 94 M74 82 L78 94" stroke="#1E1A2B" strokeWidth="5" strokeLinecap="round" />
      <path d="M17 52 Q15 90 50 90 Q85 90 83 52 Z" fill="#1E1A2B" />
      <path d="M24 60 Q24 80 38 85" stroke="#4a4160" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="52" rx="35" ry="8.5" fill="#2E2840" />
      <ellipse cx="50" cy="52" rx="29.5" ry="5.5" fill="#8DF3D1" />
      <circle className="bubble" cx="40" cy="49" r="3.2" fill="#8DF3D1" />
      <circle className="bubble b2" cx="56" cy="48" r="2.6" fill="#8DF3D1" />
      <circle className="bubble b3" cx="48" cy="50" r="2" fill="#c8fff0" />
    </g>
  );
}

export function Cupboard() {
  return (
    <g>
      <ellipse cx="50" cy="96" rx="32" ry="3" fill="#000" opacity=".3" />
      <rect x="19" y="6" width="62" height="8" rx="2" fill="#5A3324" />
      <rect x="22" y="13" width="56" height="79" fill="#7A4A30" />
      <rect x="26" y="17" width="22" height="31" rx="1" fill="#241830" />
      <rect x="52" y="17" width="22" height="31" rx="1" fill="#241830" />
      <circle cx="37" cy="29" r="7" fill="#FFF0D4" opacity=".9" /><circle cx="37" cy="29" r="3" fill="#8F3F5C" opacity=".6" />
      <circle cx="63" cy="29" r="7" fill="#FFF0D4" opacity=".9" /><circle cx="63" cy="29" r="3" fill="#3E6D6A" opacity=".7" />
      <rect x="26" y="42" width="48" height="2.5" fill="#5A3324" />
      <rect x="26" y="52" width="48" height="8" rx="1" fill="#6B3F2A" />
      <circle cx="50" cy="56" r="1.8" fill="#FFAD42" />
      <rect x="26" y="63" width="22" height="25" rx="1" fill="#6B3F2A" />
      <rect x="52" y="63" width="22" height="25" rx="1" fill="#6B3F2A" />
      <path d="M37 67 L44 75.5 L37 84 L30 75.5 Z M63 67 L70 75.5 L63 84 L56 75.5 Z" fill="#8A5634" />
      <circle cx="46" cy="76" r="1.8" fill="#FFAD42" /><circle cx="54" cy="76" r="1.8" fill="#FFAD42" />
      <rect x="22" y="91" width="8" height="4" fill="#4B2A1E" /><rect x="70" y="91" width="8" height="4" fill="#4B2A1E" />
    </g>
  );
}

export function Teapot() {
  return (
    <g>
      <g className="steam">
        <path d="M46 34 Q42 28 46 22 Q50 16 46 10" stroke="#FFF0D4" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6" />
        <path d="M55 32 Q52 27 55 22" stroke="#FFF0D4" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".45" />
      </g>
      <ellipse cx="50" cy="91" rx="24" ry="4" fill="#000" opacity=".3" />
      <path d="M28 64 Q12 61 9 45 L15 44 Q19 55 30 57 Z" fill="#E7D3AE" />
      <path d="M73 55 Q90 56 86 72 Q83 81 72 79" fill="none" stroke="#E7D3AE" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="50" cy="67" rx="27" ry="22" fill="#F3E2C3" />
      <path d="M25 70 Q50 82 75 70" stroke="#8F3F5C" strokeWidth="3.5" fill="none" />
      <circle cx="40" cy="62" r="2.4" fill="#8F3F5C" /><circle cx="50" cy="60" r="2.4" fill="#5A3D6E" /><circle cx="60" cy="62" r="2.4" fill="#8F3F5C" />
      <ellipse cx="50" cy="46.5" rx="15" ry="4.5" fill="#D9C39A" />
      <circle cx="50" cy="40.5" r="4" fill="#C9913D" />
      <ellipse cx="38" cy="56" rx="5" ry="3" fill="#fff" opacity=".35" />
      <ellipse cx="50" cy="88" rx="17" ry="3" fill="#D9C39A" />
    </g>
  );
}