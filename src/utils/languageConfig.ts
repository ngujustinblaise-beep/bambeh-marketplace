/**
 * languageConfig.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Central language configuration for Bambeh Marketplace.
 * Adds Fulfulde and Pidgin English (Creole) support.
 *
 * FILE LOCATION: src/utils/languageConfig.ts
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface Language {
  code: string;
  name: string;         // Name in that language
  nameEn: string;       // Name in English
  flag: string;         // Emoji flag
  rtl?: boolean;        // Right-to-left
}

export const BAMBEH_LANGUAGES: Language[] = [
  { code: 'en',     name: 'English',          nameEn: 'English',           flag: '🇬🇧' },
  { code: 'fr',     name: 'Français',         nameEn: 'French',            flag: '🇫🇷' },
  { code: 'ff',     name: 'Fulfulde',         nameEn: 'Fulfulde',          flag: '🇨🇲' },
  { code: 'pidgin', name: 'Pidgin English',   nameEn: 'Pidgin English (Creole)', flag: '🇨🇲' },
  { code: 'ha',     name: 'Hausa',            nameEn: 'Hausa',             flag: '🇳🇬' },
  { code: 'ar',     name: 'العربية',          nameEn: 'Arabic',            flag: '🇸🇦', rtl: true },
];

// ── Welcome messages per language ─────────────────────────────────────────────
export const WELCOME_MESSAGES: Record<string, {
  greeting: string;
  tagline: string;
  subTagline: string;
  cta: string;
}> = {
  en: {
    greeting:   'Welcome to Bambeh',
    tagline:    'The Unstoppable Grind',
    subTagline: "'s #1 Online Marketplace — Buy, Sell, Connect.",
    cta:        'Get Started',
  },
  fr: {
    greeting:   'Bienvenue sur Bambeh',
    tagline:    'L\'Effort Inarrêtable',
    subTagline: 'La 1ère Marketplace en ligne du Cameroun — Achetez, Vendez, Connectez.',
    cta:        'Commencer',
  },
  ff: {
    greeting:   'Tawaaɓe Bambeh',
    tagline:    'Liggaade Ɓurnde Dartaade',
    subTagline: 'Maare Dow Ɓure #1 e Kameruun — Soodee, Fiyee, Naatnitee.',
    cta:        'Fuɗɗo',
  },
  pidgin: {
    greeting:   'Welcome for Bambeh',
    tagline:    'Di Grind No Go Stop',
    subTagline: ' Number One Online Market — Buy, Sell, Connect.',
    cta:        'Make We Start',
  },
  ha: {
    greeting:   'Barka da zuwa Bambeh',
    tagline:    'Ƙoƙarin Da Ba Zai Tsaya Ba',
    subTagline: 'Kasuwar kan layi ta #1 a Kamaru — Saya, Sayarwa, Haɗin kai.',
    cta:        'Fara',
  },
  ar: {
    greeting:   'مرحباً بك في Bambeh',
    tagline:    'الكدح الذي لا يتوقف',
    subTagline: 'أفضل سوق إلكتروني في الكاميرون — اشترِ وبيع وتواصل.',
    cta:        'ابدأ الآن',
  },
};

// ── Helper: get current language ─────────────────────────────────────────────
export function getCurrentLanguage(): Language {
  try {
    const code = localStorage.getItem('Bambeh_language') || 'en';
    return BAMBEH_LANGUAGES.find(l => l.code === code) ?? BAMBEH_LANGUAGES[0];
  } catch {
    return BAMBEH_LANGUAGES[0];
  }
}

export function getCurrentWelcome() {
  const lang = getCurrentLanguage();
  return WELCOME_MESSAGES[lang.code] ?? WELCOME_MESSAGES['en'];
}

