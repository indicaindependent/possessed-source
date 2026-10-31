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
      {blocked ? (
        <button type="button" onClick={onClick} className="min-h-[44px] animate-pulse rounded-full border border-pumpkin/40 bg-ink/80 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-pumpkin">
          Tap for sound
        </button>
      ) : (
      <IconToggle
        icon={prefs.muted ? VolumeX : Volume2}
        slashed={prefs.muted}
        pressed={!prefs.muted}
        label={prefs.muted ? 'Sound is off. Turn sound on' : blocked ? 'Tap to start the music' : 'Sound is on. Mute'}
        onClick={onClick}
      />
      )}
    </div>
  );
}