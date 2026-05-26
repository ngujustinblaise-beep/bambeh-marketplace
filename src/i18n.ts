/**
 * BAMBÉ MARKETPLACE - i18n CONFIGURATION
 * Multi-language support: French + English
 * Version: 1.0.0
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

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

    // Supported languages
    supportedLngs: ["en", "fr"],

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

    // Backend configuration
    backend: {
      // Path to translation files
      loadPath: "/locales/{{lng}}/translation.json",
    },

    // React-i18next options
    react: {
      // Wait for translations to load before rendering
      useSuspense: true,
    },

    // Interpolation options
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
