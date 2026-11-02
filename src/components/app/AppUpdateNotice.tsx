// BAMBEH_DEPLOY_TOKEN__APPUPDATENOTICE_FIX978_CLEAN
/**
 * src/components/app/AppUpdateNotice.tsx - FIX978 (Package 18, Big 2 Nov 2026)
 *
 * The small bar at the top of the Android app that says "A newer Bambeh app is ready" - rare on purpose.
 * Since Package 18 the app updates its screens by itself (FIX977); a new APK is needed only when Bambeh changes the
 * app's native part. This bar appears only:
 *   - inside the Android app (never on the website), and
 *   - when app.bambeh.com/download/ offers a newer APK than this phone's, or the newest screens need a newer APK.
 * "Get it" opens app.bambeh.com/download/ in the phone's browser (the steps are there, in five languages).
 * "Later" hides it for 3 days - except when the screens can no longer update without the new APK.
 * Five languages; Arabic right to left.
 *
 * AppVersionLine (the phone menu, under Save data - Header.tsx, FIX981): inside the Android app only, the app's
 * version and the build it runs, and whether it is up to date, a newer one is on its way, or one is ready for the
 * next start - with "Check now". How an agent or Big sees that a phone took the latest package.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { Download } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { useAppUpdate, apkLater, apkLaterActive, openDownloadPage, checkNow } from '@/lib/appUpdate';

const W: Record<string, { title: string; ready: string; needed: string; keep: string; get: string; later: string; mb: string }> = {
  en: {
    title: 'A newer Bambeh app is ready',
    ready: 'Version {v}',
    needed: 'This app needs it to keep getting the latest Bambeh.',
    keep: 'Your account and your adverts stay as they are.',
    get: 'Get it', later: 'Later', mb: 'MB',
  },
  fr: {
    title: "Une nouvelle version de l'application Bambeh est pr\u00eate",
    ready: 'Version {v}',
    needed: "Cette application en a besoin pour continuer \u00e0 recevoir les nouveaut\u00e9s.",
    keep: 'Votre compte et vos annonces restent tels quels.',
    get: "L'obtenir", later: 'Plus tard', mb: 'Mo',
  },
  pidgin: {
    title: 'New Bambeh app don ready',
    ready: 'Version {v}',
    needed: 'Dis app need am make e continue to get di latest Bambeh.',
    keep: 'Your account and your adverts go stay as dem dey.',
    get: 'Get am', later: 'Later', mb: 'MB',
  },
  ar: {
    title: '\u0625\u0635\u062f\u0627\u0631 \u0623\u062d\u062f\u062b \u0645\u0646 \u062a\u0637\u0628\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u062c\u0627\u0647\u0632',
    ready: '\u0627\u0644\u0625\u0635\u062f\u0627\u0631 {v}',
    needed: '\u064a\u062d\u062a\u0627\u062c\u0647 \u0647\u0630\u0627 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0644\u064a\u0648\u0627\u0635\u0644 \u0627\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u062d\u062f\u062b \u0645\u0627 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647.',
    keep: '\u064a\u0628\u0642\u0649 \u062d\u0633\u0627\u0628\u0643 \u0648\u0625\u0639\u0644\u0627\u0646\u0627\u062a\u0643 \u0643\u0645\u0627 \u0647\u064a.',
    get: '\u0627\u062d\u0635\u0644 \u0639\u0644\u064a\u0647', later: '\u0644\u0627\u062d\u0642\u064b\u0627', mb: '\u0645\u064a\u063a\u0627\u0628\u0627\u064a\u062a',
  },
  ff: {
    title: 'Aplikaasiyo\u014b Bambeh keso ina woodi',
    ready: 'Versiyo\u014b {v}',
    needed: 'Ndee aplikaasiyo\u014b ina sokli mo ngam jokkude he\u0253de kesi\u0257i.',
    keep: 'Konte maa e anonsuuji maa ina keddoo no ngonnoo.',
    get: 'He\u0253 \u0257um', later: '\u0181aawo', mb: 'MB',
  },
};

export default function AppUpdateNotice() {
  const s = useAppUpdate();
  const lang = String(useLang() || 'en');
  if (!s.isApp || !(s.apkNewer || s.nativeTooOld)) return null;
  if (!s.nativeTooOld && s.apk && apkLaterActive(s.apk.version_code)) return null;
  const w = W[lang] || W.en;
  const rtl = lang === 'ar';
  const size = s.apk && s.apk.size > 0 ? ' \u00b7 ' + (s.apk.size / 1048576).toFixed(1) + ' ' + w.mb : '';
  const version = s.apk && s.apk.version_name ? w.ready.replace('{v}', s.apk.version_name) + size : '';
  return (
    <div
      data-app-update-notice={s.nativeTooOld ? 'needed' : 'ready'}
      dir={rtl ? 'rtl' : 'ltr'}
      role="status"
      className="bg-teal-50 border-b border-teal-200 text-teal-950 px-4 py-3"
    >
      <div className="container mx-auto flex items-start gap-3">
        <div className="shrink-0 mt-0.5 rounded-full bg-teal-600 text-white p-1.5">
          <Download className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{w.title}</p>
          {version ? <p className="text-xs text-teal-800 mt-0.5" data-app-update-version="1">{version}</p> : null}
          <p className="text-xs text-teal-800 mt-0.5">{s.nativeTooOld ? w.needed : w.keep}</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              data-app-update-get="1"
              onClick={() => openDownloadPage()}
              className="rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2"
              style={{ minHeight: 40 }}
            >
              {w.get}
            </button>
            {!s.nativeTooOld && s.apk ? (
              <button
                type="button"
                data-app-update-later="1"
                onClick={() => { if (s.apk) apkLater(s.apk.version_code); }}
                className="rounded-lg text-teal-800 hover:bg-teal-100 text-sm font-medium px-3 py-2"
                style={{ minHeight: 40 }}
              >
                {w.later}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const V: Record<string, { app: string; current: string; checked: string; never: string; waiting: string; coming: string; checking: string; check: string; tag: string }> = {
  en: {
    app: 'Bambeh app', current: 'Up to date', checked: 'checked at {t}', never: 'Not checked yet',
    waiting: 'A newer version is ready: it is used the next time Bambeh opens.',
    coming: 'A newer version is on its way.', checking: 'Looking for a newer version...', check: 'Check now', tag: 'en-GB',
  },
  fr: {
    app: 'Application Bambeh', current: '\u00c0 jour', checked: 'v\u00e9rifi\u00e9 \u00e0 {t}', never: 'Pas encore v\u00e9rifi\u00e9',
    waiting: 'Une version plus r\u00e9cente est pr\u00eate\u00a0: elle sera utilis\u00e9e \u00e0 la prochaine ouverture de Bambeh.',
    coming: 'Une version plus r\u00e9cente arrive.', checking: "Recherche d'une version plus r\u00e9cente...", check: 'V\u00e9rifier', tag: 'fr-FR',
  },
  pidgin: {
    app: 'Bambeh app', current: 'E dey up to date', checked: 'checked {t}', never: 'E never check yet',
    waiting: 'New version don ready: e go start di next time wey you open Bambeh.',
    coming: 'New version dey come.', checking: 'E dey find new version...', check: 'Check now', tag: 'en-GB',
  },
  ar: {
    app: '\u062a\u0637\u0628\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647', current: '\u0645\u062d\u062f\u064e\u0651\u062b', checked: '\u0622\u062e\u0631 \u0641\u062d\u0635 {t}', never: '\u0644\u0645 \u064a\u064f\u0641\u062d\u0635 \u0628\u0639\u062f',
    waiting: '\u0625\u0635\u062f\u0627\u0631 \u0623\u062d\u062f\u062b \u062c\u0627\u0647\u0632: \u0633\u064a\u064f\u0633\u062a\u062e\u062f\u0645 \u0641\u064a \u0627\u0644\u0645\u0631\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0627\u0644\u062a\u064a \u062a\u0641\u062a\u062d \u0641\u064a\u0647\u0627 \u0628\u0627\u0645\u0628\u064a\u0647.',
    coming: '\u0625\u0635\u062f\u0627\u0631 \u0623\u062d\u062f\u062b \u0641\u064a \u0627\u0644\u0637\u0631\u064a\u0642.', checking: '\u062c\u0627\u0631\u064d \u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0625\u0635\u062f\u0627\u0631 \u0623\u062d\u062f\u062b...', check: '\u0627\u0641\u062d\u0635 \u0627\u0644\u0622\u0646', tag: 'ar',
  },
  ff: {
    app: 'Aplikaasiyo\u014b Bambeh', current: 'Ina hes\u0257itinaa', checked: '\u01b4eewaa {t}', never: '\u01b3eewaaka tawo',
    waiting: 'Versiyo\u014b keso ina he\u0253ii: ina huutoree so a udditii Bambeh kadi.',
    coming: 'Versiyo\u014b keso ina ara.', checking: 'Ina yiyloo versiyo\u014b keso...', check: '\u01b3eew jooni', tag: 'fr-FR',
  },
};

/** The phone menu's version line (Header.tsx). Nothing on the website. */
export function AppVersionLine() {
  const s = useAppUpdate();
  const lang = String(useLang() || 'en');
  if (!s.isApp) return null;
  const w = V[lang] || V.en;
  let when = '';
  if (s.checkedAt > 0) {
    try { when = new Date(s.checkedAt).toLocaleTimeString(w.tag, { hour: '2-digit', minute: '2-digit' }); } catch { when = ''; }
  }
  let status = s.checkedAt > 0 ? w.current + ' (' + w.checked.replace('{t}', when) + ')' : w.never;
  if (s.checking) status = w.checking;
  else if (s.waiting && s.waiting !== s.own) status = w.waiting;
  else if (s.latest && s.own && s.latest !== s.own) status = w.coming;
  const build = s.own ? ' \u00b7 ' + s.own.slice(0, 8) : '';
  return (
    <div data-app-version="1" dir={lang === 'ar' ? 'rtl' : 'ltr'} className="px-4 py-2 text-xs text-teal-100 flex items-start gap-3">
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-white" data-app-version-name="1">{w.app + ' ' + (s.nativeVersion || '?') + build}</span>
        <span className="block" data-app-version-status="1">{status}</span>
      </span>
      {s.updater ? (
        <button
          type="button"
          data-app-version-check="1"
          disabled={s.checking}
          onClick={() => { void checkNow(true); }}
          className="shrink-0 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white"
          style={{ minHeight: 32 }}
        >
          {w.check}
        </button>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__APPUPDATENOTICE_FIX978__COMPLETE
