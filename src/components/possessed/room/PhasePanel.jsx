import LobbyPanel from '@/components/possessed/room/LobbyPanel';
import IntermissionPanel from '@/components/possessed/room/IntermissionPanel';
import FinalPanel from '@/components/possessed/room/FinalPanel';
import AbandonedPanel from '@/components/possessed/room/AbandonedPanel';

const PANELS = { lobby: LobbyPanel, intermission: IntermissionPanel, final: FinalPanel, abandoned: AbandonedPanel };

// Natural height on phones (the page scrolls); its own scroll column beside the house on wide/short screens.
export default function PhasePanel({ view, act, pending, onLeave, onNewHaunt, announce }) {
  const Panel = PANELS[view.phase];
  return (
    <section className="mx-auto w-full max-w-xl shrink-0 lg:mx-0 lg:w-[440px] lg:overflow-y-auto short:mx-0 short:w-1/2 short:overflow-y-auto">
      <div key={view.phase} className="fade-up rounded-2xl border border-parchment/15 bg-ink/90 p-4 shadow-2xl backdrop-blur-md short:p-3">
        {Panel && <Panel view={view} act={act} pending={pending} onLeave={onLeave} onNewHaunt={onNewHaunt} />}
        <p aria-hidden="true" className="mt-2 min-h-[1.25rem] text-sm font-bold text-spectral">{announce.text}</p>
      </div>
    </section>
  );
}