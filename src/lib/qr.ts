// BAMBEH_DEPLOY_TOKEN__QR_FIX893_CLEAN
// FILE LOCATION: src/lib/qr.ts
//
// FIX893 - a QR code made inside the app, with nothing downloaded (Package 10: the "Verified on Bambeh" card carries
// a QR code of the seller's shop link). Standard QR (ISO/IEC 18004): byte mode, versions 1 to 10 (up to 271 letters
// at level L, 213 at M), error correction L / M / Q / H, all eight masks with the standard penalty to pick the best.
// Checked by reading every version, level and mask back with the jsQR reader the app already uses for Taxi check.
// (c) 2026 BAMBEH SARL. All rights reserved.

export type QrLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrCode {
  /** modules per side (21 for version 1, +4 per version) */
  size: number;
  /** modules[y][x] - true is dark */
  modules: boolean[][];
  version: number;
  level: QrLevel;
  mask: number;
}

// Error-correction codewords per block and number of blocks, versions 1-10 (index 0 unused).
const ECC_PER_BLOCK: Record<QrLevel, number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28],
};
const BLOCKS: Record<QrLevel, number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8],
};
const FORMAT_LEVEL: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };
const MAX_VERSION = 10;

function rawDataModules(ver: number): number {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}

function dataCodewords(ver: number, level: QrLevel): number {
  return Math.floor(rawDataModules(ver) / 8) - ECC_PER_BLOCK[level][ver] * BLOCKS[level][ver];
}

// ---------------------------------------------------------------- Reed-Solomon over GF(256), polynomial 0x11D
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsDivisor(degree: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => { result[i] ^= gfMul(coef, factor); });
  }
  return result;
}

function withEcc(data: number[], ver: number, level: QrLevel): number[] {
  const numBlocks = BLOCKS[level][ver];
  const eccLen = ECC_PER_BLOCK[level][ver];
  const raw = Math.floor(rawDataModules(ver) / 8);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  const div = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const out: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((b, j) => {
      if (i !== shortLen - eccLen || j >= numShort) out.push(b[i]);
    });
  }
  return out;
}

// ---------------------------------------------------------------- the symbol
function utf8(text: string): number[] {
  if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text));
  const s = unescape(encodeURIComponent(text));
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
  return out;
}

function alignmentPositions(ver: number, size: number): number[] {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const step = Math.floor((ver * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < n; pos -= step) result.splice(1, 0, pos);
  return result;
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

class Grid {
  size: number;
  m: boolean[][];
  fn: boolean[][];
  constructor(size: number) {
    this.size = size;
    this.m = [];
    this.fn = [];
    for (let y = 0; y < size; y++) {
      this.m.push(new Array<boolean>(size).fill(false));
      this.fn.push(new Array<boolean>(size).fill(false));
    }
  }
  setFn(x: number, y: number, dark: boolean): void {
    this.m[y][x] = dark;
    this.fn[y][x] = true;
  }
}

function drawFunctionPatterns(g: Grid, ver: number): void {
  const size = g.size;
  for (let i = 0; i < size; i++) {
    g.setFn(6, i, i % 2 === 0);
    g.setFn(i, 6, i % 2 === 0);
  }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) g.setFn(x, y, d !== 2 && d !== 4);
      }
    }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);
  const pos = alignmentPositions(ver, size);
  const n = pos.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) g.setFn(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }
  drawFormatBits(g, 'M', 0); // reserves the format area; drawn for real once the mask is chosen
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      g.setFn(a, b, bit);
      g.setFn(b, a, bit);
    }
  }
}

function drawFormatBits(g: Grid, level: QrLevel, mask: number): void {
  const data = (FORMAT_LEVEL[level] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i: number) => ((bits >>> i) & 1) !== 0;
  const size = g.size;
  for (let i = 0; i <= 5; i++) g.setFn(8, i, bit(i));
  g.setFn(8, 7, bit(6));
  g.setFn(8, 8, bit(7));
  g.setFn(7, 8, bit(8));
  for (let i = 9; i < 15; i++) g.setFn(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) g.setFn(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) g.setFn(8, size - 15 + i, bit(i));
  g.setFn(8, size - 8, true);
}

function drawCodewords(g: Grid, data: number[]): void {
  const size = g.size;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!g.fn[y][x] && i < data.length * 8) {
          g.m[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
      }
    }
  }
}

