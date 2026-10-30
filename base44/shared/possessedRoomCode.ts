import { CODE_RE } from './possessedConfig.ts';

// Same alphabet/length as the client generator (src/lib/possessed/roomCode.js); CODE_RE is the gate.
const ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';

export function generateRoomCode() {
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
    if (CODE_RE.test(code)) return code;
  }
}