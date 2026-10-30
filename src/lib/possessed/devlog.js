// Development-only instrumentation. Never logs secrets, seat credentials or object ids.
const DEV = import.meta.env.DEV;
const MAX = 200;

export function devLog(line) {
  if (!DEV) return;
  const entry = { t: Math.round(performance.now()), line };
  const store = (window.__possessed ??= { log: [] });
  store.log.push(entry);
  if (store.log.length > MAX) store.log.shift();
  console.info(`[possessed] ${line}`);
}