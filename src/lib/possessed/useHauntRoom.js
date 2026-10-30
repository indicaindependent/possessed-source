import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { instanceIdFor } from '@/lib/possessed/roomCode';
import { connIdFor } from '@/lib/possessed/session';

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
    const room = base44.actors.HauntRoom(instanceIdFor(code)).connect({ id: connIdFor(code) });
    roomRef.current = room;
    let lastHeard = Date.now();
    let seated = false;
    let fatal = false;
    const hello = () => room.send({ type: 'hello', intent: cb.current.intent, name: cb.current.name });

    const sub = room.subscribe((msg) => {
      if (!msg || typeof msg !== 'object' || fatal) return;
      lastHeard = Date.now();
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
    });
    hello();

    const ping = setInterval(() => {
      room.send({ type: 'ping' });
      if (Date.now() - lastHeard > 6000) setStatus('reconnecting');
    }, 2500);
    const onVisible = () => { if (document.visibilityState === 'visible') room.send({ type: 'sync' }); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(ping);
      document.removeEventListener('visibilitychange', onVisible);
      sub.unsubscribe();
      room.close();
      if (roomRef.current === room) roomRef.current = null;
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