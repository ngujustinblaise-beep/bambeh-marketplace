// BAMBEH_DEPLOY_TOKEN__AUTH_LAYOUT_FIX765_CLEAN
/**
 * src/components/layout/AuthLayout.tsx - FIX765 (replaces the 10 Dec 2025 version)
 *
 * The frame around sign-in, the 30-second account (/join), the forgotten password and the biometric pages.
 * The 10 Dec 2025 branding stays exactly as it was: the single black "B" and "Bambeh", no teal in the frame.
 * What changed (15 Oct 2026, with the sign-up work - FIX762):
 *   - its words follow the app's five languages (it was English only: "Back to Home", "All rights reserved",
 *     "Terms", "Privacy", "Help") - Arabic reads right to left with the rest of the app;
 *   - "Terms" and "Privacy" open the pages to READ them (/terms-of-service, /privacy-policy). "/terms" opened
 *     the first-run acceptance screen instead;
 *   - on a phone, the form starts near the top: the big empty space above it (48 px) pushed the "Create my
 *     free account" button below a 360 x 740 screen;
 *   - "Home" is written next to the arrow on phones too (it was an arrow alone);
 *   - the year is this year (it said 2025).
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

interface AuthLayoutProps {
  children: ReactNode;
}

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function norm(v: unknown): Lang {
  const s = String(v || '').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

export const FRAME_TEXT: Record<Lang, { home: string; rights: string; terms: string; privacy: string; help: string }> = {
  en: { home: 'Home', rights: 'All rights reserved.', terms: 'Terms', privacy: 'Privacy', help: 'Help' },
  fr: { home: 'Accueil', rights: 'Tous droits r\u00e9serv\u00e9s.', terms: 'Conditions', privacy: 'Confidentialit\u00e9', help: 'Aide' },
  pidgin: { home: 'Home', rights: 'All rights reserved.', terms: 'Terms', privacy: 'Privacy', help: 'Help' },
  ar: { home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', rights: '\u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.', terms: '\u0627\u0644\u0634\u0631\u0648\u0637', privacy: '\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629', help: '\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629' },
  ff: { home: 'Galle', rights: 'Hakkeeji fof ina reenaa.', terms: 'Sar\u0257iiji', privacy: 'Suturo', help: 'Ballal' },
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const t = FRAME_TEXT[norm(useLang())];
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col" data-fix="FIX765">
      {/* HEADER - the single black logo (Dec 2025 branding) */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl sm:text-2xl font-bold">B</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-black tracking-tight">Bambeh</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black font-medium transition-colors" data-frame-home="1">
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t.home}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN - near the top on a phone, centred on a big screen */}
      <main className="flex-grow flex items-start sm:items-center justify-center px-4 pt-4 pb-8 sm:py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
            <p>
              &copy; {year} <span className="font-semibold text-black">Bambeh</span>. {t.rights}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/terms-of-service" className="hover:text-black transition-colors" data-frame-link="terms">{t.terms}</Link>
              <Link to="/privacy-policy" className="hover:text-black transition-colors" data-frame-link="privacy">{t.privacy}</Link>
              <Link to="/help" className="hover:text-black transition-colors" data-frame-link="help">{t.help}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
// BAMBEH_END_TOKEN__AUTH_LAYOUT_FIX765__COMPLETE
