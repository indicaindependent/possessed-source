import { useCallback, useEffect, useRef, useState } from 'react';
import NightSky from '@/components/possessed/house/NightSky';
import HomeScreen from '@/components/possessed/screens/HomeScreen';
import RoomScreen from '@/components/possessed/room/RoomScreen';
import usePrefs from '@/lib/possessed/usePrefs';
import { attemptAutoplay, unlockAudio } from '@/lib/possessed/audio';
import { generateCode } from '@/lib/possessed/roomCode';
import { loadSession, saveSession, forgetConn } from '@/lib/possessed/session';
import { ERROR_TEXT } from '@/lib/possessed/format';
import { openMatchmaker, cancelMatch } from '@/lib/possessed/matchmaker';
import { toast } from '@/components/ui/use-toast';

export default function Game() {
  const prefs = usePrefs();
  const [session, setSession] = useState(loadSession);
  const [error, setError] = useState(null);
  const [autoSearch, setAutoSearch] = useState(false);
  const current = useRef(session);
  current.current = session;

  useEffect(() => {
    attemptAutoplay(); // starts the music on load where the browser allows it
    // Only these events count as a user gesture for audio on phones (pointerdown on touch does not).
    const unlock = () => unlockAudio();
    const events = ['pointerup', 'touchend', 'click', 'keydown'];
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);

  const [arrived, setArrived] = useState(null);
  const begin = useCallback((s) => { saveSession(s); setError(null); setAutoSearch(false); setSession(s); }, []);

  // The matchmaker lives for the whole game so a search keeps running during practice.
  useEffect(() => openMatchmaker((code) => {
    const cur = current.current;
    if (cur?.practice) { setArrived(code); toast({ title: 'A player arrived!', description: 'Finish up or face them now.' }); return; }
    begin({ code, intent: 'quick', quick: true, name: sessionStorage.getItem('possessed:name')?.trim() || '' });
  }), [begin]);

  const exit = useCallback((message = null) => {
    if (current.current) forgetConn(current.current.code);
    saveSession(null);
    setSession(null);
    setError(message);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const onFatal = useCallback((code) => {
    const cur = current.current;
    if (code === 'code_taken' && (cur?.intent === 'create' || cur?.intent === 'practice') && (cur.attempt ?? 0) < 5) {
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
    <div className={session ? 'calm' : undefined}>
      <NightSky />
      {session ? (
        <RoomScreen session={session} prefs={prefs} onFatal={onFatal} onSeated={onSeated} onExit={() => exit()}
          onNewHaunt={() => { const name = session.name; exit(); begin({ code: generateCode(), intent: 'create', name, attempt: 0 }); }}
          onFindNew={() => { exit(); setAutoSearch(true); }}
          arrived={arrived}
          onFaceArrived={() => { const code = arrived; const name = session.name; setArrived(null); exit(); begin({ code, intent: 'quick', quick: true, name }); }} />
      ) : (
        <HomeScreen
          prefs={prefs}
          initialCode={initialCode}
          error={error}
          autoSearch={autoSearch}
          onPractice={(name) => begin({ code: generateCode(), intent: 'practice', practice: true, name, attempt: 0 })}
          onCreate={(name) => { cancelMatch(); begin({ code: generateCode(), intent: 'create', name, attempt: 0 }); }}
          onJoin={(code, name) => { cancelMatch(); begin({ code, intent: 'join', name }); }}
        />
      )}
    </div>
  );
}