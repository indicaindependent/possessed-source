import { WifiOff } from 'lucide-react';

export default function PauseOverlay({ selfOffline, graceMs }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/70 px-4 backdrop-blur-sm" role="alert">
      <div className="max-w-sm rounded-2xl border border-parchment/20 bg-plum p-5 text-center shadow-2xl">
        <WifiOff className="mx-auto h-8 w-8 text-pumpkin" aria-hidden="true" />
        {selfOffline ? (
          <>
            <p className="mt-2 font-display text-xl font-bold text-parchment">Connection lost.</p>
            <p className="mt-1 text-base font-medium text-parchment/85">Reconnecting to the house…</p>
          </>
        ) : (
          <>
            <p className="mt-2 font-display text-xl font-bold text-parchment">Your friend disconnected. Waiting to reconnect.</p>
            {graceMs != null && <p className="mt-1 text-3xl font-black tabular-nums text-pumpkin">{Math.ceil(graceMs / 1000)}s</p>}
            <p className="mt-1 text-sm font-medium text-parchment/80">The clock is frozen. If they don't return, the match ends with no winner.</p>
          </>
        )}
      </div>
    </div>
  );
}