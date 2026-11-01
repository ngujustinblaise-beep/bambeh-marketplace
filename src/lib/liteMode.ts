// BAMBEH_DEPLOY_TOKEN__LITEMODE_FIX958_CLEAN
/**
 * src/lib/liteMode.ts - FIX958 (Package 15, Big 1 Nov 2026: "does the low data saving mode function?" ... "the light
 * app version that works on all kinds of network")
 *
 * Before this, "Data Saver" was a button on the slow-connection banner that nothing in the app read. This is the one
 * switch the whole app now follows.
 *
 *   choice "auto" (the default): ON by itself when the phone asks to save data (Android "Data saver") or the line is
 *          2G; OFF otherwise.
 *   choice "on" / "off": the member decided (menu > Save data, or the slow-connection banner); kept on this phone.
 *
 * What it changes while ON:
 *   - photos in lists and on Home are not downloaded (a small grey picture stands in); opening an item shows its
 *     photos - the service worker (FIX959) does this, so every screen gets it without being changed one by one;
 *   - App Check's security library (about 150 kB) is not downloaded at start (FIX962, SecurityInitializer).
 *
 * The page tells the service worker the current switch, the screen it is on and the language - nothing else.
 */
import { useSyncExternalStore } from 'react';

export type LiteChoice = 'auto' | 'on' | 'off';

const KEY = 'bambeh_lite';
const listeners = new Set<() => void>();
let connHooked = false;
let lastRoute = '/';

interface ConnInfo { saveData?: boolean; effectiveType?: string; addEventListener?: (t: string, f: () => void) => void }

function conn(): ConnInfo | null {
  try {
    const n = navigator as unknown as { connection?: ConnInfo; mozConnection?: ConnInfo; webkitConnection?: ConnInfo };
    return n.connection || n.mozConnection || n.webkitConnection || null;
  } catch {
    return null;
  }
}

/** The phone's own signals: Android's data saver, or a 2G line. */
export function autoLite(): boolean {
  const c = conn();
  if (!c) return false;
  if (c.saveData === true) return true;
  const t = String(c.effectiveType || '').toLowerCase();
  return t === 'slow-2g' || t === '2g';
}

// When this phone's storage is blocked, the choice lives in memory for this visit.
let memChoice: LiteChoice = 'auto';
let storageBlocked = false;

export function liteChoice(): LiteChoice {
  if (storageBlocked) return memChoice;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === 'on' || v === 'off') return v;
  } catch {
    return memChoice;
  }
  return 'auto';
}

export function isLite(): boolean {
  const c = liteChoice();
  if (c === 'on') return true;
  if (c === 'off') return false;
  return autoLite();
}

function notify(): void {
  listeners.forEach((f) => { try { f(); } catch { /* one listener must not stop the others */ } });
  postToWorker();
}

export function setLiteChoice(c: LiteChoice): void {
  memChoice = c;
  try {
    if (c === 'auto') window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, c);
    storageBlocked = false;
  } catch {
    storageBlocked = true;   // the switch still works until the page closes
  }
  notify();
}

function currentLite(): boolean {
  return isLite();
}

export function subscribeLite(f: () => void): () => void {
  listeners.add(f);
  if (!connHooked) {
    connHooked = true;
    const c = conn();
    try { c?.addEventListener?.('change', () => { if (liteChoice() === 'auto') notify(); }); } catch { /* ignore */ }
  }
  return () => { listeners.delete(f); };
}

/** React: { lite, choice, setChoice } - re-renders when the switch or the line changes. */
export function useLite(): { lite: boolean; choice: LiteChoice; setChoice: (c: LiteChoice) => void } {
  const lite = useSyncExternalStore(subscribeLite, currentLite, () => false);
  const choice = useSyncExternalStore(subscribeLite, liteChoice, () => 'auto' as LiteChoice);
  return { lite, choice, setChoice: setLiteChoice };
}

function lang(): string {
  try {
    const v = window.localStorage.getItem('Bambeh_language');
    if (v) return v;
  } catch { /* ignore */ }
  return 'en';
}

/** Tells the service worker (FIX959) the switch and the screen. Called on every screen change (FIX960) and switch. */
export function postToWorker(route?: string): void {
  if (route) lastRoute = route;
  try {
    const sw = navigator.serviceWorker;
    const target = sw && sw.controller;
    if (!target) return;
    target.postMessage({ type: 'bambeh-state', lite: currentLite(), route: lastRoute, lang: lang() });
  } catch { /* no service worker here (the Android app, an old browser): nothing to tell */ }
}

// A page that loads before the service worker takes control tells it once it does.
try {
  navigator.serviceWorker?.addEventListener?.('controllerchange', () => postToWorker());
} catch { /* ignore */ }
// BAMBEH_END_TOKEN__LITEMODE_FIX958__COMPLETE
