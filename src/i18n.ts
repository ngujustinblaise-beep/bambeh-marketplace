/**
 * BAMBEH MARKETPLACE - CAPACITOR HYBRID ANDROID i18n ENGINE
 * © 2026 BAMBEH SARL. All rights reserved.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import fr from "./locales/fr/translation.json";
import ar from "./locales/ar/translation.json";
import ha from "./locales/ha/translation.json";
import pcm from "./locales/pcm/translation.json";
import ful from "./locales/ful/translation.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  ha: { translation: ha },
  pcm: { translation: pcm },
  ful: { translation: ful },
} as const;

const SUPPORTED_LANGUAGES = ["en", "fr", "ar", "ha", "pcm", "ful"] as const;
const LANG_STORAGE_KEY = "bambe_language";

const getSavedLanguage = (): string => {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as any)) {
      return stored;
    }
    return "fr"; // Default corporate standard fallback
  } catch {
    return "fr";
  }
};

void i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    lng: getSavedLanguage(),
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    returnEmptyString: false,
    returnNull: false,
  });

export default i18n;