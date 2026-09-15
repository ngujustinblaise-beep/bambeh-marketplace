// BAMBEH_DEPLOY_TOKEN__QRCODE_FIX602_CLEAN
/**
 * src/lib/qrcode.ts - Bambeh Marketplace
 *
 * A QR encoder with NO dependencies. Byte mode, error correction level M,
 * versions 1 to 10 - which covers any Bambeh invite link with room to spare.
 *
 * WHY THIS EXISTS RATHER THAN AN npm PACKAGE. An agent standing in a market
 * needs to hold up a phone and have somebody scan it. Adding a library for
 * that means another thing to install, another thing in the bundle, and
 * another thing that can break on a build. This file is ~250 lines and has
 * been checked module-for-module against the segno reference encoder, so it
 * is not a guess and not a simplification - it is the real specification.
 *
 * WHAT IT DOES NOT DO. Kanji mode, structured append, ECI, versions above 10.
 * None of those can occur for a URL of this length, and pretending to support
 * them would be code nobody ever runs.
 */

/* ---------------------------------------------------------- GF(256) ------ */
/* Reed-Solomon needs arithmetic in the field the QR spec fixes: the
   polynomial x^8 + x^4 + x^3 + x^2 + 1, i.e. 0x11D. */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

const mul = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];

/** The generator polynomial for `degree` error-correction codewords. */
function rsGenerator(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let d = 0; d < degree; d++) {
    const next = new Uint8Array(poly.length + 1);
    for (let i = 0; i < poly.length; i++) {
      next[i] ^= poly[i];
      next[i + 1] ^= mul(poly[i], EXP[d]);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data: Uint8Array, degree: number): Uint8Array {
  const gen = rsGenerator(degree);
  const rem = new Uint8Array(degree);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.copyWithin(0, 1);
    rem[degree - 1] = 0;
    for (let i = 0; i < degree; i++) rem[i] ^= mul(gen[i + 1], factor);
  }
  return rem;
}

/* ------------------------------------------------ version tables (level M) */
/* [total data codewords, ec codewords per block, group1 blocks, group2 blocks]
   Straight from the specification's table 13-22 for error correction M. */
const M_TABLE: Record<number, [number, number, number, number]> = {
  1:  [16,  10, 1, 0],
  2:  [28,  16, 1, 0],
  3:  [44,  26, 1, 0],
  4:  [64,  18, 2, 0],
  5:  [86,  24, 2, 0],
  6:  [108, 16, 4, 0],
  7:  [124, 18, 4, 0],
  8:  [154, 22, 2, 2],
  9:  [182, 22, 3, 2],
  10: [216, 26, 4, 1],
};

const ALIGN_PATTERNS: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

/* Version information for versions 7 and up, pre-computed with its BCH bits. */
const VERSION_INFO: Record<number, number> = {
  7: 0x07c94, 8: 0x085bc, 9: 0x09a99, 10: 0x0a4d3,
};

/* --------------------------------------------------------- bit buffer ---- */
class Bits {
  data: number[] = [];
  push(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.data.push((value >>> i) & 1);
  }
  get length() { return this.data.length; }
}

/* ------------------------------------------------------------ encoder ---- */
function pickVersion(byteLength: number): number {
  for (let v = 1; v <= 10; v++) {
    const capacityBits = M_TABLE[v][0] * 8;
    const countBits = v < 10 ? 8 : 16;      // byte mode count length
    if (4 + countBits + byteLength * 8 <= capacityBits) return v;
  }
  throw new Error('QR: text too long for version 10 at level M');
}

