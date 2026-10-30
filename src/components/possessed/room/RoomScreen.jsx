import { useCallback, useEffect, useRef } from 'react';
import useHauntRoom from '@/lib/possessed/useHauntRoom';
import useFeedback from '@/lib/possessed/useFeedback';
import usePropStates from '@/lib/possessed/usePropStates';
import { useNowTick, derive } from '@/lib/possessed/clock';
import { sfx } from '@/lib/possessed/audio';
import { objectName } from '@/lib/possessed/layout';
import { secs } from '@/lib/possessed/format';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import TopBar from '@/components/possessed/room/TopBar';
import GameHUD from '@/components/possessed/room/GameHUD';
import CountdownOverlay from '@/components/possessed/room/CountdownOverlay';
import PauseOverlay from '@/components/possessed/room/PauseOverlay';
import PhasePanel from '@/components/possessed/room/PhasePanel';
import Connecting from '@/components/possessed/room/Connecting';

export default function RoomScreen({ session, prefs, onFatal, onSeated, onExit }) {
  const fb = useFeedback();
  const ctx = useRef({});
  const { view, status, act, leave } = useHauntRoom(session, { onEvent: (e) => fb.handle(e, ctx.current), onFatal, onSeated });
  ctx.current = { you: view?.you, role: view?.role };
  const playing = view?.phase === 'countdown' || view?.phase === 'active';
  const now = useNowTick(Boolean(view));
  const propStates = usePropStates(view, fb.marks);
  const { say } = fb;

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}?room=${session.code}`);
  }, [session.code]);

  const pick = useCallback((id) => {
    if (!view || view.phase !== 'active' || view.clock.paused) return;
    const d = derive(view, performance.now());
    if (view.role === 'ghost') {
      if (id === view.ghost?.objectId) return say(`You're already possessing the ${objectName(id)}.`);
      if (d.ghostReadyIn > 0) return say(`Your next move is ready in ${secs(d.ghostReadyIn)}s.`);
      act('possess', { objectId: id, roundId: view.roundId });
    } else if (view.role === 'hunter') {
      if (d.charges <= 0) return say(`No charges left. Refill in ${secs(view.balance.chargeRegenMs - (d.refill ?? 0))}s.`);
      sfx.investigate();
      act('investigate', { objectId: id, roundId: view.roundId });
    }
  }, [view, act, say]);

  const doLeave = () => { leave(); setTimeout(onExit, 150); };
  if (!view) return <Connecting code={session.code} onCancel={() => onExit()} />;

  const d = derive(view, now);
  const friendGrace = d.graceMs[1 - view.you];
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <TopBar code={view.code} status={status} prefs={prefs} onLeave={doLeave} />
      {playing && <GameHUD view={view} d={d} announce={fb.announce} />}
      <div className="relative flex min-h-0 flex-1 px-1.5 pb-1.5 pt-1.5 sm:px-4">
        <HauntedHouse className="h-full" interactive={view.phase === 'active' && !view.clock.paused}
          propStates={propStates} clue={fb.clue} celebrate={fb.celebrate} onPick={pick} />
        {view.phase === 'countdown' && !view.clock.paused && (
          <CountdownOverlay ms={d.countdownMs} round={view.round} role={view.role} objectId={view.ghost?.objectId} />
        )}
        {playing && (view.clock.paused || status === 'reconnecting') && (
          <PauseOverlay selfOffline={status === 'reconnecting'} graceMs={friendGrace} />
        )}
      </div>
      {!playing && <PhasePanel view={view} d={d} act={act} onLeave={doLeave} announce={fb.announce} />}
    </div>
  );
}