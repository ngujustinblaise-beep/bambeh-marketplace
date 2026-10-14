// BAMBEH_DEPLOY_TOKEN__QR_SCAN_FIX749_CLEAN
/**
 * src/features/safety/qrScan.ts - FIX749 (new)
 *
 * READING A QR CODE WITH THE PHONE'S CAMERA - for Taxi check (FIX748).
 *   - The camera is opened only when the person presses "Scan", and closed as soon as a code is
 *     read, when they press Close, or when they leave the page.
 *   - Decoding happens ON THE PHONE. The picture never leaves it and Bambeh never receives the code.
 *   - Android (Chrome and most phones) reads codes with the phone's own reader (BarcodeDetector).
 *     Where that does not exist (iPhone, some older phones, some app web views), the jsQR library
 *     (Apache-2.0, loaded only when needed) reads the same picture.
 *   - No camera, or the camera refused: a photo of the code works too (decodeImageFile), and the
 *     door number can always be typed by hand.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

export type CameraProblem = 'unsupported' | 'denied' | 'none' | 'busy' | 'failed';

interface BarcodeLike { rawValue?: string }
interface DetectorLike { detect: (source: CanvasImageSource) => Promise<BarcodeLike[]> }
interface DetectorClass {
  new (opts: { formats: string[] }): DetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}
type JsQrFn = (data: Uint8ClampedArray, width: number, height: number,
               opts?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' }) => { data: string } | null;

let detectorP: Promise<DetectorLike | null> | null = null;
let jsqrP: Promise<JsQrFn | null> | null = null;

/** The phone's own QR reader, or null where there is none. Asked once. */
export function nativeDetector(): Promise<DetectorLike | null> {
  if (!detectorP) {
    detectorP = (async () => {
      try {
        const BD = (window as unknown as { BarcodeDetector?: DetectorClass }).BarcodeDetector;
        if (typeof BD !== 'function') return null;
        if (typeof BD.getSupportedFormats === 'function') {
          const formats = await BD.getSupportedFormats();
          if (!Array.isArray(formats) || formats.indexOf('qr_code') < 0) return null;
        }
        return new BD({ formats: ['qr_code'] });
      } catch {
        return null;
      }
    })();
  }
  return detectorP;
}

/** jsQR, loaded the first time it is needed (its own small download). */
export function jsqrDecoder(): Promise<JsQrFn | null> {
  if (!jsqrP) {
    jsqrP = import('jsqr')
      .then((m) => {
        let f: unknown = (m as unknown as { default?: unknown }).default ?? m;
        // a bundler that wraps the module twice: { default: { default: jsQR } }
        if (f && typeof f !== 'function' && typeof (f as { default?: unknown }).default === 'function') f = (f as { default: unknown }).default;
        return typeof f === 'function' ? (f as JsQrFn) : null;
      })
      .catch(() => null);
  }
  return jsqrP;
}

/** The text of a QR code in a block of RGBA pixels, or null. */
export async function decodePixels(data: Uint8ClampedArray, width: number, height: number): Promise<string | null> {
  const f = await jsqrDecoder();
  if (!f) return null;
  try {
    const r = f(data, width, height, { inversionAttempts: 'attemptBoth' });
    return r && typeof r.data === 'string' && r.data.length > 0 ? r.data : null;
  } catch {
    return null;
  }
}

