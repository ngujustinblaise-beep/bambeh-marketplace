// BAMBEH_DEPLOY_TOKEN__WAITSCREEN_FIX967_CLEAN
/**
 * src/components/app/WaitScreen.tsx - FIX967 (Package 16, Big 1 Nov 2026: "a wait screen such that as pages load,
 * we show the logo faintly with the message: be patient as we link you up, or please be patient as we carry this
 * load properly ... in all in-app languages").
 *
 * While a screen of the app is being downloaded: the Bambeh logo, faint and gently breathing, with "Be patient as
 * we link you up..." - and, once the wait passes 4 seconds (a slow line, or a download being retried, FIX957),
 * "Please be patient as we carry this load properly...". In the member's language; Arabic right to left.
 *
 * Two ways it shows (App.tsx, FIX968):
 *   - WaitScreen       the screen while the app opens (React's Suspense fallback);
 *   - WaitOverlay      on top of the current page when the member taps to another screen that is still
 *                      downloading. React keeps the old page on show during such a move (it does not show the
 *                      Suspense fallback again), so on a slow line nothing seemed to happen for seconds: now the
 *                      wait screen covers it after 0.4 s, and leaves as soon as the new screen is there - or as
 *                      soon as the member goes back.
 * lazyWithWait() is App.tsx's `lazy`: React.lazy with the retries of FIX957, counting the downloads under way.
 * A screen that comes at once never flashes it (it fades in after a moment). "Reduce motion": nothing moves.
 * It reads the language straight from the phone, so it works anywhere - even before the app's settings load.
 * index.html shows the same screen before the app itself has arrived (FIX968), with the same words.
 */
import { lazy, useEffect, useState, useSyncExternalStore, type ComponentType, type LazyExoticComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { importWithRetry } from '@/lib/lazyRetry';

const LANG_KEY = 'Bambeh_language';
export const WAIT_AFTER_MS = 4000;
export const OVERLAY_AFTER_MS = 400;

/** [while linking up, after 4 seconds] in each in-app language. */
export const WAIT_TEXT: Record<string, [string, string]> = {
  en: ['Be patient as we link you up\u2026', 'Please be patient as we carry this load properly\u2026'],
  fr: ['Patientez, nous vous connectons\u2026', 'Merci de patienter\u00a0: nous portons cette charge comme il faut\u2026'],
  pidgin: ['Take am easy, we dey link you up\u2026', 'Abeg get patience, we dey carry dis load well-well\u2026'],
  ar: ['\u062a\u062d\u0644\u064e\u0651 \u0628\u0627\u0644\u0635\u0628\u0631\u060c \u062c\u0627\u0631\u064d \u062a\u0648\u0635\u064a\u0644\u0643\u2026', '\u0646\u0631\u062c\u0648 \u0645\u0646\u0643 \u0627\u0644\u0635\u0628\u0631\u060c \u0646\u062d\u0645\u0644 \u0647\u0630\u0627 \u0627\u0644\u062d\u0645\u0644 \u0643\u0645\u0627 \u064a\u0646\u0628\u063a\u064a\u2026'],
  ff: ['Mu\u00f1 see\u0257a, min njokkondirta ma\u2026', 'Tii\u0257no mu\u00f1, min ndonda doongal ngal no feewi\u2026'],
};

/** The member's language: the app's setting on this phone, else the phone's own language, else English. */
export function waitLang(): string {
  try {
    const l = window.localStorage.getItem(LANG_KEY) || '';
    if (WAIT_TEXT[l]) return l;
  } catch { /* storage blocked */ }
  try {
    const n = (navigator.language || '').slice(0, 2).toLowerCase();
    if (n === 'fr' || n === 'ar') return n;
  } catch { /* ignore */ }
  return 'en';
}

// ------------------------------------------------------------------------------------------- downloads under way
let pending = 0;          // screens being downloaded now
let startHash = '';       // where the member was going when the latest download started
let fallbacks = 0;        // full wait screens on show (the overlay then stays away)
let waitSince = 0;        // when the current wait began (the second line counts from there, whatever is drawn)
const listeners = new Set<() => void>();
function notifyLater() {
  // never during React's own drawing (a screen's download starts while React draws it)
  Promise.resolve().then(() => listeners.forEach((f) => { try { f(); } catch { /* ignore */ } }));
}
function subscribe(f: () => void) { listeners.add(f); return () => { listeners.delete(f); }; }
function hashNow(): string { try { return window.location.hash || '#/'; } catch { return ''; } }
function snapshot(): string { return pending + '|' + fallbacks + '|' + startHash; }   // a string: compared by value

/** Counts a download while it is under way (it may never end: the app is reloading - the screen stays, rightly). */
export function trackDownload<T>(p: Promise<T>): Promise<T> {
  startHash = hashNow();   // the app moves the address first, then draws the new screen (which starts its download)
  if (pending === 0) waitSince = Date.now();
  pending++;
  notifyLater();
  const done = () => { pending = Math.max(0, pending - 1); notifyLater(); };
  p.then(done, done);
  return p;
}

/** React.lazy with the retries of FIX957 (lazyRetry), counted for the wait screen. Same use as React.lazy. */
export function lazyWithWait<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): LazyExoticComponent<T> {
  return lazy(() => trackDownload(importWithRetry(async () => {
    const mod = await factory();
    // a download that "succeeded" with nothing in it is a failed download (see lazyWithRetry, FIX957)
    if (!mod || (mod as { default?: unknown }).default === undefined) {
      const err = new Error('Failed to fetch dynamically imported module (empty answer)');
      err.name = 'ChunkLoadError';
      throw err;
    }
    return mod;
  })));
}

