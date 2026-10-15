// BAMBEH_DEPLOY_TOKEN__FIRST_VISIT_FIX764_CLEAN
/**
 * src/components/auth/FirstVisit.tsx - FIX764 (new)
 *
 * FIRST-TIME VISITORS BROWSE STRAIGHT AWAY. Big, 15 Oct 2026, said yes to: "let first-time visitors browse
 * straight away, with the language taken from the phone and the Terms accepted at sign-up".
 *
 * Before: a phone that opened Bambeh for the first time had to pass three screens before seeing anything -
 * pick a language, scroll through the whole Terms and accept them, then a welcome screen. FIX754 (14 Oct):
 * 76 new phones in six days, 13 of them ever used an account.
 *
 * Now:
 *   1. The moment this file loads (App.tsx imports it near the top, before anything is drawn), a phone that
 *      never had a Bambeh language gets its own: French, English, Arabic, Fulfulde or Pidgin, as the phone
 *      is set (the first of the phone's languages that Bambeh speaks; English when none). Nothing is sent
 *      anywhere. A phone that already has a Bambeh language is never touched.
 *   2. The first-screens guard in App.tsx no longer sends anybody to those three screens (one line there:
 *      FORCE_FIRST_SCREENS = false). They stay open at /language, /terms-acceptance and /welcome.
 *   3. The Terms and the data consent are accepted with the one box when she creates her account
 *      (QuickJoin, FIX762) - the moment they start to matter.
 *   4. This strip, on the Home page only, until she answers it once: "Bambeh speaks your language" and the
 *      five languages. A tap changes the whole app; the cross keeps the phone's language. Choosing another
 *      language anywhere else (the header, the sign-up page) ends it too. It never shows on another page,
 *      so it can never cover a chat box, the Safety button or a payment.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, Globe, X } from 'lucide-react';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

/** The app's language key (App.tsx LanguageProvider reads it when it first draws). */
export const LANG_KEY = 'Bambeh_language';
/** Set only here: "fr:fr-FR" = the language was taken from the phone (fr-FR), not chosen. The strip shows while it is set. */
export const AUTO_KEY = 'Bambeh_language_auto';

const FULFULDE = ['ff', 'ful', 'fub', 'fuf', 'fuh', 'fuq', 'fuv', 'ffm'];
const PIDGIN = ['pcm', 'wes'];
const ARABIC = ['ar', 'arb', 'shu', 'apd', 'ayl'];

/** The phone's languages, best first ("fr-CM", "en-US", "ff-Latn-CM") -> the first one Bambeh speaks; else English. */
export function phoneLanguage(list: ReadonlyArray<string> | null | undefined): Lang {
  const all = Array.isArray(list) ? list : [];
  for (const raw of all) {
    const base = String(raw || '').trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    if (!base) continue;
    if (base === 'fr') return 'fr';
    if (base === 'en') return 'en';
    if (ARABIC.indexOf(base) >= 0) return 'ar';
    if (FULFULDE.indexOf(base) >= 0) return 'ff';
    if (PIDGIN.indexOf(base) >= 0) return 'pidgin';
  }
  return 'en';
}

function phoneLanguages(): string[] {
  try {
    const n = window.navigator;
    if (n && Array.isArray(n.languages) && n.languages.length) return n.languages.slice(0, 8);
    return n && n.language ? [n.language] : [];
  } catch {
    return [];
  }
}

/**
 * A phone without a Bambeh language gets its own. Returns the language it set, or null when there was
 * nothing to do (she already has one, or the phone blocks storage).
 */
export function firstVisit(langs?: ReadonlyArray<string>): Lang | null {
  try {
    const ls = window.localStorage;
    if (ls.getItem(LANG_KEY)) return null;
    const list = langs ? Array.from(langs) : phoneLanguages();
    const code = phoneLanguage(list);
    ls.setItem(LANG_KEY, code);
    ls.setItem(AUTO_KEY, code + ':' + String(list[0] || 'none').slice(0, 24));
    return code;
  } catch {
    return null;
  }
}

/** What this page load decided (once), so the first drawing can tell every page - see the effect below. */
let decidedNow: Lang | null = firstVisit();

