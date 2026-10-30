import { useMatchmaker } from '@/lib/possessed/matchmaker';

function line({ online, searching, matches }) {
  if (online <= 1 && searching === 0) return "You're the first one here. Start a Quick Match and we'll pair you when someone joins, or invite a friend.";
  const parts = [`${online} online`, `${searching} searching`];
  if (matches != null) parts.push(`${matches} ${matches === 1 ? 'match' : 'matches'} in progress`);
  return parts.join(', ');
}

// Only this line re-renders on count changes. Fixed height: appearing/updating never reflows Home.
export default function LivePresence() {
  const counts = useMatchmaker((s) => s.counts);
  return (
    <p className="mt-1.5 flex min-h-[2.5rem] items-center justify-center gap-2 text-sm font-bold text-parchment/90 lg:justify-start short:min-h-[2rem] short:justify-start short:text-[13px]" aria-live="polite">
      {counts && (
        <>
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spectral opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-spectral" />
          </span>
          <span className="leading-snug">{line(counts)}</span>
        </>
      )}
    </p>
  );
}