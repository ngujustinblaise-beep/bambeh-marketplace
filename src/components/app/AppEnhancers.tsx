// BAMBEH_DEPLOY_TOKEN__APPENHANCERS_FIX960_CLEAN
/**
 * src/components/app/AppEnhancers.tsx \u2014 Bambeh Marketplace
 *
 * FIX960 (Package 15, Big 1 Nov 2026: "the app keeps failing to open"). The screen his wife's phone showed was this
 * boundary catching a page that could not be DOWNLOADED on a weak line - shown as "Something went wrong" with a
 * support code, as if Bambeh had broken. Now:
 *   - a download failure (after FIX957 has already retried) shows "Weak or no connection" in the five languages, with
 *     Try again, and tries again by itself the moment the phone comes back online. No support code: nothing broke.
 *   - every other error is shown exactly as before (FIX357).
 *   - RouteTracker tells the service worker (FIX959) which screen is open, for the data-saving switch (FIX958), and a
 *     few seconds after the app opens asks it to save this release on the phone, so the next opening works on any line.
 * Performance & security wrappers. This is the error boundary App.tsx ACTUALLY
 * mounts: `import { AppErrorBoundary, RouteTracker, PerformanceMonitor } from
 * "@/components/app/AppEnhancers"`.
 *
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 *  FIX357 \u2014 THE STACK TRACE EVERY CUSTOMER COULD READ.
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 *
 *  THE BUG. The fallback screen rendered this, unconditionally, in production:
 *
 *      <details open>            <- open BY DEFAULT, nothing to click
 *        <pre>{details}</pre>    <- name, message, FULL STACK,
 *      </details>                   FULL COMPONENT STACK
 *
 *  There was no `import.meta.env.DEV` guard \u2014 unlike RouteErrorBoundary.tsx,
 *  which gets this right. So any customer who hit any crash was shown Bambeh's
 *  internal file paths, function names and component tree, already expanded.
 *  The comment above it said "TEMPORARY DIAGNOSTIC ... Remove later." It was
 *  never removed. This is that removal.
 *
 *  WHY IT MATTERS BEYOND EMBARRASSMENT: stack traces name your source files and
 *  internal structure. That is free reconnaissance for anyone probing the app,
 *  and Google Play and the App Store both treat leaked diagnostics as a quality
 *  defect at review.
 *
 *  WHAT REPLACES IT \u2014 a real support reference, not a stub.
 *    The customer sees a short code like BMB-M4X2K9-A7F. THE SAME CODE is
 *    printed to the console and attached to the Sentry report, so when someone
 *    quotes it, the matching error can actually be found. A code that led
 *    nowhere would be theatre; this one is the join key.
 *
 *  ALSO FIXED
 *    \u00b7 The screen now speaks all five languages, read from the same
 *      localStorage key App.tsx writes ("Bambeh_language"). A crash is exactly
 *      when a confused person most needs their own language.
 *    \u00b7 PerformanceMonitor's console.log calls are now DEV-only. They were
 *      printing LCP / FID / Page Load Time into every customer's console.
 *
 *  UNCHANGED ON PURPOSE: handleReset still navigates to "/" rather than
 *  reloading on a timer. One of the dead AppErrorBoundary copies auto-reloaded
 *  after 5 seconds and reset its own error counter on remount, which would have
 *  made a persistent crash into an infinite reload loop. Nothing like that is
 *  introduced here.
 *
 *  \u00a9 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics/AnalyticsInit';
import { RefreshCw, AlertTriangle, Home, Copy, WifiOff } from 'lucide-react';
import { isNetworkError } from '@/lib/lazyRetry';   // FIX960 - a page that could not be downloaded is not a crash
import { postToWorker } from '@/lib/liteMode';      // FIX960 - the screen, for the data-saving switch

// \u2500\u2500\u2500 Language, read the way App.tsx writes it \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// App.tsx: const LANG_KEY = "Bambeh_language", storing "en"|"fr"|"pidgin"|"ar"|"ff".
// Wrapped in try/catch because this runs while the app is already broken.
type BoundaryLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

function readLang(): BoundaryLang {
  try {
    const raw = window.localStorage.getItem('Bambeh_language');
    if (raw === 'pcm' || raw === 'pidgin_english') return 'pidgin';
    if (raw === 'ful' || raw === 'fulfulde') return 'ff';
    if (raw === 'en' || raw === 'fr' || raw === 'pidgin' || raw === 'ar' || raw === 'ff') return raw;
  } catch {
    /* storage blocked or unavailable */
  }
  return 'en';
}

