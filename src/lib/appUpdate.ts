// BAMBEH_DEPLOY_TOKEN__APPUPDATE_FIX977_CLEAN
/**
 * src/lib/appUpdate.ts - FIX977 (Package 18, Big 2 Nov 2026: phones with the APK were missing Packages 11 to 17)
 *
 * THE ANDROID APP KEEPS ITSELF UP TO DATE - no new APK for each package.
 * The website (app.bambeh.com) changes the moment a package is pushed; the installed Android app used to keep the
 * screens of the day its APK was built, for ever. From this APK on:
 *
 *   1. At every start the app tells the updater it opened (notifyAppReady). A downloaded version that does not open
 *      within 20 seconds is thrown away by the updater, the phone goes back to the last version that worked, and this
 *      file never downloads that version again.
 *   2. A few seconds after start - and when the app comes back to the screen - at most every 4 hours, it asks
 *      app.bambeh.com/ota/version.json for the newest build (a few hundred bytes; FIX979 writes it at every build).
 *   3. If that is not the build on the phone, it reads the list of files (ota/manifest.json) and the updater downloads
 *      ONLY the files the phone does not already have - usually a few hundred kB for a package - each one checked
 *      against its SHA-256 before it is used. Under "Save data" (FIX958) it does not start a download of more than
 *      1.5 MB; that one waits until Save data is off.
 *   4. The new version is used at the NEXT START of the app - never in the middle of what the member is doing (a
 *      payment, a form, a chat). At a start, if a downloaded version is waiting, the app switches to it first (one
 *      quick reload behind the wait screen) - unless it was opened by a link (a payment's return, a shared item):
 *      then the link goes first and the switch waits for the next start.
 *   5. A new APK is needed only when Bambeh changes the app's native part (a new permission, a new plugin).
 *      app.bambeh.com/download/latest.json (written by FIX983 with each APK) names the newest APK; when it is newer
 *      than this phone's, a small bar offers it (AppUpdateNotice, FIX978).
 *
 * Only app.bambeh.com is asked: the updater's own statistics, channels and update server are switched off
 * (capacitor.config.ts, FIX981). On the website itself (not the APK) this file does nothing.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useSyncExternalStore } from 'react';
import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { isLite } from '@/lib/liteMode';

/** Where the newest build and the newest APK are published (Netlify, the same place as the website). */
export const UPDATE_BASE = 'https://app.bambeh.com';
export const DOWNLOAD_PAGE = UPDATE_BASE + '/download/';

const K_LATEST = 'bambeh_ota_latest';    // the newest build id the server named
const K_BAD = 'bambeh_ota_bad';          // build ids that did not open on this phone: never downloaded again
const K_CHECKED = 'bambeh_ota_checked';  // when the server was last asked: "<ms>:ok" or "<ms>:fail"
const K_APK = 'bambeh_apk_latest';       // the newest APK the server offers (JSON)
const K_LATER = 'bambeh_apk_later';      // "Later" on the bar: "<version_code>:<ms>"

export const CHECK_EVERY_MS = 4 * 3600 * 1000;
export const RETRY_AFTER_FAIL_MS = 15 * 60 * 1000;
export const FIRST_CHECK_DELAY_MS = 15000;
export const LITE_MAX_BYTES = 1536 * 1024;
export const LATER_FOR_MS = 3 * 24 * 3600 * 1000;

// ------------------------------------------------------------------------------------------------ the updater plugin
// @capgo/capacitor-updater 8.54.0 (native part only, installed by FIX982). Registered here by its name, so the website
// never loads its code; it is called only inside the Android app, and only when the APK carries it.
interface Bundle { id: string; version: string; status: string; downloaded?: string; checksum?: string }
interface Entry { file_name: string; file_hash: string; download_url: string }
interface UpdaterPlugin {
  notifyAppReady(): Promise<{ bundle: Bundle }>;
  getFailedUpdate(): Promise<{ bundle: Bundle } | null>;
  list(): Promise<{ bundles: Bundle[] }>;
  set(o: { id: string }): Promise<void>;
  delete(o: { id: string }): Promise<void>;
  download(o: { url: string; version: string; manifest: Entry[] }): Promise<Bundle>;
  getMissingBundleFiles(o: { manifest: Entry[]; version?: string }): Promise<{ missing: Entry[]; total: number }>;
}
const Updater = registerPlugin<UpdaterPlugin>('CapacitorUpdater');

