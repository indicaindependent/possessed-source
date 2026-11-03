// Registry of matches in progress, for the honest "N matches in progress" count.
// Rows hold a hash of the room id (never the joinable code); the entity is admin-only
// and only actors touch it through the service role. kind 'practice' rows (vs The House)
// are counted separately and never as live human matches.
export const MATCH_STALE_MS = 20 * 60 * 1000;

async function hashRoom(roomKey) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`possessed:${roomKey}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

const table = (client) => client?.asServiceRole?.entities?.LiveMatch ?? null;

export async function reportMatch(client, roomKey, active, kind = 'match') {
  const db = table(client);
  if (!db) return;
  const room_hash = await hashRoom(roomKey);
  const data = { room_hash, kind, status: active ? 'active' : 'ended', changed_at: new Date().toISOString() };
  const rows = await db.filter({ room_hash });
  if (rows?.length) await db.update(rows[0].id, data);
  else if (active) await db.create(data);
}

const fresh = (now) => ({ status: 'active', changed_at: { $gt: new Date(now - MATCH_STALE_MS).toISOString() } });

export async function countActiveMatches(client, now = Date.now()) {
  const db = table(client);
  if (!db) return null;
  return db.count({ ...fresh(now), kind: { $ne: 'practice' } });
}

export async function countActivePractice(client, now = Date.now()) {
  const db = table(client);
  if (!db) return null;
  return db.count({ ...fresh(now), kind: 'practice' });
}