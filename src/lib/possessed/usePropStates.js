import { useMemo } from 'react';

// Merge transient event marks with authoritative state (my own possession, round reveal).
export default function usePropStates(view, marks) {
  return useMemo(() => {
    const ps = {};
    const add = (id, patch) => { if (id) ps[id] = { ...(ps[id] || {}), ...patch }; };
    for (const [id, m] of Object.entries(marks)) add(id, m);
    if (!view) return ps;
    if (view.ghost?.objectId) add(view.ghost.objectId, { possessed: true });
    const last = view.results[view.results.length - 1];
    if (last && (view.phase === 'intermission' || view.phase === 'final')) {
      add(last.hidingObject, last.outcome === 'caught' ? { caught: true } : { survivedHere: true });
    }
    return ps;
  }, [view, marks]);
}