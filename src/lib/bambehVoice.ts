// BAMBEH_DEPLOY_TOKEN__BAMBEHVOICE_FIX525_CLEAN
/**
 * src/lib/bambehVoice.ts - Bambeh Marketplace
 *
 * FIX525 - THE VOICE ENGINE. One module, two engines, no pretending.
 * ------------------------------------------------------------------
 * Speech recognition on a Capacitor app is not one problem, it is two.
 *
 *   INSIDE THE ANDROID APP the page runs in a WebView. Android System WebView
 *   does NOT implement the Web Speech API. Any code that calls
 *   webkitSpeechRecognition there fails silently - which is exactly how a voice
 *   feature ships broken and nobody notices for a month. Native must go through
 *   Android's own recognizer via @capacitor-community/speech-recognition.
 *
 *   ON app.bambeh.com the page runs in real Chrome, where the Web Speech API
 *   works and needs no plugin, no permission declaration and no store review.
 *
 * This module picks the right one at runtime and hands the rest of the app a
 * single interface. If NEITHER is available - Firefox, an old WebView, the
 * plugin not installed - `supported` is false and the caller hides the button.
 * A microphone button that does nothing is worse than no button.
 *
 * THE PLUGIN IS IMPORTED THROUGH A VARIABLE, ON PURPOSE
 *   The specifier is held in a const so Vite cannot resolve it at build time.
 *   That means the web build still compiles cleanly on a machine where the
 *   native plugin was never installed. It is loaded once, lazily, and only on
 *   a native platform.
 *
 * LANGUAGES, HONESTLY
 *   en  -> en-US
 *   fr  -> fr-FR
 *   ar  -> ar-001
 *   pcm -> en-NG   Nigerian English. There is no Pidgin engine, and en-NG is by
 *                  a wide margin the closest thing that exists - it handles West
 *                  African vowels and rhythm far better than en-US does.
 *   ff  -> fr-FR   No engine on earth transcribes Fulfulde. Falling back to
 *                  French is not a fix, it is the least bad option, and
 *                  `approximateLanguage` is set true so the UI can say so
 *                  rather than let a Fulfulde speaker think they were heard.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { Capacitor } from '@capacitor/core';

export type VoiceLang = 'en' | 'fr' | 'ar' | 'ff' | 'pcm';

export interface VoiceResult {
  transcript: string;
  /** true when we had to listen in a language the speaker did not choose */
  approximate: boolean;
}

export interface VoiceEngineInfo {
  supported: boolean;
  engine: 'native' | 'web' | 'none';
  /** why it is unsupported, for the UI to explain rather than fail mutely */
  reason: 'ok' | 'webview_no_speech_api' | 'plugin_missing' | 'browser_unsupported';
}

/* ------------------------------------------------------------------ */
/* language                                                            */
/* ------------------------------------------------------------------ */

/** Your codebase spells Pidgin two ways. Accept both rather than break on one. */
export function normaliseLang(raw: string | null | undefined): VoiceLang {
  const l = (raw || 'en').toLowerCase();
  if (l.startsWith('fr')) return 'fr';
  if (l.startsWith('ar')) return 'ar';
  if (l.startsWith('ff') || l.startsWith('ful')) return 'ff';
  if (l.startsWith('pcm') || l.startsWith('pidgin')) return 'pcm';
  return 'en';
}

const BCP47: Record<VoiceLang, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-001',
  pcm: 'en-NG',
  ff: 'fr-FR',
};

/** true when we are listening in a language the speaker did not actually pick */
export function isApproximate(lang: VoiceLang): boolean {
  return lang === 'ff';
}

export function bcp47For(lang: VoiceLang): string {
  return BCP47[lang] || 'en-US';
}

/* ------------------------------------------------------------------ */
/* engine detection                                                    */
/* ------------------------------------------------------------------ */

const NATIVE_PLUGIN_ID = '@capacitor-community/speech-recognition';

