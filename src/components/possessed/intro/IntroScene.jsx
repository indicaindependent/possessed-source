// Silhouette of the home-screen house: moon, fog, attic/library/parlor windows, ghost eyes.
export default function IntroScene() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-x-0 bottom-0 mx-auto h-[70%] w-full max-w-3xl" aria-hidden="true">
      <circle className="intro-moon" cx="320" cy="60" r="28" fill="#FFF0D4" />
      <path d="M90 300V150l110-80 110 80v150z" fill="#1b1226" />
      <path d="M70 155l130-95 130 95" fill="none" stroke="#241830" strokeWidth="10" />
      <rect className="intro-win-attic" x="184" y="105" width="32" height="30" rx="4" fill="#FFAD42" />
      <rect className="intro-win-library" x="120" y="175" width="40" height="40" rx="4" fill="#FFAD42" />
      <rect x="240" y="175" width="40" height="40" rx="4" fill="#0d0b16" />
      <g className="intro-eyes" fill="#8DF3D1">
        <ellipse cx="253" cy="195" rx="3.5" ry="4.5" />
        <ellipse cx="267" cy="195" rx="3.5" ry="4.5" />
      </g>
      <rect className="intro-fog" x="-200" y="250" width="800" height="50" rx="25" fill="#FFF0D4" opacity="0.08" />
    </svg>
  );
}