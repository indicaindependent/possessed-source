import usePropStates from '@/lib/possessed/usePropStates';
import usePick from '@/lib/possessed/usePick';
import HauntedHouse from '@/components/possessed/house/HauntedHouse';
import TopBar from '@/components/possessed/room/TopBar';
import GameHUD from '@/components/possessed/room/GameHUD';
import CountdownOverlay from '@/components/possessed/room/CountdownOverlay';
import PauseOverlay from '@/components/possessed/room/PauseOverlay';
import PhasePanel from '@/components/possessed/room/PhasePanel';
import AnnouncePill from '@/components/possessed/room/AnnouncePill';
import CaughtFlourish from '@/components/possessed/room/CaughtFlourish';

// Pure room layout (no socket): playing = HUD + full house; otherwise panel first, house as context.
export default function RoomView({ view, status, pending, act, fb, prefs, onLeave, onNewHaunt, quick = false, onFindNew }) {
  const playing = view.phase === 'countdown' || view.phase === 'active';
  const propStates = usePropStates(view, fb.marks, pending);
  const onPick = usePick(view, act, fb.say);
  const live = view.phase === 'active' && !view.clock.paused && status === 'online';

  return (
    <div className="flex h-[100dvh] flex-col overflow-y-auto pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]">
      <p className="sr-only" aria-live="polite" aria-atomic="true">{fb.announce.text}</p>
      <TopBar code={view.code} status={status} prefs={prefs} onLeave={onLeave} />
      {playing && <GameHUD view={view} pulse={fb.pulse} />}
      {playing ? (
        <div className="relative flex min-h-[300px] flex-1 px-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)] pt-1.5 sm:px-4 short:min-h-[230px]">
          <HauntedHouse className="h-full" interactive={live} propStates={propStates} clue={fb.clue} celebrate={fb.celebrate} onPick={onPick} />
          <AnnouncePill announce={fb.announce} />
          <CaughtFlourish stamp={fb.flourish} />
          {view.phase === 'countdown' && !view.clock.paused && <CountdownOverlay view={view} />}
          {(view.clock.paused || status === 'reconnecting') && <PauseOverlay view={view} selfOffline={status === 'reconnecting'} />}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 px-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 sm:px-4 lg:min-h-0 lg:flex-row short:min-h-0 short:flex-row">
          <PhasePanel view={view} act={act} pending={pending} onLeave={onLeave} onNewHaunt={onNewHaunt} announce={fb.announce} quick={quick} onFindNew={onFindNew} />
          <div className="relative h-[300px] shrink-0 sm:h-[400px] lg:h-auto lg:min-h-0 lg:flex-1 short:h-auto short:min-h-0 short:flex-1">
            <HauntedHouse decorative className="h-full" propStates={propStates} celebrate={fb.celebrate} />
            <CaughtFlourish stamp={fb.flourish} />
          </div>
        </div>
      )}
    </div>
  );
}