/** When the downloads under way began (0: none under way). */
export function waitStartedAt(): number { return pending > 0 ? waitSince : 0; }

const CSS =
  '@keyframes bambehWaitIn{from{opacity:0}to{opacity:1}}' +
  '@keyframes bambehWaitBreath{0%,100%{opacity:.22}50%{opacity:.45}}' +
  '.bambeh-wait{animation:bambehWaitIn .35s ease-out .15s both}' +
  '.bambeh-wait-logo{opacity:.32;animation:bambehWaitBreath 2.4s ease-in-out infinite}' +
  '@media (prefers-reduced-motion: reduce){.bambeh-wait{animation:none}.bambeh-wait-logo{animation:none}}';

export function WaitScreen({ lang, after = WAIT_AFTER_MS, overlay = false }: { lang?: string; after?: number; overlay?: boolean }) {
  const l = lang && WAIT_TEXT[lang] ? lang : waitLang();
  // the second line comes 4 s after the WAIT began - not after this screen was drawn (it may be drawn again)
  const [since] = useState(() => waitStartedAt() || Date.now());
  const [long, setLong] = useState(() => Date.now() - since >= after);
  useEffect(() => {
    if (long) return undefined;
    const t = window.setTimeout(() => setLong(true), Math.max(0, since + after - Date.now()));
    return () => window.clearTimeout(t);
  }, [since, after, long]);
  useEffect(() => {
    if (overlay) return undefined;
    fallbacks++;
    notifyLater();
    return () => { fallbacks = Math.max(0, fallbacks - 1); notifyLater(); };
  }, [overlay]);
  const text = WAIT_TEXT[l][long ? 1 : 0];
  return (
    <div
      className="bambeh-wait min-h-screen w-full flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={overlay
        ? { position: 'fixed', inset: 0, zIndex: 2147483000, background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 70%)' }
        : { background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 70%)' }}
      role="status"
      aria-live="polite"
      dir={l === 'ar' ? 'rtl' : 'ltr'}
      lang={l === 'pidgin' ? 'en' : l}
      data-wait-screen={overlay ? 'overlay' : 'page'}
    >
      <style>{CSS}</style>
      <img
        src="/icons/icon-192.png"
        width={96}
        height={96}
        alt=""
        decoding="async"
        className="bambeh-wait-logo"
        style={{ borderRadius: 24 }}
      />
      <p className="m-0 max-w-xs text-base leading-relaxed font-medium" style={{ color: '#0f766e' }} data-wait-text={long ? '2' : '1'}>
        {text}
      </p>
    </div>
  );
}

/** Mounted once at the top of the app: the wait screen over the current page while the next screen downloads. */
export function WaitOverlay({ delay = OVERLAY_AFTER_MS }: { delay?: number }) {
  const snap = useSyncExternalStore(subscribe, snapshot, () => '0|0|');
  useLocation();   // drawn again on every move (in-app moves change the address without a "hashchange")
  // ... and at once when the member goes back: React holds the move back while the other screen still downloads
  const [, setTick] = useState(0);
  useEffect(() => {
    const f = () => setTick((t) => t + 1);
    window.addEventListener('popstate', f);
    window.addEventListener('hashchange', f);
    return () => { window.removeEventListener('popstate', f); window.removeEventListener('hashchange', f); };
  }, []);
  const parts = snap.split('|');
  const p = Number(parts[0]);
  const fb = Number(parts[1]);
  const sh = parts.slice(2).join('|');
  // only while the member still waits for that screen: they went back = no cover
  const want = p > 0 && fb === 0 && sh === hashNow();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!want) { setShow(false); return undefined; }
    const t = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(t);
  }, [want, delay]);
  return show ? <WaitScreen overlay /> : null;
}

export default WaitScreen;
// BAMBEH_END_TOKEN__WAITSCREEN_FIX967__COMPLETE
