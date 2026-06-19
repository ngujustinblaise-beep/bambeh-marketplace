// @ts-nocheck
import DOMPurify from "dompurify";

const CHAR_MAP: Record<string, string> = {
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;",
};

export const sanitizeHTML = (dirty: string): string =>
  DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });

export const sanitizeText = (raw: string): string =>
  raw.replace(/[<>&"']/g, ch => CHAR_MAP[ch] ?? ch);

export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "#";
  } catch {
    return "#";
  }
};

export const sanitizeRichText = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
