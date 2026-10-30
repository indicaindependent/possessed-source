import { useCallback, useRef } from 'react';
import { derive } from '@/lib/possessed/clock';
import { sfx } from '@/lib/possessed/audio';
import { objectName } from '@/lib/possessed/layout';
import { secs } from '@/lib/possessed/format';

// Stable tap handler for props: local pre-checks give instant text feedback; the server
// decides the outcome. Only one action may be in flight; nothing is queued while offline.
export default function usePick(view, act, say) {
  const ref = useRef();
  ref.current = (id) => {
    if (!view || view.phase !== 'active' || view.clock.paused) return;
    const dd = derive(view, performance.now());
    let type = null;
    if (view.role === 'ghost') {
      if (id === view.ghost?.objectId) return say(`You're already possessing the ${objectName(id)}.`);
      if (dd.ghostReadyIn > 0) return say(`Your next move is ready in ${secs(dd.ghostReadyIn)}s.`);
      type = 'possess';
    } else if (view.role === 'hunter') {
      if (dd.charges <= 0) return say(`No charges left. Refill in ${secs(view.balance.chargeRegenMs - (dd.refill ?? 0))}s.`);
      type = 'investigate';
    }
    if (!type) return;
    const r = act(type, { objectId: id, roundId: view.roundId });
    if (r.ok) { if (type === 'investigate') sfx.investigate(); return; }
    if (r.reason === 'offline') say('Reconnecting to the house. Try that again in a moment.');
    // 'busy': the previous tap is still waiting for the house, so this one is ignored.
  };
  return useCallback((id) => ref.current(id), []);
}