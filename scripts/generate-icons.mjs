/**
 * Generates the extension's placeholder PNG icons with no external dependency.
 * Run it only when the drawing changes: `node scripts/generate-icons.mjs`.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'public', 'icons');

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** Light sheet with one dark "line of text" across the middle: legible at 16px. */
function pixel(x, y, side) {
  const margin = Math.max(1, Math.round(side * 0.09));
  const inside = x >= margin && x < side - margin && y >= margin && y < side - margin;
  if (!inside) return [0, 0, 0, 0];
  const line = y > side * 0.44 && y < side * 0.56 && x > side * 0.26 && x < side * 0.74;
  return line ? [29, 28, 26, 255] : [251, 250, 248, 255];
}

function png(side) {
  const raw = Buffer.alloc(side * (side * 4 + 1));
  let p = 0;
  for (let y = 0; y < side; y++) {
    raw[p++] = 0; // "none" filter
    for (let x = 0; x < side; x++) {
      const [r, g, b, a] = pixel(x, y, side);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(side, 0);
  ihdr.writeUInt32BE(side, 4);
  ihdr[8] = 8; // bits per channel
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(TARGET, { recursive: true });
for (const side of [16, 32, 48, 128]) {
  writeFileSync(join(TARGET, `${side}.png`), png(side));
  console.log(`icons/${side}.png`);
}
