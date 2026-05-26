/**
 * BAMBÉ MARKETPLACE - i18n CONFIGURATION
 * Multi-language support: French + English + Arabic + Hausa + Fulfulde + Pidgin
 * Version: 2.0.0
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// ============================================
// SUPPORTED LANGUAGES TYPE
// ============================================
export type SupportedLanguage =
  | "en" // English
  | "fr" // French
  | "ar" // Arabic
  | "ha" // Hausa
  | "ff" // Fulfulde (Fula)
  | "pcm" // Pidgin English (Nigerian/Cameroon Pidgin)
  | "ewo" // Ewondo (Future)
  | "dua" // Duala (Future)
  | "nge"; // Ngemba (Future)

// ============================================
// LANGUAGE CONFIGURATION
// ============================================
export const LANGUAGE_CONFIG: {
  [key in SupportedLanguage]: {
    name: string;
    nativeName: string;
    flag: string;
    dir: "ltr" | "rtl";
    enabled: boolean;
  };
} = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
    enabled: true,
  },
  fr: {
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    enabled: true,
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl", // Right-to-left
    enabled: true,
  },
  ha: {
    name: "Hausa",
    nativeName: "Hausa",
    flag: "🇳🇬",
    dir: "ltr",
    enabled: true,
  },
  ff: {
    name: "Fulfulde",
    nativeName: "Pulaar",
    flag: "🇨🇲",
    dir: "ltr",
    enabled: true,
  },
  pcm: {
    name: "Pidgin English",
    nativeName: "Pidgin",
    flag: "🇨🇲",
    dir: "ltr",
    enabled: true,
  },
  ewo: {
    name: "Ewondo",
    nativeName: "Ewondo",
    flag: "🇨🇲",
    dir: "ltr",
    enabled: false, // Coming soon
  },
  dua: {
    name: "Duala",
    nativeName: "Duálá",
    flag: "🇨🇲",
    dir: "ltr",
    enabled: false, // Coming soon
  },
  nge: {
    name: "Ngemba",
    nativeName: "Ngemba",
    flag: "🇨🇲",
    dir: "ltr",
    enabled: false, // Coming soon
  },
};

// ============================================
// GET ENABLED LANGUAGES
// ============================================
export const getEnabledLanguages = (): SupportedLanguage[] => {
  return Object.entries(LANGUAGE_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([code, _]) => code as SupportedLanguage);
};

// i18n INITIALIZATION
// ============================================
i18n
  // Load translations using http backend
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: "fr", // French as default for Cameroon

    // Supported languages - Now using dynamic enabled languages
    supportedLngs: getEnabledLanguages(),

    // Debug mode (set to false in production)
    debug: false,

    // Language detection options
    detection: {
      // Order of language detection
      order: ["localStorage", "navigator", "htmlTag"],

      // Cache user language
      caches: ["localStorage"],

      // Key to store language in localStorage
      lookupLocalStorage: "bambe_language",
    },

    backend: {
      // Path to translation files
      loadPath: "/locales/{{lng}}/translation.json",
    },

    react: {
      // Wait for translations to load before rendering
      useSuspense: true,
    },

    interpolation: {
      // React already escapes values
      escapeValue: false,
    },

    // Return empty string for missing keys
    returnEmptyString: false,

    // Return key if translation is missing (useful for debugging)
    returnNull: false,
  });

export default i18n;