function norm(v: unknown): Lang {
  const s = String(v || '').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

function read(k: string): string | null {
  try { return window.localStorage.getItem(k); } catch { return null; }
}
function forgetAuto(): void {
  try { window.localStorage.removeItem(AUTO_KEY); } catch { /* the strip may show once more */ }
}
/** The language taken from the phone ("fr" from "fr:fr-FR"), or null when she has chosen one herself. */
export function autoLanguage(): Lang | null {
  const v = read(AUTO_KEY);
  return v ? norm(v.split(':')[0]) : null;
}

/** The strip's words, in the language the app is in (kept short: the strip must stay small). */
export const STRIP_TEXT: Record<Lang, { title: string; close: string }> = {
  en: { title: 'Bambeh speaks your language', close: 'Keep this language' },
  fr: { title: 'Bambeh parle votre langue', close: 'Garder cette langue' },
  pidgin: { title: 'Bambeh di talk your language', close: 'Keep this language' },
  ar: { title: '\u0628\u0627\u0645\u0628\u064a\u0647 \u064a\u062a\u062d\u062f\u062b \u0644\u063a\u062a\u0643', close: '\u0627\u062d\u062a\u0641\u0638 \u0628\u0647\u0630\u0647 \u0627\u0644\u0644\u063a\u0629' },
  ff: { title: 'Bambeh ina haala \u0257emngal maa', close: 'Jogo \u0257emngal ngal' },
};

/** The five languages, each written in itself; the codes are the app's own (App.tsx LanguageProvider). */
export const STRIP_LANGS: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: 'fr', label: 'Fran\u00e7ais' },
  { code: 'en', label: 'English' },
  { code: 'pidgin', label: 'Pidgin' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
  { code: 'ff', label: 'Fulfulde' },
];

/** Home only: the page every visitor reaches, where the strip can cover nothing that matters. */
export function stripPage(pathname: string): boolean {
  const p = (String(pathname || '/').split('?')[0].replace(/\/+$/, '') || '/').toLowerCase();
  return p === '/' || p === '/home';
}

/** Renders nothing - except on Home, for a phone whose language was taken from the phone and not yet confirmed. */
export default function FirstVisit() {
  const location = useLocation();
  const [, setTick] = useState(0);
  const box = useRef<HTMLDivElement | null>(null);
  const show = autoLanguage() !== null && stripPage(location.pathname);

  useEffect(() => {
    // another language chosen anywhere (the header, the sign-up page, another tab) answers the strip too;
    // the same language sent again (a page repeating it) does not
    const answered = (code: unknown) => {
      const auto = autoLanguage();
      if (auto && norm(code) !== auto) forgetAuto();
      setTick((n) => n + 1); // draw again: the strip reads the note fresh
    };
    const onLang = (e: Event) => answered((e as CustomEvent).detail);
    const onStorage = (e: StorageEvent) => { if (e.key === LANG_KEY && e.newValue) answered(e.newValue); };
    window.addEventListener('bambeh:langchange', onLang);
    window.addEventListener('storage', onStorage);
    // the language was set in this page load: tell every page once, in case one read the key before it was set
    if (decidedNow) {
      const code = decidedNow;
      decidedNow = null;
      try { window.dispatchEvent(new CustomEvent('bambeh:langchange', { detail: code })); } catch { /* older browser */ }
    }
    return () => {
      window.removeEventListener('bambeh:langchange', onLang);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // while the strip shows, the page gets room at its bottom: nothing stays hidden under the strip
  useEffect(() => {
    const el = box.current;
    const body = show && el && typeof document !== 'undefined' ? document.body : null;
    if (!el || !body || !body.style) return undefined;
    const before = body.style.paddingBottom;
    body.style.paddingBottom = String(el.offsetHeight + 24) + 'px';
    return () => { body.style.paddingBottom = before; };
  });

  if (!show) return null;
  const lang = norm(read(LANG_KEY));
  const t = STRIP_TEXT[lang];

  const choose = (code: Lang) => {
    forgetAuto();
    if (code !== lang) {
      try { window.localStorage.setItem(LANG_KEY, code); } catch { /* the event still changes the pages */ }
      try { window.dispatchEvent(new CustomEvent('bambeh:langchange', { detail: code })); } catch { /* older browser */ }
    }
    setTick((n) => n + 1);
  };
  const keep = () => { forgetAuto(); setTick((n) => n + 1); };

  return (
    <div ref={box} role="region" aria-label={t.title} dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX764"
         className="fixed inset-x-3 z-[60] mx-auto max-w-md rounded-2xl border border-teal-200 bg-white px-3 py-2.5 shadow-2xl"
         style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 flex-shrink-0 text-teal-600" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-bold text-gray-900">{t.title}</p>
        <button type="button" onClick={keep} aria-label={t.close} title={t.close} data-strip-close="1"
                className="-m-1 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STRIP_LANGS.map((l) => (
          <button key={l.code} type="button" onClick={() => choose(l.code)} aria-pressed={l.code === lang} data-strip-lang={l.code}
                  className={'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ' +
                    (l.code === lang ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
            {l.code === lang && <Check className="h-3 w-3" aria-hidden="true" />}
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__FIRST_VISIT_FIX764__COMPLETE
