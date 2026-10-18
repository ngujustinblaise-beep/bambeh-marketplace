// BAMBEH_DEPLOY_TOKEN__LOCATIONFILTER_FIX794_CLEAN
/**
 * src/components/filters/LocationFilter.tsx - FIX794 (replaces FIX379)
 *
 * The location filter of the marketplace pages (Services, Jobs, Rentals, Car rental, Exchange). FIX794,
 * Big 15 Oct 2026 ("is the location filter ready for expansion?"):
 *  - the regions and towns come from ONE list, src/lib/africa/places.ts (FIX769), instead of a copy here:
 *    Kumba sits in the South West, no town twice, more towns per region, neighbourhood suggestions for
 *    the big towns;
 *  - when an admin opens other countries for places (Command Center > Countries, FIX779), a Country box
 *    appears first; a country without a region list lets people type the region and the town. With only
 *    Cameroon open (today) the filter looks exactly as before;
 *  - locationMatches(text, filters): the check every page can use - accents and capitals ignored
 *    ("Yaounde" finds "Yaound\u00e9"), "North-West" = "North West" = "Nord-Ouest", and a region also
 *    matches the listings that only name one of its towns ("Bamenda, Nkwen" is in the North West).
 *
 * PUBLIC API UNCHANGED: LocationFilter, LocationFilters, EMPTY_LOCATION (+ locationMatches, new). The values
 * stay what FIX379 stored: the region's English name ('North West'), the town as written ('Yaound\u00e9').
 *
 * Pure ASCII: every accent is an escape. Language: read from Bambeh_language, display only.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useState } from 'react';
import { MapPin, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { countryName, flagOf, HOME } from '@/lib/africa/countries';
import { findRegion, hasRegions, neighbourhoodsOf, regionLabel as placeRegionLabel, regionsOf, townsOf } from '@/lib/africa/places';
import { useOpenCountries } from '@/lib/africa/useOpenCountries';

// -- Types ---------------------------------------------------------------------
export interface LocationFilters {
  region:   string;
  city:     string;
  quarter:  string;
  landmark: string;
  /** FIX794: the country (two letters); empty or missing = Cameroon */
  country?: string;
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
  country: string;
  typeRegion: string;
  typeTown: string;
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
    country: 'Country',
    typeRegion: 'Type the region',
    typeTown: 'Type the town',
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
    country: 'Pays',
    typeRegion: 'Saisissez la r\u00E9gion',
    typeTown: 'Saisissez la ville',
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
    country: 'Country',
    typeRegion: 'Write the region',
    typeTown: 'Write the town',
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
    country: '\u0627\u0644\u0628\u0644\u062F',
    typeRegion: '\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0627\u0644\u062C\u0647\u0629',
    typeTown: '\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u064A\u0646\u0629',
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
    country: 'Leydi',
    typeRegion: 'Winndu diiwaan',
    typeTown: 'Winndu wuro',
  },
};

// -- Matching (FIX794) ----------------------------------------------------------
/** lower case, no accents, every run of other characters one space: "Nord-Ouest" -> "nord ouest" */
function foldText(v: unknown): string {
  let s = String(v == null ? '' : v);
  try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch { /* old browser: as written */ }
  return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
}

/** whole words only: "kumba" is found in "kumba town", not in "kumbo" */
function hasWords(hay: string, needle: string): boolean {
  return !!needle && (' ' + hay + ' ').indexOf(' ' + needle + ' ') >= 0;
}

/**
 * true when a listing's location text fits the filter. A region matches its own name in English or French
 * (and its short key) or any of its towns; a town matches whole words; quarter and landmark match anywhere.
 */
export function locationMatches(text: unknown, f: LocationFilters | null | undefined): boolean {
  if (!f) return true;
  const hay = foldText(text);
  if (f.region) {
    const r = findRegion(f.country || HOME, f.region);
    const names = r ? [r.name, r.fr, r.key.replace(/_/g, ' ')].concat(r.towns as string[]) : [f.region];
    if (!names.some((n) => hasWords(hay, foldText(n)))) return false;
  }
  if (f.city && !hasWords(hay, foldText(f.city))) return false;
  if (f.quarter && hay.indexOf(foldText(f.quarter)) < 0) return false;
  if (f.landmark && hay.indexOf(foldText(f.landmark)) < 0) return false;
  return true;
}

// -- Component -----------------------------------------------------------------
const SELECT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 outline-none ' +
  'focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';
const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 ' +
  'outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';

