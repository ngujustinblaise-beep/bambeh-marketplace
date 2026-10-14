// BAMBEH_DEPLOY_TOKEN__LINK_RETURN_FIX752_CLEAN
/**
 * src/components/auth/LinkReturn.tsx - FIX752 (new)
 *
 * A SHARED LINK OPENS WHAT IT POINTS TO. Big, 14 Oct 2026: "i wish for us to have the most easy and
 * fruitful on-boarding from the links. many people complain that on boarding is quite difficult".
 *
 * Before: a first-time phone that opened a shared Bambeh link (the pharmacies on call, a women's health
 * page, a food place, Taxi check...) was sent to the language screen, then the terms, then the welcome
 * screen - and then to Home. The page the link pointed to was lost: she had to find it again by herself,
 * and many people simply left.
 *
 * Now:
 *   1. The page a link points to is noted for this visit only (sessionStorage, 30 minutes) - only on a
 *      phone that has not finished the first screens. It is noted when the app starts (a link opened in
 *      the browser) and when the first-screens guard turns a page away (rememberLink, called from the
 *      guard in App.tsx - a link that opens the Android app).
 *   2. The language and terms screens stay exactly as they are.
 *   3. When the terms are accepted, the welcome screen is skipped for her and the page the link pointed
 *      to opens. Without a link, nothing changes.
 * Only a page inside the app can open this way (a path that starts with one "/"), never another website,
 * never a payment page. Nothing is sent anywhere; the note is deleted as soon as the page opens, when she
 * goes her own way after the first screens, or after 30 minutes.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const RETURN_KEY = 'bambeh_return_to';
export const RETURN_MINUTES = 30;

/** The first screens and the sign-in pages: never where a link should land. */
export const FIRST_SCREENS: readonly string[] = [
  '/', '/home', '/language', '/select-language', '/terms-acceptance', '/terms', '/welcome', '/splash',
  '/login', '/signin', '/sign-in', '/register', '/forgot-password', '/forgot-credentials', '/security-recovery',
  '/biometric-login', '/biometric-setup', '/enable-biometrics', '/offline-mode',
];

function readLocal(k: string): string | null {
  try { return window.localStorage.getItem(k); } catch { return null; }
}

/** Has this phone finished the first screens? The same keys as the app's first-screens guard. */
export function firstRunDone(): boolean {
  return !!readLocal('Bambeh_language') && !!readLocal('Bambeh_terms_accepted')
    && !!(readLocal('Bambeh_welcome_shown') || readLocal('Bambeh_welcome_completed'));
}

/** "/pharmacies?town=yaounde" without its query, without a trailing "/", lower case. */
function pageOf(path: string): string {
  return (path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/').toLowerCase();
}

/** A page inside the app that a link may open, or null. */
export function cleanPath(raw: unknown): string | null {
  const s = String(raw == null ? '' : raw).trim();
  if (!s || s.length > 500) return null;
  if (s.charAt(0) !== '/' || s.charAt(1) === '/' || s.indexOf('\\') >= 0) return null;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 32 || c === 127) return null;
  }
  const page = pageOf(s);
  if (FIRST_SCREENS.indexOf(page) >= 0) return null;
  if (page === '/payment' || page.indexOf('/payment/') === 0) return null;
  return s;
}

export function forgetLink(): void {
  try { window.sessionStorage.removeItem(RETURN_KEY); } catch { /* nothing kept */ }
}

/** Note the page a link points to - only on a phone that has not finished the first screens. */
export function rememberLink(raw: unknown, now: number = Date.now()): boolean {
  if (firstRunDone()) return false;
  const p = cleanPath(raw);
  if (!p) return false;
  try {
    window.sessionStorage.setItem(RETURN_KEY, JSON.stringify({ p, at: now }));
    return true;
  } catch {
    return false;
  }
}

/** The page noted for this visit (less than 30 minutes old), or null. */
export function savedLink(now: number = Date.now()): string | null {
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { p?: unknown; at?: unknown } | null;
    const p = v ? cleanPath(v.p) : null;
    const at = v && typeof v.at === 'number' ? v.at : NaN;
    if (!p || isNaN(at) || now - at > RETURN_MINUTES * 60000 || at - now > 60000) {
      forgetLink();
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

/** The page in the address when the app starts (the app uses "#/page" addresses). */
export function startPath(): string {
  try {
    const h = String(window.location.hash || '');
    return h.indexOf('#/') === 0 ? h.slice(1) : '';
  } catch {
    return '';
  }
}

// When the app starts - before the first screens move the address away from the link.
rememberLink(startPath());

/**
 * Renders nothing. Mounted once, beside AccountGate, inside the first-screens guard: it sees every page
 * the guard lets through.
 */
export default function LinkReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const here = pageOf(location.pathname);

  useEffect(() => {
    const want = savedLink();
    if (!want) return;
    if (here === '/welcome') {
      // the terms are accepted: skip the welcome screen this once and open the link
      try {
        window.localStorage.setItem('Bambeh_welcome_shown', 'true');
        window.localStorage.setItem('Bambeh_welcome_completed', 'true');
      } catch {
        // storage blocked: the welcome screen shows again later, nothing worse
      }
      forgetLink();
      navigate(want, { replace: true });
      return;
    }
    if (here === pageOf(want)) { forgetLink(); return; }                 // the link's page is open
    if ((here === '/' || here === '/home') && firstRunDone()) {          // sent Home after the first screens
      forgetLink();
      navigate(want, { replace: true });
      return;
    }
    if (FIRST_SCREENS.indexOf(here) >= 0) return;                         // still on the first screens: keep it
    if (firstRunDone()) forgetLink();                                     // she went her own way
  }, [here, navigate]);

  return null;
}
// BAMBEH_END_TOKEN__LINK_RETURN_FIX752__COMPLETE
