import { LIMITS } from './possessedConfig.ts';

// Platform-verified identity of a connection. conn.id is client-held, so it is only
// trusted together with this key. Never send this key to any client.
export function identityKey(conn) {
  const id = conn?.identity;
  if (!id) return null;
  if (id.type === 'authenticated' && id.userId) return `u:${id.userId}`;
  if (id.type === 'anonymous' && id.anonymousId) return `a:${id.anonymousId}`;
  return null;
}

// Token bucket per connection id (same limits for every POSSESSED actor).
export function createLimiter() {
  const buckets = new Map();
  return {
    allow(id) {
      const now = Date.now();
      const b = buckets.get(id) ?? { tokens: LIMITS.rateBurst, at: now };
      b.tokens = Math.min(LIMITS.rateBurst, b.tokens + ((now - b.at) / 1000) * LIMITS.rateRefillPerSec);
      b.at = now;
      buckets.set(id, b);
      if (b.tokens < 1) return false;
      b.tokens -= 1;
      return true;
    },
    forget(id) { buckets.delete(id); },
  };
}