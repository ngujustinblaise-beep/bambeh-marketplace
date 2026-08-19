// BAMBEH_DEPLOY_TOKEN__CONTACTGUARD_FIX350_CLEAN
/**
 * src/lib/contactGuard.ts - Bambeh Marketplace
 *
 * FIX350 - one place that decides whether a piece of text is trying to move a
 * deal off Bambeh. Six post forms need this rule; six copies of it would drift
 * apart within a month, so they all import from here.
 *
 * What it catches, and why each one is here:
 *   237677889900 / 6 77 88 99 00 / 677-889-900 / 677.889.900
 *       separators are stripped before counting, so spacing tricks fail
 *   677 88 99 OO   (letter O standing in for zero)
 *   whatsapp: 677889900
 *   name@gmail.com / name (at) gmail (dot) com / name AT gmail DOT com
 *   a bare @gmail / @yahoo / @hotmail mention
 *
 * What it deliberately does NOT catch, because false alarms teach sellers to
 * hate the form and write "call me" instead of a number we can find:
 *   prices - "15000 XAF", "1 500 000"  (guarded by a currency check)
 *   years, model numbers, sizes, quantities under 8 digits
 *   a plain "@" on its own (people write "@ the market")
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

export type GuardLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

export interface ContactScan {
  hasPhone: boolean;
  hasEmail: boolean;
  /** true when nothing was found - safe to submit */
  clean: boolean;
  /** the offending fragments, for showing the seller exactly what to remove */
  matches: string[];
}

const CURRENCY_NEAR = /(xaf|fcfa|cfa|frs?|francs?|€|\$|usd|eur)/i;

/** Digits, plus the letters people substitute for them. */
const LOOKALIKE: Record<string, string> = { o: '0', O: '0', l: '1', I: '1', '|': '1' };

function digitsOnly(chunk: string): string {
  return chunk
    .split('')
    .map((ch) => LOOKALIKE[ch] ?? ch)
    .filter((ch) => ch >= '0' && ch <= '9')
    .join('');
}

/**
 * A phone number survives being written with spaces, dots, dashes or slashes,
 * so we glue those runs back together before judging the length.
 */
function findPhoneLike(text: string): string[] {
  const hits: string[] = [];
  // A run of digits/lookalikes that may be broken up by common separators.
  const re = /(?:\+?\d|[oOlI|])[\d\soOlI|.\-/()]{6,}/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const digits = digitsOnly(raw);
    if (digits.length < 8) continue;                    // too short to be a number

    // A price written with spaces ("1 500 000 XAF") must not be flagged.
    const window = text.slice(Math.max(0, m.index - 12), m.index + raw.length + 12);
    if (CURRENCY_NEAR.test(window) && digits.length <= 9 && !/^(?:237)?6/.test(digits)) continue;

    hits.push(raw.trim());
  }
  return hits;
}

function findEmailLike(text: string): string[] {
  const hits: string[] = [];
  const patterns = [
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,                       // real address
    /[A-Za-z0-9._%+-]+\s*(?:\(at\)|\[at\]|\{at\}|\sat\s)\s*[A-Za-z0-9.-]+\s*(?:\(dot\)|\[dot\]|\sdot\s|\.)\s*[A-Za-z]{2,}/gi,
    /@\s*(?:gmail|yahoo|hotmail|outlook|icloud|protonmail)/gi,                // bare provider
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) hits.push(m[0].trim());
  }
  return hits;
}

export function scanForContacts(input: string | null | undefined): ContactScan {
  const text = String(input ?? '');
  if (!text.trim()) return { hasPhone: false, hasEmail: false, clean: true, matches: [] };

  const phones = findPhoneLike(text);
  const emails = findEmailLike(text);
  const matches = Array.from(new Set([...phones, ...emails]));

  return {
    hasPhone: phones.length > 0,
    hasEmail: emails.length > 0,
    clean: matches.length === 0,
    matches,
  };
}

/** Scans several fields at once - title, description, and anything else. */
export function scanFields(...fields: (string | null | undefined)[]): ContactScan {
  const all = fields.map((f) => scanForContacts(f));
  const matches = Array.from(new Set(all.flatMap((r) => r.matches)));
  return {
    hasPhone: all.some((r) => r.hasPhone),
    hasEmail: all.some((r) => r.hasEmail),
    clean: matches.length === 0,
    matches,
  };
}

const MSG: Record<GuardLang, { phone: string; email: string; both: string; why: string }> = {
  en: {
    phone: 'Please remove the phone number from your advert.',
    email: 'Please remove the email address from your advert.',
    both:  'Please remove the phone number and email address from your advert.',
    why:   'Buyers reach you through Bambeh chat. It keeps your number private and protects you if a deal goes wrong.',
  },
  fr: {
    phone: 'Veuillez retirer le numéro de téléphone de votre annonce.',
    email: "Veuillez retirer l'adresse e-mail de votre annonce.",
    both:  "Veuillez retirer le numéro de téléphone et l'adresse e-mail de votre annonce.",
    why:   'Les acheteurs vous contactent via la messagerie Bambeh. Votre numéro reste privé et vous êtes protégé en cas de problème.',
  },
  pidgin: {
    phone: 'Abeg comot di phone number from your advert.',
    email: 'Abeg comot di email address from your advert.',
    both:  'Abeg comot di phone number and email address from your advert.',
    why:   'Buyers go reach you for Bambeh chat. E dey keep your number private and e go protect you if wahala happen.',
  },
  ar: {
    phone: 'يرجى إزالة رقم الهاتف من إعلانك.',
    email: 'يرجى إزالة البريد الإلكتروني من إعلانك.',
    both:  'يرجى إزالة رقم الهاتف والبريد الإلكتروني من إعلانك.',
    why:   'يتواصل معك المشترون عبر محادثة بامبيه. هذا يبقي رقمك خاصاً ويحميك إذا ساءت الصفقة.',
  },
  ff: {
    phone: 'Tiiɗno ittu limngal telefol e jeeyngal maa.',
    email: 'Tiiɗno ittu iimeel e jeeyngal maa.',
    both:  'Tiiɗno ittu limngal telefol e iimeel e jeeyngal maa.',
    why:   'Soodooɓe ena ngara e maa e yeewtere Bambeh. Ɗum suuɗay limngal maa kadi hisna ma so njulaaku waylii.',
  },
};

/** The sentence to show the seller, in their own language. */
export function contactWarning(scan: ContactScan, lang: string = 'en'): string {
  const l = (MSG[lang as GuardLang] ? lang : 'en') as GuardLang;
  const m = MSG[l];
  const head = scan.hasPhone && scan.hasEmail ? m.both : scan.hasEmail ? m.email : m.phone;
  return `${head} ${m.why}`;
}
// BAMBEH_END_TOKEN__CONTACTGUARD_FIX350__COMPLETE
