// BAMBEH_DEPLOY_TOKEN__LAZYRETRY_FIX957_CLEAN
/**
 * src/lib/lazyRetry.ts - FIX957 (Package 15, Big 1 Nov 2026: "the app keeps failing to open ... there seems to be
 * a network issue")
 *
 * Every page of Bambeh is its own small file, downloaded the first time it is opened. On a weak line that download
 * fails now and then, and React showed the big "Something went wrong" screen for what was only a slow connection.
 *
 * A browser does not try the same page file twice in one visit: once a download has failed, asking again fails at
 * once, without going to the network (tested in Chromium). So a retry must ask for the file under a fresh address
 * (name.js?r=2 - the same file; the service worker keeps it under its plain name).
 *
 * lazyWithRetry() is React.lazy() that does exactly that before giving up:
 *   - up to 3 more tries, waiting a little longer each time (1.2 s, 3 s, 6 s);
 *   - with no connection at all it waits for the phone to come back online - 8 s at most: still offline after that, it
 *     stops at once (no tries that cannot work, no long spinner in airplane mode);
 *   - when the browser does not say which file failed (Safari), or every try fails while the phone says it is online,
 *     the app reloads - at most once a minute (the service worker opens it from the phone, so this is quick);
 *   - after that it gives up with a BambehNetworkError, which the error screen (FIX960) shows as "weak or no
 *     connection" with Try again, and which tries again by itself when the phone comes back online - never a crash.
 * App.tsx imports this as `lazy`, so all of its pages get it without touching each line.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const NETWORK_ERROR_NAME = 'BambehNetworkError';
const RELOAD_AT_KEY = 'bambeh_chunk_reload_at';   // when the app last reloaded itself for a failed download
const RELOAD_GAP_MS = 60000;
const DELAYS = [1200, 3000, 6000];
const OFFLINE_WAIT_MS = 8000;   // how long a page waits for a lost connection before saying "weak or no connection"

const NETWORKISH = /dynamically imported module|importing a module script failed|error loading dynamically imported|failed to fetch|load failed|networkerror|network error|chunkloaderror|loading chunk|loading css chunk|unable to preload/i;

/** True for "the file could not be downloaded" errors - a connection problem, not a bug in the page. */
export function isNetworkError(e: unknown): boolean {
  if (!e) return false;
  const err = e as { name?: unknown; message?: unknown };
  if (err.name === NETWORK_ERROR_NAME || err.name === 'ChunkLoadError') return true;
  const msg = String(err.message ?? e);
  return NETWORKISH.test(msg);
}

/** The address of the file that failed, when the browser says it (Chrome, Firefox). */
export function failedFileUrl(e: unknown): string | null {
  const msg = String((e as { message?: unknown })?.message ?? '');
  const m = /(https?:\/\/[^\s'"<>()]+?\.(?:m?js|css))(?:\?[^\s'"<>()]*)?/i.exec(msg);
  if (!m) return null;
  try {
    const u = new URL(m[1]);
    if (typeof window !== 'undefined' && u.origin !== window.location.origin) return null;   // only Bambeh's own files
    return u.origin + u.pathname;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function online(): boolean {
  try { return typeof navigator === 'undefined' || navigator.onLine !== false; } catch { return true; }
}

/** Resolves when the phone is back online, or after maxMs. */
export function waitForOnline(maxMs: number): Promise<void> {
  if (online()) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { window.removeEventListener('online', finish); } catch { /* ignore */ }
      resolve();
    };
    try { window.addEventListener('online', finish); } catch { /* ignore */ }
    setTimeout(finish, maxMs);
  });
}

/** Reloads the app unless it already did so in the last minute (no loop on a dead line). True if reloading. */
export function reloadOnce(why: string): boolean {
  let last = 0;
  try { last = Number(sessionStorage.getItem(RELOAD_AT_KEY) || 0); } catch { return false; }   // storage blocked: never loop
  if (Date.now() - last < RELOAD_GAP_MS) return false;
  try { sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now())); } catch { return false; }
  try { console.warn('[FIX957] reloading once: ' + why); } catch { /* ignore */ }
  try { window.location.reload(); } catch { return false; }
  return true;
}

function networkError(cause: unknown): Error {
  const err = new Error('This screen could not be downloaded: the connection is weak or off.');
  err.name = NETWORK_ERROR_NAME;
  (err as Error & { cause?: unknown }).cause = cause;
  return err;
}

// The browser's own import, kept out of the bundler's way: the address is only known when a download has failed.
const nativeImport = (url: string): Promise<unknown> => import(/* @vite-ignore */ url);

/**
 * Calls factory(); when the download fails, asks for the same file again under a fresh address, as described at the
 * top. Errors that are not about the network are thrown at once.
 */
export async function importWithRetry<T>(
  factory: () => Promise<T>,
  delays: number[] = DELAYS,
  load: (url: string) => Promise<unknown> = nativeImport,
  offlineWaitMs: number = OFFLINE_WAIT_MS,
): Promise<T> {
  let first: unknown;
  try {
    return await factory();
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    first = e;
  }
  const url = failedFileUrl(first);
  let last: unknown = first;
  if (url) {
    for (let i = 0; i < delays.length; i++) {
      if (!online()) {
        await waitForOnline(offlineWaitMs);
        if (!online()) break;   // still no connection: say so now - the screen opens by itself when it comes back
      }
      await sleep(delays[i]);
      try {
        return (await load(url + '?r=' + (i + 2) + '-' + Date.now().toString(36))) as T;
      } catch (e) {
        last = e;
        if (!isNetworkError(e)) throw e;
      }
    }
  } else if (!online()) {
    await waitForOnline(offlineWaitMs);
  }
  if (online() && reloadOnce(url ? 'a page could not be downloaded after retries' : 'a page could not be downloaded')) {
    return new Promise<T>(() => { /* the page is reloading */ });
  }
  throw networkError(last);
}

/** React.lazy with retries. Same signature, so `import { lazyWithRetry as lazy }` replaces React's lazy in place. */
export function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): LazyExoticComponent<T> {
  return lazy(() => importWithRetry(async () => {
    const mod = await factory();
    // A page download that "succeeded" with nothing in it (a cancelled preload resolves with nothing) is a failed
    // download: retried like one, never handed to React, which would crash on it.
    if (!mod || (mod as { default?: unknown }).default === undefined) {
      const err = new Error('Failed to fetch dynamically imported module (empty answer)');
      err.name = 'ChunkLoadError';
      throw err;
    }
    return mod;
  }));
}

export default lazyWithRetry;
// BAMBEH_END_TOKEN__LAZYRETRY_FIX957__COMPLETE