export function LocationFilter({ onFilterChange }: LocationFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<LocationFilters>(EMPTY_LOCATION);
  const countries = useOpenCountries().places;

  const lang = currentLang();
  const t = T[lang];
  const rtl = lang === 'ar';
  const country = filters.country || HOME;
  const listed = hasRegions(country);
  const region = listed ? findRegion(country, filters.region) : null;

  // Count how many filters are currently active (the country only when it is not Cameroon)
  const activeCount = [filters.region, filters.city, filters.quarter, filters.landmark].filter(Boolean).length
    + (filters.country && filters.country !== HOME ? 1 : 0);

  const regions = regionsOf(country);
  const cities: string[] = listed ? townsOf(country, filters.region || undefined) : [];
  if (filters.city && cities.indexOf(filters.city) < 0) cities.unshift(filters.city);
  const quarters = neighbourhoodsOf(filters.city);

  // Update a single field and propagate upward
  const update = useCallback((key: keyof LocationFilters, value: string) => {
    setFilters((prev) => {
      // When the country changes, everything below resets; when the region changes, the town does
      const patch: Partial<LocationFilters> = { [key]: value };
      if (key === 'country') { patch.region = ''; patch.city = ''; patch.quarter = ''; }
      if (key === 'region') patch.city = '';
      const next = { ...prev, ...patch };
      if (next.country === HOME) delete next.country;
      onFilterChange(next);
      return next;
    });
  }, [onFilterChange]);

  // Clear all filters
  const reset = useCallback(() => {
    setFilters(EMPTY_LOCATION);
    onFilterChange(EMPTY_LOCATION);
  }, [onFilterChange]);

  const label = (k: keyof LocationFilters, v: string): string => {
    if (k === 'region') { const r = findRegion(country, v); return r ? placeRegionLabel(r, lang) : v; }
    if (k === 'country') return flagOf(v) + ' ' + countryName(v, lang);
    return v;
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      data-fix="FIX794"
      className="rounded-2xl bg-white shadow-sm border border-gray-200 mb-4 overflow-hidden"
    >

      {/* -- Toggle bar ------------------------------------------------------ */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-controls="location-filter-panel"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal size={16} className="text-teal-600" />
          {t.title}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              aria-label={t.clearAria}
              onClick={(e) => { e.stopPropagation(); reset(); }}
              onKeyDown={(e) => e.key === 'Enter' && reset()}
              className="flex items-center gap-1 text-xs text-red-500 font-medium hover:text-red-700 transition-colors cursor-pointer"
            >
              <X size={12} /> {t.clear}
            </span>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* -- Filter panel ---------------------------------------------------- */}
      {open && (
        <div id="location-filter-panel" className="border-t border-gray-100 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Country - only once another country is open for places */}
          {countries.length > 1 && (
            <div className="sm:col-span-2">
              <label htmlFor="lf-country" className="block text-xs font-semibold text-gray-500 mb-1">{t.country}</label>
              <select id="lf-country" value={country} onChange={(e) => update('country', e.target.value)} className={SELECT} data-lf="country">
                {countries.map((c) => <option key={c} value={c}>{flagOf(c) + ' ' + countryName(c, lang)}</option>)}
              </select>
            </div>
          )}

          {/* Region */}
          <div>
            <label htmlFor="lf-region" className="block text-xs font-semibold text-gray-500 mb-1">{t.region}</label>
            {listed ? (
              <select id="lf-region" value={region ? region.name : filters.region} onChange={(e) => update('region', e.target.value)} className={SELECT} data-lf="region">
                <option value="">{t.allRegions}</option>
                {regions.map((r) => <option key={r.key} value={r.name}>{placeRegionLabel(r, lang)}</option>)}
              </select>
            ) : (
              <input id="lf-region" type="text" value={filters.region} maxLength={60} placeholder={t.typeRegion}
                onChange={(e) => update('region', e.target.value)} className={INPUT} data-lf="region" />
            )}
          </div>

          {/* City - cascades from region */}
          <div>
            <label htmlFor="lf-city" className="block text-xs font-semibold text-gray-500 mb-1">{t.city}</label>
            {listed ? (
              <select id="lf-city" value={filters.city} onChange={(e) => update('city', e.target.value)} className={SELECT} data-lf="city">
                <option value="">{region ? t.allCitiesIn + ' ' + placeRegionLabel(region, lang) : t.allCities}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input id="lf-city" type="text" value={filters.city} maxLength={60} placeholder={t.typeTown}
                onChange={(e) => update('city', e.target.value)} className={INPUT} data-lf="city" />
            )}
          </div>

          {/* Quarter / Neighbourhood */}
          <div>
            <label htmlFor="lf-quarter" className="block text-xs font-semibold text-gray-500 mb-1">{t.quarter}</label>
            <input id="lf-quarter" type="text" placeholder={t.quarterPh} value={filters.quarter} maxLength={60}
              list={quarters.length ? 'lf-quarters' : undefined}
              onChange={(e) => update('quarter', e.target.value)} className={INPUT} data-lf="quarter" />
            {quarters.length > 0 && <datalist id="lf-quarters">{quarters.map((q) => <option key={q} value={q} />)}</datalist>}
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="lf-landmark" className="block text-xs font-semibold text-gray-500 mb-1">{t.landmark}</label>
            <input id="lf-landmark" type="text" placeholder={t.landmarkPh} value={filters.landmark} maxLength={80}
              onChange={(e) => update('landmark', e.target.value)} className={INPUT} data-lf="landmark" />
          </div>

          {/* Active filter summary pills */}
          {activeCount > 0 && (
            <div className="col-span-full flex flex-wrap gap-2 pt-1">
              {(Object.entries(filters) as [keyof LocationFilters, string][])
                .filter(([k, v]) => v && !(k === 'country' && v === HOME))
                .map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <MapPin size={10} />
                    {label(k, v)}
                    <button aria-label={t.removeAria} onClick={() => update(k, k === 'country' ? HOME : '')} className="ml-0.5 hover:text-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">
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
// BAMBEH_END_TOKEN__LOCATIONFILTER_FIX794__COMPLETE
