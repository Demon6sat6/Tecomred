import { readFileSync } from 'fs';

const file = 'tecomred/src/pages/Checkout.tsx';
const buf = readFileSync(file);

// Find â€¢ sequence
const search = Buffer.from('\u00e2\u0080\u00a2', 'latin1'); // â€¢ as latin1 bytes
console.log('Search bytes:', search.toString('hex'));

// Find in file
const idx = buf.indexOf(search);
console.log('Found at:', idx);
if (idx >= 0) {
  console.log('Context:', buf.slice(idx-5, idx+15).toString('utf8'));
  console.log('Bytes:', buf.slice(idx, idx+6).toString('hex'));
}

// The issue: â€¢ in UTF-8 is: c3 a2 e2 80 9c c2 a2
// This is the UTF-8 encoding of the Latin-1 string "â€¢"
// Where â = 0xe2, € = 0x80 (as Latin-1 0x80), ¢ = 0xa2
// The original character was • (U+2022) = e2 80 a2 in UTF-8
// When those bytes are read as Latin-1: â (e2) + \x80 (80) + ¢ (a2)
// When that Latin-1 string is encoded as UTF-8: c3a2 + c280 + c2a2

// Let's verify
const bullet_utf8 = Buffer.from([0xe2, 0x80, 0xa2]); // • in UTF-8
console.log('Bullet UTF-8:', bullet_utf8.toString('utf8'));
const bullet_latin1 = bullet_utf8.toString('latin1'); // read as latin1
console.log('Bullet as Latin-1:', bullet_latin1);
const bullet_reencoded = Buffer.from(bullet_latin1, 'latin1');
console.log('Re-encoded bytes:', bullet_reencoded.toString('hex'));
const bullet_utf8_reencoded = Buffer.from(bullet_latin1); // encode as UTF-8
console.log('Re-encoded as UTF-8:', bullet_utf8_reencoded.toString('hex'));
console.log('Re-encoded string:', bullet_utf8_reencoded.toString('utf8'));
