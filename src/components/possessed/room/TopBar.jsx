import { LogOut, Sparkles, Volume2, VolumeX } from 'lucide-react';
import ConnectionBadge from '@/components/possessed/room/ConnectionBadge';
import IconToggle from '@/components/possessed/room/IconToggle';

export default function TopBar({ code, status, prefs, onLeave }) {
  return (
    <header className="flex shrink-0 items-center gap-2 px-2 pt-2 sm:gap-3 sm:px-4 short:pt-1">
      <span className="hidden font-display text-2xl font-black text-parchment sm:inline short:text-xl">Possessed</span>
      <span className="rounded-lg bg-plum px-2 py-1 font-mono text-base font-bold tracking-[0.18em] text-pumpkin" aria-label={`Room code ${code.split('').join(' ')}`}>
        {code}
      </span>
      <ConnectionBadge status={status} />
      <div className="ml-auto flex items-center gap-1.5">
        <IconToggle icon={prefs.muted ? VolumeX : Volume2} label={prefs.muted ? 'Sound is off. Turn sound on' : 'Sound is on. Mute'} pressed={!prefs.muted} onClick={prefs.toggleMute} />
        <IconToggle icon={Sparkles} label={prefs.reducedMotion ? 'Reduced motion is on' : 'Reduced motion is off'} pressed={prefs.reducedMotion} slashed={prefs.reducedMotion} onClick={prefs.toggleMotion} />
        <IconToggle icon={LogOut} label="Leave haunt" onClick={onLeave} />
      </div>
    </header>
  );
}