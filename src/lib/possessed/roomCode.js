// No 0/O, 1/I/L, 5/S, 2/Z, 8/B: easy to read aloud and type.
export const CODE_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';
export const CODE_LENGTH = 6;
const CODE_RE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export const normalizeCode = (v = '') => String(v).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
export const isValidCode = (v) => CODE_RE.test(v);
export const instanceIdFor = (code) => `haunt-${code}`;