/** The text of a QR code drawn on a canvas, or null. The phone's reader first, then jsQR. */
export async function decodeCanvas(canvas: HTMLCanvasElement, onlyNative = false): Promise<string | null> {
  const d = await nativeDetector();
  if (d) {
    try {
      const found = await d.detect(canvas);
      for (const b of found || []) if (b && typeof b.rawValue === 'string' && b.rawValue.length > 0) return b.rawValue;
    } catch {
      // the phone's reader failed on this picture: jsQR below
    }
    if (onlyNative) return null;
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null;
  if (!ctx || canvas.width < 1 || canvas.height < 1) return null;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return decodePixels(img.data, canvas.width, canvas.height);
}

/** Draw a picture (a video frame or a photo) on the canvas, at most `max` pixels wide or high. */
export function drawScaled(canvas: HTMLCanvasElement, src: CanvasImageSource, w: number, h: number, max = 800): boolean {
  if (!w || !h) return false;
  const k = Math.min(1, max / Math.max(w, h));
  canvas.width = Math.max(1, Math.round(w * k));
  canvas.height = Math.max(1, Math.round(h * k));
  const ctx = canvas.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null;
  if (!ctx) return false;
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return true;
}

/** A photo of the code (from the camera app or the gallery): its text, or null. */
export async function decodeImageFile(file: Blob): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('image'));
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    for (const max of [1000, 1600, 600]) {
      if (!drawScaled(canvas, img, img.naturalWidth || img.width, img.naturalHeight || img.height, max)) return null;
      const text = await decodeCanvas(canvas);
      if (text) return text;
    }
    return null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface OpenCamera {
  stop: () => void;
  /** null when the phone has no light it lets the page use */
  torch: ((on: boolean) => Promise<boolean>) | null;
}

/** Why the camera did not open, in one word the page turns into a sentence. */
export function cameraProblem(e: unknown): CameraProblem {
  const name = e && typeof e === 'object' && 'name' in e ? String((e as { name: unknown }).name) : '';
  const msg = e instanceof Error ? e.message : String(e || '');
  if (msg === 'unsupported' || name === 'NotSupportedError') return 'unsupported';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') return 'none';
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return 'busy';
  return 'failed';
}

/** Open the back camera into the video element. Throws an Error/DOMException that cameraProblem() explains. */
export async function openCamera(video: HTMLVideoElement): Promise<OpenCamera> {
  const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
  if (!md || typeof md.getUserMedia !== 'function') throw new Error('unsupported');
  let stream: MediaStream;
  try {
    stream = await md.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
  } catch (e) {
    if (cameraProblem(e) !== 'none') throw e;
    stream = await md.getUserMedia({ audio: false, video: true });
  }
  const stop = () => {
    try { stream.getTracks().forEach((tr) => tr.stop()); } catch { /* already stopped */ }
    try { video.srcObject = null; } catch { /* gone */ }
  };
  try {
    video.setAttribute('playsinline', 'true');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    stop();
    throw e;
  }
  let torch: OpenCamera['torch'] = null;
  try {
    const track = stream.getVideoTracks()[0];
    const caps = track && typeof track.getCapabilities === 'function' ? (track.getCapabilities() as { torch?: boolean }) : null;
    if (track && caps && caps.torch) {
      torch = async (on: boolean) => {
        try {
          await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
          return true;
        } catch {
          return false;
        }
      };
    }
  } catch {
    torch = null;
  }
  return { stop, torch };
}

// ------------------------------------------------------------------ what the code says
/**
 * The website of the city of Yaounde's taxi register (Taxi-Yaounde, Communaute urbaine de Yaounde, launched
 * 3 July 2026): www.taxiyaounde.com and its sub-sites. Only this one is marked; any other site gets a warning,
 * because anybody can print a QR code. (A look-alike spelling is never trusted until the city confirms it.)
 */
export const OFFICIAL_TAXI_SITES: readonly string[] = ['taxiyaounde.com'];

export type ScannedCode =
  | { kind: 'link'; url: string; host: string; official: boolean }
  | { kind: 'text'; text: string };

/** A web link (http or https only) or plain text. Nothing else is ever opened. */
export function readCode(raw: string): ScannedCode {
  const text = String(raw || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, 1000);
  if (/^https?:\/\/\S+$/i.test(text)) {
    try {
      const u = new URL(text);
      if ((u.protocol === 'https:' || u.protocol === 'http:') && u.hostname) {
        const host = u.hostname.toLowerCase().replace(/\.$/, '');
        const official = OFFICIAL_TAXI_SITES.some((d) => host === d || host.endsWith('.' + d));
        return { kind: 'link', url: u.toString(), host, official };
      }
    } catch {
      // not a real link: plain text below
    }
  }
  return { kind: 'text', text };
}
// BAMBEH_END_TOKEN__QR_SCAN_FIX749__COMPLETE
