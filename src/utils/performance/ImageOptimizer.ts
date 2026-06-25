/**
 * src/utils/performance/ImageOptimizer.ts
 * Bambeh Marketplace — Image Optimization Utilities
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: "image/jpeg" | "image/webp" | "image/png";
}

export interface OptimizedImage {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
}

// --- Load Image from File -----------------------------------------------------
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

// --- Canvas to Blob -----------------------------------------------------------
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob returned null"));
        }
      },
      format,
      quality
    );
  });
}

// --- Resize & Compress Image --------------------------------------------------
export async function optimizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    outputFormat = "image/jpeg",
  } = options;

  const img = await loadImageFromFile(file);

  let width = img.naturalWidth;
  let height = img.naturalHeight;

  // Calculate new dimensions maintaining aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, outputFormat, quality);
  const dataUrl = canvas.toDataURL(outputFormat, quality);

  return {
    dataUrl,
    blob,
    width,
    height,
    sizeBytes: blob.size,
    format: outputFormat,
  };
}

// --- Create Thumbnail ---------------------------------------------------------
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<OptimizedImage> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    outputFormat: "image/jpeg",
  });
}

// --- Validate Image Dimensions ------------------------------------------------
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImageFromFile(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

// --- Convert Blob to File -----------------------------------------------------
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

// --- Get Supabase Image URL with Transform -------------------------------------
export function getOptimizedImageUrl(
  baseUrl: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!baseUrl) return "";

  const params = new URLSearchParams();

  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));

  const queryString = params.toString();
  if (!queryString) return baseUrl;

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${queryString}`;
}