const T: Record<BoundaryLang, {
  heading: string; body: string; reload: string; home: string;
  refLabel: string; refHelp: string; copied: string; devTitle: string;
}> = {
  en: {
    heading: 'Something went wrong',
    body: 'Bambeh hit an unexpected problem on this screen. Nothing you were doing has been lost \u2014 please reload and try again.',
    reload: 'Reload', home: 'Go Home',
    refLabel: 'Reference', copied: 'Copied',
    refHelp: 'If it keeps happening, send this code to support@bambeh.com and we can find exactly what broke.',
    devTitle: 'Technical details (development only)',
  },
  fr: {
    heading: "Une erreur s'est produite",
    body: "Bambeh a rencontr\u00e9 un probl\u00e8me inattendu sur cet \u00e9cran. Rien de ce que vous faisiez n'est perdu \u2014 rechargez et r\u00e9essayez.",
    reload: 'Recharger', home: 'Accueil',
    refLabel: 'R\u00e9f\u00e9rence', copied: 'Copi\u00e9',
    refHelp: "Si cela se reproduit, envoyez ce code \u00e0 support@bambeh.com et nous trouverons exactement l'origine du probl\u00e8me.",
    devTitle: 'D\u00e9tails techniques (d\u00e9veloppement uniquement)',
  },
  pidgin: {
    heading: 'Something no work well',
    body: 'Bambeh see problem for dis screen. Wetin you dey do no loss \u2014 abeg reload and try again.',
    reload: 'Reload', home: 'Go Home',
    refLabel: 'Reference', copied: 'E don copy',
    refHelp: 'If e continue, send dis code go support@bambeh.com make we fit find wetin spoil.',
    devTitle: 'Technical details (development only)',
  },
  ar: {
    heading: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627',
    body: '\u0648\u0627\u062c\u0647 Bambeh \u0645\u0634\u0643\u0644\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639\u0629 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0634\u0627\u0634\u0629. \u0644\u0645 \u064a\u064f\u0641\u0642\u062f \u0634\u064a\u0621 \u0645\u0645\u0627 \u0643\u0646\u062a \u062a\u0641\u0639\u0644\u0647 \u2014 \u0623\u0639\u062f \u0627\u0644\u062a\u062d\u0645\u064a\u0644 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    reload: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u062d\u0645\u064a\u0644', home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
    refLabel: '\u0627\u0644\u0645\u0631\u062c\u0639', copied: '\u062a\u0645 \u0627\u0644\u0646\u0633\u062e',
    refHelp: '\u0625\u0630\u0627 \u062a\u0643\u0631\u0631 \u0627\u0644\u0623\u0645\u0631\u060c \u0623\u0631\u0633\u0644 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0625\u0644\u0649 support@bambeh.com \u0648\u0633\u0646\u062c\u062f \u0633\u0628\u0628 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0628\u0627\u0644\u0636\u0628\u0637.',
    devTitle: '\u062a\u0641\u0627\u0635\u064a\u0644 \u062a\u0642\u0646\u064a\u0629 (\u0644\u0644\u062a\u0637\u0648\u064a\u0631 \u0641\u0642\u0637)',
  },
  ff: {
    heading: 'Huunde waylii',
    body: 'Bambeh da\u00f1ii ca\u0257eele e ndee ecran. Ko golloto-\u0257aa koo majjaani \u2014 tii\u0257no loowtu ndeen fu\u0257\u0257itaa.',
    reload: 'Loowtu', home: 'Hoore',
    refLabel: 'Maandeeji', copied: 'Nanngaama',
    refHelp: 'So \u0257um jokkii, neldu ngal maandeeji e support@bambeh.com ndeen min njiytira ko bonni.',
    devTitle: 'Kabaruuji karallaagal (development only)',
  },
};

