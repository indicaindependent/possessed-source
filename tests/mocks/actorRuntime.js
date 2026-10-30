// Minimal stand-in for 'base44:runtime/actors' used by the HauntRoom simulation tests.
// Each actor instance reads its environment (id, storage, attached sockets, wakes) from __env.
export class Actor {
  get instanceId() { return this.__env.instanceId; }
  get storage() { return this.__env.storage; }
  getConnections() { return [...this.__env.conns.values()]; }
  async schedule(key, at) { this.__env.wakes.set(key, at); }
  async cancelSchedule(key) { this.__env.wakes.delete(key); }
}