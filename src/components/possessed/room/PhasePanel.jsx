import LobbyPanel from '@/components/possessed/room/LobbyPanel';
import IntermissionPanel from '@/components/possessed/room/IntermissionPanel';
import FinalPanel from '@/components/possessed/room/FinalPanel';
import AbandonedPanel from '@/components/possessed/room/AbandonedPanel';

const PANELS = { lobby: LobbyPanel, intermission: IntermissionPanel, final: FinalPanel, abandoned: AbandonedPanel };

export default function PhasePanel({ view, d, act, onLeave, announce }) {
  const Panel = PANELS[view.phase];
  return (
    <section className="mx-auto w-full max-w-xl shrink-0 px-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] sm:px-4">
      <div key={view.phase} className="fade-up max-h-[58dvh] overflow-y-auto rounded-2xl border border-parchment/15 bg-ink/90 p-4 shadow-2xl backdrop-blur-md">
        {Panel && <Panel view={view} d={d} act={act} onLeave={onLeave} />}
        <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm font-bold text-spectral">{announce.text}</p>
      </div>
    </section>
  );
}