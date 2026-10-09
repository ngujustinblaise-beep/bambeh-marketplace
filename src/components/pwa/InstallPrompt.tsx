// BAMBEH_DEPLOY_TOKEN__INSTALL_PROMPT_FIX669_CLEAN
/**
 * InstallPrompt.tsx - FIX669
 * Puts Bambeh on the phone's home screen without any app store.
 *  - Android (Chrome, Edge, Samsung Internet): when the browser says Bambeh can be
 *    installed, a small bar offers "Install" - one tap, the browser's own install.
 *  - iPhone (Safari has no install button for websites): the bar explains
 *    "Share > Add to Home Screen".
 *  - Never inside the Android app, never once installed, and "Not now" rests for
 *    7 days. Browsers do not allow a site to install itself silently - one tap
 *    from the person is always required, and this makes that tap obvious.
 * Also registers the small service worker (/sw.js, FIX670) that makes the site
 * installable; it never serves an old version of the app.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/hooks/useAppLang';
import { IS_NATIVE_APP } from '@/config/storeMode'; // FIX683

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm') return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

const TEXT: Record<Lang, Record<string, string>> = {
  en: {
    title: "Put Bambeh on your home screen",
    body: "Open it in one tap, like an app. It uses little data and needs no app store.",
    install: "Install",
    later: "Not now",
    ios: "On iPhone: tap the Share button, then \"Add to Home Screen\".",
    ok: "OK",
  },
  fr: {
    title: "Ajoutez Bambeh \u00e0 votre \u00e9cran d'accueil",
    body: "Ouvrez-le d'un geste, comme une application. Il consomme peu de donn\u00e9es et ne passe par aucun store.",
    install: "Installer",
    later: "Plus tard",
    ios: "Sur iPhone : touchez le bouton Partager, puis \u00ab Sur l'\u00e9cran d'accueil \u00bb.",
    ok: "OK",
  },
  pidgin: {
    title: "Put Bambeh for your phone home screen",
    body: "Open am with one touch like app. E no dey chop plenty data and you no need app store.",
    install: "Install am",
    later: "No be now",
    ios: "For iPhone: touch the Share button, then \"Add to Home Screen\".",
    ok: "OK",
  },
  ar: {
    title: "\u0623\u0636\u0641 \u0628\u0627\u0645\u0628\u064a\u0647 \u0625\u0644\u0649 \u0634\u0627\u0634\u062a\u0643 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    body: "\u0627\u0641\u062a\u062d\u0647 \u0628\u0644\u0645\u0633\u0629 \u0648\u0627\u062d\u062f\u0629 \u0645\u062b\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642. \u064a\u0633\u062a\u0647\u0644\u0643 \u0627\u0644\u0642\u0644\u064a\u0644 \u0645\u0646 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0648\u0644\u0627 \u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u062a\u062c\u0631 \u062a\u0637\u0628\u064a\u0642\u0627\u062a.",
    install: "\u062a\u062b\u0628\u064a\u062a",
    later: "\u0644\u064a\u0633 \u0627\u0644\u0622\u0646",
    ios: "\u0639\u0644\u0649 \u0622\u064a\u0641\u0648\u0646: \u0627\u0636\u063a\u0637 \u0632\u0631 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u062b\u0645 \u00ab\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629\u00bb.",
    ok: "\u062d\u0633\u0646\u064b\u0627",
  },
  ff: {
    title: "Wa\u0257 Bambeh e yaasi telefon maa",
    body: "Uddit mo e meemol gooto wano aplikasion. \u018aum huutortaa data keew\u0257o, haajaaki store.",
    install: "Wa\u0257",
    later: "Wonaa jooni",
    ios: "E iPhone: meemu buto\u014b Share, caggal \u0257uum \"Add to Home Screen\".",
    ok: "OK",
  },
};

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SNOOZE_KEY = 'bambeh_install_snooze_until';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

function standalone(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
}
function snoozed(): boolean {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}
function snooze(): void {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* storage blocked: the bar simply comes back next visit */
  }
}

export default function InstallPrompt() {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  const [mode, setMode] = useState<'none' | 'android' | 'ios'>('none');
  const deferred = useRef<InstallEvent | null>(null);

  useEffect(() => {
    if (IS_NATIVE_APP) return undefined;
    try {
      const secure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (secure && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
      }
    } catch {
      /* no service worker support: the site still works */
    }
    if (standalone() || snoozed()) return undefined;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as InstallEvent;
      window.setTimeout(() => setMode((m) => (m === 'none' ? 'android' : m)), 8000);
    };
    const onInstalled = () => {
      deferred.current = null;
      setMode('none');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    let iosTimer = 0;
    const ua = navigator.userAgent || '';
    if (/iphone|ipad|ipod/i.test(ua)) {
      iosTimer = window.setTimeout(() => setMode((m) => (m === 'none' ? 'ios' : m)), 20000);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  if (mode === 'none') return null;

  const install = async () => {
    const ev = deferred.current;
    setMode('none');
    if (!ev) return;
    try {
      await ev.prompt();
      const choice = await ev.userChoice;
      if (choice.outcome !== 'accepted') snooze();
    } catch {
      snooze();
    }
    deferred.current = null;
  };
  const later = () => {
    snooze();
    setMode('none');
  };

  return (
    <div role="dialog" aria-live="polite" dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX669"
      className="fixed inset-x-3 z-[60] mx-auto max-w-lg rounded-2xl border border-teal-200 bg-white p-4 shadow-xl"
      style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-start gap-3">
        <img src="/icons/bambeh-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">{t.title}</p>
          <p className="mt-0.5 text-xs leading-5 text-gray-600">{mode === 'ios' ? t.ios : t.body}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={later} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
          {mode === 'ios' ? t.ok : t.later}
        </button>
        {mode === 'android' ? (
          <button type="button" onClick={() => void install()} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
            {t.install}
          </button>
        ) : null}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__INSTALL_PROMPT_FIX669__COMPLETE
