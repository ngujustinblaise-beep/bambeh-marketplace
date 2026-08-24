// BAMBEH_DEPLOY_TOKEN__LOCATIONFILTER_FIX379_CLEAN
/**
 * src/components/filters/LocationFilter.tsx - Bambeh Marketplace
 *
 * FIX379. Three separate things were wrong with this file.
 *
 * 1. MOJIBAKE, and we were hunting the wrong towns.
 *    Two names had already been destroyed to literal question marks:
 *        'Doum?'   should be Doume  (East)
 *        'Ka?l?'   should be Kaele  (Far North)
 *    Every earlier search looked for Yaounde / Ngaoundere / Sangmelima /
 *    Tignere / Bangante - and all five of those were INTACT in this file.
 *    That is why five hunts through the database and the source came back
 *    empty. The damage was real, it was just in different towns.
 *
 * 2. HARDCODED ENGLISH.
 *    Every label here was an English string literal, so the whole panel
 *    stayed in English while the rest of the page spoke Fulfulde, Pidgin,
 *    French or Arabic. Now it speaks all five.
 *
 * 3. AN ENCODING TIME BOMB.
 *    The accents were stored as raw bytes. Any tool that touched the file
 *    with the wrong encoding could break them again, exactly as happened to
 *    Doume and Kaele.
 *
 * THE PERMANENT FIX for 1 and 3: this file is now PURE ASCII. Every accented
 * character is a \uXXXX escape. No editor, no git autocrlf setting, no
 * PowerShell redirect and no copy-paste can ever corrupt it again. This is
 * the same approach that has kept LocationLock.tsx clean.
 *
 * Language follows the proven LocationLock pattern - read Bambeh_language
 * from localStorage directly, rather than going through the key system.
 * Display only, never security.
 *
 * DATA CORRECTIONS in this pass:
 *    Doum?    -> Doum\u00E9
 *    Ka?l?    -> Ka\u00E9l\u00E9
 *    Kousseri -> Kouss\u00E9ri
 *    Guider   removed from Far North - it is in the North region, and it was
 *             appearing TWICE in the All Cities list because of it
 *    Mokolo   added to Far North
 *    All Cities list is now de-duplicated
 *
 * PUBLIC API IS UNCHANGED: LocationFilter, LocationFilters, EMPTY_LOCATION.
 *
 * HOW TO USE IN ANY PAGE (unchanged):
 *   import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
 *   const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);
 *   <LocationFilter onFilterChange={setLocationFilters} />
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState, useCallback } from 'react';
import { MapPin, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

// -- Types ---------------------------------------------------------------------
export interface LocationFilters {
  region:   string;
  city:     string;
  quarter:  string;
  landmark: string;
}

export const EMPTY_LOCATION: LocationFilters = {
  region: '', city: '', quarter: '', landmark: '',
};

interface LocationFilterProps {
  onFilterChange: (filters: LocationFilters) => void;
  /** Optional accent colour class for the active state. Defaults to teal. */
  accentClass?: string;
}

// -- Language (display only, never security) -----------------------------------
type LangCode = 'en' | 'fr' | 'pcm' | 'ar' | 'ff';

function currentLang(): LangCode {
  let raw = '';
  try {
    raw = String(localStorage.getItem('Bambeh_language') || '').toLowerCase();
  } catch {
    raw = '';
  }
  if (raw.startsWith('fr')) return 'fr';
  if (raw.startsWith('ar')) return 'ar';
  if (raw.startsWith('ff') || raw.startsWith('ful')) return 'ff';
  if (raw.startsWith('pcm') || raw.startsWith('pid')) return 'pcm';
  return 'en';
}

interface Copy {
  title: string;
  clear: string;
  clearAll: string;
  clearAria: string;
  removeAria: string;
  region: string;
  allRegions: string;
  city: string;
  allCities: string;
  allCitiesIn: string;
  quarter: string;
  quarterPh: string;
  landmark: string;
  landmarkPh: string;
}

