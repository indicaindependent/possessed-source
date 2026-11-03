const TAUNTS = [
  { id: 'creak', label: 'Creak' },
  { id: 'knock', label: 'Knock' },
  { id: 'breath', label: 'Breath' },
  { id: 'giggle', label: 'Giggle' },
];

// Ghost-only taunts: the server applies the cooldown; buttons only reflect it.
export default function TauntBar({ view, act, readyIn }) {
  const cooling = readyIn > 0;
  const send = (sound) => act('taunt', { sound, roundId: view.roundId });
  return (
    <div className="mt-1 flex items-center gap-1.5" role="group" aria-label="Taunt the Hunter">
      <span className="shrink-0 text-[12px] font-black uppercase tracking-[0.1em] text-parchment/70">Taunt</span>
      {TAUNTS.map((t) => (
        <button key={t.id} type="button" disabled={cooling} onClick={() => send(t.id)}
          className="min-h-[32px] flex-1 rounded-full border border-spectral/40 bg-plum px-2 text-[12px] font-extrabold text-spectral transition-opacity disabled:opacity-40">
          {t.label}
        </button>
      ))}
      {cooling && <span className="w-9 shrink-0 text-right text-[12px] font-bold tabular-nums text-parchment/80">{Math.ceil(readyIn / 1000)}s</span>}
    </div>
  );
}