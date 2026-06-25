/**
 * src/utils/langBridge.ts — Bambeh Marketplace
 *
 * PURPOSE: When a user selects a language in the LanguageSelection page
 * (or any language switcher), call `setAppLang(lang)` from this module.
 * It will:
 *   1. Persist the choice to localStorage
 *   2. Dispatch a "langChange" CustomEvent on window
 *
 * All marketplace pages listen for "langChange" via useLangState() and
 * re-render immediately — no page reload needed.
 *
 * USAGE in your language selector:
 *
 *   import { setAppLang } from "@/utils/langBridge";
 *
 *   function LanguageSelection() {
 *     return (
 *       <button onClick={() => setAppLang("fr")}>Français</button>
 *       <button onClick={() => setAppLang("en")}>English</button>
 *       <button onClick={() => setAppLang("pcm")}>Pidgin</button>
 *       ...
 *     );
 *   }
 *
 * STORAGE KEY:  "bambeh_lang"
 * VALID VALUES: "en" | "fr" | "ha" | "ar" | "pcm" | "ff"
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

export type AppLang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";

export const SUPPORTED_LANGS: { code: AppLang; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en",  label: "English",          nativeLabel: "English",        dir: "ltr" },
  { code: "fr",  label: "French",           nativeLabel: "Français",       dir: "ltr" },
  { code: "pcm", label: "Pidgin English",   nativeLabel: "Pidgin",         dir: "ltr" },
  { code: "ha",  label: "Hausa",            nativeLabel: "Hausa",          dir: "ltr" },
  { code: "ff",  label: "Fulfulde",         nativeLabel: "Fulfulde",       dir: "ltr" },
  { code: "ar",  label: "Arabic",           nativeLabel: "???????",        dir: "rtl" },
];

const LANG_KEY = "bambeh_lang";

/**
 * Read the currently active language from localStorage.
 * Falls back to browser language, then "fr" (default for Cameroon).
 */
export function getAppLang(): AppLang {
  try {
    const stored = localStorage.getItem(LANG_KEY) as AppLang;
    if (stored && SUPPORTED_LANGS.some((l) => l.code === stored)) return stored;
  } catch { /* ignore */ }
  const browser = navigator.language.split("-")[0] as AppLang;
  return SUPPORTED_LANGS.some((l) => l.code === browser) ? browser : "fr";
}

/**
 * Set the active language, persist it, and notify all listeners instantly.
 * This causes every component using useLangState() to re-render with the new lang.
 */
export function setAppLang(lang: AppLang): void {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  // Dispatch to all useLangState() listeners
  window.dispatchEvent(new CustomEvent("langChange", { detail: { lang } }));
  // Also fire storage event for cross-tab sync (some older listeners use this)
  try {
    window.dispatchEvent(new StorageEvent("storage", {
      key: LANG_KEY,
      newValue: lang,
      storageArea: localStorage,
    }));
  } catch { /* ignore — StorageEvent not always constructable */ }

  // Update document direction for Arabic
  const langData = SUPPORTED_LANGS.find((l) => l.code === lang);
  if (langData) {
    document.documentElement.dir = langData.dir;
    document.documentElement.lang = lang;
  }
}

/**
 * React hook: returns the current lang and re-renders when it changes.
 * Identical pattern used in Marketplace.tsx, MarketplaceItemDetails.tsx, etc.
 */
export function useAppLang(): AppLang {
  // Lazy import React to avoid circular dependencies if used outside component tree.
  // In your component files, prefer importing useLangState directly from this module.
  const { useState, useEffect } = require("react");
  const [lang, setLang] = useState(getAppLang as any);
  useEffect(() => {
    const update = () => setLang(getAppLang());
    window.addEventListener("langChange", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("langChange", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return lang;
}

