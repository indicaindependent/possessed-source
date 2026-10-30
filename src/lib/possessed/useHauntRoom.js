import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { instanceIdFor } from '@/lib/possessed/roomCode';
import { connIdFor } from '@/lib/possessed/session';

const STALE_MS = 6000;   // no message for this long: show "Reconnecting"
const REOPEN_MS = 9000;  // still nothing: drop the socket and open a fresh one (same seat id)

// One socket per room code per tab. Callbacks live in a ref so re-renders never reconnect.
export default function useHauntRoom(session, { onEvent, onFatal, onSeated }) {
  const [view, setView] = useState(null);
  const [status, setStatus] = useState('connecting');
  const roomRef = useRef(null);
  const cb = useRef({});
  cb.current = { onEvent, onFatal, onSeated, intent: session?.intent, name: session?.name };
  const code = session?.code;

  useEffect(() => {
    if (!code) return undefined;
    let room = null;
    let sub = null;
    let lastHeard = Date.now();
    let seated = false;
    let fatal = false;
    let wasLost = false;
    const hello = () => room?.send({ type: 'hello', intent: cb.current.intent, name: cb.current.name });

    const onMsg = (msg) => {
      if (!msg || typeof msg !== 'object' || fatal) return;
      lastHeard = Date.now();
      if (wasLost) { wasLost = false; toast({ title: 'Reconnected', description: 'You are back in the haunt.', duration: 2500 }); }
      setStatus('online');
      if (msg.type === 'state') {
        if (!seated) { seated = true; cb.current.onSeated?.(); }
        setView({ ...msg, receivedAt: performance.now() });
      } else if (msg.type === 'ev') {
        cb.current.onEvent?.(msg);
      } else if (msg.type === 'pong') {
        if (!msg.seated) hello();
      } else if (msg.type === 'error') {
        if (msg.code === 'not_seated') { hello(); return; }
        fatal = true;
        cb.current.onFatal?.(msg.code);
      }
    };

    const open = () => {
      room = base44.actors.HauntRoom(instanceIdFor(code)).connect({ id: connIdFor(code) });
      roomRef.current = room;
      sub = room.subscribe(onMsg);
      lastHeard = Date.now();
      hello();
    };
    const shut = () => {
      sub?.unsubscribe();
      room?.close();
      if (roomRef.current === room) roomRef.current = null;
    };
    open();

    const check = () => {
      if (fatal) return;
      const quiet = Date.now() - lastHeard;
      if (quiet > STALE_MS && seated) { wasLost = true; setStatus('reconnecting'); }
      if (quiet > REOPEN_MS) { shut(); open(); }
    };
    const ping = setInterval(() => { room?.send({ type: 'ping' }); check(); }, 2500);
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      room?.send({ type: 'sync' });
      check();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(ping);
      document.removeEventListener('visibilitychange', onVisible);
      shut();
      setView(null);
      setStatus('connecting');
    };
  }, [code]);

  const act = useCallback((type, payload = {}) => {
    roomRef.current?.send({ type, actionId: crypto.randomUUID().slice(0, 18), ...payload });
  }, []);
  const leave = useCallback(() => roomRef.current?.send({ type: 'leave' }), []);

  return { view, status, act, leave };
}