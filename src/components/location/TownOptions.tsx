// BAMBEH_DEPLOY_TOKEN__TOWN_OPTIONS_FIX795_CLEAN
/**
 * src/components/location/TownOptions.tsx - FIX795 (new, 15 Oct 2026)
 *
 * The town list of the free pages - Pharmacies on call, Hospitals on duty, Water & lights, Fuel at night, Safety
 * alerts - grouped by REGION (Big, 15 Oct 2026: "add a location filter to the free pages"): inside the same
 * town box, each region is a heading with its towns under it, in the reader's language; a town Bambeh cannot
 * place goes under "Other towns". The town a person picked (or the one picked on another free page) is always
 * offered, even when nobody has added anything there yet - the page then says so in its own words.
 * Regions and towns come from src/lib/africa/places.ts (FIX769). Plain ASCII.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useLang } from '@/hooks/useAppLang';
import { groupTownsByRegion, regionLabel } from '@/lib/africa/places';

const OTHER_TOWNS: Record<string, string> = {
  en: 'Other towns',
  fr: 'Autres villes',
  pidgin: 'Other towns',
  ar: '\u0645\u062f\u0646 \u0623\u062e\u0631\u0649',
  ff: 'Saareeji go\u0257\u0257i',
};

function langKey(v: unknown): string {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

export interface TownRowLike { town: string; region?: string | null }

/** <select> options: the towns grouped by region. current: the chosen town, added when it is not in the list. */
export default function TownOptions({ towns, current, country = 'CM' }: {
  towns: readonly TownRowLike[]; current?: string; country?: string;
}) {
  const lang = langKey(useLang());
  const rows: TownRowLike[] = towns.slice();
  const want = String(current || '').trim();
  if (want && !rows.some((x) => String(x.town).toLowerCase() === want.toLowerCase())) rows.push({ town: want });
  const groups = groupTownsByRegion(country, rows);
  return (
    <>
      {groups.map((g) => (
        <optgroup key={g.region ? g.region.key : '_other'} label={g.region ? regionLabel(g.region, lang) : OTHER_TOWNS[lang]}>
          {g.towns.map((x) => <option key={x} value={x}>{x}</option>)}
        </optgroup>
      ))}
    </>
  );
}
// BAMBEH_END_TOKEN__TOWN_OPTIONS_FIX795__COMPLETE