type NativePlugin = {
  available: () => Promise<{ available: boolean }>;
  checkPermissions?: () => Promise<{ speechRecognition: string }>;
  requestPermissions?: () => Promise<{ speechRecognition: string }>;
  requestPermission?: () => Promise<void>;
  hasPermission?: () => Promise<{ permission: boolean }>;
  start: (opts: Record<string, unknown>) => Promise<{ matches?: string[] } | void>;
  stop: () => Promise<void>;
  addListener?: (ev: string, cb: (data: { matches?: string[] }) => void) => Promise<{ remove: () => void }>;
  removeAllListeners?: () => Promise<void>;
};

let nativeCache: NativePlugin | null | undefined; // undefined = not tried yet

async function loadNative(): Promise<NativePlugin | null> {
  if (nativeCache !== undefined) return nativeCache;
  if (!Capacitor.isNativePlatform()) { nativeCache = null; return null; }
  try {
    const mod = (await import(/* @vite-ignore */ NATIVE_PLUGIN_ID)) as Record<string, unknown>;
    const plugin = (mod.SpeechRecognition || mod.default) as NativePlugin | undefined;
    nativeCache = plugin && typeof plugin.start === 'function' ? plugin : null;
  } catch {
    nativeCache = null;   // plugin not installed. Web fallback, or nothing.
  }
  return nativeCache;
}

type WebRecogCtor = new () => WebRecog;
interface WebRecog {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

function webCtor(): WebRecogCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as WebRecogCtor | undefined || null;
}

/** Ask before you draw a button. Cheap, and it never lies. */
export async function detectEngine(): Promise<VoiceEngineInfo> {
  if (Capacitor.isNativePlatform()) {
    const native = await loadNative();
    if (!native) return { supported: false, engine: 'none', reason: 'plugin_missing' };
    try {
      const a = await native.available();
      if (!a?.available) return { supported: false, engine: 'none', reason: 'webview_no_speech_api' };
    } catch {
      return { supported: false, engine: 'none', reason: 'webview_no_speech_api' };
    }
    return { supported: true, engine: 'native', reason: 'ok' };
  }
  return webCtor()
    ? { supported: true, engine: 'web', reason: 'ok' }
    : { supported: false, engine: 'none', reason: 'browser_unsupported' };
}

/* ------------------------------------------------------------------ */
/* permission                                                          */
/* ------------------------------------------------------------------ */

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * The plugin has changed API twice across versions. Rather than pin one and
 * break on the next, every known shape is tried in order.
 */
export async function ensurePermission(): Promise<PermissionState> {
  if (!Capacitor.isNativePlatform()) return 'granted';   // Chrome asks by itself
  const native = await loadNative();
  if (!native) return 'denied';

  try {
    if (typeof native.checkPermissions === 'function') {
      const c = await native.checkPermissions();
      if (c?.speechRecognition === 'granted') return 'granted';
    } else if (typeof native.hasPermission === 'function') {
      const h = await native.hasPermission();
      if (h?.permission) return 'granted';
    }
  } catch { /* fall through to the request */ }

  try {
    if (typeof native.requestPermissions === 'function') {
      const r = await native.requestPermissions();
      return r?.speechRecognition === 'granted' ? 'granted' : 'denied';
    }
    if (typeof native.requestPermission === 'function') {
      await native.requestPermission();
      if (typeof native.hasPermission === 'function') {
        const h = await native.hasPermission();
        return h?.permission ? 'granted' : 'denied';
      }
      return 'granted';
    }
  } catch { return 'denied'; }

  return 'unknown';
}

/* ------------------------------------------------------------------ */
/* listening                                                           */
/* ------------------------------------------------------------------ */

export type VoiceErrorCode =
  | 'no_permission' | 'unsupported' | 'no_speech' | 'network' | 'aborted' | 'failed';

