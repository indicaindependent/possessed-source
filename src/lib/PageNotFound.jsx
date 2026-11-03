import { useEffect } from 'react';

export default function PageNotFound() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-ink p-6 text-center">
      <p className="font-display text-6xl font-black text-spectral">404</p>
      <h1 className="title-emboss font-display text-3xl font-black text-parchment">No one haunts this room</h1>
      <p className="max-w-sm font-body text-muted-foreground">This page doesn't exist. The game is back at the house.</p>
      <button type="button" onClick={() => { window.location.href = '/'; }} className="min-h-[44px] rounded-xl bg-pumpkin px-6 font-body font-extrabold text-ink">Back to the house</button>
    </div>
  );
}