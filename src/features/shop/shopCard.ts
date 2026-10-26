// BAMBEH_DEPLOY_TOKEN__SHOPCARD_FIX896_CLEAN
// FILE LOCATION: src/features/shop/shopCard.ts
//
// FIX896 - the seller's card (Package 10): one picture to post on a WhatsApp status or on Facebook. The shop name,
// "Verified on Bambeh" only when Bambeh checked the seller (otherwise "On Bambeh"), the stars buyers gave, how many
// things are for sale, the town, a QR code and the link bambeh.com/<name>, and the sign-off - in the seller's
// language. 1080 x 1350 (portrait 4:5: a Facebook post and a WhatsApp status both show it whole). Drawn in the phone,
// nothing is sent anywhere. Bambeh's colours: deep teal, warm sand, ink, marigold for the stars.
// Anyone can fake a picture; the QR code and the link open the real shop page, which shows the truth.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { drawQr, makeQr } from '@/lib/qr';
import { SHOP_STR, shopFill } from './shopText';
import type { ShopLang } from './shopText';
import { shopShort, shopUrl } from './shopApi';

export const CARD_W = 1080;
export const CARD_H = 1350;

const TEAL = '#0C5D57';
const SAND = '#F6EFE4';
const INK = '#10231F';
const MUTED = '#4D5A56';
const MARIGOLD = '#F2A93B';
const CARD = '#FFFCF7';
const LINE = '#E6DCCB';
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif";

export interface CardInput {
  name: string;
  slug: string;
  verified: boolean;
  rating: { avg: number; count: number };
  items: number;
  town: string | null;
  lang: ShopLang;
}

const ICON = {
  bag: 'M6 7h12l-1 13H7L6 7z M9 7a3 3 0 0 1 6 0',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
  check: 'M9 12l2 2 4-4',
  star: 'M12 3l2.7 5.6 6.1 0.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-0.9z',
  pin: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z',
};

function icon(ctx: CanvasRenderingContext2D, path: string, x: number, y: number, size: number, stroke: string | null,
              fill: string | null, width = 2): void {
  if (typeof Path2D === 'undefined') return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  const p = new Path2D(path);
  if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(p);
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** The name on at most two lines, the font made smaller until it fits (then cut with an ellipsis). */
function nameLines(ctx: CanvasRenderingContext2D, name: string, maxW: number): { lines: string[]; size: number } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  for (let size = 84; size >= 52; size -= 4) {
    ctx.font = 'bold ' + size + 'px ' + FONT;
    const lines: string[] = [];
    let cur = '';
    let fits = true;
    for (const w of words) {
      const next = cur ? cur + ' ' + w : w;
      if (ctx.measureText(next).width <= maxW) { cur = next; continue; }
      if (!cur) { fits = false; break; }
      lines.push(cur);
      cur = w;
      if (ctx.measureText(cur).width > maxW) { fits = false; break; }
    }
    if (cur) lines.push(cur);
    if (fits && lines.length <= 2) return { lines, size };
  }
  ctx.font = 'bold 52px ' + FONT;
  let one = name.trim();
  while (one.length > 1 && ctx.measureText(one + '\u2026').width > maxW) one = one.slice(0, -1);
  return { lines: [one + (one.length < name.trim().length ? '\u2026' : '')], size: 52 };
}

/** Sets the biggest font, from `size` down to `min`, at which the text fits in maxW (long links, long words in French). */
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, min: number, bold: boolean): number {
  for (let s = size; s > min; s -= 2) {
    ctx.font = (bold ? 'bold ' : '') + s + 'px ' + FONT;
    if (ctx.measureText(text).width <= maxW) return s;
  }
  ctx.font = (bold ? 'bold ' : '') + min + 'px ' + FONT;
  return min;
}

