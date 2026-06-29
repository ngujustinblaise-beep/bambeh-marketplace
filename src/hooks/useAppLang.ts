/**
 * src/hooks/useAppLang.ts — Bambeh Marketplace
 *
 * SAFE: no crash-prone dependencies. Only imports the plain LANG_STRINGS
 * dictionary (a leaf module with no imports of its own), so there is no
 * circular dependency and no bundle bloat. Every page that calls useLang()
 * or t() keeps working — but t() now returns REAL translations instead of
 * echoing the key.
 *
 * App-wide instant language switching:
 *  • A single global listener (installed once on import) flips <html lang>/dir
 *    (RTL for Arabic) the instant the language changes, from any source.
 *  • setLang(code): persist + apply dir/lang + broadcast "bambeh:langchange".
 *  • applyDocumentLang(code): re-apply helper.
 */

import { useState, useEffect } from "react";
import { LANG_STRINGS } from "@/i18n/langStrings";

export type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANG_KEY = "Bambeh_language";
const RTL_LANGS: LangCode[] = ["ar"];

export function resolveCode(raw: string | null | undefined): LangCode {
  const valid: LangCode[] = ["en", "fr", "pidgin", "ar", "ff"];
  if (!raw) return "en";
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde") return "ff";
  return valid.includes(raw as LangCode) ? (raw as LangCode) : "en";
}

function currentCode(): LangCode {
  try {
    return resolveCode(typeof localStorage !== "undefined" ? localStorage.getItem(LANG_KEY) : "en");
  } catch {
    return "en";
  }
}

/** applyDocumentLang — set <html lang> + text direction for the whole app. */
export function applyDocumentLang(code: LangCode): void {
  try {
    const el = document.documentElement;
    el.lang = code;
    el.dir = RTL_LANGS.includes(code) ? "rtl" : "ltr";
  } catch { /* SSR or no document — ignore */ }
}

/** setLang — single global entry point to switch the whole app instantly. */
export function setLang(code: string): void {
  const c = resolveCode(code);
  try { localStorage.setItem(LANG_KEY, c); } catch {}
  applyDocumentLang(c);
  try {
    window.dispatchEvent(new CustomEvent("bambeh:langchange", { detail: c }));
  } catch {}
}

/** useLang — current language code, reactive to language changes. */
export function useLang(): LangCode {
  const [lang, setLangState] = useState<LangCode>(() => currentCode());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) {
        const c = resolveCode(e.newValue);
        setLangState(c);
        applyDocumentLang(c);
      }
    };
    const onLangChange = (e: Event) => {
      const c = resolveCode((e as CustomEvent).detail as string);
      setLangState(c);
      applyDocumentLang(c);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("bambeh:langchange", onLangChange as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bambeh:langchange", onLangChange as EventListener);
    };
  }, []);

  return lang;
}

/**
 * t — standalone translation lookup (non-hook). Resolves against the shared
 * LANG_STRINGS dictionary for the CURRENT language (or an explicit `lang`).
 * Tries the exact key, then the key with its namespace stripped
 * ("nav.home" -> "home", "common.login" -> "login"), then English, and
 * finally returns the original key unchanged so existing default-fallback
 * patterns (t(key) !== key ? ... : default) keep working.
 */
export function t(key: string, lang?: string): string {
  if (!key) return key;
  const code = resolveCode(lang ?? currentCode());
  const dict = LANG_STRINGS[code] || {};
  const en = LANG_STRINGS.en || {};
  const short = key.includes(".") ? key.slice(key.lastIndexOf(".") + 1) : key;
  return dict[key] ?? dict[short] ?? en[key] ?? en[short] ?? key;
}

// ── Install ONE global listener at import time ─────────────────────────────
let __bambehLangWired = false;
function wireGlobalLang(): void {
  if (__bambehLangWired) return;
  __bambehLangWired = true;
  try {
    applyDocumentLang(currentCode());
    window.addEventListener("bambeh:langchange", (e: Event) =>
      applyDocumentLang(resolveCode((e as CustomEvent).detail as string))
    );
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === LANG_KEY) applyDocumentLang(resolveCode(e.newValue));
    });
  } catch { /* ignore */ }
}
if (typeof window !== "undefined") wireGlobalLang();
