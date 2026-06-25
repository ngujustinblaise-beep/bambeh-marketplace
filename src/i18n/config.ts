/**
 * src/i18n/config.ts
 * Bambeh Marketplace � i18n Language Configuration
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

// --- Supported Languages ------------------------------------------------------
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "fr",
    name: "French",
    nativeName: "Fran�ais",
    flag: "????",
    rtl: false,
    region: "",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "????",
    rtl: false,
    region: "",
  },
  {
    code: "pidgin",
    name: " Pidgin",
    nativeName: "Pidgin",
    flag: "????",
    rtl: false,
    region: "",
  },
  {
    code: "bassa",
    name: "Bassa",
    nativeName: "B�s�a",
    flag: "????",
    rtl: false,
    region: "Littoral",
  },
  {
    code: "ewondo",
    name: "Ewondo",
    nativeName: "Ewondo",
    flag: "????",
    rtl: false,
    region: "Centre",
  },
  {
    code: "fulfulde",
    name: "Fulfulde",
    nativeName: "Fulfulde",
    flag: "????",
    rtl: false,
    region: "Adamawa",
  },
  {
    code: "duala",
    name: "Duala",
    nativeName: "Duala",
    flag: "????",
    rtl: false,
    region: "Littoral",
  },
  {
    code: "ghomala",
    name: "Ghomala",
    nativeName: "Ghomala",
    flag: "????",
    rtl: false,
    region: "West",
  },
];

export const DEFAULT_LANGUAGE = "fr";
export const FALLBACK_LANGUAGE = "fr";

// --- Language Storage Key -----------------------------------------------------
export const LANGUAGE_STORAGE_KEY = "Bambeh_language";

// --- Get Language Config ------------------------------------------------------
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

// --- Is Supported Language ----------------------------------------------------
export function isSupportedLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code);
}

// --- Get Stored Language ------------------------------------------------------
export function getStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_LANGUAGE;
}

// --- Store Language -----------------------------------------------------------
export function storeLanguage(code: string): void {
  try {
    if (isSupportedLanguage(code)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    }
  } catch {
    // localStorage unavailable
  }
}

// --- Detect Browser Language --------------------------------------------------
export function detectBrowserLanguage(): string {
  try {
    const browserLang = navigator.language.split("-")[0];
    if (isSupportedLanguage(browserLang)) {
      return browserLang;
    }
  } catch {
    // navigator unavailable
  }
  return DEFAULT_LANGUAGE;
}

// --- Namespace Keys -----------------------------------------------------------
export const I18N_NAMESPACES = [
  "common",
  "auth",
  "marketplace",
  "jobs",
  "services",
  "vendor",
  "profile",
  "payment",
  "notifications",
  "errors",
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];


