// Visual copy of the latest announcement, floating over the top of the house so it never
// takes a row in the status bar. Screen readers get the same text from the live region.
export default function AnnouncePill({ announce }) {
  if (!announce.text) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-40 flex justify-center px-3" aria-hidden="true">
      <p key={announce.id} className="announce-pill max-w-md rounded-full border border-spectral/40 bg-ink/90 px-3 py-1 text-center text-sm font-extrabold text-spectral shadow-lg backdrop-blur">
        {announce.text}
      </p>
    </div>
  );
}