// FIX960 - the screen for a page that could not be downloaded (weak or no connection).
const NET: Record<BoundaryLang, { heading: string; body: string; again: string; auto: string }> = {
  en: {
    heading: 'Weak or no connection',
    body: 'Bambeh could not download this screen: your connection is weak or off. Nothing you were doing is lost.',
    again: 'Try again',
    auto: 'Bambeh tries again by itself as soon as your connection comes back.',
  },
  fr: {
    heading: 'Connexion faible ou absente',
    body: "Bambeh n'a pas pu t\u00e9l\u00e9charger cet \u00e9cran : votre connexion est faible ou coup\u00e9e. Rien de ce que vous faisiez n'est perdu.",
    again: 'R\u00e9essayer',
    auto: 'Bambeh r\u00e9essaie tout seul d\u00e8s que la connexion revient.',
  },
  pidgin: {
    heading: 'Network weak or e no dey',
    body: 'Bambeh no fit download dis screen: your network weak or e don cut. Wetin you dey do no loss.',
    again: 'Try again',
    auto: 'Bambeh go try again by imself as network come back.',
  },
  ar: {
    heading: '\u0627\u062a\u0635\u0627\u0644 \u0636\u0639\u064a\u0641 \u0623\u0648 \u0645\u0646\u0642\u0637\u0639',
    body: '\u0644\u0645 \u064a\u062a\u0645\u0643\u0646 Bambeh \u0645\u0646 \u062a\u0646\u0632\u064a\u0644 \u0647\u0630\u0647 \u0627\u0644\u0634\u0627\u0634\u0629: \u0627\u062a\u0635\u0627\u0644\u0643 \u0636\u0639\u064a\u0641 \u0623\u0648 \u0645\u0646\u0642\u0637\u0639. \u0644\u0645 \u064a\u0636\u0639 \u0634\u064a\u0621 \u0645\u0645\u0627 \u0643\u0646\u062a \u062a\u0641\u0639\u0644\u0647.',
    again: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
    auto: '\u064a\u0639\u064a\u062f Bambeh \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627 \u0628\u0645\u062c\u0631\u062f \u0639\u0648\u062f\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644.',
  },
  ff: {
    heading: 'Ce\u014bol ngol fooyi walla alaa',
    body: 'Bambeh waawaani aawtaade ndee ecran: ce\u014bol maa fooyi walla ta\u01b4ii. Ko golloto-\u0257aa koo majjaani.',
    again: 'Fu\u0257\u0257itu',
    auto: 'Bambeh fu\u0257\u0257ittoto e hoore mum so ce\u014bol ruttiima.',
  },
};

/**
 * A short, human-quotable reference. Built from the clock plus a little
 * randomness so two crashes in the same second do not collide. The SAME string
 * is logged and sent to Sentry, so it is a real join key, not decoration.
 */
function makeReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const salt = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  return `BMB-${stamp}-${salt}`;
}

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
  reference: string;
  copied: boolean;
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, info: null, reference: '', copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, reference: makeReference() };
  }

  // FIX960 - back online after a download failure: open the screen again, by itself
  private onOnline = () => { window.location.reload(); };

  componentWillUnmount() {
    try { window.removeEventListener('online', this.onOnline); } catch { /* ignore */ }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ info: errorInfo });

    // FIX960 - a page that could not be downloaded is the connection, not a bug: no report, no support code - and
    // when the line comes back, the screen opens again by itself
    if (isNetworkError(error)) {
      console.warn('[AppErrorBoundary] a screen could not be downloaded (weak or no connection)', error);
      try {
        window.removeEventListener('online', this.onOnline);
        window.addEventListener('online', this.onOnline);
      } catch { /* ignore */ }
      return;
    }

    // The reference the customer can see, printed beside the full detail they
    // cannot. This is what makes the code on screen worth quoting.
    const ref = this.state.reference || makeReference();
    console.error(`[AppErrorBoundary] ${ref}`, error, errorInfo);

    try {
      import('@sentry/react')
        .then(({ captureException }) => {
          captureException(error, { tags: { bambehRef: ref }, extra: { errorInfo } });
        })
        .catch(() => { /* Sentry not installed - console already has it */ });
    } catch { /* dynamic import unsupported */ }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null, reference: '', copied: false });
    window.location.href = '/';
  };

  handleCopy = () => {
    try {
      void navigator.clipboard.writeText(this.state.reference);
      this.setState({ copied: true });
    } catch { /* clipboard blocked - the code is on screen to read out */ }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = T[readLang()];
    const e = this.state.error;

    if (isNetworkError(e)) {
      const n = NET[readLang()];
      return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 flex items-center justify-center p-4" data-net-error="1">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-amber-100 rounded-full p-5">
                <WifiOff className="w-12 h-12 text-amber-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{n.heading}</h1>
            <p className="text-gray-600 mb-6">{n.body}</p>
            <button
              onClick={() => window.location.reload()}
              data-net-retry="1"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold">
              <RefreshCw className="w-5 h-5" />{n.again}
            </button>
            <p className="text-xs text-gray-500 mt-4">{n.auto}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-6">
              <AlertTriangle className="w-16 h-16 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">{t.heading}</h1>
          <p className="text-gray-600 text-center mb-8">{t.body}</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
              <RefreshCw className="w-5 h-5" />{t.reload}
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
              <Home className="w-5 h-5" />{t.home}
            </button>
          </div>

          {/* FIX357 - what the customer sees instead of a stack trace. */}
          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{t.refLabel}</p>
                <p className="font-mono text-sm text-gray-900 break-all">{this.state.reference}</p>
              </div>
              <button
                onClick={this.handleCopy}
                className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-medium flex-shrink-0">
                <Copy className="w-3.5 h-3.5" />
                {this.state.copied ? t.copied : t.refLabel}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 leading-snug">{t.refHelp}</p>
          </div>

          {/* FIX357 - the full dump is DEV-ONLY now, and no longer `open`.
              In a production build this whole block is compiled away. */}
          {import.meta.env.DEV && e && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-gray-500 cursor-pointer">{t.devTitle}</summary>
              <pre className="mt-2 text-xs bg-gray-50 rounded-lg p-3 overflow-auto text-red-700 border border-red-100 max-h-72 whitespace-pre-wrap">
                {[
                  `${e.name || 'Error'}: ${e.message || '(no message)'}`,
                  '',
                  'STACK:',
                  e.stack || '(no stack)',
                  '',
                  'COMPONENT STACK:',
                  this.state.info?.componentStack || '(none)',
                ].join('\n')}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export const RouteTracker: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();

  // FIX960 - a few seconds after the app opens, ask the service worker (FIX959) to keep this release on the phone:
  // by then its files are already downloaded, so nothing is downloaded twice.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const sw = navigator.serviceWorker;
        if (!sw) return;
        // the screens this visit has already downloaded (Home, usually), from the browser's own list
        let files: string[] = [];
        try {
          const here = window.location.origin + '/assets/';
          files = performance.getEntriesByType('resource')
            .map((e) => e.name)
            .filter((n) => n.indexOf(here) === 0)
            .map((n) => n.slice(window.location.origin.length).split('?')[0]);
        } catch { /* no list: the worker saves the release's own files */ }
        void sw.ready.then((reg) => {
          try { reg.active?.postMessage({ type: 'bambeh-save-shell', files }); } catch { /* ignore */ }
        }).catch(() => { /* no service worker here */ });
      } catch { /* no service worker here (the Android app) */ }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    postToWorker(location.pathname);   // FIX960 - the data-saving switch needs the open screen
    trackPageView(location.pathname + location.search);
    const routeTitles: Record<string, string> = {
      '/': 'Bambeh - Online Marketplace',
      '/marketplace': 'Shop Products - Bambeh',
      '/jobs': 'Find Jobs - Bambeh',
      '/services': 'Professional Services - Bambeh',
      '/rentals': 'Property Rentals - Bambeh',
      '/vehicles': 'Vehicles for Sale - Bambeh',
    };
    document.title = routeTitles[location.pathname] || 'Bambeh Marketplace';
  }, [location]);
  return <>{children}</>;
};

export const PerformanceMonitor: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    // FIX357 - these used to print into every customer's console in production.
    // The measurement still runs in development, where it is actually read.
    if (!import.meta.env.DEV) return;

    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', Math.round(entry.startTime), 'ms');
            }
            if (entry.entryType === 'first-input') {
              const fi = entry as PerformanceEventTiming;
              console.log('FID:', Math.round(fi.processingStart - fi.startTime), 'ms');
            }
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch { /* entry types unsupported in this browser */ }
    }

    const logPageLoadTime = () => {
      try {
        const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (!navEntry) return;
        if (navEntry.loadEventEnd > 0) {
          console.log('Page Load Time:', Math.round(navEntry.loadEventEnd - navEntry.startTime), 'ms');
        } else {
          console.log('Page Load Time (approx):', Math.round(performance.now()), 'ms');
        }
      } catch { /* navigation timing unavailable */ }
    };

    if (document.readyState === 'complete') setTimeout(logPageLoadTime, 0);
    else window.addEventListener('load', () => setTimeout(logPageLoadTime, 0), { once: true });
  }, []);

  return <>{children}</>;
};

export default { AppErrorBoundary, RouteTracker, PerformanceMonitor };
// BAMBEH_END_TOKEN__APPENHANCERS_FIX960__COMPLETE
