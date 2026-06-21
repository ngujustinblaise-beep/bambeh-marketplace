/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * I18N CONFIGURATION - WITH PIDGIN ENGLISH SUPPORT
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * ✅ 5 Languages: English, French, Arabic, Hausa, Pidgin (Creole)
 * ✅ Safe error handling
 * ✅ RTL support for Arabic
 *
 * © 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Safely import language resources with error handling
let enTranslation = {};
let frTranslation = {};
let arTranslation = {};
let haTranslation = {};
let pcmTranslation = {}; // NEW: Pidgin!

// English
try {
  enTranslation = require("./locales/en/translation.json");
} catch (error) {
  console.warn("English translation not found, using fallback");
  enTranslation = { welcome: "Welcome to Bambeh",
    search: "Search",
    login: "Login",
    signup: "Sign Up",
  };
}

// French
try {
  frTranslation = require("./locales/fr/translation.json");
} catch (error) {
  console.warn("French translation not found, using fallback");
  frTranslation = { welcome: "Bienvenue à Bambeh",
    search: "Rechercher",
    login: "Connexion",
    signup: "S'inscrire",
  };
}

// Arabic
try {
  arTranslation = require("./locales/ar/translation.json");
} catch (error) {
  console.warn("Arabic translation not found, using fallback");
  arTranslation = { welcome: "مرحبا بكم Ùي بامبيه",
    search: "بحث",
    login: "تسجيل الدخول",
    signup: "اشتراك",
  };
}

// Hausa
try {
  haTranslation = require("./locales/ha/translation.json");
} catch (error) {
  console.warn("Hausa translation not found, using fallback");
  haTranslation = { welcome: "Barka da zuwa Bambeh",
    search: "Bincike",
    login: "Shiga",
    signup: "Yi rajista",
  };
}

// NEW: Pidgin English (Creole)
try {
  pcmTranslation = require("./locales/pcm.json");
} catch (error) {
  console.warn("Pidgin translation not found, using fallback");
  pcmTranslation = { welcome: "Welcome",
    search: "Search",
    login: "Enter",
    signup: "Join we",
  };
}

// Properly structured resources
const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  ar: { translation: arTranslation },
  ha: { translation: haTranslation },
  pcm: { translation: pcmTranslation }, // NEW: Pidgin!
};

// Proper i18n initialization with error handling
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: import.meta.env.MODE === "development",

    interpolation: { escapeValue: false, // React already escapes
    },

    detection: {
      // Order of detection
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "Bambeh_language",
    },

    react: {
      useSuspense: false,
    },

    returnNull: false,
    returnEmptyString: false,

    // Ensure proper namespace handling
    defaultNS: "translation",
    ns: ["translation"],

    // Add load options
    load: "languageOnly", // 'en' instead of 'en-US'

    // Add proper key separator
    keySeparator: ".",
    nsSeparator: ":",
  })
  .catch((error) => {
    console.error("i18n initialization error:", error);
  });

// Export a function to check if i18n is initialized
export const isI18nInitialized = () => {
  return i18n.isInitialized;
};

// Export a function to change language safely
export const changeLanguage = async (lng: string) => {
  try {
    await i18n.changeLanguage(lng);

    // Update HTML dir for RTL languages
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";

    return true;
  } catch (error) {
    console.error("Error changing language:", error);
    return false;
  }
};

// Export current language getter
export const getCurrentLanguage = () => {
  return i18n.language || "en";
};

export default i18n;

/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * SUPPORTED LANGUAGES:
 *
 * 1. en - English (🇬🇧)
 * 2. fr - French (🇫🇷)
 * 3. ar - Arabic (🇸🇦) - RTL
 * 4. ha - Hausa (🇳🇬)
 * 5. pcm - Pidgin English (🇨🇲) - NEW!
 *
 * © 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