const T: Record<LangCode, Copy> = {
  en: {
    title: 'Location Filter',
    clear: 'Clear',
    clearAll: 'Clear all',
    clearAria: 'Clear location filters',
    removeAria: 'Remove filter',
    region: 'Region',
    allRegions: 'All Regions',
    city: 'City / Town',
    allCities: 'All Cities',
    allCitiesIn: 'All cities in',
    quarter: 'Quarter / Neighbourhood',
    quarterPh: 'e.g. Bastos, Akwa, Bonamoussadi',
    landmark: 'Landmark',
    landmarkPh: 'e.g. Near Total Station, Market, Hospital',
  },
  fr: {
    title: 'Filtre de localisation',
    clear: 'Effacer',
    clearAll: 'Tout effacer',
    clearAria: 'Effacer les filtres de localisation',
    removeAria: 'Retirer le filtre',
    region: 'R\u00E9gion',
    allRegions: 'Toutes les r\u00E9gions',
    city: 'Ville',
    allCities: 'Toutes les villes',
    allCitiesIn: 'Toutes les villes de',
    quarter: 'Quartier',
    quarterPh: 'ex. Bastos, Akwa, Bonamoussadi',
    landmark: 'Point de rep\u00E8re',
    landmarkPh: 'ex. pr\u00E8s de la station Total, march\u00E9, h\u00F4pital',
  },
  pcm: {
    title: 'Find by Place',
    clear: 'Comot',
    clearAll: 'Comot all',
    clearAria: 'Comot all the place filter dem',
    removeAria: 'Comot this filter',
    region: 'Region',
    allRegions: 'All Region dem',
    city: 'Town',
    allCities: 'All Town dem',
    allCitiesIn: 'All town for',
    quarter: 'Quarter',
    quarterPh: 'like Bastos, Akwa, Bonamoussadi',
    landmark: 'Wetin dey near',
    landmarkPh: 'like near Total Station, Market, Hospital',
  },
  ar: {
    title: '\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0648\u0642\u0639',
    clear: '\u0645\u0633\u062D',
    clearAll: '\u0645\u0633\u062D \u0627\u0644\u0643\u0644',
    clearAria: '\u0645\u0633\u062D \u0645\u0631\u0634\u062D\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639',
    removeAria: '\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0631\u0634\u062D',
    region: '\u0627\u0644\u062C\u0647\u0629',
    allRegions: '\u0643\u0644 \u0627\u0644\u062C\u0647\u0627\u062A',
    city: '\u0627\u0644\u0645\u062F\u064A\u0646\u0629',
    allCities: '\u0643\u0644 \u0627\u0644\u0645\u062F\u0646',
    allCitiesIn: '\u0643\u0644 \u0645\u062F\u0646',
    quarter: '\u0627\u0644\u062D\u064A',
    quarterPh: '\u0645\u062B\u0627\u0644: \u0628\u0627\u0633\u062A\u0648\u0633\u060C \u0623\u0643\u0648\u0627\u060C \u0628\u0648\u0646\u0627\u0645\u0648\u0633\u0627\u062F\u064A',
    landmark: '\u0645\u0639\u0644\u0645 \u0642\u0631\u064A\u0628',
    landmarkPh: '\u0645\u062B\u0627\u0644: \u0642\u0631\u0628 \u0645\u062D\u0637\u0629 \u062A\u0648\u062A\u0627\u0644\u060C \u0627\u0644\u0633\u0648\u0642\u060C \u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649',
  },
  ff: {
    title: 'Ceerndugol nokku',
    clear: 'Momtu',
    clearAll: 'Momtu fof',
    clearAria: 'Momtu ceerndugol nokku fof',
    removeAria: 'Momtu ndee ceerndugol',
    region: 'Diiwaan',
    allRegions: 'Diiwaanuuji fof',
    city: 'Wuro',
    allCities: 'Gure fof',
    allCitiesIn: 'Gure fof e',
    quarter: 'Leegal',
    quarterPh: 'misal: Bastos, Akwa, Bonamoussadi',
    landmark: 'Maande',
    landmarkPh: 'misal: takko Total, luumo, safrirdu',
  },
};

// -- Cameroon geography data ---------------------------------------------------
// The KEYS below are the stored values and must never change - listings already
// hold these exact strings. Only the DISPLAY label is translated.
const REGIONS: string[] = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'North West', 'South', 'South West', 'West',
];

/** Official French names of the ten regions. Display only. */
const REGION_LABELS_FR: Record<string, string> = {
  'Adamawa': 'Adamaoua',
  'Centre': 'Centre',
  'East': 'Est',
  'Far North': 'Extr\u00EAme-Nord',
  'Littoral': 'Littoral',
  'North': 'Nord',
  'North West': 'Nord-Ouest',
  'South': 'Sud',
  'South West': 'Sud-Ouest',
  'West': 'Ouest',
};

function regionLabel(key: string, lang: LangCode): string {
  if (lang === 'fr') return REGION_LABELS_FR[key] ?? key;
  return key;
}

/** Cities/towns grouped by region for cascading select */
const CITIES_BY_REGION: Record<string, string[]> = {
  'Adamawa':   ['Ngaound\u00E9r\u00E9', 'Meiganga', 'Tibati', 'Banyo', 'Tign\u00E8re'],
  'Centre':    ['Yaound\u00E9', 'Mbalmayo', 'Obala', 'Nanga Eboko', 'Mfou', 'Bafia'],
  'East':      ['Bertoua', 'Batouri', 'Yokadouma', 'Abong-Mbang', 'Doum\u00E9'],
  'Far North': ['Maroua', 'Kouss\u00E9ri', 'Mora', 'Yagoua', 'Mokolo', 'Ka\u00E9l\u00E9'],
  'Littoral':  ['Douala', 'Nkongsamba', 'Ed\u00E9a', 'Loum', 'Mbanga', 'Manjo'],
  'North':     ['Garoua', 'Guider', 'Poli', 'Bibemi', 'Rey Bouba'],
  'North West':['Bamenda', 'Kumbo', 'Nkambe', 'Wum', 'Fundong', 'Mbengwi', 'Santa', 'Ndop'],
  'South':     ['Ebolowa', 'Kribi', 'Sangm\u00E9lima', 'Lolodorf', 'Ambam'],
  'South West':['Buea', 'Limbe', 'Kumba', 'Mamfe', 'Ekondo Titi', 'Muyuka'],
  'West':      ['Bafoussam', 'Dschang', 'Foumban', 'Mbouda', 'Bangangt\u00E9', 'Foumbot'],
};

