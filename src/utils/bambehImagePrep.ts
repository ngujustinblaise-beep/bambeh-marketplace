// BAMBEH_DEPLOY_TOKEN__IMAGEPREP_FIX296_CLEAN
// FILE LOCATION: src/utils/bambehImagePrep.ts
//
// FIX296 - ONE PLACE THAT SHRINKS EVERY PHOTO BEFORE IT LEAVES THE PHONE.
//
// WHY THIS IS NOT A PATCH
// -----------------------
// You already own imageUploadOptimizer.ts and ImageOptimizer.ts. Neither is
// imported by a single posting page. That is the actual problem: the
// plumbing was built twice and connected zero times. So this file is
// deliberately small, has no dependencies, cannot throw, and is designed so
// that wiring it into an existing upload is a ONE LINE change - because a
// fix that needs twenty lines per page is a fix that gets half-applied.
//
// WHAT IT DOES
//   A 4 MB photo from a modern phone camera becomes roughly 200 KB.
//   That is the same twenty-to-one saving already running live in your chat
//   right now - the picture in your last screenshot was shrunk, uploaded and
//   given a public address successfully. Only the database column was
//   missing.
//
// WHY IT MATTERS MORE THAN THE BUNDLE
//   On Supabase's free plan you get 5 GB of traffic a month. At 3 MB a
//   photo, one person browsing the marketplace burns 60 MB. That is about
//   85 browsing sessions for the whole month. At 200 KB it is 4 MB a
//   session - fifteen times more people, for nothing.
//
// IT RETURNS A REAL File, NOT A Blob
//   Deliberate. Every upload site in your app reads file.name to work out
//   the extension and file.type for the content type. Handing back a File
//   means all of that keeps working and the diff stays one line.
//
// IT NEVER THROWS
//   If the browser is old, the canvas is blocked, the file is a GIF, or the
//   compressed version somehow comes out bigger - it hands back exactly what
//   you gave it. A seller must never lose a listing because a photo would
//   not compress.

export interface PrepOptions {
  /** Longest edge in pixels after shrinking. Default 1400. */
  maxSide?: number;
  /** JPEG quality, 0 to 1. Default 0.75. */
  quality?: number;
  /** Keep squeezing until under this many bytes. Default 500 KB. */
  targetBytes?: number;
  /** Lowest quality we are willing to drop to. Default 0.45. */
  minQuality?: number;
}

export interface PrepResult {
  file: File;
  originalBytes: number;
  finalBytes: number;
  /** e.g. 18.4 means the upload is 18.4x smaller. 1 means unchanged. */
  ratio: number;
  /** false when we handed the original straight back, and why. */
  compressed: boolean;
  reason: string;
}

const DEFAULTS: Required<PrepOptions> = {
  maxSide: 1400,
  quality: 0.75,
  targetBytes: 500 * 1024,
  minQuality: 0.45,
};

/** Formats bytes for a human. 204800 -> "200 KB". */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 KB";
  if (n < 1024 * 1024) return Math.round(n / 1024) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}

/* ------------------------------------------------------------------ decode */

/**
 * Turn a file into something we can draw. createImageBitmap is the fast path
 * and, with imageOrientation, it also applies the EXIF rotation - without
 * that, photos taken sideways upload sideways. The <img> path is the
 * fallback for older Android WebViews.
 */
async function decode(
  input: Blob,
): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  const w = window as unknown as {
    createImageBitmap?: (b: Blob, o?: unknown) => Promise<ImageBitmap>;
  };

  if (typeof w.createImageBitmap === "function") {
    try {
      const bmp = await w.createImageBitmap(input, { imageOrientation: "from-image" });
      return {
        source: bmp,
        width: bmp.width,
        height: bmp.height,
        close: () => { try { bmp.close(); } catch { /* ignore */ } },
      };
    } catch {
      // some WebViews reject the options object - try it bare
      try {
        const bmp = await w.createImageBitmap(input);
        return {
          source: bmp,
          width: bmp.width,
          height: bmp.height,
          close: () => { try { bmp.close(); } catch { /* ignore */ } },
        };
      } catch { /* fall through to the <img> path */ }
    }
  }

  const url = URL.createObjectURL(input);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("could not decode the picture"));
      el.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    } catch {
      resolve(null);
    }
  });
}

function jpegName(original: string): string {
  const stem = String(original || "photo").replace(/\.[^.]+$/, "");
  const safe = stem.replace(/[^\w\-]+/g, "-").slice(0, 60) || "photo";
  return safe + ".jpg";
}

/* ------------------------------------------------------------- the main job */

