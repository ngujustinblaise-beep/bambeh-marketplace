// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_PAGE_FIX690_CLEAN
/**
 * src/features/foodgas/FoodGasPage.tsx - FIX690   (route: /food-gas)
 *
 * GAS & FOOD - the list buyers search: cooking gas, restaurants, grill & soya,
 * roasted fish, by city, neighbourhood and words ("soya", "12.5 kg", a name).
 *   - Browsing the list is free for everyone, signed in or not. Opening a business
 *     (menu, directions, chat, booking) follows the "Gas & food" members switch in
 *     the Command Center (SectionGate in App.tsx).
 *   - Featured businesses come first in their neighbourhood, taking turns each day.
 *   - "Gas available today" only counts an answer the seller gave today.
 *   - Up Station and Mimboman are offered first (where Bambeh starts).
 *   - The last city, neighbourhood and kind are remembered on the phone.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Loader2, MapPin, Plus, RefreshCw, Search, Star, Store, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AREAS, CITY_KEYS, FOOD_KINDS, KIND_ICON, LAUNCH_AREAS, cityLabel, doualaNow, fmtXaf, isCityKey, kindLabel,
  openState, opensLaterToday, reasonText, useFoodText,
} from './foodGasText';
import type { CityKey, FoodKind, FoodLang, FoodKey } from './foodGasText';
import { listPlaces } from './foodGasApi';
import type { AreaCount, FoodCard } from './foodGasApi';

const FILTER_KEY = 'bambeh_food_filters';
const PAGE = 30;

interface Filters { city: CityKey | ''; area: string; kind: FoodKind | '' }

function loadFilters(): Filters {
  try {
    const raw = window.localStorage.getItem(FILTER_KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<Filters>;
      const city = isCityKey(v.city) ? v.city : '';
      const kind = (FOOD_KINDS as readonly string[]).indexOf(String(v.kind)) >= 0 ? (v.kind as FoodKind) : '';
      const area = city && typeof v.area === 'string' && /^[a-z0-9_]{2,40}$/.test(v.area) ? v.area : '';
      return { city, area, kind };
    }
  } catch {
    /* private window or blocked storage: start fresh */
  }
  return { city: '', area: '', kind: '' };
}

function saveFilters(f: Filters): void {
  try { window.localStorage.setItem(FILTER_KEY, JSON.stringify(f)); } catch { /* not kept - fine */ }
}

type T = (key: FoodKey, vars?: Record<string, string | number>) => string;

function GasBadge({ p, t }: { p: FoodCard; t: T }) {
  if (p.kinds.indexOf('gas') < 0) return null;
  if (p.gas_today) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">{t('gasYes')}</span>;
  }
  const answeredToday = !!p.gas_checked_at && doualaNow(new Date(p.gas_checked_at)).ymd === doualaNow().ymd;
  return answeredToday
    ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{t('gasNo')}</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{t('gasUnknown')}</span>;
}

function OpenLine({ p, t }: { p: FoodCard; t: T }) {
  const st = openState(p.open_days, p.opens_at, p.closes_at);
  if (st === 'unknown') return null;
  if (st === 'open') {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><Clock className="h-3.5 w-3.5" />{t('openNow')}</span>;
  }
  const later = opensLaterToday(p.open_days, p.opens_at);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
      <Clock className="h-3.5 w-3.5" />{later ? t('opensAt', { t: later }) : t('closedNow')}
    </span>
  );
}

