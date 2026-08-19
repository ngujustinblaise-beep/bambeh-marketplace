// BAMBEH_DEPLOY_TOKEN__APPENHANCERS_FIX357_CLEAN
/**
 * src/components/app/AppEnhancers.tsx — Bambeh Marketplace
 * Performance & security wrappers. This is the error boundary App.tsx ACTUALLY
 * mounts: `import { AppErrorBoundary, RouteTracker, PerformanceMonitor } from
 * "@/components/app/AppEnhancers"`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  FIX357 — THE STACK TRACE EVERY CUSTOMER COULD READ.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  THE BUG. The fallback screen rendered this, unconditionally, in production:
 *
 *      <details open>            <- open BY DEFAULT, nothing to click
 *        <pre>{details}</pre>    <- name, message, FULL STACK,
 *      </details>                   FULL COMPONENT STACK
 *
 *  There was no `import.meta.env.DEV` guard — unlike RouteErrorBoundary.tsx,
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
 *  WHAT REPLACES IT — a real support reference, not a stub.
 *    The customer sees a short code like BMB-M4X2K9-A7F. THE SAME CODE is
 *    printed to the console and attached to the Sentry report, so when someone
 *    quotes it, the matching error can actually be found. A code that led
 *    nowhere would be theatre; this one is the join key.
 *
 *  ALSO FIXED
 *    · The screen now speaks all five languages, read from the same
 *      localStorage key App.tsx writes ("Bambeh_language"). A crash is exactly
 *      when a confused person most needs their own language.
 *    · PerformanceMonitor's console.log calls are now DEV-only. They were
 *      printing LCP / FID / Page Load Time into every customer's console.
 *
 *  UNCHANGED ON PURPOSE: handleReset still navigates to "/" rather than
 *  reloading on a timer. One of the dead AppErrorBoundary copies auto-reloaded
 *  after 5 seconds and reset its own error counter on remount, which would have
 *  made a persistent crash into an infinite reload loop. Nothing like that is
 *  introduced here.
 *
 *  © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics/AnalyticsInit';
import { RefreshCw, AlertTriangle, Home, Copy } from 'lucide-react';

// ─── Language, read the way App.tsx writes it ────────────────────────────────
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
    body: 'Bambeh hit an unexpected problem on this screen. Nothing you were doing has been lost — please reload and try again.',
    reload: 'Reload', home: 'Go Home',
    refLabel: 'Reference', copied: 'Copied',
    refHelp: 'If it keeps happening, send this code to support@bambeh.com and we can find exactly what broke.',
    devTitle: 'Technical details (development only)',
  },
  fr: {
    heading: "Une erreur s'est produite",
    body: "Bambeh a rencontré un problème inattendu sur cet écran. Rien de ce que vous faisiez n'est perdu — rechargez et réessayez.",
    reload: 'Recharger', home: 'Accueil',
    refLabel: 'Référence', copied: 'Copié',
    refHelp: "Si cela se reproduit, envoyez ce code à support@bambeh.com et nous trouverons exactement l'origine du problème.",
    devTitle: 'Détails techniques (développement uniquement)',
  },
  pidgin: {
    heading: 'Something no work well',
    body: 'Bambeh see problem for dis screen. Wetin you dey do no loss — abeg reload and try again.',
    reload: 'Reload', home: 'Go Home',
    refLabel: 'Reference', copied: 'E don copy',
    refHelp: 'If e continue, send dis code go support@bambeh.com make we fit find wetin spoil.',
    devTitle: 'Technical details (development only)',
  },
  ar: {
    heading: 'حدث خطأ ما',
    body: 'واجه Bambeh مشكلة غير متوقعة في هذه الشاشة. لم يُفقد شيء مما كنت تفعله — أعد التحميل وحاول مرة أخرى.',
    reload: 'إعادة التحميل', home: 'الرئيسية',
    refLabel: 'المرجع', copied: 'تم النسخ',
    refHelp: 'إذا تكرر الأمر، أرسل هذا الرمز إلى support@bambeh.com وسنجد سبب المشكلة بالضبط.',
    devTitle: 'تفاصيل تقنية (للتطوير فقط)',
  },
  ff: {
    heading: 'Huunde waylii',
    body: 'Bambeh dañii caɗeele e ndee ecran. Ko golloto-ɗaa koo majjaani — tiiɗno loowtu ndeen fuɗɗitaa.',
    reload: 'Loowtu', home: 'Hoore',
    refLabel: 'Maandeeji', copied: 'Nanngaama',
    refHelp: 'So ɗum jokkii, neldu ngal maandeeji e support@bambeh.com ndeen min njiytira ko bonni.',
    devTitle: 'Kabaruuji karallaagal (development only)',
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ info: errorInfo });

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

          {/* FIX357 — what the customer sees instead of a stack trace. */}
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

          {/* FIX357 — the full dump is DEV-ONLY now, and no longer `open`.
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
  useEffect(() => {
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
// BAMBEH_END_TOKEN__APPENHANCERS_FIX357__COMPLETE