function buildCodewords(bytes: Uint8Array, version: number): Uint8Array {
  const [totalData, ecPerBlock, g1, g2] = M_TABLE[version];

  const bits = new Bits();
  bits.push(0b0100, 4);                                  // byte mode
  bits.push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) bits.push(b, 8);

  // terminator, then pad to a byte boundary
  const capacity = totalData * 8;
  bits.push(0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.data.push(0);

  // pad bytes alternate 0xEC / 0x11, as the spec requires
  const padding = [0xec, 0x11];
  for (let i = 0; bits.length < capacity; i++) bits.push(padding[i % 2], 8);

  const dataBytes = new Uint8Array(totalData);
  for (let i = 0; i < totalData; i++) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits.data[i * 8 + j];
    dataBytes[i] = v;
  }

  // split into blocks; group 2 blocks hold one more data codeword than group 1
  const blockCount = g1 + g2;
  const shortLen = Math.floor(totalData / blockCount);
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  for (let b = 0; b < blockCount; b++) {
    const len = b < g1 ? shortLen : shortLen + 1;
    const block = dataBytes.subarray(offset, offset + len);
    offset += len;
    dataBlocks.push(block);
    ecBlocks.push(rsRemainder(block, ecPerBlock));
  }

  // interleave: column-wise across blocks, data first then error correction
  const out: number[] = [];
  const maxData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++) {
    for (const b of dataBlocks) if (i < b.length) out.push(b[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const b of ecBlocks) out.push(b[i]);
  }
  return new Uint8Array(out);
}

/* ------------------------------------------------------------ matrix ----- */
type Grid = { size: number; mod: Uint8Array; fixed: Uint8Array };

const at = (g: Grid, x: number, y: number) => g.mod[y * g.size + x];
const set = (g: Grid, x: number, y: number, dark: number, fixed = true) => {
  g.mod[y * g.size + x] = dark;
  if (fixed) g.fixed[y * g.size + x] = 1;
};

function placeFinder(g: Grid, ox: number, oy: number) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const x = ox + dx, y = oy + dy;
      if (x < 0 || y < 0 || x >= g.size || y >= g.size) continue;
      const inner = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6;
      const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
      set(g, x, y, inner && (ring || core) ? 1 : 0);
    }
  }
}

