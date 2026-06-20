/**
 * src/hooks/useAppLang.ts — Bambeh Marketplace
 *
 * SAFE VERSION — zero external file dependencies.
 * Never crashes regardless of which other files exist.
 *
 * Returns the current language code by reading localStorage directly.
 * This means it correctly reads the saved language on every render.
 *
 * For fully reactive switching (component re-renders when language changes),
 * use useLanguage() which is exported directly from App.tsx inline context.
 *
 * All existing pages that call useLang() continue to work unchanged.
 */

import { useCallback, useState, useEffect } from "react";

export type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANG_KEY = "Bambeh_language";

export function resolveCode(raw: string | null): LangCode {
  const valid: LangCode[] = ["en", "fr", "pidgin", "ar", "ff"];
  if (!raw) return "en";
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde")        return "ff";
  return valid.includes(raw as LangCode) ? (raw as LangCode) : "en";
}

/**
 * useLang — returns current language code, reactive to language changes.
 * Works without LanguageProvider. Safe to use on any page.
 */
export function useLang(): LangCode {
  const [lang, setLang] = useState<LangCode>(() =>
    resolveCode(localStorage.getItem(LANG_KEY))
  );

  useEffect(() => {
    // Re-sync when another part of the app changes localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) setLang(resolveCode(e.newValue));
    };
    // Also listen for a custom event fired by LanguageProvider on setLanguage
    const onLangChange = (e: CustomEvent) => {
      setLang(resolveCode(e.detail as string));
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
 * t — standalone translation lookup (non-hook).
 * Pages pass their own STR table; this is just an API-compatibility export.
 */
export function t(key: string, _lang: string): string {
  return key;
}