/** Draws the card on the canvas (it is sized to 1080 x 1350). */
export function drawShopCard(canvas: HTMLCanvasElement, c: CardInput): void {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const t = SHOP_STR[c.lang];
  const rtl = c.lang === 'ar';
  const PAD = 80;
  const X = (x: number) => (rtl ? CARD_W - x : x);
  const align: CanvasTextAlign = rtl ? 'right' : 'left';
  ctx.direction = rtl ? 'rtl' : 'ltr';

  // the ground and the calm teal bar with the wordmark
  ctx.fillStyle = SAND;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, CARD_W, 180);
  ctx.save();
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  icon(ctx, ICON.bag, PAD, 62, 58, '#FFFFFF', null, 2.1);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px ' + FONT;
  ctx.fillText('Bambeh', PAD + 76, 111);
  ctx.restore();

  // the shop name
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  const nl = nameLines(ctx, c.name, CARD_W - PAD * 2);
  ctx.fillStyle = INK;
  ctx.font = 'bold ' + nl.size + 'px ' + FONT;
  let y = 196 + nl.size;
  nl.lines.forEach((ln, i) => { ctx.fillText(ln, X(PAD), y + i * Math.round(nl.size * 1.14)); });
  y += (nl.lines.length - 1) * Math.round(nl.size * 1.14) + 34;

  // Verified on Bambeh (filled teal) - or On Bambeh (outlined)
  // filled: 28 + shield 40 + 14 + the words + 32; outlined: 28 + the words + 28
  const label = c.verified ? t.verified : t.onBambeh;
  const inner = c.verified ? 28 + 40 + 14 + 32 : 56;
  fit(ctx, label, CARD_W - PAD * 2 - inner, 38, 28, true);
  const pillW = Math.ceil(ctx.measureText(label).width) + inner;
  const pillH = 76;
  const pillX = rtl ? CARD_W - PAD - pillW : PAD;
  roundRect(ctx, pillX, y, pillW, pillH, pillH / 2);
  if (c.verified) {
    ctx.fillStyle = TEAL;
    ctx.fill();
    const ix = rtl ? pillX + pillW - 28 - 40 : pillX + 28;
    icon(ctx, ICON.shield, ix, y + 18, 40, '#FFFFFF', null, 2.2);
    icon(ctx, ICON.check, ix, y + 18, 40, '#FFFFFF', null, 2.4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, rtl ? pillX + pillW - 82 : pillX + 82, y + 51);
  } else {
    ctx.lineWidth = 3;
    ctx.strokeStyle = TEAL;
    ctx.stroke();
    ctx.fillStyle = TEAL;
    ctx.fillText(label, rtl ? pillX + pillW - 28 : pillX + 28, y + 51);
  }
  y += pillH + 62;

  // the stars and how much is for sale
  ctx.font = 'bold 38px ' + FONT;
  const forSale = shopFill(t.forSale, { n: c.items });
  let line: string;
  if (c.rating.count > 0) {
    const starX = rtl ? CARD_W - PAD - 40 : PAD;
    icon(ctx, ICON.star, starX, y - 34, 40, MARIGOLD, MARIGOLD, 1.5);
    line = c.rating.avg.toFixed(1) + ' (' + c.rating.count + ')   \u00b7   ' + forSale;
    ctx.fillStyle = INK;
    fit(ctx, line, CARD_W - PAD * 2 - 54, 38, 28, true);
    ctx.fillText(line, X(PAD + 54), y);
  } else {
    ctx.fillStyle = INK;
    fit(ctx, forSale, CARD_W - PAD * 2, 38, 28, true);
    ctx.fillText(forSale, X(PAD), y);
  }
  if (c.town) {
    y += 58;
    icon(ctx, ICON.pin, rtl ? CARD_W - PAD - 34 : PAD, y - 29, 34, MUTED, null, 2);
    ctx.fillStyle = MUTED;
    fit(ctx, c.town, CARD_W - PAD * 2 - 46, 34, 26, false);
    ctx.fillText(c.town, X(PAD + 46), y);
  }

  // the QR code on a white panel, "Scan to see my items" under it
  const panelW = 450;
  const panelH = 500;
  const panelX = (CARD_W - panelW) / 2;
  const panelY = Math.max(y + 40, 620);
  roundRect(ctx, panelX, panelY, panelW, panelH, 36);
  ctx.fillStyle = CARD;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = LINE;
  ctx.stroke();
  const qrW = 410;
  drawQr(ctx, makeQr(shopUrl(c.slug), 'M'), panelX + (panelW - qrW) / 2, panelY + 20, qrW, INK, CARD);
  ctx.textAlign = 'center';
  ctx.fillStyle = MUTED;
  fit(ctx, t.cardScan, panelW - 48, 30, 22, false);
  ctx.fillText(t.cardScan, CARD_W / 2, panelY + panelH - 28);

  // the link (a long one is made smaller, never cut), how to buy safely, the sign-off
  const linkY = panelY + panelH + 64;
  ctx.fillStyle = TEAL;
  ctx.save();
  ctx.direction = 'ltr';
  fit(ctx, shopShort(c.slug), CARD_W - PAD * 2, 50, 28, true);
  ctx.fillText(shopShort(c.slug), CARD_W / 2, linkY);
  ctx.restore();
  ctx.fillStyle = MUTED;
  fit(ctx, t.cardChat, CARD_W - PAD * 2, 30, 22, false);
  ctx.fillText(t.cardChat, CARD_W / 2, linkY + 46);
  ctx.fillStyle = TEAL;
  ctx.font = 'bold 30px ' + FONT;
  const sign = t.signoff;
  if (rtl) {
    ctx.fillText(sign, CARD_W / 2, CARD_H - 40);
  } else {
    // letter-spaced by hand (canvas letterSpacing is not everywhere yet)
    const chars = Array.from(sign);
    const gap = 6;
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let cx = CARD_W / 2 - total / 2;
    ctx.textAlign = 'left';
    chars.forEach((ch, i) => { ctx.fillText(ch, cx, CARD_H - 40); cx += widths[i] + gap; });
  }
}

/** The card as a PNG file, ready to share or save. */
export function cardBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), 'image/png');
    } catch {
      resolve(null);
    }
  });
}
// BAMBEH_END_TOKEN__SHOPCARD_FIX896__COMPLETE
