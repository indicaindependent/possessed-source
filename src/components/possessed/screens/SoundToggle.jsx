import { Volume2, VolumeX } from 'lucide-react';
import IconToggle from '@/components/possessed/room/IconToggle';
import useAudioRunning from '@/lib/possessed/useAudioRunning';
import { unlockAudio } from '@/lib/possessed/audio';

// Home-screen speaker: mutes/unmutes, and stands in for autoplay where the browser blocks it.
export default function SoundToggle({ prefs }) {
  const running = useAudioRunning();
  const blocked = !prefs.muted && !running;

  const onClick = () => {
    if (blocked) { unlockAudio(); return; } // first tap is what iOS needs to start the music
    prefs.toggleMute();
  };

  return (
    <div className="flex items-center gap-2">
      <IconToggle
        icon={prefs.muted || blocked ? VolumeX : Volume2}
        slashed={prefs.muted || blocked}
        pressed={!prefs.muted && !blocked}
        label={prefs.muted ? 'Sound is off. Turn sound on' : blocked ? 'Sound is off. Tap to turn sound on' : 'Sound is on. Mute'}
        onClick={onClick}
      />
    </div>
  );
}