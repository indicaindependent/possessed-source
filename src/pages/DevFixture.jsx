import { useMemo } from 'react';
import NightSky from '@/components/possessed/house/NightSky';
import RoomView from '@/components/possessed/room/RoomView';
import useFeedback from '@/lib/possessed/useFeedback';
import usePrefs from '@/lib/possessed/usePrefs';
import { fixtureView } from '@/lib/possessed/fixtures';

const noop = () => {};
const fakeAct = () => ({ ok: true });

// DEV-only: renders the real room layout from a static snapshot (no socket). Not a live game.
// /dev/fixture?phase=lobby|countdown|active|intermission|final&role=hunter|ghost&probe=1
export default function DevFixture() {
  const q = new URLSearchParams(window.location.search);
  const view = useMemo(() => fixtureView(q.get('phase') || 'active', q.get('role') || 'hunter'), []); // eslint-disable-line react-hooks/exhaustive-deps
  const fb = useFeedback();
  const prefs = usePrefs();
  return (
    <div className="calm">
      <NightSky />
      <RoomView view={view} status="online" pending={null} act={fakeAct} fb={fb} prefs={prefs} onLeave={noop} onNewHaunt={noop} />
    </div>
  );
}