export default function TimeBar({ activeMs, roundMs, clueTimesMs = [] }) {
  return (
    <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-parchment/10" aria-hidden="true">
      <div className="h-full rounded-full bg-gradient-to-r from-spectral to-pumpkin" style={{ width: `${(activeMs / roundMs) * 100}%` }} />
      {clueTimesMs.map((t) => (
        <span key={t} className={`absolute top-0 h-full w-1 ${activeMs >= t ? 'bg-ink/70' : 'bg-parchment/60'}`} style={{ left: `${(t / roundMs) * 100}%` }} />
      ))}
    </div>
  );
}