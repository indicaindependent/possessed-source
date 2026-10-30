// Per-tab bookkeeping lives in sessionStorage so two tabs are two independent players.
const KEY = 'possessed:session';

export function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; }
}

export function saveSession(s) {
  if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
  else sessionStorage.removeItem(KEY);
}

export function connIdFor(code) {
  const k = `possessed:conn:${code}`;
  let id = sessionStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(k, id); }
  return id;
}

export const forgetConn = (code) => sessionStorage.removeItem(`possessed:conn:${code}`);