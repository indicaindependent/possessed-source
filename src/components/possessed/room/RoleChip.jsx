import { Ghost, Search } from 'lucide-react';

export default function RoleChip({ role }) {
  const ghost = role === 'ghost';
  const Icon = ghost ? Ghost : Search;
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-extrabold uppercase tracking-wide text-ink ${ghost ? 'bg-spectral' : 'bg-pumpkin'}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {ghost ? 'Ghost' : 'Hunter'}
    </span>
  );
}