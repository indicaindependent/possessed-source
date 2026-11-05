export const RECORD_KEY = 'possessed.record';
const levels = ['restless', 'haunted', 'possessed'];
export const readHauntRecord = (storage = localStorage) => JSON.parse(storage.getItem(RECORD_KEY) || 'null');

// Final results only; the durable match identity makes reconnects/remounts idempotent.
export function saveHauntRecord(view, storage = localStorage) {
  if (view.phase !== 'final' || !view.recordId || view.results?.length !== 2) return null;
  const record = readHauntRecord(storage) || { matchesPlayed: 0, bestSurvivalMs: 0, fastestCatchMs: null, tauntsFired: 0, housesBeaten: { restless: 0, haunted: 0, possessed: 0 }, completed: [] };
  const id = `${view.recordId}:${view.you}`;
  if (record.completed.includes(id)) return record;
  const ghost = view.results.find((r) => r.ghostSeat === view.you);
  const hunter = view.results.find((r) => r.ghostSeat !== view.you);
  if (!ghost || !hunter) return null;
  record.matchesPlayed += 1;
  record.bestSurvivalMs = Math.max(record.bestSurvivalMs, ghost.survivalMs);
  if (hunter.outcome === 'caught') record.fastestCatchMs = record.fastestCatchMs == null ? hunter.survivalMs : Math.min(record.fastestCatchMs, hunter.survivalMs);
  record.tauntsFired += ghost.tauntsFired || 0;
  const level = levels.includes(view.practiceLevel) ? view.practiceLevel : 'haunted';
  if (view.practice && view.winner === view.you) record.housesBeaten[level] += 1;
  record.completed.push(id);
  storage.setItem(RECORD_KEY, JSON.stringify(record));
  return record;
}