export default function GhostFace({ className = '', mood = 'boo' }) {
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden="true">
      <path
        d="M50 5 C24 5 13 27 13 52 L13 97 Q21 88 29 97 Q37 105 45 97 Q53 88 61 97 Q69 105 77 97 Q85 88 87 97 L87 52 C87 27 76 5 50 5 Z"
        fill="#FFF0D4" stroke="#8DF3D1" strokeWidth="2.5"
      />
      <ellipse cx="37" cy="46" rx="6.5" ry="8.5" fill="#151221" />
      <ellipse cx="63" cy="46" rx="6.5" ry="8.5" fill="#151221" />
      <circle cx="39" cy="43" r="2.2" fill="#fff" /><circle cx="65" cy="43" r="2.2" fill="#fff" />
      <circle cx="28" cy="60" r="5" fill="#FF9FB2" opacity=".5" /><circle cx="72" cy="60" r="5" fill="#FF9FB2" opacity=".5" />
      {mood === 'boo' && <ellipse cx="50" cy="67" rx="7" ry="9" fill="#151221" />}
      {mood === 'happy' && <path d="M38 62 Q50 76 62 62 Q50 70 38 62 Z" fill="#151221" />}
      {mood === 'oops' && <path d="M40 68 Q45 63 50 68 Q55 73 60 68" stroke="#151221" strokeWidth="3.5" fill="none" strokeLinecap="round" />}
    </svg>
  );
}