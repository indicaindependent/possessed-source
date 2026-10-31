import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { normalizeCode, isValidCode } from '@/lib/possessed/roomCode';

export default function JoinPanel({ name, onName, joining, setJoining, initialCode, busy, error, onCreate, onJoin, quick = null, searching = false }) {
  const [code, setCode] = useState(normalizeCode(initialCode));
  const valid = isValidCode(code);
  const submit = (e) => { e.preventDefault(); if (valid && !busy) onJoin(code); };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-parchment/80">Display name (optional)</span>
        <input
          value={name} onChange={(e) => onName(e.target.value.slice(0, 16))} maxLength={16} placeholder="e.g. Mabel"
          autoFocus={isValidCode(normalizeCode(initialCode))}
          className="mt-1 h-12 w-full rounded-xl border-2 border-parchment/20 bg-plum/70 px-4 text-base font-extrabold tracking-[0.01em] text-parchment shadow-inner placeholder:font-medium placeholder:text-parchment/40 focus:border-pumpkin focus:outline-none"
        />
      </label>
      {!joining ? (
        <>
          {quick}
          {!searching && (
            <div>
              <p className="mb-1.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-parchment/75">Play with a friend</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={onCreate} disabled={busy}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-pumpkin/90 bg-pumpkin/5 px-2 font-display text-base font-bold tracking-[0.01em] text-pumpkin transition hover:bg-pumpkin/15 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-60 sm:text-lg">
                  {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />} Create a Haunt
                </button>
                <button type="button" onClick={() => setJoining(true)} disabled={busy}
                  className="h-12 rounded-xl border-2 border-spectral/90 bg-spectral/5 px-2 font-display text-base font-bold tracking-[0.01em] text-spectral transition hover:bg-spectral/15 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment sm:text-lg">
                  Join a Friend
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={submit} className="space-y-2.5">
          <label className="block">
            <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-parchment/80">Room code</span>
            <input
              value={code} onChange={(e) => setCode(normalizeCode(e.target.value))} autoFocus={!isValidCode(normalizeCode(initialCode))} inputMode="text" autoCapitalize="characters" autoComplete="off"
              aria-invalid={code.length === 6 && !valid} placeholder="ABCDEF"
              className="mt-1 h-14 w-full rounded-xl border-2 border-parchment/20 bg-plum/70 text-center font-mono text-2xl font-bold uppercase tabular-nums tracking-[0.38em] text-parchment shadow-inner placeholder:text-parchment/25 focus:border-spectral focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <button type="button" onClick={() => setJoining(false)} className="h-14 rounded-xl px-4 font-bold text-parchment/80 hover:text-parchment focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment">Back</button>
            <button type="submit" disabled={!valid || busy}
              className="flex h-14 items-center justify-center gap-2 rounded-xl bg-spectral font-display text-lg font-bold text-ink shadow-[0_6px_0_#4fb894] transition active:translate-y-1 active:shadow-[0_2px_0_#4fb894] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-50">
              {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />} Enter the house
            </button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="rounded-lg bg-[#5a1f2e] px-3 py-2 text-sm font-bold text-parchment">{error}</p>}
    </div>
  );
}