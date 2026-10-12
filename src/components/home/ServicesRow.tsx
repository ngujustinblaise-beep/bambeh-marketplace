// BAMBEH_DEPLOY_TOKEN__SERVICESROW_FIX728_CLEAN
/**
 * src/components/home/ServicesRow.tsx \u2014 Bambeh Marketplace
 *
 * FIX481 \u2014 THE FREE SERVICES, WHERE PEOPLE WILL ACTUALLY FIND THEM.
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * Bambeh means the one who carries the heavy load in the marketplace. These
 * are the services that earn the name: nobody in Cameroon has built the thing
 * that tells you which pharmacy is open at 2am. They cost the user nothing,
 * ever.
 *
 * WHY IT SITS DIRECTLY ABOVE THE FEATURED STRIP
 *   Big's idea, and it is a good one. Someone reaching for "Pharmacies on
 *   call" has to travel past the adverts to get here, so the strip is seen on
 *   the way \u2014 passively, without anybody being made to look at it. Free
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
 * FIX502 \u2014 THE SIGNAL, ON THE TILE.
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
 * FIX728 \u2014 WOMEN'S HEALTH JOINS THE FREE ROW, AND THE SAFETY BUTTON SITS UNDER IT.
 *   Big, 11 Oct 2026: Women's health belongs with the free services, not among
 *   the commercial tiles. Six tiles now: three per row on a phone, one row of
 *   six on a computer. Under them, a red bar opens the Safety button
 *   (/safety-button, FIX733): one tap sends an SMS with her location to the
 *   people she trusts, and the police (117) and gendarmerie (113) are one tap
 *   away. It needs no account and stores nothing on Bambeh.
 *   The free pages need a free account; a first-time phone reads them for a day
 *   as a guest (FIX730).
 *   The row now finds its words whichever way the app spells the language
 *   (pidgin or pcm, ff or ful) - before, a 'pcm' phone got English here.
 *
 * \u00a9 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';   // FIX728: no global React needed
import { Link } from 'react-router-dom';
import { Cross, Stethoscope, Droplets, Fuel, ShieldAlert, HeartPulse, Siren, ChevronRight } from 'lucide-react'; // FIX728: HeartPulse, Siren, ChevronRight
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';   // FIX502

type Tile = {
  key: string;
  to?: string;             // absent = not built yet
  icon: ComponentType<{ className?: string }>;
  tint: string;            // icon colour
  bg: string;              // icon bubble
};

const TILES: Tile[] = [
  { key: 'pharmacy', to: '/pharmacies', icon: Cross,       tint: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'hospital', to: '/hospitals',  icon: Stethoscope, tint: 'text-rose-600',    bg: 'bg-rose-50' },
  { key: 'utility',  to: '/water-lights', icon: Droplets,    tint: 'text-sky-600',     bg: 'bg-sky-50' }, // FIX501 live
  { key: 'fuel',     to: '/fuel',       icon: Fuel,        tint: 'text-amber-600',   bg: 'bg-amber-50' }, // FIX506 live
  { key: 'safety',   to: '/safety',     icon: ShieldAlert, tint: 'text-red-600',     bg: 'bg-red-50' }, // FIX507 live
  { key: 'womens',   to: '/womens-health', icon: HeartPulse, tint: 'text-pink-600',   bg: 'bg-pink-50' }, // FIX728
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
    womens: "Women's health", // FIX728
    safetyBar: 'Safety button',
    safetyBarSub: 'In danger? Alert the people you trust in one tap',
  },
  fr: {
    heading: 'Aide gratuite, \u00e0 toute heure',
    sub: 'Bambeh porte la charge. Ces services sont toujours gratuits.',
    soon: 'Bient\u00f4t',
    pharmacy: 'Pharmacies de garde',
    hospital: 'H\u00f4pitaux de garde',
    utility: 'Eau / Lumi\u00e8re',
    fuel: 'Carburant la nuit',
    safety: 'Alertes s\u00e9curit\u00e9',
    womens: 'Sant\u00e9 des femmes', // FIX728
    safetyBar: 'Bouton de s\u00e9curit\u00e9',
    safetyBarSub: 'En danger ? Alertez vos proches de confiance en un geste',
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
    womens: 'Woman health', // FIX728
    safetyBar: 'Safety button',
    safetyBarSub: 'Danger dey? Alert people weh you trust with one touch',
  },
  ar: {
    heading: '\u0645\u0633\u0627\u0639\u062f\u0629 \u0645\u062c\u0627\u0646\u064a\u0629\u060c \u0641\u064a \u0623\u064a \u0648\u0642\u062a',
    sub: '\u0628\u0627\u0645\u0628\u064a\u0647 \u064a\u062d\u0645\u0644 \u0627\u0644\u062d\u0645\u0644. \u0647\u0630\u0647 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0645\u062c\u0627\u0646\u064a\u0629 \u062f\u0627\u0626\u0645\u0627\u064b.',
    soon: '\u0642\u0631\u064a\u0628\u0627\u064b',
    pharmacy: '\u0635\u064a\u062f\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629',
    hospital: '\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629',
    utility: '\u0627\u0644\u0645\u0627\u0621 / \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621',
    fuel: '\u0627\u0644\u0648\u0642\u0648\u062f \u0644\u064a\u0644\u0627\u064b',
    safety: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0633\u0644\u0627\u0645\u0629',
    womens: '\u0635\u062d\u0629 \u0627\u0644\u0645\u0631\u0623\u0629', // FIX728
    safetyBar: '\u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646',
    safetyBarSub: '\u0641\u064a \u062e\u0637\u0631\u061f \u0646\u0628\u0651\u0647 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645 \u0628\u0644\u0645\u0633\u0629 \u0648\u0627\u062d\u062f\u0629',
  },
  ff: {
    heading: 'Ballal meere, sahaa kala',
    sub: 'Bambeh ina roondoo donngal. \u018aii\u0257oo ngalaa coggu.',
    soon: 'Ina ara',
    pharmacy: 'Farmasiiji e ndeenka',
    hospital: 'Opitaaluuji e ndeenka',
    utility: 'Ndiyam / Yiite',
    fuel: 'Esaas jemma',
    safety: 'Tintinooje kisal',
    womens: 'Cellal rew\u0253e', // FIX728
    safetyBar: 'Buto\u014b kisal',
    safetyBarSub: 'Ca\u0257eele? Anndin yim\u0253e \u0253e hooloto\u0257aa e mee\u0257ol gootol',
  },
};

const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

// FIX728 - the app spells some languages two ways; both find their words.
const LANG_ALIAS: Record<string, string> = { pcm: 'pidgin', pid: 'pidgin', ful: 'ff', fulfulde: 'ff' };

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
  const rawLang = typeof language === 'string' ? language : 'en';
  const lang = LANG_ALIAS[rawLang] || rawLang;                             // FIX728: pcm / ful spellings too
  const t = (k: string) => tr(lang, k);
  const isRtl = lang === 'ar';

  const card =
    'flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all';

  return (
    <section className="mb-10" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="svcHead">
      <h2 id="svcHead" className="text-2xl font-bold text-gray-900 mb-1">{t('heading')}</h2>
      <p className="text-sm text-gray-500 mb-4">{t('sub')}</p>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">{/* FIX728: six tiles */}
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

      {/* FIX728 - the Safety button: no account, nothing stored on Bambeh */}
      <Link to="/safety-button" data-safety-bar="1"
        className="mt-3 flex items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-white shadow hover:bg-red-700 active:scale-[0.99] transition-all">
        <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
          <Siren className="w-5 h-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-tight">{t('safetyBar')}</span>
          <span className="block text-xs text-red-50 leading-tight">{t('safetyBarSub')}</span>
        </span>
        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
      </Link>
    </section>
  );
}
// BAMBEH_END_TOKEN__SERVICESROW_FIX728__COMPLETE
