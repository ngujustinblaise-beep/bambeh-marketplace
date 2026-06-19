// @ts-nocheck
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf",
];
const MAX_SIZE_MB = 10;

export const validateFile = async (file: File): Promise<FileValidationResult> => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type '${file.type}' is not allowed.` };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File exceeds ${MAX_SIZE_MB}MB limit.` };
  }
  const slice  = file.slice(0, 4);
  const buffer = await slice.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  const hex    = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const signatures: Record<string, string> = {
    "FFD8FF":   "image/jpeg",
    "89504E47": "image/png",
    "47494638": "image/gif",
    "25504446": "application/pdf",
    "52494646": "image/webp",
  };
  const matched = Object.entries(signatures).find(([sig]) => hex.startsWith(sig));
  if (!matched) {
    return { valid: false, error: "File signature mismatch â€” possible spoofed extension." };
  }
  return { valid: true };
};

export const validateImageDimensions = (
  file: File,
  maxWidth  = 4096,
  maxHeight = 4096,
): Promise<FileValidationResult> =>
  new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({ valid: false, error: `Image exceeds ${maxWidth}Ã—${maxHeight}px.` });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: "Could not read image dimensions." });
    };
    img.src = url;
  });