function applyMask(g: Grid, mask: number): void {
  for (let y = 0; y < g.size; y++) {
    for (let x = 0; x < g.size; x++) {
      if (!g.fn[y][x] && maskBit(mask, x, y)) g.m[y][x] = !g.m[y][x];
    }
  }
}

function penalty(g: Grid): number {
  const size = g.size;
  const m = g.m;
  let score = 0;
  const line = (get: (i: number) => boolean) => {
    let s = 0;
    let run = 1;
    for (let i = 1; i < size; i++) {
      if (get(i) === get(i - 1)) {
        run++;
      } else {
        if (run >= 5) s += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) s += 3 + (run - 5);
    // finder-like 1:1:3:1:1 with four light modules on one side (outside the symbol counts as light)
    const at = (i: number) => (i < 0 || i >= size ? false : get(i));
    for (let i = -4; i < size; i++) {
      const core = at(i) && !at(i + 1) && at(i + 2) && at(i + 3) && at(i + 4) && !at(i + 5) && at(i + 6);
      if (!core) continue;
      const before = !at(i - 1) && !at(i - 2) && !at(i - 3) && !at(i - 4);
      const after = !at(i + 7) && !at(i + 8) && !at(i + 9) && !at(i + 10);
      if (before || after) s += 40;
    }
    return s;
  };
  for (let y = 0; y < size; y++) score += line((i) => m[y][i]);
  for (let x = 0; x < size; x++) score += line((i) => m[i][x]);
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
    }
  }
  let dark = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (m[y][x]) dark++;
  const total = size * size;
  score += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
  return score;
}

/**
 * The QR code for a text (a link). The smallest version that fits at the level asked; throws when the text is longer
 * than version 10 holds (213 bytes at level M) - a shop link is far shorter.
 */
export function makeQr(text: string, level: QrLevel = 'M', forceMask?: number): QrCode {
  const bytes = utf8(text);
  let ver = 1;
  for (; ver <= MAX_VERSION; ver++) {
    const ccBits = ver <= 9 ? 8 : 16;
    if (4 + ccBits + bytes.length * 8 <= dataCodewords(ver, level) * 8) break;
  }
  if (ver > MAX_VERSION) throw new Error('QR: text too long (' + bytes.length + ' bytes)');
  const capBits = dataCodewords(ver, level) * 8;
  const bits: number[] = [];
  const put = (val: number, len: number) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(0x4, 4);
  put(bytes.length, ver <= 9 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  put(0, Math.min(4, capBits - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    data.push(v);
  }
  for (let pad = 0xec; data.length < capBits / 8; pad ^= 0xec ^ 0x11) data.push(pad);

  const size = ver * 4 + 17;
  const base = new Grid(size);
  drawFunctionPatterns(base, ver);
  drawCodewords(base, withEcc(data, ver, level));

  const tryMask = (mask: number): Grid => {
    const g = new Grid(size);
    for (let y = 0; y < size; y++) {
      g.m[y] = base.m[y].slice();
      g.fn[y] = base.fn[y].slice();
    }
    applyMask(g, mask);
    drawFormatBits(g, level, mask);
    return g;
  };
  let best: Grid | null = null;
  let bestMask = 0;
  if (forceMask !== undefined && forceMask >= 0 && forceMask <= 7) {
    best = tryMask(forceMask);
    bestMask = forceMask;
  } else {
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
      const g = tryMask(mask);
      const s = penalty(g);
      if (s < bestScore) { bestScore = s; best = g; bestMask = mask; }
    }
  }
  const g = best as Grid;
  return { size, modules: g.m, version: ver, level, mask: bestMask };
}

/** Draws a QR code on a canvas: dark modules in `color` on `background`, with the 4-module quiet zone. */
export function drawQr(ctx: CanvasRenderingContext2D, qr: QrCode, x: number, y: number, width: number,
                       color = '#10231F', background = '#FFFFFF'): void {
  const n = qr.size + 8;
  const cell = width / n;
  ctx.fillStyle = background;
  ctx.fillRect(x, y, width, width);
  ctx.fillStyle = color;
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (!qr.modules[r][c]) continue;
      // whole pixels with a hair of overlap, so no seams show between modules
      const x0 = Math.floor(x + (c + 4) * cell);
      const y0 = Math.floor(y + (r + 4) * cell);
      const x1 = Math.ceil(x + (c + 5) * cell);
      const y1 = Math.ceil(y + (r + 5) * cell);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }
}
// BAMBEH_END_TOKEN__QR_FIX893__COMPLETE