export interface ListenHandle {
  /** stop early; resolves the promise with whatever was heard so far */
  cancel: () => void;
}

export interface ListenOptions {
  lang: VoiceLang;
  /** hard stop, so a stuck recogniser can never hold the microphone open */
  timeoutMs?: number;
  onPartial?: (text: string) => void;
}

const DEFAULT_TIMEOUT = 8000;

/**
 * Listen once and resolve with what was heard.
 * Never throws. Errors come back as a rejected VoiceErrorCode so the caller
 * can say something useful in the user's own language.
 */
export function listenOnce(
  opts: ListenOptions,
  handleOut?: (h: ListenHandle) => void,
): Promise<VoiceResult> {
  const lang = opts.lang;
  const tag = bcp47For(lang);
  const approximate = isApproximate(lang);
  const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT;

  return new Promise<VoiceResult>((resolve, reject) => {
    let settled = false;
    let timer: number | undefined;
    const finish = (t: string) => {
      if (settled) return;
      settled = true;
      if (timer) window.clearTimeout(timer);
      const clean = (t || '').trim();
      if (!clean) { reject('no_speech' as VoiceErrorCode); return; }
      resolve({ transcript: clean, approximate });
    };
    const fail = (code: VoiceErrorCode) => {
      if (settled) return;
      settled = true;
      if (timer) window.clearTimeout(timer);
      reject(code);
    };

    void (async () => {
      const info = await detectEngine();
      if (!info.supported) { fail('unsupported'); return; }

      /* ---------------- native ---------------- */
      if (info.engine === 'native') {
        const native = await loadNative();
        if (!native) { fail('unsupported'); return; }

        const perm = await ensurePermission();
        if (perm !== 'granted') { fail('no_permission'); return; }

        let best = '';
        let sub: { remove: () => void } | null = null;
        try {
          if (typeof native.addListener === 'function') {
            sub = await native.addListener('partialResults', (d) => {
              const m = d?.matches?.[0];
              if (m) { best = m; opts.onPartial?.(m); }
            });
          }
        } catch { /* partials are a nicety, not a requirement */ }

        const cleanup = () => {
          try { sub?.remove(); } catch { /* ignore */ }
          try { void native.stop(); } catch { /* ignore */ }
        };

        handleOut?.({ cancel: () => { cleanup(); finish(best); } });
        timer = window.setTimeout(() => { cleanup(); finish(best); }, timeout);

        try {
          const res = await native.start({
            language: tag,
            maxResults: 3,
            prompt: '',
            partialResults: true,
            popup: false,
          });
          const m = (res as { matches?: string[] } | undefined)?.matches?.[0];
          cleanup();
          finish(m || best);
        } catch {
          cleanup();
          fail(best ? 'failed' : 'no_speech');
        }
        return;
      }

      /* ---------------- web ---------------- */
      const Ctor = webCtor();
      if (!Ctor) { fail('unsupported'); return; }
      const rec = new Ctor();
      rec.lang = tag;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 3;

      let best = '';
      rec.onresult = (e) => {
        const last = e.results[e.results.length - 1];
        const t = last?.[0]?.transcript;
        if (t) { best = t; opts.onPartial?.(t); }
      };
      rec.onerror = (e) => {
        const code = e?.error;
        if (code === 'not-allowed' || code === 'service-not-allowed') fail('no_permission');
        else if (code === 'no-speech') fail('no_speech');
        else if (code === 'network') fail('network');
        else if (code === 'aborted') fail('aborted');
        else fail('failed');
      };
      rec.onend = () => finish(best);

      handleOut?.({ cancel: () => { try { rec.stop(); } catch { /* ignore */ } } });
      timer = window.setTimeout(() => { try { rec.stop(); } catch { /* ignore */ } }, timeout);

      try { rec.start(); } catch { fail('failed'); }
    })();
  });
}
// BAMBEH_END_TOKEN__BAMBEHVOICE_FIX525__COMPLETE