export function PlaceCard({ p, lang, t, onOpen }: { p: FoodCard; lang: FoodLang; t: T; onOpen: () => void }) {
  const Icon = KIND_ICON[p.kinds[0] || 'restaurant'];
  return (
    <button
      type="button"
      onClick={onOpen}
      data-place={p.id}
      className="group w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-start shadow-sm transition hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative h-36 w-full bg-gradient-to-br from-orange-100 to-amber-50">
        {p.photo ? (
          <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-orange-300"><Icon className="h-14 w-14" /></div>
        )}
        {p.featured && (
          <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-amber-950 shadow">
            <Star className="h-3.5 w-3.5 fill-amber-950" />{t('featured')}
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-gray-900">{p.name}</h3>
          {p.delivers && <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" aria-label={t('delivers')} />}
        </div>
        <div className="flex flex-wrap gap-1">
          {p.kinds.map((k) => {
            const KI = KIND_ICON[k];
            return (
              <span key={k} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800">
                <KI className="h-3 w-3" />{kindLabel(lang, k)}
              </span>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.area_label}, {cityLabel(p.city, lang)}</span>
          <OpenLine p={p} t={t} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GasBadge p={p} t={t} />
          {p.key_price_xaf !== null && (
            <span className="text-sm font-bold text-teal-700">
              {t('fromPrice', { n: fmtXaf(p.key_price_xaf, lang) })}
              {p.key_price_label ? <span className="font-medium text-gray-500"> {'\u00b7'} {p.key_price_label}</span> : null}
            </span>
          )}
        </div>
        {p.preview.length > 0 && (
          <p className="line-clamp-1 text-xs text-gray-500">
            {p.preview.slice(0, 3).map((i) => i.name + (i.price_xaf !== null ? ' ' + fmtXaf(i.price_xaf, lang) : '')).join(' \u00b7 ')}
          </p>
        )}
      </div>
    </button>
  );
}

export default function FoodGasPage() {
  const { lang, dir, t } = useFoodText();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [f, setF] = useState<Filters>(loadFilters);
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  const [gasToday, setGasToday] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [rows, setRows] = useState<FoodCard[]>([]);
  const [total, setTotal] = useState(0);
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState('');
  const reqId = useRef(0);

  useEffect(() => {
    const h = window.setTimeout(() => setQuery(typed.trim()), 450);
    return () => window.clearTimeout(h);
  }, [typed]);

  useEffect(() => { saveFilters(f); }, [f]);

  const load = useCallback(async (offset: number) => {
    const id = ++reqId.current;
    if (offset === 0) { setLoading(true); setErr(''); } else { setLoadingMore(true); }
    const r = await listPlaces({ city: f.city || null, area: f.area || null, kind: f.kind || null, query, gasToday, limit: PAGE, offset });
    if (id !== reqId.current) return;
    if (r.ok) {
      setRows((prev) => (offset === 0 ? r.rows : prev.concat(r.rows)));
      setTotal(r.total);
      if (offset === 0) setAreas(r.areas);
    } else if (offset === 0) {
      setRows([]);
      setTotal(0);
      setErr(r.reason === 'network' ? t('loadError') : reasonText(lang, r.reason));
    }
    setLoading(false);
    setLoadingMore(false);
    // t and lang only change the error wording; the list itself does not depend on them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.city, f.area, f.kind, query, gasToday]);

  useEffect(() => { void load(0); }, [load]);

  const shown = openNow ? rows.filter((r) => openState(r.open_days, r.opens_at, r.closes_at) === 'open') : rows;

  // the neighbourhoods offered for the chosen city: the known list, then any others owners typed
  const areaChips: Array<{ key: string; label: string; n: number | null }> = [];
  if (f.city) {
    for (const a of AREAS[f.city]) {
      const hit = areas.filter((x) => x.city === f.city && x.area === a.key);
      areaChips.push({ key: a.key, label: a.label, n: hit.length ? hit[0].n : null });
    }
    for (const x of areas) {
      if (x.city === f.city && !areaChips.some((c) => c.key === x.area)) areaChips.push({ key: x.area, label: x.area_label, n: x.n });
    }
  }
  const filtersOn = !!(f.city || f.area || f.kind || query || gasToday || openNow);

  const setCity = (c: string) => setF({ city: isCityKey(c) ? c : '', area: '', kind: f.kind });
  const clearAll = () => { setF({ city: '', area: '', kind: '' }); setTyped(''); setQuery(''); setGasToday(false); setOpenNow(false); };

  return (
    <div dir={dir} data-fix="FIX690" className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-4 pb-5 pt-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{t('title')}</h1>
          <p className="mt-1 text-sm text-orange-50">{t('subtitle')}</p>
          <form
            className="mt-4 flex overflow-hidden rounded-xl bg-white shadow-lg"
            onSubmit={(e) => { e.preventDefault(); setQuery(typed.trim()); }}
          >
            <Search className="ms-3 mt-3 h-5 w-5 flex-shrink-0 text-gray-400" />
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t('searchPh')}
              aria-label={t('searchPh')}
              maxLength={60}
              className="min-w-0 flex-1 px-3 py-3 text-sm text-gray-900 outline-none"
            />
            <button type="submit" className="bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700">{t('searchBtn')}</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/food-gas/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-sm font-bold text-orange-700 shadow hover:bg-white"
            >
              <Plus className="h-4 w-4" />{t('addBusiness')}
            </button>
            {user && (
              <button
                type="button"
                onClick={() => navigate('/food-gas/mine')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 px-3 py-2 text-sm font-bold text-white hover:bg-white/10"
              >
                <Store className="h-4 w-4" />{t('myBusinesses')}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3" role="tablist">
          {(['', ...FOOD_KINDS] as Array<FoodKind | ''>).map((k) => {
            const on = f.kind === k;
            const KI = k ? KIND_ICON[k] : null;
            return (
              <button
                key={k || 'all'}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setF({ ...f, kind: k })}
                className={'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ' +
                  (on ? 'bg-orange-600 text-white shadow' : 'border border-gray-200 bg-white text-gray-700 hover:border-orange-300')}
              >
                {KI ? <KI className="h-4 w-4" /> : null}
                {k ? kindLabel(lang, k, true) : t('kAll')}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="food-city">{t('city')}</label>
          <select
            id="food-city"
            value={f.city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800"
          >
            <option value="">{t('allCities')}</option>
            {CITY_KEYS.map((c) => <option key={c} value={c}>{cityLabel(c, lang)}</option>)}
          </select>
          <button
            type="button"
            aria-pressed={gasToday}
            onClick={() => setGasToday(!gasToday)}
            className={'rounded-xl px-3 py-2 text-sm font-bold ' + (gasToday ? 'bg-green-600 text-white' : 'border border-gray-200 bg-white text-gray-700')}
          >
            {t('gasTodayFilter')}
          </button>
          <button
            type="button"
            aria-pressed={openNow}
            onClick={() => setOpenNow(!openNow)}
            className={'rounded-xl px-3 py-2 text-sm font-bold ' + (openNow ? 'bg-teal-600 text-white' : 'border border-gray-200 bg-white text-gray-700')}
          >
            {t('openNowFilter')}
          </button>
          {filtersOn && (
            <button type="button" onClick={clearAll} className="px-2 py-2 text-sm font-semibold text-orange-700 underline">
              {t('clearFilters')}
            </button>
          )}
        </div>

        {!f.city && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">{t('startHere')}</p>
            <div className="flex flex-wrap gap-2">
              {LAUNCH_AREAS.map(({ city, area }) => (
                <button
                  key={city + area.key}
                  type="button"
                  onClick={() => setF({ city, area: area.key, kind: f.kind })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-800 hover:bg-orange-100"
                >
                  <MapPin className="h-4 w-4" />{area.label} {'\u00b7'} {cityLabel(city, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {f.city && (
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            <button
              type="button"
              onClick={() => setF({ ...f, area: '' })}
              className={'flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ' + (f.area === '' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-700')}
            >
              {t('allAreas')}
            </button>
            {areaChips.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setF({ ...f, area: a.key })}
                className={'flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ' + (f.area === a.key ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-700')}
              >
                {a.label}{a.n !== null ? ' (' + a.n + ')' : ''}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            {loading ? t('loading') : shown.length === 1 && !openNow && total === 1 ? t('countOne') : t('countPlaces', { n: openNow ? shown.length : total })}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
        ) : err ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
            <p className="text-sm font-semibold text-red-700">{err}</p>
            <button
              type="button"
              onClick={() => void load(0)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              <RefreshCw className="h-4 w-4" />{t('retry')}
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center">
            <Store className="mx-auto h-10 w-10 text-orange-300" />
            <h2 className="mt-3 text-lg font-extrabold text-gray-900">{t('emptyTitle')}</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{t('emptyBody')}</p>
            <button
              type="button"
              onClick={() => navigate('/food-gas/new')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />{t('addBusiness')}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <PlaceCard key={p.id} p={p} lang={lang} t={t} onOpen={() => navigate('/food-gas/place/' + p.id)} />
              ))}
            </div>
            {rows.length < total && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void load(rows.length)}
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-bold text-orange-700 disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t('loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__FOOD_GAS_PAGE_FIX690__COMPLETE