function buildMatrix(codewords: Uint8Array, version: number, mask: number): Grid {
  const size = version * 4 + 17;
  const g: Grid = {
    size,
    mod: new Uint8Array(size * size),
    fixed: new Uint8Array(size * size),
  };

  placeFinder(g, 0, 0);
  placeFinder(g, size - 7, 0);
  placeFinder(g, 0, size - 7);

  // alignment patterns, skipping where they would collide with a finder
  const centres = ALIGN_PATTERNS[version];
  for (const cy of centres) {
    for (const cx of centres) {
      const nearFinder =
        (cx === 6 && cy === 6) ||
        (cx === 6 && cy === size - 7) ||
        (cx === size - 7 && cy === 6);
      if (nearFinder) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ring = Math.max(Math.abs(dx), Math.abs(dy));
          set(g, cx + dx, cy + dy, ring === 1 ? 0 : 1);
        }
      }
    }
  }

  // timing patterns
  for (let i = 8; i < size - 8; i++) {
    set(g, i, 6, i % 2 === 0 ? 1 : 0);
    set(g, 6, i, i % 2 === 0 ? 1 : 0);
  }

  // the dark module, always set
  set(g, 8, size - 8, 1);

  // reserve the format areas so data skips them
  for (let i = 0; i < 9; i++) {
    if (i !== 6) { set(g, i, 8, 0); set(g, 8, i, 0); }
  }
  for (let i = 0; i < 8; i++) {
    set(g, size - 1 - i, 8, 0);
    if (i < 7) set(g, 8, size - 1 - i, 0);
  }
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const a = Math.floor(i / 3), b = i % 3;
      set(g, size - 11 + b, a, 0);
      set(g, a, size - 11 + b, 0);
    }
  }

  // data, snaking up and down in two-column strips, right to left
  let bit = 0;
  const total = codewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    /* Column 6 is the vertical timing pattern. Stepping over it shifts EVERY
       remaining column left by one - it is not a skip for this pair only.
       Getting that wrong offsets the entire data region and still produces a
       plausible-looking code that no scanner can read. */
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - vert : vert;
      for (let c = 0; c < 2; c++) {
        const x = right - c;
        if (x < 0 || g.fixed[y * g.size + x]) continue;
        let dark = 0;
        if (bit < total) {
          dark = (codewords[bit >>> 3] >>> (7 - (bit & 7))) & 1;
          bit++;
        }
        if (maskBit(mask, x, y)) dark ^= 1;
        g.mod[y * g.size + x] = dark;
      }
    }
  }

  writeFormat(g, mask);
  if (version >= 7) writeVersion(g, version);
  return g;
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function writeFormat(g: Grid, mask: number) {
  const ecBits = 0b00;                        // level M
  const data = (ecBits << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const size = g.size;

  for (let i = 0; i <= 5; i++) set(g, 8, i, (bits >>> i) & 1);
  set(g, 8, 7, (bits >>> 6) & 1);
  set(g, 8, 8, (bits >>> 7) & 1);
  set(g, 7, 8, (bits >>> 8) & 1);
  for (let i = 9; i < 15; i++) set(g, 14 - i, 8, (bits >>> i) & 1);

  for (let i = 0; i < 8; i++) set(g, size - 1 - i, 8, (bits >>> i) & 1);
  for (let i = 8; i < 15; i++) set(g, 8, size - 15 + i, (bits >>> i) & 1);
}

function writeVersion(g: Grid, version: number) {
  const bits = VERSION_INFO[version];
  const size = g.size;
  for (let i = 0; i < 18; i++) {
    const b = (bits >>> i) & 1;
    const a = Math.floor(i / 3), c = i % 3;
    set(g, size - 11 + c, a, b);
    set(g, a, size - 11 + c, b);
  }
}

/* ----------------------------------------------------- mask selection ---- */
function penalty(g: Grid): number {
  const n = g.size;
  let score = 0;

  // rule 1: runs of five or more
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < n; a++) {
      let run = 1;
      for (let b = 1; b < n; b++) {
        const prev = pass ? at(g, a, b - 1) : at(g, b - 1, a);
        const cur  = pass ? at(g, a, b)     : at(g, b, a);
        if (cur === prev) { run++; } else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
  }

  // rule 2: 2x2 blocks of one colour
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const v = at(g, x, y);
      if (v === at(g, x + 1, y) && v === at(g, x, y + 1) && v === at(g, x + 1, y + 1)) score += 3;
    }
  }

  // rule 3: the finder-lookalike 1:1:3:1:1 with four light modules either side
  const A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  const match = (get: (i: number) => number, start: number, pat: number[]) => {
    for (let i = 0; i < 11; i++) if (get(start + i) !== pat[i]) return false;
    return true;
  };
  for (let a = 0; a < n; a++) {
    for (let start = 0; start + 11 <= n; start++) {
      const row = (i: number) => at(g, i, a);
      const col = (i: number) => at(g, a, i);
      if (match(row, start, A) || match(row, start, B)) score += 40;
      if (match(col, start, A) || match(col, start, B)) score += 40;
    }
  }

  // rule 4: how far the dark proportion strays from half
  let dark = 0;
  for (let i = 0; i < n * n; i++) dark += g.mod[i];
  const pct = (dark * 100) / (n * n);
  score += Math.floor(Math.abs(pct - 50) / 5) * 10;

  return score;
}

/* --------------------------------------------------------- public API ---- */
/** The QR matrix for `text`: an array of rows, each row an array of 0/1. */
export function qrMatrix(text: string): number[][] {
  const bytes = new TextEncoder().encode(text);
  const version = pickVersion(bytes.length);
  const codewords = buildCodewords(bytes, version);

  let best: Grid | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const g = buildMatrix(codewords, version, mask);
    const s = penalty(g);
    if (s < bestScore) { bestScore = s; best = g; }
  }

  const g = best as Grid;
  const rows: number[][] = [];
  for (let y = 0; y < g.size; y++) {
    const row: number[] = [];
    for (let x = 0; x < g.size; x++) row.push(at(g, x, y));
    rows.push(row);
  }
  return rows;
}

/**
 * An SVG string for `text`, sized to `px`, with the 4-module quiet zone the
 * specification requires. Without that border many scanners simply fail, which
 * is the most common reason a home-made QR "does not work".
 */
export function qrSvg(text: string, px = 220): string {
  const m = qrMatrix(text);
  const n = m.length;
  const quiet = 4;
  const total = n + quiet * 2;

  let path = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (m[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"`,
    ` viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">`,
    `<rect width="${total}" height="${total}" fill="#ffffff"/>`,
    `<path d="${path}" fill="#0f172a"/>`,
    '</svg>',
  ].join('');
}
// BAMBEH_END_TOKEN__QRCODE_FIX602__COMPLETE
