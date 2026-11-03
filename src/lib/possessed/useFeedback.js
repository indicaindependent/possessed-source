import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/possessed/audio';
import { musicTail } from '@/lib/possessed/music';
import { objectName, roomName, roomOfObject } from '@/lib/possessed/layout';
import { REJECT_TEXT, secs } from '@/lib/possessed/format';

const TAUNT_TEXT = {
  creak: 'A floorboard creaks somewhere in the house...',
  knock: 'Knock knock. The Ghost is mocking you.',
  breath: 'A cold breath brushes past you...',
  giggle: 'A ghostly giggle echoes through the halls!',
};

// Turns server events into short-lived visuals, sounds and a text equivalent for each.
export default function useFeedback() {
  const [marks, setMarks] = useState({});
  const [clue, setClue] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [announce, setAnnounce] = useState({ text: '', id: 0 });
  const [pulse, setPulse] = useState(null);
  const [flourish, setFlourish] = useState(null);
  // Hunter's searched props for the current roundId only ("searched", never "empty": the ghost may move in later).
  const [go, setGo] = useState(null);
  const [shake, setShake] = useState(null);
  const [memory, setMemory] = useState({ roundId: null, ids: {} });
  const timers = useRef(new Set());

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn(); }, ms);
    timers.current.add(t);
  }, []);
  // Clears after 3.2 s, matching the pill animation, so stale text never lingers.
  const say = useCallback((text) => {
    let id;
    setAnnounce((a) => { id = a.id + 1; return { text, id }; });
    later(() => setAnnounce((a) => (a.id === id ? { ...a, text: '' } : a)), 3200);
  }, [later]);
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
      case 'empty': flash(e.objectId, 'empty', 1100);
        setMemory((m) => (m.roundId === ctx.roundId ? { ...m, ids: { ...m.ids, [e.objectId]: true } } : { roundId: ctx.roundId, ids: { [e.objectId]: true } })); sfx.knock(); say(`Empty. Nothing in the ${n}.`); break;
      case 'searched': {
        flash(e.objectId, 'searched', 1100);
        sfx.searched();
        if (ctx.ghostObject && roomOfObject(e.objectId) === roomOfObject(ctx.ghostObject)) {
          const stamp = Date.now();
          setPulse(stamp);
          later(() => setPulse((p) => (p === stamp ? null : p)), 1300);
          sfx.heartbeat();
          say(`The Hunter searched the ${n}. They're close...`);
        } else say(`The Hunter searched the ${n}.`);
        break;
      }
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
      case 'round_setup': setMarks({}); setMemory({ roundId: null, ids: {} }); setClue(null); say(`Round ${e.round} is about to begin.`); break;
      case 'go': {
        const stamp = Date.now();
        setGo(stamp);
        later(() => setGo((g) => (g === stamp ? null : g)), 700);
      }
        sfx.go(); say(ctx.role === 'ghost' ? 'Go! Stay hidden.' : 'Go! Find the Ghost.'); break;
      case 'round_end': {
        const r = e.result;
        const where = objectName(r.hidingObject);
        const mine = r.ghostSeat === ctx.you;
        musicTail();
        if (r.outcome === 'caught') {
          // 250 ms hit-stop: silence, then the stamp, shake and sound land together.
          const stamp = Date.now();
          later(() => {
            sfx.caught();
            setFlourish({ stamp, ms: r.survivalMs });
            setShake(stamp);
          }, 250);
          later(() => setShake((s) => (s === stamp ? null : s)), 750);
          later(() => setFlourish((f) => (f?.stamp === stamp ? null : f)), 2300);
          say(mine ? `Caught in the ${where} after ${secs(r.survivalMs, 2)}s!` : `You caught ${r.ghostName} in the ${where} at ${secs(r.survivalMs, 2)}s!`);
        } else {
          sfx.survived();
          const stamp = Date.now();
          setCelebrate(stamp);
          later(() => setCelebrate((c) => (c === stamp ? null : c)), 3400);
          say(mine ? `You survived all ${Math.round((ctx.roundMs ?? 60000) / 1000)} seconds in the ${where}!` : `${r.ghostName} survived the whole round in the ${where}.`);
        }
        break;
      }
      case 'taunt': sfx[e.sound]?.(); say(TAUNT_TEXT[e.sound] || 'Something stirs in the house...'); break;
      case 'taunted': sfx[e.sound]?.(); say('Your taunt echoes through the house.'); break;
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

  return { go, shake, memory, marks, clue, celebrate, announce, pulse, flourish, handle, say };
}