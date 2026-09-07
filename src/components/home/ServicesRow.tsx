// BAMBEH_DEPLOY_TOKEN__SERVICESROW_FIX507_CLEAN
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
 *   All five are live: Pharmacies FIX480, Hospitals FIX484, Water/Lights
 *   FIX500-501, Fuel at night FIX506, Safety alerts FIX507. The SOON
 *   branch below stays - the next service will need it. A tile that navigates
 *   nowhere is the same lie as a form that discards what you typed, so an
 *   unbuilt service renders as a flat, unclickable card that says SOON. When
 *   its page ships, one line here changes `to` and drops `soon`.
 *
 * FIX502 — THE SIGNAL, ON THE TILE.
 *   An announcement used to publish in silence and wait for somebody to
 *   wander onto the page. Now the Water/Lights tile carries a count of what is
 *   live for the town the user last chose, and a dot when something has
 *   appeared since they last opened the page.
 *
 *   NOT a push notification, deliberately. A cut in Bastos means nothing to
 *   somebody in Douala, and most accounts carry no reliable location. Sending
 *   all of them would teach people to ignore Bambeh notifications, and that
 *   lesson cannot be untaught. Everyone passes this row on the way into the
 *   app; a number here reaches them without spending that channel.
 *
 *   THE COUNT NEVER BLOCKS THE PAGE. If the query fails, nothing renders and
 *   Home is unaffected. A missing badge costs nothing; a broken Home costs
 *   everything.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cross, Stethoscope, Droplets, Fuel, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';   // FIX502

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
  { key: 'utility',  to: '/water-lights', icon: Droplets,    tint: 'text-sky-600',     bg: 'bg-sky-50' }, // FIX501 live
  { key: 'fuel',     to: '/fuel',       icon: Fuel,        tint: 'text-amber-600',   bg: 'bg-amber-50' }, // FIX506 live
  { key: 'safety',   to: '/safety',     icon: ShieldAlert, tint: 'text-red-600',     bg: 'bg-red-50' }, // FIX507 live
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

// Written by the Water/Lights page itself; read here. Same keys both sides.
const TOWN_KEY = 'bambeh:utility:town';
const SEEN_KEY = 'bambeh:utility:seen';
const FUEL_TOWN_KEY = 'bambeh:fuel:town';
const SAFETY_TOWN_KEY = 'bambeh:safety:town';

function useUtilitySignal() {
  const [count, setCount] = useState(0);
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let town: string | null = null;
        let seen: string | null = null;
        try {
          town = window.localStorage.getItem(TOWN_KEY);
          seen = window.localStorage.getItem(SEEN_KEY);
        } catch { /* private mode - treat as no preference */ }

        const { data, error } = await supabase.rpc('utility_signal', { p_town: town || null });
        if (error || !alive) return;
        const r = (Array.isArray(data) ? data[0] : data) as
          { announcements: number; reports: number; newest: string | null } | undefined;
        if (!r) return;

        const n = Number(r.announcements ?? 0) + Number(r.reports ?? 0);
        setCount(Number.isFinite(n) ? n : 0);
        setFresh(Boolean(r.newest) && (!seen || new Date(r.newest as string) > new Date(seen)));
      } catch {
        /* silent on purpose - a badge must never break Home */
      }
    })();
    return () => { alive = false; };
  }, []);

  return { count, fresh };
}

/** FIX506 - how many stations are open RIGHT NOW in the town this person last
 *  chose. That is the only fuel number worth a badge: a count of stations that
 *  exist tells you nothing at 1am, a count of stations you can drive to does. */
function useFuelSignal() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let ftown: string | null = null;
        try { ftown = window.localStorage.getItem(FUEL_TOWN_KEY); } catch { /* private mode */ }
        const { data, error } = await supabase.rpc('fuel_open_now', {
          p_town: ftown || null, p_fuel: null,
        });
        if (error || !alive || !Array.isArray(data)) return;
        setCount((data as Array<{ open_now: boolean }>).filter((r) => r.open_now).length);
      } catch {
        /* silent - a badge must never break Home */
      }
    })();
    return () => { alive = false; };
  }, []);
  return count;
}

/** FIX507 - how many incidents are UNSAFE right now in the town this person
 *  last chose. The one badge on this row that means danger rather than
 *  availability, so it must never linger: safety_active only returns
 *  incidents that have not expired. */
function useSafetySignal() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let stown: string | null = null;
        try { stown = window.localStorage.getItem(SAFETY_TOWN_KEY); } catch { /* private mode */ }
        const { data, error } = await supabase.rpc('safety_active', { p_town: stown || null });
        if (error || !alive || !Array.isArray(data)) return;
        setCount((data as Array<{ is_unsafe: boolean }>).filter((r) => r.is_unsafe).length);
      } catch {
        /* silent - a badge must never break Home */
      }
    })();
    return () => { alive = false; };
  }, []);
  return count;
}

export default function ServicesRow() {
  const { count: utilityCount, fresh: utilityFresh } = useUtilitySignal();   // FIX502
  const fuelOpenCount = useFuelSignal();                                    // FIX506
  const safetyCount = useSafetySignal();                                    // FIX507
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
          const badge = tile.key === 'utility' ? utilityCount
            : tile.key === 'fuel' ? fuelOpenCount
            : tile.key === 'safety' ? safetyCount : 0;               // FIX502 / 506 / 507
          const isFresh = tile.key === 'utility' && utilityFresh;

          const inner = (
            <>
              <span className={`relative w-11 h-11 rounded-2xl ${tile.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${tile.tint}`} />
                {badge > 0 ? (
                  <span
                    aria-label={`${badge} active`}
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    {badge > 99 ? '99+' : badge}
                  </span>
                ) : isFresh ? (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                ) : null}
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
// BAMBEH_END_TOKEN__SERVICESROW_FIX507__COMPLETE
