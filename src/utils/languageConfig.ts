/**
 * languageConfig.ts
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Central language configuration for Bambeh Marketplace.
 * Adds Fulfulde and Pidgin English (Creole) support.
 *
 * FILE LOCATION: src/utils/languageConfig.ts
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

export interface Language {
  code: string;
  name: string;         // Name in that language
  nameEn: string;       // Name in English
  flag: string;         // Emoji flag
  rtl?: boolean;        // Right-to-left
}

export const BAMBEH_LANGUAGES: Language[] = [
  { code: 'en',     name: 'English',          nameEn: 'English',           flag: 'ðŸ‡¬ðŸ‡§' },
  { code: 'fr',     name: 'FranÃ§ais',         nameEn: 'French',            flag: 'ðŸ‡«ðŸ‡·' },
  { code: 'ff',     name: 'Fulfulde',         nameEn: 'Fulfulde',          flag: 'ðŸ‡¨ðŸ‡²' },
  { code: 'pidgin', name: 'Pidgin English',   nameEn: 'Pidgin English (Creole)', flag: 'ðŸ‡¨ðŸ‡²' },
  { code: 'ha',     name: 'Hausa',            nameEn: 'Hausa',             flag: 'ðŸ‡³ðŸ‡¬' },
  { code: 'ar',     name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',          nameEn: 'Arabic',            flag: 'ðŸ‡¸ðŸ‡¦', rtl: true },
];

// â”€â”€ Welcome messages per language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const WELCOME_MESSAGES: Record<string, {
  greeting: string;
  tagline: string;
  subTagline: string;
  cta: string;
}> = {
  en: {
    greeting:   'Welcome to Bambeh',
    tagline:    'The Unstoppable Grind',
    subTagline: "'s #1 Online Marketplace â€” Buy, Sell, Connect.",
    cta:        'Get Started',
  },
  fr: {
    greeting:   'Bienvenue sur Bambeh',
    tagline:    'L\'Effort InarrÃªtable',
    subTagline: 'La 1Ã¨re Marketplace en ligne du Cameroun â€” Achetez, Vendez, Connectez.',
    cta:        'Commencer',
  },
  ff: {
    greeting:   'TawaaÉ“e Bambeh',
    tagline:    'Liggaade Æurnde Dartaade',
    subTagline: 'Maare Dow Æure #1 e Kameruun â€” Soodee, Fiyee, Naatnitee.',
    cta:        'FuÉ—É—o',
  },
  pidgin: {
    greeting:   'Welcome for Bambeh',
    tagline:    'Di Grind No Go Stop',
    subTagline: ' Number One Online Market â€” Buy, Sell, Connect.',
    cta:        'Make We Start',
  },
  ha: {
    greeting:   'Barka da zuwa Bambeh',
    tagline:    'Æ˜oÆ™arin Da Ba Zai Tsaya Ba',
    subTagline: 'Kasuwar kan layi ta #1 a Kamaru â€” Saya, Sayarwa, HaÉ—in kai.',
    cta:        'Fara',
  },
  ar: {
    greeting:   'Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Bambeh',
    tagline:    'Ø§Ù„ÙƒØ¯Ø­ Ø§Ù„Ø°ÙŠ Ù„Ø§ ÙŠØªÙˆÙ‚Ù',
    subTagline: 'Ø£ÙØ¶Ù„ Ø³ÙˆÙ‚ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙÙŠ Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ† â€” Ø§Ø´ØªØ±Ù ÙˆØ¨ÙŠØ¹ ÙˆØªÙˆØ§ØµÙ„.',
    cta:        'Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù†',
  },
};

// â”€â”€ Helper: get current language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

