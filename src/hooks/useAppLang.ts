/**
 * src/hooks/useAppLang.ts â€” Bambeh Marketplace
 *
 * SAFE VERSION â€” zero external file dependencies. Never crashes regardless of
 * which other files exist. All existing pages that call useLang() or t()
 * continue to work unchanged.
 *
 * WHAT THIS VERSION ADDS (app-wide instant language switching):
 *  â€¢ A single global listener (installed once on import) flips the document
 *    <html lang> and dir (RTL for Arabic) the INSTANT the language changes,
 *    no matter which screen triggered it. This makes the whole app re-orient
 *    immediately â€” Arabic switches the entire layout to right-to-left.
 *  â€¢ setLang(code): one canonical entry point any component can call to switch
 *    the whole app â€” it persists to localStorage, applies dir/lang, and
 *    broadcasts "bambeh:langchange" so every reactive screen updates at once.
 *  â€¢ applyDocumentLang(code): exported helper if you ever need to re-apply.
 *
 * The active LanguageProvider (in @/App) already dispatches "bambeh:langchange"
 * on setLanguage, so existing language selectors keep working AND now also
 * drive the global dir/lang flip through the listener below.
 */

import { useState, useEffect } from "react";

export type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANG_KEY = "Bambeh_language";
const RTL_LANGS: LangCode[] = ["ar"];

export function resolveCode(raw: string | null | undefined): LangCode {
  const valid: LangCode[] = ["en", "fr", "pidgin", "ar", "ff"];
  if (!raw) return "en";
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde")        return "ff";
  return valid.includes(raw as LangCode) ? (raw as LangCode) : "en";
}

/**
 * applyDocumentLang â€” set <html lang> and text direction for the whole app.
 * RTL for Arabic, LTR otherwise. Safe to call anywhere; never throws.
 */
export function applyDocumentLang(code: LangCode): void {
  try {
    const el = document.documentElement;
    el.lang = code;
    el.dir = RTL_LANGS.includes(code) ? "rtl" : "ltr";
  } catch { /* SSR or no document â€” ignore */ }
}

/**
 * setLang â€” single global entry point to switch the entire app instantly.
 * Persists the choice, flips document dir/lang, and broadcasts the change so
 * every reactive screen (anything using useLang / useLanguage) re-renders now.
 */
export function setLang(code: string): void {
  const c = resolveCode(code);
  try { localStorage.setItem(LANG_KEY, c); } catch {}
  applyDocumentLang(c);
  try {
    window.dispatchEvent(new CustomEvent("bambeh:langchange", { detail: c }));
  } catch {}
}

/**
 * useLang â€” returns current language code, reactive to language changes.
 * Works without LanguageProvider. Safe to use on any page.
 */
export function useLang(): LangCode {
  const [lang, setLangState] = useState<LangCode>(() =>
    resolveCode(typeof localStorage !== "undefined" ? localStorage.getItem(LANG_KEY) : "en")
  );

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
 * t â€” standalone translation lookup (non-hook). Pages pass their own STR table;
 * this is just an API-compatibility export so existing imports keep working.
 */
export function t(key: string, _lang?: string): string {
  return key;
}

// â”€â”€ Install ONE global listener at import time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Flips <html> dir/lang app-wide the instant the language changes, from any
// source (the LanguageProvider's event, setLang(), or a cross-tab storage
// change). Guarded so it only ever wires up once.
let __bambehLangWired = false;
function wireGlobalLang(): void {
  if (__bambehLangWired) return;
  __bambehLangWired = true;
  try {
    applyDocumentLang(resolveCode(localStorage.getItem(LANG_KEY)));
    window.addEventListener("bambeh:langchange", (e: Event) =>
      applyDocumentLang(resolveCode((e as CustomEvent).detail as string))
    );
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === LANG_KEY) applyDocumentLang(resolveCode(e.newValue));
    });
  } catch { /* ignore */ }
}
if (typeof window !== "undefined") wireGlobalLang();