/**
 * The one to call. Give it whatever the file input handed you; it gives
 * back something small enough to upload over a 3G connection.
 *
 *   const ready = await prepImage(file);
 *   await supabase.storage.from(bucket).upload(path, ready, {
 *     contentType: ready.type,
 *   });
 */
export async function prepImage(
  input: File | Blob,
  options: PrepOptions = {},
): Promise<File> {
  const result = await prepImageDetailed(input, options);
  return result.file;
}

/** Same thing, but tells you what it did - for a progress line or a log. */
export async function prepImageDetailed(
  input: File | Blob,
  options: PrepOptions = {},
): Promise<PrepResult> {
  const opt = { ...DEFAULTS, ...options };
  const originalBytes = input.size;
  const originalName = input instanceof File ? input.name : "photo.jpg";
  const originalType = input.type || "image/jpeg";

  const asFile = (): File =>
    input instanceof File
      ? input
      : new File([input], originalName, { type: originalType });

  const passthrough = (reason: string): PrepResult => ({
    file: asFile(),
    originalBytes,
    finalBytes: originalBytes,
    ratio: 1,
    compressed: false,
    reason,
  });

  // Not a picture at all - a PDF attachment, say. Leave it alone.
  if (!originalType.startsWith("image/")) return passthrough("not an image");

  // An animated GIF flattened to JPEG loses the animation. Never do that.
  if (originalType === "image/gif") return passthrough("gif, animation preserved");

  // SVG is already tiny and rasterising it would be worse.
  if (originalType === "image/svg+xml") return passthrough("svg, already small");

  // Already smaller than a webpage. Not worth the CPU on a cheap phone.
  if (originalBytes > 0 && originalBytes < 120 * 1024) {
    return passthrough("already under 120 KB");
  }

  let decoded: Awaited<ReturnType<typeof decode>> | null = null;

  try {
    decoded = await decode(input);

    const longest = Math.max(decoded.width, decoded.height);
    if (!longest) return passthrough("could not read the dimensions");

    // Never enlarge. A 600px photo stays 600px.
    const scale = Math.min(1, opt.maxSide / longest);
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return passthrough("no canvas in this browser");

    // White behind it, or a transparent PNG turns black as a JPEG.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(decoded.source, 0, 0, width, height);

    // First attempt at the requested quality, then step down until it fits.
    // Four steps is enough; past that the picture starts to look cheap and
    // a seller's goods deserve better.
    let quality = opt.quality;
    let blob = await toBlob(canvas, quality);

    for (let step = 0; step < 4; step++) {
      if (!blob) break;
      if (blob.size <= opt.targetBytes) break;
      if (quality <= opt.minQuality) break;
      quality = Math.max(opt.minQuality, quality - 0.1);
      blob = await toBlob(canvas, quality);
    }

    if (!blob) return passthrough("the browser refused to encode it");

    // The honest check your own UserSettings.tsx already does: if squeezing
    // made it bigger, keep the original.
    if (originalBytes > 0 && blob.size >= originalBytes) {
      return passthrough("original was already smaller");
    }

    const out = new File([blob], jpegName(originalName), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return {
      file: out,
      originalBytes,
      finalBytes: out.size,
      ratio: originalBytes > 0 ? Number((originalBytes / out.size).toFixed(1)) : 1,
      compressed: true,
      reason: width + "x" + height + " at quality " + quality.toFixed(2),
    };
  } catch (err) {
    // A seller must never lose a listing because a photo would not compress.
    return passthrough(
      "compression failed, original kept" +
        (err instanceof Error ? " (" + err.message + ")" : ""),
    );
  } finally {
    if (decoded) decoded.close();
  }
}

/**
 * A small square-ish version for listing cards.
 *
 * Your BambehImage/ListingImage renders at 320x240. Serving the full 1400px
 * photo into that box wastes about 90% of the bytes. Upload one of these
 * alongside the main photo and point the card at it.
 */
export async function makeThumbnail(
  input: File | Blob,
  size = 320,
): Promise<File> {
  return prepImage(input, {
    maxSide: size,
    quality: 0.7,
    targetBytes: 45 * 1024,
    minQuality: 0.4,
  });
}

/** Shrink a whole set, one after another so a cheap phone does not stall. */
export async function prepImages(
  inputs: Array<File | Blob>,
  options: PrepOptions = {},
  onProgress?: (done: number, total: number) => void,
): Promise<File[]> {
  const out: File[] = [];
  for (let i = 0; i < inputs.length; i++) {
    out.push(await prepImage(inputs[i], options));
    if (onProgress) onProgress(i + 1, inputs.length);
  }
  return out;
}
// BAMBEH_END_TOKEN__IMAGEPREP_FIX296__COMPLETE
