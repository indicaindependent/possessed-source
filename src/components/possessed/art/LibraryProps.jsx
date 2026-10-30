const SHELF_COLORS = ['#8F3F5C', '#3E6D6A', '#C9913D', '#5A3D6E', '#A8693F', '#2F4F7A', '#8DF3D1'];
const ROWS = [15, 39, 63];

export function Bookcase() {
  return (
    <g>
      <ellipse cx="50" cy="96" rx="34" ry="3" fill="#000" opacity=".3" />
      <rect x="17" y="6" width="66" height="89" rx="2" fill="#5A3324" />
      <rect x="22" y="11" width="56" height="79" fill="#22161f" />
      {ROWS.map((y, r) => (
        <g key={y}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const h = 16 + ((i * 7 + r * 5) % 7);
            const color = SHELF_COLORS[(i + r * 2) % SHELF_COLORS.length];
            const tilt = r === 1 && i === 5;
            return (
              <rect key={i} x={24 + i * 8.6} y={y + 22 - h} width="7" height={h} rx="1" fill={color}
                transform={tilt ? `rotate(14 ${24 + i * 8.6} ${y + 22})` : undefined} opacity={color === '#8DF3D1' ? 0.75 : 1} />
            );
          })}
          <rect x="22" y={y + 22} width="56" height="3.5" fill="#7A4A30" />
        </g>
      ))}
    </g>
  );
}

export function Globe() {
  return (
    <g>
      <ellipse cx="50" cy="94" rx="20" ry="4.5" fill="#4B2A1E" />
      <path d="M50 92 L50 76" stroke="#6B3F2A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="49" cy="46" r="25" fill="#2F5F86" />
      <path d="M34 34 Q42 28 48 34 Q46 42 38 44 Q32 40 34 34 Z M54 48 Q62 44 68 50 Q66 60 58 62 Q52 56 54 48 Z M40 58 Q46 56 48 62 Q44 66 40 64 Z"
        fill="#8DF3D1" opacity=".85" />
      <ellipse cx="40" cy="35" rx="7" ry="4" fill="#fff" opacity=".22" />
      <path d="M22 44 A28 28 0 0 0 72 70" stroke="#C9913D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="49" cy="18" r="2.5" fill="#C9913D" />
    </g>
  );
}

export function Typewriter() {
  return (
    <g>
      <ellipse cx="50" cy="94" rx="38" ry="3" fill="#000" opacity=".3" />
      <rect x="33" y="16" width="34" height="30" fill="#FFF0D4" />
      <path d="M38 23 H62 M38 28 H58 M38 33 H61" stroke="#30213F" strokeWidth="1.6" opacity=".55" />
      <rect x="23" y="40" width="54" height="9" rx="4.5" fill="#151221" stroke="#5A3D6E" strokeWidth="1.5" />
      <circle cx="20" cy="44.5" r="5" fill="#C9913D" /><circle cx="80" cy="44.5" r="5" fill="#C9913D" />
      <path d="M19 51 L81 51 L89 85 L11 85 Z" fill="#2B2440" stroke="#4a3d63" strokeWidth="1.5" />
      {[28, 36, 44, 52, 60, 68].map((x) => <circle key={`a${x}`} cx={x + 2} cy="61" r="2.8" fill="#FFF0D4" />)}
      {[24, 32, 40, 48, 56, 64, 72].map((x) => <circle key={`b${x}`} cx={x + 2} cy="69" r="2.8" fill="#FFF0D4" />)}
      <rect x="34" y="75" width="32" height="4" rx="2" fill="#FFF0D4" />
      <rect x="11" y="85" width="78" height="6" rx="2" fill="#151221" />
    </g>
  );
}