/** Flat, de-duplicated, sorted list for the "All Regions" case. */
const ALL_CITIES: string[] = Array.from(
  new Set(Object.values(CITIES_BY_REGION).flat())
).sort((a, b) => a.localeCompare(b));

// -- Component -----------------------------------------------------------------
export function LocationFilter({ onFilterChange }: LocationFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  const lang = currentLang();
  const t = T[lang];
  const rtl = lang === 'ar';

  // Count how many filters are currently active
  const activeCount = Object.values(filters).filter(Boolean).length;

  // Get available cities based on selected region
  const availableCities: string[] = filters.region
    ? (CITIES_BY_REGION[filters.region] ?? [])
    : ALL_CITIES;

  // Update a single field and propagate upward
  const update = useCallback((key: keyof LocationFilters, value: string) => {
    setFilters(prev => {
      // When region changes, reset city (cascading behaviour)
      const patch: Partial<LocationFilters> = { [key]: value };
      if (key === 'region') patch.city = '';
      const next = { ...prev, ...patch };
      onFilterChange(next);
      return next;
    });
  }, [onFilterChange]);

  // Clear all filters
  const reset = useCallback(() => {
    setFilters(EMPTY_LOCATION);
    onFilterChange(EMPTY_LOCATION);
  }, [onFilterChange]);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="rounded-2xl bg-white shadow-sm border border-gray-200 mb-4 overflow-hidden"
    >

      {/* -- Toggle bar ------------------------------------------------------ */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-controls="location-filter-panel"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal size={16} className="text-teal-600" />
          {t.title}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                             bg-teal-600 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {/* Quick clear - visible even when the panel is closed */}
          {activeCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              aria-label={t.clearAria}
              onClick={e => { e.stopPropagation(); reset(); }}
              onKeyDown={e => e.key === 'Enter' && reset()}
              className="flex items-center gap-1 text-xs text-red-500 font-medium
                         hover:text-red-700 transition-colors cursor-pointer"
            >
              <X size={12} /> {t.clear}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* -- Filter panel ---------------------------------------------------- */}
      {open && (
        <div
          id="location-filter-panel"
          className="border-t border-gray-100 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >

          {/* Region */}
          <div>
            <label htmlFor="lf-region" className="block text-xs font-semibold text-gray-500 mb-1">
              {t.region}
            </label>
            <select
              id="lf-region"
              value={filters.region}
              onChange={e => update('region', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         bg-white text-gray-900 outline-none focus:ring-2 focus:ring-teal-500
                         focus:border-transparent transition"
            >
              <option value="">{t.allRegions}</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{regionLabel(r, lang)}</option>
              ))}
            </select>
          </div>

          {/* City - cascades from region */}
          <div>
            <label htmlFor="lf-city" className="block text-xs font-semibold text-gray-500 mb-1">
              {t.city}
            </label>
            <select
              id="lf-city"
              value={filters.city}
              onChange={e => update('city', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         bg-white text-gray-900 outline-none focus:ring-2 focus:ring-teal-500
                         focus:border-transparent transition"
            >
              <option value="">
                {filters.region
                  ? `${t.allCitiesIn} ${regionLabel(filters.region, lang)}`
                  : t.allCities}
              </option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quarter / Neighbourhood */}
          <div>
            <label htmlFor="lf-quarter" className="block text-xs font-semibold text-gray-500 mb-1">
              {t.quarter}
            </label>
            <input
              id="lf-quarter"
              type="text"
              placeholder={t.quarterPh}
              value={filters.quarter}
              onChange={e => update('quarter', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         bg-white text-gray-900 placeholder-gray-400 outline-none
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="lf-landmark" className="block text-xs font-semibold text-gray-500 mb-1">
              {t.landmark}
            </label>
            <input
              id="lf-landmark"
              type="text"
              placeholder={t.landmarkPh}
              value={filters.landmark}
              onChange={e => update('landmark', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         bg-white text-gray-900 placeholder-gray-400 outline-none
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          {/* Active filter summary pills */}
          {activeCount > 0 && (
            <div className="col-span-full flex flex-wrap gap-2 pt-1">
              {(Object.entries(filters) as [keyof LocationFilters, string][])
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 bg-teal-50 text-teal-700
                               text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    <MapPin size={10} />
                    {k === 'region' ? regionLabel(v, lang) : v}
                    <button
                      aria-label={t.removeAria}
                      onClick={() => update(k, '')}
                      className="ml-0.5 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))
              }
              <button
                onClick={reset}
                className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
              >
                {t.clearAll}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default LocationFilter;
// BAMBEH_END_TOKEN__LOCATIONFILTER_FIX379__COMPLETE
