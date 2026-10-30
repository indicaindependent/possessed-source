import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { normalizeCode, isValidCode } from '@/lib/possessed/roomCode';

export default function JoinPanel({ name, onName, joining, setJoining, initialCode, busy, error, onCreate, onJoin }) {
  const [code, setCode] = useState(normalizeCode(initialCode));
  const valid = isValidCode(code);
  const submit = (e) => { e.preventDefault(); if (valid && !busy) onJoin(code); };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-extrabold text-parchment/80">Display name (optional)</span>
        <input
          value={name} onChange={(e) => onName(e.target.value.slice(0, 16))} maxLength={16} placeholder="e.g. Mabel"
          className="mt-1 h-12 w-full rounded-xl border-2 border-parchment/20 bg-plum/60 px-4 text-base font-medium text-parchment placeholder:text-parchment/40 focus:border-pumpkin focus:outline-none"
        />
      </label>
      {!joining ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button type="button" onClick={onCreate} disabled={busy}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-pumpkin px-4 font-display text-lg font-bold text-ink shadow-[0_6px_0_#b86f17] transition active:translate-y-1 active:shadow-[0_2px_0_#b86f17] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment disabled:opacity-60">
            {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />} Create a Haunt
          </button>
          <button type="button" onClick={() => setJoining(true)} disabled={busy}
            className="h-14 rounded-xl border-2 border-spectral px-4 font-display text-lg font-bold text-spectral transition hover:bg-spectral/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-parchment">
            Join a Friend
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-2.5">
          <label className="block">
            <span className="text-sm font-extrabold text-parchment/80">Room code</span>
            <input
              value={code} onChange={(e) => setCode(normalizeCode(e.target.value))} autoFocus inputMode="text" autoCapitalize="characters" autoComplete="off"
              aria-invalid={code.length === 6 && !valid} placeholder="ABCDEF"
              className="mt-1 h-14 w-full rounded-xl border-2 border-parchment/20 bg-plum/60 text-center font-mono text-2xl font-bold uppercase tracking-[0.4em] text-parchment placeholder:text-parchment/25 focus:border-spectral focus:outline-none"
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