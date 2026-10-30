import { useEffect, useRef } from 'react';
import useHauntRoom from '@/lib/possessed/useHauntRoom';
import useFeedback from '@/lib/possessed/useFeedback';
import RoomView from '@/components/possessed/room/RoomView';
import Connecting from '@/components/possessed/room/Connecting';

const SETTLE_TEXT = {
  timeout: 'No answer from the house yet. Check your connection and try again.',
  offline: 'The connection dropped before the house answered. Try again once you are back online.',
};

export default function RoomScreen({ session, prefs, onFatal, onSeated, onExit, onNewHaunt }) {
  const fb = useFeedback();
  const ctx = useRef({});
  const { view, status, pending, act, leave } = useHauntRoom(session, {
    onEvent: (e) => fb.handle(e, ctx.current), onFatal, onSeated,
    onSettled: (done) => { if (SETTLE_TEXT[done.outcome]) fb.say(SETTLE_TEXT[done.outcome]); },
  });
  ctx.current = { you: view?.you, role: view?.role, ghostObject: view?.ghost?.objectId };

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}?room=${session.code}`);
  }, [session.code]);

  const doLeave = () => { leave(); setTimeout(onExit, 150); };
  const doNewHaunt = () => { leave(); setTimeout(onNewHaunt, 150); };
  if (!view) return <Connecting code={session.code} onCancel={() => onExit()} />;
  return <RoomView view={view} status={status} pending={pending} act={act} fb={fb} prefs={prefs} onLeave={doLeave} onNewHaunt={doNewHaunt} />;
}