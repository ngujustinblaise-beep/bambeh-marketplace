/**
 * BAMBEH MARKETPLACE - i18n engine (react-i18next)
 * Aligned with the app-wide LanguageProvider defined in App.tsx.
 *
 * Canonical language codes : en, fr, ar, ff (Fulfulde), pidgin
 * Shared storage key        : "Bambeh_language"
 * Reacts to                 : window event "bambeh:langchange"
 *
 * The existing locale folders are preserved: Fulfulde is read from
 * ./locales/ful and Pidgin from ./locales/pcm, but registered under the
 * canonical keys ff / pidgin. Legacy aliases (ful, pcm) are also registered.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en  from "./locales/en/translation.json";
import fr  from "./locales/fr/translation.json";
import ar  from "./locales/ar/translation.json";
import ful from "./locales/ful/translation.json"; // Fulfulde source (folder kept as-is)
import pcm from "./locales/pcm/translation.json"; // Pidgin English source (folder kept as-is)

const resources = {
  en:     { translation: en },
  fr:     { translation: fr },
  ar:     { translation: ar },
  ff:     { translation: ful },
  pidgin: { translation: pcm },
  // legacy aliases for back-compat with any code still using ful/pcm
  ful:    { translation: ful },
  pcm:    { translation: pcm },
} as const;

const SUPPORTED = ["en", "fr", "ar", "ff", "pidgin"] as const;
const LANG_KEY = "Bambeh_language"; // MUST match the LanguageProvider in App.tsx

function resolveCode(raw: string | null): string {
  if (!raw) return "en";
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde") return "ff";
  if (raw === "ha") return "en"; // Hausa was retired; fall back to English
  return (SUPPORTED as readonly string[]).includes(raw) ? raw : "en";
}

const getSavedLanguage = (): string => {
  try { return resolveCode(localStorage.getItem(LANG_KEY)); }
  catch { return "en"; }
};

void i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED, "ful", "pcm"],
    lng: getSavedLanguage(),
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnEmptyString: false,
    returnNull: false,
  });

// Keep react-i18next in lockstep with the app-wide language selector.
if (typeof window !== "undefined") {
  window.addEventListener("bambeh:langchange", (e: Event) => {
    const detail = (e as CustomEvent).detail as string | undefined;
    const next = resolveCode(detail ?? localStorage.getItem(LANG_KEY));
    if (next && i18n.language !== next) void i18n.changeLanguage(next);
  });

  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === LANG_KEY && e.newValue) {
      const next = resolveCode(e.newValue);
      if (i18n.language !== next) void i18n.changeLanguage(next);
    }
  });
}

export default i18n;