import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { instanceIdFor } from '@/lib/possessed/roomCode';
import { connIdFor } from '@/lib/possessed/session';
import { createRoomLink, TICK_MS } from '@/lib/possessed/roomLink';
import { devLog } from '@/lib/possessed/devlog';

// Exactly one live link per mounted room. Callbacks live in a ref so renders never reconnect.
export default function useHauntRoom(session, { onEvent, onFatal, onSeated, onSettled }) {
  const [view, setView] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [pending, setPending] = useState(null);
  const linkRef = useRef(null);
  const cb = useRef({});
  cb.current = { onEvent, onFatal, onSeated, onSettled, intent: session?.intent, name: session?.name };
  const code = session?.code;

  useEffect(() => {
    if (!code) return undefined;
    let seated = false;
    let lost = false;
    const link = createRoomLink({
      ref: base44.actors.HauntRoom(instanceIdFor(code)),
      connId: connIdFor(code),
      hello: () => ({ type: 'hello', intent: cb.current.intent, name: cb.current.name }),
      onState: (msg) => {
        if (!seated) { seated = true; cb.current.onSeated?.(); }
        setView({ ...msg, receivedAt: performance.now() });
      },
      onEvent: (msg) => cb.current.onEvent?.(msg),
      onFatal: (c) => cb.current.onFatal?.(c),
      onStatus: (s) => {
        setStatus(s);
        if (s === 'reconnecting') lost = true;
        if (s === 'online' && lost) { lost = false; toast({ title: 'Reconnected', description: 'You are back in the haunt.', duration: 2500 }); }
      },
      onPending: (p, done) => { setPending(p); if (done) cb.current.onSettled?.(done); },
      log: devLog,
    });
    linkRef.current = link;
    link.start();
    const timer = setInterval(() => link.tick(document.visibilityState === 'visible'), TICK_MS);
    const onVis = () => { if (document.visibilityState === 'visible') link.visible(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
      link.stop();
      if (linkRef.current === link) linkRef.current = null;
      setView(null);
      setStatus('connecting');
      setPending(null);
    };
  }, [code]);

  const act = useCallback((type, payload) => linkRef.current?.act(type, payload) ?? { ok: false, reason: 'offline' }, []);
  const leave = useCallback(() => linkRef.current?.leave(), []);

  return { view, status, pending, act, leave };
}