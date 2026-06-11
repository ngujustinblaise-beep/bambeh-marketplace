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
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    supportedLngs: ["en", "fr"],
    debug: false,

    // ✅ returnEmptyString appears only ONCE (was duplicated before — caused build error)
    returnEmptyString: false,
    returnNull: false,

    saveMissing: true,
    missingKeyHandler: (lng, ns, key) => {
      if (typeof window !== "undefined") {
        console.warn("[i18n] missing:", lng, ns, key);
      }
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "bambe_language",
    },

    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    react: {
      useSuspense: true,
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
