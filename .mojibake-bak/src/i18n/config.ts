/**
 * src/i18n/config.ts
 * Bambeh Marketplace â€” i18n Language Configuration
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

// â”€â”€â”€ Supported Languages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    nativeName: "FranÃ§ais",
    flag: "ðŸ‡«ðŸ‡·",
    rtl: false,
    region: "",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "ðŸ‡¬ðŸ‡§",
    rtl: false,
    region: "",
  },
  {
    code: "pidgin",
    name: " Pidgin",
    nativeName: "Pidgin",
    flag: "ðŸ‡¨ðŸ‡²",
    rtl: false,
    region: "",
  },
  {
    code: "bassa",
    name: "Bassa",
    nativeName: "BÃ sÃ a",
    flag: "ðŸ‡¨ðŸ‡²",
    rtl: false,
    region: "Littoral",
  },
  {
    code: "ewondo",
    name: "Ewondo",
    nativeName: "Ewondo",
    flag: "ðŸ‡¨ðŸ‡²",
    rtl: false,
    region: "Centre",
  },
  {
    code: "fulfulde",
    name: "Fulfulde",
    nativeName: "Fulfulde",
    flag: "ðŸ‡¨ðŸ‡²",
    rtl: false,
    region: "Adamawa",
  },
  {
    code: "duala",
    name: "Duala",
    nativeName: "Duala",
    flag: "ðŸ‡¨ðŸ‡²",
    rtl: false,
    region: "Littoral",
  },
  {
    code: "ghomala",
    name: "Ghomala",
    nativeName: "Ghomala",
    flag: "ðŸ‡¨ðŸ‡²",
    rtl: false,
    region: "West",
  },
];

export const DEFAULT_LANGUAGE = "fr";
export const FALLBACK_LANGUAGE = "fr";

// â”€â”€â”€ Language Storage Key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LANGUAGE_STORAGE_KEY = "Bambeh_language";

// â”€â”€â”€ Get Language Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

// â”€â”€â”€ Is Supported Language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function isSupportedLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code);
}

// â”€â”€â”€ Get Stored Language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Store Language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function storeLanguage(code: string): void {
  try {
    if (isSupportedLanguage(code)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    }
  } catch {
    // localStorage unavailable
  }
}

// â”€â”€â”€ Detect Browser Language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Namespace Keys â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