/** Inside the installed Android app (not the website, not an iPhone). */
export function isAndroidApp(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

/** This APK carries the updater (APKs from Package 18 on). */
export function hasUpdater(): boolean {
  try {
    return isAndroidApp() && Capacitor.isPluginAvailable('CapacitorUpdater');
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------------------------------------ small helpers
function read(k: string): string {
  try { return window.localStorage.getItem(k) || ''; } catch { return ''; }
}
function write(k: string, v: string): void {
  try { window.localStorage.setItem(k, v); } catch { /* storage full or blocked: the next check asks again */ }
}
function bad(): string[] {
  try {
    const a = JSON.parse(read(K_BAD) || '[]');
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function addBad(id: string): void {
  const a = bad().filter((x) => x !== id);
  a.push(id);
  write(K_BAD, JSON.stringify(a.slice(-20)));
}
function isId(x: unknown): x is string {
  return typeof x === 'string' && /^[0-9a-f]{8,64}$/.test(x);
}

/** GET a small JSON file from app.bambeh.com. Inside the app through the phone itself (no browser rules in the way). */
async function getJson(url: string): Promise<any | null> {
  const u = url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
  try {
    if (isAndroidApp()) {
      const r = await CapacitorHttp.get({
        url: u, headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        connectTimeout: 15000, readTimeout: 20000, responseType: 'json',
      });
      if (!r || r.status !== 200) return null;
      return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
    }
    const res = await fetch(u, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** The id of the build this phone is running (FIX979 writes it into every build). '' when unknown. */
async function ownBuildId(): Promise<string> {
  try {
    const r = await fetch('/bambeh-build.json', { cache: 'no-store' });
    if (!r.ok) return '';
    const j = await r.json();
    return isId(j && j.id) ? j.id : '';
  } catch {
    return '';
  }
}

// ------------------------------------------------------------------------------------------------ what the bar reads
export interface ApkInfo { version_code: number; version_name: string; size: number; released_at: string; url: string }
export interface AppUpdateState {
  isApp: boolean;          // inside the Android app
  updater: boolean;        // this APK keeps itself up to date
  nativeBuild: number;     // this APK's version code
  nativeVersion: string;   // this APK's version name
  own: string;             // the build running now
  apk: ApkInfo | null;     // the newest APK on app.bambeh.com/download/
  apkNewer: boolean;       // a newer APK than this one exists
  nativeTooOld: boolean;   // the newest build needs a newer APK than this one
  waiting: string;         // a downloaded build, used at the next start ('' = none)
  latest: string;          // the newest build the server named ('' = not known yet)
  checking: boolean;       // asking the server / downloading now
  checkedAt: number;       // when the server last answered (ms; 0 = not yet)
}

const EMPTY: AppUpdateState = {
  isApp: false, updater: false, nativeBuild: 0, nativeVersion: '', own: '', apk: null, apkNewer: false,
  nativeTooOld: false, waiting: '', latest: '', checking: false, checkedAt: 0,
};
let S: AppUpdateState = { ...EMPTY };
const listeners = new Set<() => void>();
function set(p: Partial<AppUpdateState>): void {
  S = { ...S, ...p };
  S.apkNewer = !!(S.isApp && S.apk && S.nativeBuild > 0 && S.apk.version_code > S.nativeBuild);
  listeners.forEach((f) => { try { f(); } catch { /* a listener's problem stays its own */ } });
}
export function getAppUpdateState(): AppUpdateState {
  return S;
}
export function subscribeAppUpdate(f: () => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}
export function useAppUpdate(): AppUpdateState {
  return useSyncExternalStore(subscribeAppUpdate, getAppUpdateState, getAppUpdateState);
}

function pickApk(j: any): ApkInfo | null {
  if (!j || typeof j !== 'object') return null;
  const code = Number(j.version_code);
  if (!Number.isInteger(code) || code < 1) return null;
  const url = typeof j.url === 'string' && /^\/download\/[A-Za-z0-9._-]+\.apk$/.test(j.url) ? j.url : '/download/bambeh.apk';
  return {
    version_code: code,
    version_name: typeof j.version_name === 'string' ? j.version_name.slice(0, 40) : '',
    size: Number.isFinite(Number(j.size)) ? Number(j.size) : 0,
    released_at: typeof j.released_at === 'string' ? j.released_at.slice(0, 40) : '',
    url,
  };
}

/** The bar's "Later": hidden for 3 days for this APK. */
export function apkLater(code: number): void {
  write(K_LATER, String(code) + ':' + String(Date.now()));
  set({});
}
export function apkLaterActive(code: number): boolean {
  const [c, t] = read(K_LATER).split(':');
  return Number(c) === code && Date.now() - Number(t || 0) < LATER_FOR_MS;
}

/** Opens app.bambeh.com/download/ in the phone's browser (the app hands any outside address to the browser). */
export function openDownloadPage(): void {
  try { window.location.href = DOWNLOAD_PAGE; } catch { /* nothing else to try */ }
}

// ------------------------------------------------------------------------------------------------ at start
let started = false;
let busy = false;

/** main.tsx calls this once, first thing (FIX981). Does nothing outside the Android app. */
export function startAppUpdates(): void {
  if (started) return;
  started = true;
  if (!isAndroidApp()) return;
  if (hasUpdater()) {
    // 1. this version opened: say so at once, before anything waits on the network
    Updater.notifyAppReady().catch(() => undefined);
  }
  void boot();
}

async function boot(): Promise<void> {
  try {
    let build = 0;
    let version = '';
    try {
      const info = await CapApp.getInfo();
      build = parseInt(String(info && info.build), 10) || 0;
      version = String((info && info.version) || '');
    } catch { /* unknown: the bar never shows */ }
    const own = await ownBuildId();
    let apk: ApkInfo | null = null;
    try { apk = pickApk(JSON.parse(read(K_APK) || 'null')); } catch { apk = null; }
    const [at, how] = read(K_CHECKED).split(':');
    set({
      isApp: true, updater: hasUpdater(), nativeBuild: build, nativeVersion: version, own, apk,
      latest: isId(read(K_LATEST)) ? read(K_LATEST) : '', checkedAt: how === 'ok' ? Number(at) || 0 : 0,
    });

    if (S.updater) {
      try {
        const f = await Updater.getFailedUpdate();
        const v = f && f.bundle && f.bundle.version;
        if (isId(v)) addBad(v);
      } catch { /* no failed version */ }
      if (await applyWaiting()) return;   // the app reloads into the new version: nothing more here
    }
    setTimeout(() => { void checkNow(false); }, FIRST_CHECK_DELAY_MS);
    try { void CapApp.addListener('resume', () => { void checkNow(false); }); } catch { /* no resume event: start only */ }
  } catch {
    /* never in the member's way */
  }
}

/** 4. A downloaded version waits: use it now, at the start - not when the app was opened by a link. */
async function applyWaiting(): Promise<boolean> {
  try {
    const latest = read(K_LATEST);
    if (!isId(latest) || latest === S.own || bad().indexOf(latest) >= 0) return false;
    const { bundles } = await Updater.list();
    const ready = (bundles || []).find((b) => b && b.version === latest && b.status === 'pending');
    if (!ready) return false;
    set({ waiting: latest });
    const h = String(window.location.hash || '');
    if (h && h !== '#' && h !== '#/') return false;          // a page is open (a reload, or a link): next start
    try {
      const launch = await CapApp.getLaunchUrl();
      if (launch && launch.url) return false;               // opened by a link: the link goes first
    } catch { /* no launch link */ }
    await Updater.set({ id: ready.id });                    // reloads the app into the new version
    return true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------------------------------------ asking the server
/** 2. and 3. Ask app.bambeh.com; download what is missing. force: ignore the 4-hour pause (tests, staff). */
export async function checkNow(force: boolean): Promise<void> {
  if (!S.isApp || busy) return;
  if (!force) {
    const [at, how] = read(K_CHECKED).split(':');
    const wait = how === 'ok' ? CHECK_EVERY_MS : RETRY_AFTER_FAIL_MS;
    if (Date.now() - (Number(at) || 0) < wait) return;
  }
  try { if (typeof navigator !== 'undefined' && navigator.onLine === false) return; } catch { /* unknown: try */ }
  busy = true;
  set({ checking: true });
  let ok = false;
  try {
    write(K_CHECKED, String(Date.now()) + ':fail');      // a check cut short counts as failed: tried again in 15 minutes
    const apk = pickApk(await getJson(UPDATE_BASE + '/download/latest.json'));
    if (apk) {
      write(K_APK, JSON.stringify(apk));
      set({ apk });
    }
    const v = await getJson(UPDATE_BASE + '/ota/version.json');
    if (v && isId(v.id)) {
      const tooOld = (Number(v.min_native) || 0) > S.nativeBuild;
      set({ nativeTooOld: tooOld });
      if (!tooOld && S.updater) await fetchBuild(v);
      ok = true;
    }
  } catch {
    /* the next check tries again */
  } finally {
    const now = Date.now();
    if (ok) write(K_CHECKED, String(now) + ':ok');
    busy = false;
    set(ok ? { checking: false, checkedAt: now } : { checking: false });
  }
}

async function fetchBuild(v: { id: string; manifest?: string }): Promise<void> {
  write(K_LATEST, v.id);
  set({ latest: v.id });
  if (v.id === S.own || bad().indexOf(v.id) >= 0) return;
  const { bundles } = await Updater.list();
  let have = false;
  for (const b of bundles || []) {
    if (!b || b.id === 'builtin') continue;
    if (b.version === v.id && (b.status === 'pending' || b.status === 'success')) { have = true; continue; }
    // what an earlier start left behind (a version the server has moved past, a download cut off, a failure)
    if (b.status === 'pending' || b.status === 'downloading' || b.status === 'error') {
      try { await Updater.delete({ id: b.id }); } catch { /* the updater keeps what it is using */ }
    }
  }
  if (have) { set({ waiting: v.id }); return; }

  const path = typeof v.manifest === 'string' && /^ota\/[a-z0-9._-]+\.json$/.test(v.manifest) ? v.manifest : 'ota/manifest.json';
  const m = await getJson(UPDATE_BASE + '/' + path);
  if (!m || m.id !== v.id || !Array.isArray(m.files) || m.files.length === 0) return;   // a deploy in between: later
  const sizes: Record<string, number> = {};
  const manifest: Entry[] = [];
  for (const row of m.files) {
    if (!Array.isArray(row) || typeof row[0] !== 'string' || !/^[0-9a-f]{64}$/.test(String(row[1]))) return;
    const name = row[0];
    if (!name || name.charAt(0) === '/' || name.indexOf('\\') >= 0 || name.split('/').indexOf('..') >= 0) return;
    sizes[name] = Number(row[2]) || 0;
    manifest.push({
      file_name: name,
      file_hash: row[1],
      download_url: UPDATE_BASE + '/' + name.split('/').map(encodeURIComponent).join('/') + '?h=' + String(row[1]).slice(0, 16),
    });
  }
  if (!manifest.some((e) => e.file_name === 'index.html')) return;
  if (isLite()) {
    try {
      const miss = await Updater.getMissingBundleFiles({ manifest, version: v.id });
      const need = (miss && Array.isArray(miss.missing) ? miss.missing : []).reduce((s, e) => s + (sizes[e.file_name] || 0), 0);
      if (need > LITE_MAX_BYTES) return;   // Save data is on: a big download waits until it is off
    } catch {
      return;
    }
  }
  await Updater.download({ url: UPDATE_BASE + '/' + path, version: v.id, manifest });
  set({ waiting: v.id });                  // used at the next start
}

/** Test hook: back to the state at page load. */
export function __resetAppUpdateForTests(): void {
  started = false;
  busy = false;
  S = { ...EMPTY };
}
// BAMBEH_END_TOKEN__APPUPDATE_FIX977__COMPLETE
