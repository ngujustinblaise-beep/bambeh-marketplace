// BAMBEH_DEPLOY_TOKEN__SERVICESROW_FIX484_CLEAN
/**
 * src/components/home/ServicesRow.tsx — Bambeh Marketplace
 *
 * FIX481 — THE FREE SERVICES, WHERE PEOPLE WILL ACTUALLY FIND THEM.
 * ─────────────────────────────────────────────────────────────────
 * Bambeh means the one who carries the heavy load in the marketplace. These
 * are the services that earn the name: nobody in Cameroon has built the thing
 * that tells you which pharmacy is open at 2am. They cost the user nothing,
 * ever.
 *
 * WHY IT SITS DIRECTLY ABOVE THE FEATURED STRIP
 *   Big's idea, and it is a good one. Someone reaching for "Pharmacies on
 *   call" has to travel past the adverts to get here, so the strip is seen on
 *   the way — passively, without anybody being made to look at it. Free
 *   services pull people back to the app; the adverts they pass on the way are
 *   what pays for it. Do not move this block below the strip.
 *
 * WHY SOME TILES ARE MARKED "SOON"
 *   Hospitals, Water/Lights and Fuel are not built yet. A tile that navigates
 *   nowhere is the same lie as a form that discards what you typed, so an
 *   unbuilt service renders as a flat, unclickable card that says SOON. When
 *   its page ships, one line here changes `to` and drops `soon`.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { Link } from 'react-router-dom';
import { Cross, Stethoscope, Droplets, Fuel, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type Tile = {
  key: string;
  to?: string;             // absent = not built yet
  icon: React.ComponentType<{ className?: string }>;
  tint: string;            // icon colour
  bg: string;              // icon bubble
};

const TILES: Tile[] = [
  { key: 'pharmacy', to: '/pharmacies', icon: Cross,       tint: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'hospital', to: '/hospitals',  icon: Stethoscope, tint: 'text-rose-600',    bg: 'bg-rose-50' },
  { key: 'utility',                     icon: Droplets,    tint: 'text-sky-600',     bg: 'bg-sky-50' },
  { key: 'fuel',                        icon: Fuel,        tint: 'text-amber-600',   bg: 'bg-amber-50' },
  { key: 'safety',                      icon: ShieldAlert, tint: 'text-red-600',     bg: 'bg-red-50' },
];

const STR: Record<string, Record<string, string>> = {
  en: {
    heading: 'Free help, any time',
    sub: 'Bambeh carries the load. These never cost anything.',
    soon: 'Soon',
    pharmacy: 'Pharmacies on call',
    hospital: 'Hospitals on duty',
    utility: 'Water / Lights',
    fuel: 'Fuel at night',
    safety: 'Safety alerts',
  },
  fr: {
    heading: 'Aide gratuite, à toute heure',
    sub: 'Bambeh porte la charge. Ces services sont toujours gratuits.',
    soon: 'Bientôt',
    pharmacy: 'Pharmacies de garde',
    hospital: 'Hôpitaux de garde',
    utility: 'Eau / Lumière',
    fuel: 'Carburant la nuit',
    safety: 'Alertes sécurité',
  },
  pidgin: {
    heading: 'Free help, any time',
    sub: 'Bambeh dey carry di load. Dis one no dey cost anything.',
    soon: 'E dey come',
    pharmacy: 'Pharmacy wey dey on call',
    hospital: 'Hospital wey dey on duty',
    utility: 'Water / Light',
    fuel: 'Fuel for night',
    safety: 'Safety alert',
  },
  ar: {
    heading: 'مساعدة مجانية، في أي وقت',
    sub: 'بامبيه يحمل الحمل. هذه الخدمات مجانية دائماً.',
    soon: 'قريباً',
    pharmacy: 'صيدليات المناوبة',
    hospital: 'مستشفيات المناوبة',
    utility: 'الماء / الكهرباء',
    fuel: 'الوقود ليلاً',
    safety: 'تنبيهات السلامة',
  },
  ff: {
    heading: 'Ballal meere, sahaa kala',
    sub: 'Bambeh ina roondoo donngal. Ɗiiɗoo ngalaa coggu.',
    soon: 'Ina ara',
    pharmacy: 'Farmasiiji e ndeenka',
    hospital: 'Opitaaluuji e ndeenka',
    utility: 'Ndiyam / Yiite',
    fuel: 'Esaas jemma',
    safety: 'Tintinooje kisal',
  },
};

const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

export default function ServicesRow() {
  const { language } = useLanguage();
  const lang = typeof language === 'string' ? language : 'en';
  const t = (k: string) => tr(lang, k);
  const isRtl = lang === 'ar';

  const card =
    'flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all';

  return (
    <section className="mb-10" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="svcHead">
      <h2 id="svcHead" className="text-2xl font-bold text-gray-900 mb-1">{t('heading')}</h2>
      <p className="text-sm text-gray-500 mb-4">{t('sub')}</p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const inner = (
            <>
              <span className={`w-11 h-11 rounded-2xl ${tile.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${tile.tint}`} />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold leading-tight">
                {t(tile.key)}
              </span>
              {!tile.to ? (
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                  {t('soon')}
                </span>
              ) : null}
            </>
          );

          // Not built yet renders as a flat, unclickable card. A tile that
          // navigates nowhere would be the same lie as a form that throws
          // away what you typed.
          return tile.to ? (
            <Link key={tile.key} to={tile.to}
              className={`${card} bg-white border-gray-100 text-gray-800 hover:border-emerald-300 hover:shadow-md active:scale-95`}>
              {inner}
            </Link>
          ) : (
            <div key={tile.key} aria-disabled="true"
              className={`${card} bg-gray-50 border-gray-100 text-gray-400 cursor-default`}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
// BAMBEH_END_TOKEN__SERVICESROW_FIX484__COMPLETE
