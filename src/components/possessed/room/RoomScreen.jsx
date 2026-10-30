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
import AnnouncePill from '@/components/possessed/room/AnnouncePill';
import CaughtFlourish from '@/components/possessed/room/CaughtFlourish';

export default function RoomScreen({ session, prefs, onFatal, onSeated, onExit, onNewHaunt }) {
  const fb = useFeedback();
  const ctx = useRef({});
  const { view, status, act, leave } = useHauntRoom(session, { onEvent: (e) => fb.handle(e, ctx.current), onFatal, onSeated });
  ctx.current = { you: view?.you, role: view?.role, ghostObject: view?.ghost?.objectId };
  const playing = view?.phase === 'countdown' || view?.phase === 'active';
  const now = useNowTick(Boolean(view));
  const propStates = usePropStates(view, fb.marks);
  const { say } = fb;

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}?room=${session.code}`);
  }, [session.code]);

  const d = view ? derive(view, now) : null;
  const finalSecond = view?.phase === 'active' && !view.clock.paused && d.remainingMs > 0 && d.remainingMs <= 10000
    ? Math.ceil(d.remainingMs / 1000) : null;
  useEffect(() => { if (finalSecond) sfx.softTick(); }, [finalSecond]);

  const pick = useCallback((id) => {
    if (!view || view.phase !== 'active' || view.clock.paused) return;
    const dd = derive(view, performance.now());
    if (view.role === 'ghost') {
      if (id === view.ghost?.objectId) return say(`You're already possessing the ${objectName(id)}.`);
      if (dd.ghostReadyIn > 0) return say(`Your next move is ready in ${secs(dd.ghostReadyIn)}s.`);
      act('possess', { objectId: id, roundId: view.roundId });
    } else if (view.role === 'hunter') {
      if (dd.charges <= 0) return say(`No charges left. Refill in ${secs(view.balance.chargeRegenMs - (dd.refill ?? 0))}s.`);
      sfx.investigate();
      act('investigate', { objectId: id, roundId: view.roundId });
    }
  }, [view, act, say]);

  const doLeave = () => { leave(); setTimeout(onExit, 150); };
  const doNewHaunt = () => { leave(); setTimeout(onNewHaunt, 150); };
  if (!view) return <Connecting code={session.code} onCancel={() => onExit()} />;

  const friendGrace = d.graceMs[1 - view.you];
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <p className="sr-only" aria-live="polite" aria-atomic="true">{fb.announce.text}</p>
      <TopBar code={view.code} status={status} prefs={prefs} onLeave={doLeave} />
      {playing && <GameHUD view={view} d={d} pulse={fb.pulse} />}
      <div className="relative flex min-h-0 flex-1 px-1.5 pb-1.5 pt-1.5 sm:px-4">
        <HauntedHouse className="h-full" interactive={view.phase === 'active' && !view.clock.paused}
          propStates={propStates} clue={fb.clue} celebrate={fb.celebrate} onPick={pick} />
        {playing && <AnnouncePill announce={fb.announce} />}
        <CaughtFlourish stamp={fb.flourish} />
        {view.phase === 'countdown' && !view.clock.paused && (
          <CountdownOverlay ms={d.countdownMs} round={view.round} role={view.role} objectId={view.ghost?.objectId} />
        )}
        {playing && (view.clock.paused || status === 'reconnecting') && (
          <PauseOverlay selfOffline={status === 'reconnecting'} graceMs={friendGrace} />
        )}
      </div>
      {!playing && <PhasePanel view={view} d={d} act={act} onLeave={doLeave} onNewHaunt={doNewHaunt} announce={fb.announce} />}
    </div>
  );
}