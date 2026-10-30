import { useCallback, useEffect, useRef, useState } from 'react';
import NightSky from '@/components/possessed/house/NightSky';
import HomeScreen from '@/components/possessed/screens/HomeScreen';
import RoomScreen from '@/components/possessed/room/RoomScreen';
import usePrefs from '@/lib/possessed/usePrefs';
import { unlockAudio } from '@/lib/possessed/audio';
import { generateCode } from '@/lib/possessed/roomCode';
import { loadSession, saveSession, forgetConn } from '@/lib/possessed/session';
import { ERROR_TEXT } from '@/lib/possessed/format';

export default function Game() {
  const prefs = usePrefs();
  const [session, setSession] = useState(loadSession);
  const [error, setError] = useState(null);
  const current = useRef(session);
  current.current = session;

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, []);

  const begin = useCallback((s) => { saveSession(s); setError(null); setSession(s); }, []);

  const exit = useCallback((message = null) => {
    if (current.current) forgetConn(current.current.code);
    saveSession(null);
    setSession(null);
    setError(message);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const onFatal = useCallback((code) => {
    const cur = current.current;
    if (code === 'code_taken' && cur?.intent === 'create' && (cur.attempt ?? 0) < 5) {
      forgetConn(cur.code);
      begin({ ...cur, code: generateCode(), attempt: (cur.attempt ?? 0) + 1 });
      return;
    }
    exit(ERROR_TEXT[code] ?? 'The haunt could not be opened. Please try again.');
  }, [begin, exit]);

  const onSeated = useCallback(() => {
    const cur = current.current;
    if (cur && cur.intent !== 'join') begin({ ...cur, intent: 'join' });
  }, [begin]);

  const initialCode = new URLSearchParams(window.location.search).get('room') || '';

  return (
    <>
      <NightSky />
      {session ? (
        <RoomScreen session={session} prefs={prefs} onFatal={onFatal} onSeated={onSeated} onExit={() => exit()} />
      ) : (
        <HomeScreen
          initialCode={initialCode}
          error={error}
          onCreate={(name) => begin({ code: generateCode(), intent: 'create', name, attempt: 0 })}
          onJoin={(code, name) => begin({ code, intent: 'join', name })}
        />
      )}
    </>
  );
}