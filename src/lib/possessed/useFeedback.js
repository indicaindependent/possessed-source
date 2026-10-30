import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/possessed/audio';
import { objectName, roomName } from '@/lib/possessed/layout';
import { REJECT_TEXT, secs } from '@/lib/possessed/format';

// Turns server events into short-lived visuals, sounds and a text equivalent for each.
export default function useFeedback() {
  const [marks, setMarks] = useState({});
  const [clue, setClue] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [announce, setAnnounce] = useState({ text: '', id: 0 });
  const timers = useRef(new Set());

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn(); }, ms);
    timers.current.add(t);
  }, []);
  const say = useCallback((text) => setAnnounce((a) => ({ text, id: a.id + 1 })), []);
  const flash = useCallback((id, kind, ms) => {
    const stamp = `${Date.now()}-${Math.random()}`;
    setMarks((m) => ({ ...m, [id]: { ...m[id], [kind]: stamp } }));
    later(() => setMarks((m) => {
      if (m[id]?.[kind] !== stamp) return m;
      const next = { ...m[id] };
      delete next[kind];
      return { ...m, [id]: next };
    }), ms);
  }, [later]);

  const handle = useCallback((e, ctx) => {
    const n = objectName(e.objectId);
    switch (e.kind) {
      case 'empty': flash(e.objectId, 'empty', 1100); sfx.knock(); say(`Empty. Nothing in the ${n}.`); break;
      case 'searched': flash(e.objectId, 'searched', 1100); sfx.searched(); say(`The Hunter searched the ${n}.`); break;
      case 'moved': flash(e.from, 'ripple', 1000); sfx.move(); say(`You slipped into the ${n}.`); break;
      case 'ripple': flash(e.objectId, 'ripple', 1000); sfx.ripple(); say(`A spectral ripple! Something just left the ${n}.`); break;
      case 'clue': {
        const key = `${e.index}-${Date.now()}`;
        setClue({ room: e.room, key });
        later(() => setClue((c) => (c?.key === key ? null : c)), 2000);
        sfx.chime();
        say(`Clue: the Ghost is in the ${roomName(e.room)}!`);
        break;
      }
      case 'round_setup': setMarks({}); setClue(null); say(`Round ${e.round} is about to begin.`); break;
      case 'go': sfx.go(); say(ctx.role === 'ghost' ? 'Go! Stay hidden.' : 'Go! Find the Ghost.'); break;
      case 'round_end': {
        const r = e.result;
        const where = objectName(r.hidingObject);
        const mine = r.ghostSeat === ctx.you;
        if (r.outcome === 'caught') {
          sfx.caught();
          say(mine ? `Caught in the ${where} after ${secs(r.survivalMs, 2)}s!` : `You caught ${r.ghostName} in the ${where} at ${secs(r.survivalMs, 2)}s!`);
        } else {
          sfx.survived();
          const stamp = Date.now();
          setCelebrate(stamp);
          later(() => setCelebrate((c) => (c === stamp ? null : c)), 3400);
          say(mine ? `You survived all 60 seconds in the ${where}!` : `${r.ghostName} survived the whole round in the ${where}.`);
        }
        break;
      }
      case 'rejected': if (REJECT_TEXT[e.reason]) say(REJECT_TEXT[e.reason]); break;
      case 'friend_joined': sfx.chime(); say('A friend has entered the house.'); break;
      case 'friend_disconnected': say('Your friend disconnected. Waiting to reconnect.'); break;
      case 'friend_back': say('Your friend is back.'); break;
      case 'resumed': say('Back in play!'); break;
      case 'friend_left': say(`${e.name} left the haunt.`); break;
      case 'abandoned': say(`${e.name} didn't return. The match was abandoned.`); break;
      default: break;
    }
  }, [flash, later, say]);

  return { marks, clue, celebrate, announce, handle, say };
}