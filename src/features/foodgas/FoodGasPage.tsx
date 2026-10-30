// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_PAGE_FIX792_CLEAN
/**
 * src/features/foodgas/FoodGasPage.tsx - FIX792 (replaces FIX700)
 *   routes: /food-gas       the two buttons: Cooking gas and Food (old links land here)
 *           /food-gas/gas   COOKING GAS - who has which brand and bottle size, gas today
 *           /food-gas/food  FOOD - restaurants, grill & soya, roasted fish; meats and local dishes
 *
 * Big, 10 Oct 2026: "is food page different from gas page? please separate them so they
 * have two separate buttons". The two sections share one database (FIX697) and one
 * business page, but each has its own search, filters and neighbourhood counts.
 *   - Gas: brand chips (SCTM, CAMGAS, GLOCAL, TOTAL, TRADEX and any brand a seller typed),
 *     bottle sizes, "Gas available today". Each card shows the gas in stock with prices.
 *   - Food: Restaurants / Grill & soya / Roasted fish, meat chips (beef, goat, pork,
 *     chicken, fish) and dish chips by local name (achu, eru, ndole, okok...).
 *   - Browsing is free for everyone, signed in or not. Opening a business (ordering gas,
 *     booking, chat) follows the "Gas & food" members switch (SectionGate in App.tsx).
 *   - Featured businesses come first, taking turns each day. Up Station and Mimboman
 *     are offered first. The city, neighbourhood and filters are remembered on the phone.
 *
 * FIX792 (Big, 15 Oct 2026 - "region search for gas depots, food, restaurants, grills"): the five launch cities
 * become REGION > TOWN > NEIGHBOURHOOD for all of Cameroon (FIX788 in the database). The region list holds the
 * ten regions; the town list shows the towns that already have businesses (with how many), then the region's
 * other towns; the neighbourhood chips follow the chosen town. Up Station and Mimboman stay one tap away. The
 * place chosen is remembered on the phone (the old city choice carries over).
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Flame, Loader2, MapPin, Plus, RefreshCw, Search, Star, Store, Truck, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DISH_PICKS, FOOD_SECTION_KINDS, GAS_BRANDS, KIND_ICON, LAUNCH_AREAS, MEATS, SIZE_PICKS, brandLabel,
  cityLabel, doualaNow, fmtXaf, foldDish, isCityKey, isMeat, kindLabel, launchAreasOf, meatLabel, openState, opensLaterToday,
  reasonText, regionOfCity, sizeText, townOfCity, useFoodText,
} from './foodGasText';
import type { FoodKey, FoodKind, FoodLang, Meat } from './foodGasText';
import { listPlaces } from './foodGasApi';
import GasTodayCard from './GasToday'; // FIX938 - the easy gas switch at the top of Cooking gas, for depot owners (FIX935)
import type { AreaCount, BrandCount, DishCount, FoodCard, MeatCount, SizeCount, TownCount } from './foodGasApi';
import { findRegion, regionLabel as placeRegionLabel, regionsOf, townsOf } from '@/lib/africa/places';

type Section = 'gas' | 'food';
type T = (key: FoodKey, vars?: Record<string, string | number>) => string;

const WHERE_KEY = 'bambeh_food_where';   // region, town and neighbourhood, shared by both sections
const GAS_KEY = 'bambeh_food_gas';       // brand and bottle size
const FOOD_KEY = 'bambeh_food_food';     // kind, meat and dish
const OLD_KEY = 'bambeh_food_filters';   // FIX690 (one page): its city and neighbourhood carry over
const PAGE = 30;

/** FIX792: region key ('' = all), town ('' = all), neighbourhood key ('' = all) */
interface Where { region: string; town: string; area: string }
const NOWHERE: Where = { region: '', town: '', area: '' };

function isRegionKey(v: unknown): v is string {
  return typeof v === 'string' && regionsOf('CM').some((r) => r.key === v);
}

function foldTown(v: string): string {
  return foldDish(v);
}
interface GasFilters { brand: string; size: number | null }
interface FoodFilters { kind: FoodKind | ''; meat: Meat | ''; dish: string }

function readJson(key: string): Record<string, unknown> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
  } catch {
    return null; // private window or blocked storage: start fresh
  }
}

function writeJson(key: string, v: object): void {
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch { /* not kept - fine */ }
}

function loadWhere(): Where {
  const v = readJson(WHERE_KEY) || readJson(OLD_KEY) || {};
  const area = typeof v.area === 'string' && /^[a-z0-9_]{2,40}$/.test(v.area) ? v.area : '';
  // FIX792: kept as region + town; a city kept by FIX700/FIX690 carries over
  if (isRegionKey(v.region) || typeof v.town === 'string') {
    const region = isRegionKey(v.region) ? v.region : '';
    const town = typeof v.town === 'string' && v.town.trim().length >= 2 && v.town.length <= 60 ? v.town.trim() : '';
    return { region, town, area: town ? area : '' };
  }
  if (isCityKey(v.city)) return { region: regionOfCity(v.city), town: townOfCity(v.city, area), area };
  return NOWHERE;
}

function loadGas(): GasFilters {
  const v = readJson(GAS_KEY) || {};
  const brand = typeof v.brand === 'string' && v.brand.trim().length >= 2 && v.brand.length <= 30 ? v.brand.trim() : '';
  const size = typeof v.size === 'number' && v.size >= 1 && v.size <= 100 ? v.size : null;
  return { brand, size };
}

function loadFood(): FoodFilters {
  const v = readJson(FOOD_KEY) || {};
  const kind = (FOOD_SECTION_KINDS as readonly string[]).indexOf(String(v.kind)) >= 0 ? (v.kind as FoodKind) : '';
  const meat = isMeat(v.meat) ? v.meat : '';
  const dish = typeof v.dish === 'string' && foldDish(v.dish).length >= 2 && v.dish.length <= 30 ? v.dish : '';
  return { kind, meat, dish };
}

function chipCls(on: boolean, tone: 'dark' | 'red' | 'amber'): string {
  const onCls = tone === 'red' ? 'bg-red-600 text-white shadow' : tone === 'amber' ? 'bg-amber-500 text-amber-950 shadow' : 'bg-gray-900 text-white';
  return 'inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold transition ' +
    (on ? onCls : 'border border-gray-200 bg-white text-gray-700 hover:border-orange-300');
}

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

/** The gas in stock: "TRADEX 12.5 kg ... 6,500 XAF", up to four lines. */
function GasLines({ p, lang, t }: { p: FoodCard; lang: FoodLang; t: T }) {
  const offers = p.offers || [];
  if (offers.length === 0) return null;
  const more = (p.offer_count || 0) - offers.length;
  return (
    <ul className="space-y-0.5 rounded-xl bg-red-50/60 px-2.5 py-1.5" data-gas-lines={p.id}>
      {offers.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-gray-900">{brandLabel(o.brand, o.brand_other)} <span className="font-semibold text-gray-600">{sizeText(lang, o.size_kg)}</span></span>
          <span className="font-extrabold text-teal-700">{o.refill_xaf !== null ? fmtXaf(o.refill_xaf, lang) + ' XAF' : t('askPrice')}</span>
        </li>
      ))}
      {more > 0 && <li className="text-[11px] font-semibold text-gray-500">{t('gasMore', { n: more })}</li>}
    </ul>
  );
}

/** Meats and the first dishes, by their local names. */
function FoodLines({ p, lang, t }: { p: FoodCard; lang: FoodLang; t: T }) {
  const meats = p.meats || [];
  const dishes = p.dishes || [];
  const moreDishes = (p.dish_count || dishes.length) - Math.min(dishes.length, 4);
  return (
    <>
      {meats.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {meats.map((m) => <span key={m} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">{meatLabel(lang, m)}</span>)}
        </div>
      )}
      {dishes.length > 0 && (
        <p className="line-clamp-2 text-xs font-semibold text-gray-700" data-dishes={p.id}>
          {dishes.slice(0, 4).join(' \u00b7 ')}{moreDishes > 0 ? ' \u00b7 ' + t('gasMore', { n: moreDishes }) : ''}
        </p>
      )}
    </>
  );
}

export function PlaceCard({ p, lang, t, onOpen, section = 'food' }: { p: FoodCard; lang: FoodLang; t: T; onOpen: () => void; section?: Section }) {
  const Icon = KIND_ICON[section === 'gas' ? 'gas' : p.kinds.filter((k) => k !== 'gas')[0] || p.kinds[0] || 'restaurant'];
  const hasGasLines = section === 'gas' && (p.offers || []).length > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      data-place={p.id}
      className="group w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-start shadow-sm transition hover:shadow-md active:scale-[0.99]"
    >
      <div className={'relative h-36 w-full bg-gradient-to-br ' + (section === 'gas' ? 'from-red-100 to-orange-50' : 'from-orange-100 to-amber-50')}>
        {p.photo ? (
          <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className={'flex h-full w-full items-center justify-center ' + (section === 'gas' ? 'text-red-300' : 'text-orange-300')}><Icon className="h-14 w-14" /></div>
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
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.area_label}, {p.town || cityLabel(p.city, lang)}</span>
          <OpenLine p={p} t={t} />
        </div>
        {section === 'gas' && <div className="flex flex-wrap items-center gap-2"><GasBadge p={p} t={t} /></div>}
        {section === 'gas' ? <GasLines p={p} lang={lang} t={t} /> : <FoodLines p={p} lang={lang} t={t} />}
        {!hasGasLines && p.key_price_xaf !== null && (
          <p className="text-sm font-bold text-teal-700">
            {t('fromPrice', { n: fmtXaf(p.key_price_xaf, lang) })}
            {p.key_price_label ? <span className="font-medium text-gray-500"> {'\u00b7'} {p.key_price_label}</span> : null}
          </p>
        )}
        {section === 'food' && p.preview.length > 0 && (
          <p className="line-clamp-1 text-xs text-gray-500">
            {p.preview.slice(0, 3).map((i) => i.name + (i.price_xaf !== null ? ' ' + fmtXaf(i.price_xaf, lang) : '')).join(' \u00b7 ')}
          </p>
        )}
      </div>
    </button>
  );
}

// ------------------------------------------------------------------ /food-gas : the two buttons
function Hub() {
  const { dir, t } = useFoodText();
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div dir={dir} data-fix="FIX792" data-section="hub" className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-4 pb-10 pt-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{t('hubTitle')}</h1>
        </div>
      </header>
      <div className="mx-auto -mt-6 grid max-w-5xl gap-4 px-4 sm:grid-cols-2">
        <button type="button" data-go="gas" onClick={() => navigate('/food-gas/gas')}
          className="rounded-2xl bg-white p-5 text-start shadow-md transition hover:shadow-lg active:scale-[0.99]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white"><Flame className="h-8 w-8" /></span>
          <span className="mt-3 block text-xl font-extrabold text-gray-900">{t('navGas')}</span>
          <span className="mt-1 block text-sm text-gray-600">{t('hubGas')}</span>
          <span className="mt-3 flex flex-wrap gap-1">
            {GAS_BRANDS.map((b) => <span key={b} className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-800">{b}</span>)}
          </span>
        </button>
        <button type="button" data-go="food" onClick={() => navigate('/food-gas/food')}
          className="rounded-2xl bg-white p-5 text-start shadow-md transition hover:shadow-lg active:scale-[0.99]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white"><UtensilsCrossed className="h-8 w-8" /></span>
          <span className="mt-3 block text-xl font-extrabold text-gray-900">{t('navFood')}</span>
          <span className="mt-1 block text-sm text-gray-600">{t('hubFood')}</span>
          <span className="mt-3 flex flex-wrap gap-1">
            {DISH_PICKS.slice(0, 6).map((d) => <span key={d} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900">{d}</span>)}
          </span>
        </button>
      </div>
      <div className="mx-auto mt-5 flex max-w-5xl flex-wrap gap-2 px-4">
        <button type="button" onClick={() => navigate('/food-gas/new')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white hover:bg-orange-700">
          <Plus className="h-4 w-4" />{t('addBusiness')}
        </button>
        {user && (
          <button type="button" onClick={() => navigate('/food-gas/mine')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-300 bg-white px-3 py-2 text-sm font-bold text-orange-800">
            <Store className="h-4 w-4" />{t('myBusinesses')}
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ /food-gas/gas and /food-gas/food
function ListView({ section }: { section: Section }) {
  const { lang, dir, t } = useFoodText();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGas = section === 'gas';

  const [where, setWhere] = useState<Where>(loadWhere);
  const [gf, setGf] = useState<GasFilters>(loadGas);
  const [ff, setFf] = useState<FoodFilters>(loadFood);
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  const [gasToday, setGasToday] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [rows, setRows] = useState<FoodCard[]>([]);
  const [total, setTotal] = useState(0);
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [towns, setTowns] = useState<TownCount[]>([]);
  const [brands, setBrands] = useState<BrandCount[]>([]);
  const [sizes, setSizes] = useState<SizeCount[]>([]);
  const [meats, setMeats] = useState<MeatCount[]>([]);
  const [dishes, setDishes] = useState<DishCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState('');
  const reqId = useRef(0);

  useEffect(() => {
    const h = window.setTimeout(() => setQuery(typed.trim()), 450);
    return () => window.clearTimeout(h);
  }, [typed]);

  useEffect(() => { writeJson(WHERE_KEY, where); }, [where]);
  useEffect(() => { if (isGas) writeJson(GAS_KEY, gf); }, [isGas, gf]);
  useEffect(() => { if (!isGas) writeJson(FOOD_KEY, ff); }, [isGas, ff]);

  const load = useCallback(async (offset: number) => {
    const id = ++reqId.current;
    if (offset === 0) { setLoading(true); setErr(''); } else { setLoadingMore(true); }
    const r = await listPlaces({
      region: where.region || null, town: where.town || null, area: where.area || null,
      kind: isGas ? 'gas' : (ff.kind || 'food'),
      query, gasToday: isGas && gasToday, limit: PAGE, offset,
      brand: isGas ? gf.brand || null : null, size: isGas ? gf.size : null,
      meat: isGas ? null : ff.meat || null, dish: isGas ? null : ff.dish || null,
    });
    if (id !== reqId.current) return;
    if (r.ok) {
      setRows((prev) => (offset === 0 ? r.rows : prev.concat(r.rows)));
      setTotal(r.total);
      if (offset === 0) {
        setAreas(r.areas || []);
        setTowns(r.towns || []);
        setBrands(r.brands || []);
        setSizes(r.sizes || []);
        setMeats(r.meats || []);
        setDishes(r.dishes || []);
      }
    } else if (offset === 0) {
      setRows([]);
      setTotal(0);
      setErr(r.reason === 'network' ? t('loadError') : reasonText(lang, r.reason));
    }
    setLoading(false);
    setLoadingMore(false);
    // t and lang only change the error wording; the list itself does not depend on them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGas, where.region, where.town, where.area, gf.brand, gf.size, ff.kind, ff.meat, ff.dish, query, gasToday]);

  useEffect(() => { void load(0); }, [load]);

  const shown = openNow ? rows.filter((r) => openState(r.open_days, r.opens_at, r.closes_at) === 'open') : rows;

  // FIX792: the neighbourhoods of the chosen town: the launch list (Up Station, Mimboman...), then any others owners typed
  const areaChips: Array<{ key: string; label: string; n: number | null }> = [];
  if (where.town) {
    const inTown = areas.filter((x) => !x.town || foldTown(x.town) === foldTown(where.town));
    for (const a of launchAreasOf(where.region, where.town)) {
      const hit = inTown.filter((x) => x.area === a.key);
      areaChips.push({ key: a.key, label: a.label, n: hit.length ? hit[0].n : null });
    }
    for (const x of inTown) {
      if (!areaChips.some((c) => c.key === x.area)) areaChips.push({ key: x.area, label: x.area_label, n: x.n });
    }
    if (where.area && !areaChips.some((c) => c.key === where.area)) areaChips.push({ key: where.area, label: where.area.replace(/_/g, ' '), n: 0 });
  }

  // FIX792: the towns - those with businesses first (with how many), then the region's other towns
  const townOpts: Array<{ town: string; n: number | null }> = [];
  const addTown = (town: string, n: number | null) => {
    if (town && !townOpts.some((x) => foldTown(x.town) === foldTown(town))) townOpts.push({ town, n });
  };
  towns.filter((x) => !where.region || x.region === where.region).forEach((x) => addTown(x.town, x.n));
  if (where.region) townsOf('CM', where.region).forEach((x) => addTown(x, null));
  else LAUNCH_AREAS.forEach((x) => addTown(townOfCity(x.city, x.area.key), null));
  if (where.town) addTown(where.town, null);
  const pickTown = (town: string) => {
    if (!town) { setWhere({ region: where.region, town: '', area: '' }); return; }
    const r = where.region ? null : findRegion('CM', (towns.filter((x) => foldTown(x.town) === foldTown(town))[0] || { region: '' }).region);
    setWhere({ region: where.region || (r ? r.key : ''), town, area: '' });
  };

  // gas: the five brands, then any brand sellers typed; the sizes in stock and the usual ones
  const brandChips: Array<{ value: string; label: string; n: number | null }> = GAS_BRANDS.map((b) => {
    const hit = brands.filter((x) => x.brand === b);
    return { value: b, label: b, n: hit.length ? hit[0].n : null };
  });
  for (const x of brands) {
    if (x.brand === 'OTHER' && x.label) brandChips.push({ value: x.label, label: x.label, n: x.n });
  }
  if (gf.brand && !brandChips.some((c) => foldDish(c.value) === foldDish(gf.brand))) brandChips.push({ value: gf.brand, label: gf.brand, n: 0 });
  const sizeSet: number[] = [];
  for (const s of SIZE_PICKS.concat(sizes.map((x) => Number(x.size_kg)))) if (isFinite(s) && sizeSet.indexOf(s) < 0) sizeSet.push(s);
  if (gf.size !== null && sizeSet.indexOf(gf.size) < 0) sizeSet.push(gf.size);
  sizeSet.sort((a, b) => a - b);
  const sizeCount = (s: number): number | null => {
    const hit = sizes.filter((x) => Number(x.size_kg) === s);
    return hit.length ? hit[0].n : null;
  };

  // food: dishes the businesses here cook first (with counts), then the usual local dishes
  const dishChips: Array<{ label: string; n: number | null }> = dishes.map((d) => ({ label: d.dish, n: d.n }));
  for (const d of DISH_PICKS) if (!dishChips.some((c) => foldDish(c.label) === foldDish(d))) dishChips.push({ label: d, n: null });
  if (ff.dish && !dishChips.some((c) => foldDish(c.label) === foldDish(ff.dish))) dishChips.unshift({ label: ff.dish, n: 0 });
  const meatCount = (m: Meat): number | null => {
    const hit = meats.filter((x) => x.meat === m);
    return hit.length ? hit[0].n : null;
  };

  const sectionOn = isGas ? !!(gf.brand || gf.size !== null || gasToday) : !!(ff.kind || ff.meat || ff.dish);
  const filtersOn = !!(where.region || where.town || where.area || query || openNow || sectionOn);
  const setRegion = (r: string) => setWhere({ region: isRegionKey(r) ? r : '', town: '', area: '' });
  const clearAll = () => {
    setWhere(NOWHERE);
    if (isGas) setGf({ brand: '', size: null }); else setFf({ kind: '', meat: '', dish: '' });
    setTyped(''); setQuery(''); setGasToday(false); setOpenNow(false);
  };
  const countLine = (n: number): string => (n === 1 ? t('countOne') : t('countPlaces', { n }));

  return (
    <div dir={dir} data-fix="FIX792" data-section={section} className="min-h-screen bg-gray-50 pb-24">
      <header className={'bg-gradient-to-br px-4 pb-5 pt-6 text-white ' + (isGas ? 'from-red-600 via-orange-600 to-amber-500' : 'from-amber-500 via-orange-500 to-rose-500')}>
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{t(isGas ? 'gasTitle' : 'foodTitle')}</h1>
          <p className="mt-1 text-sm text-orange-50">{t(isGas ? 'gasSubtitle' : 'foodSubtitle')}</p>
          <form
            className="mt-4 flex overflow-hidden rounded-xl bg-white shadow-lg"
            onSubmit={(e) => { e.preventDefault(); setQuery(typed.trim()); }}
          >
            <Search className="ms-3 mt-3 h-5 w-5 flex-shrink-0 text-gray-400" />
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t(isGas ? 'gasSearchPh' : 'foodSearchPh')}
              aria-label={t(isGas ? 'gasSearchPh' : 'foodSearchPh')}
              maxLength={60}
              className="min-w-0 flex-1 px-3 py-3 text-sm text-gray-900 outline-none"
            />
            <button type="submit" className="bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700">{t('searchBtn')}</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate('/food-gas/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-sm font-bold text-orange-700 shadow hover:bg-white">
              <Plus className="h-4 w-4" />{t('addBusiness')}
            </button>
            {user && (
              <button type="button" onClick={() => navigate('/food-gas/mine')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 px-3 py-2 text-sm font-bold text-white hover:bg-white/10">
                <Store className="h-4 w-4" />{t('myBusinesses')}
              </button>
            )}
            <button type="button" data-go={isGas ? 'food' : 'gas'} onClick={() => navigate(isGas ? '/food-gas/food' : '/food-gas/gas')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 px-3 py-2 text-sm font-bold text-white hover:bg-white/10">
              {isGas ? <UtensilsCrossed className="h-4 w-4" /> : <Flame className="h-4 w-4" />}{t(isGas ? 'navFood' : 'navGas')}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4">
        {isGas && <GasTodayCard onChanged={() => void load(0)} />}
        {isGas ? (
          <>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3" role="tablist" aria-label={t('colBrand')} data-row="brands">
              <button type="button" role="tab" aria-selected={!gf.brand} onClick={() => setGf({ ...gf, brand: '' })} className={chipCls(!gf.brand, 'red')}>
                {t('allBrands')}
              </button>
              {brandChips.map((c) => {
                const on = !!gf.brand && foldDish(gf.brand) === foldDish(c.value);
                return (
                  <button key={c.value} type="button" role="tab" aria-selected={on} data-brand={c.value}
                    onClick={() => setGf({ ...gf, brand: on ? '' : c.value })} className={chipCls(on, 'red')}>
                    {c.label}{c.n ? ' (' + c.n + ')' : ''}
                  </button>
                );
              })}
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3" data-row="sizes">
              <button type="button" aria-pressed={gf.size === null} onClick={() => setGf({ ...gf, size: null })} className={chipCls(gf.size === null, 'dark')}>
                {t('allSizes')}
              </button>
              {sizeSet.map((s) => {
                const on = gf.size === s;
                const n = sizeCount(s);
                return (
                  <button key={s} type="button" aria-pressed={on} data-size={s} onClick={() => setGf({ ...gf, size: on ? null : s })} className={chipCls(on, 'dark')}>
                    {sizeText(lang, s)}{n ? ' (' + n + ')' : ''}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3" role="tablist" data-row="kinds">
              {(['', ...FOOD_SECTION_KINDS] as Array<FoodKind | ''>).map((k) => {
                const on = ff.kind === k;
                const KI = k ? KIND_ICON[k] : UtensilsCrossed;
                return (
                  <button key={k || 'all'} type="button" role="tab" aria-selected={on} onClick={() => setFf({ ...ff, kind: k })}
                    className={'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ' +
                      (on ? 'bg-orange-600 text-white shadow' : 'border border-gray-200 bg-white text-gray-700 hover:border-orange-300')}>
                    <KI className="h-4 w-4" />{k ? kindLabel(lang, k, true) : t('kFood')}
                  </button>
                );
              })}
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2" data-row="meats" aria-label={t('meatsTitle')}>
              <button type="button" aria-pressed={!ff.meat} onClick={() => setFf({ ...ff, meat: '' })} className={chipCls(!ff.meat, 'amber')}>
                {t('meatsTitle')}
              </button>
              {MEATS.map((m) => {
                const on = ff.meat === m;
                const n = meatCount(m);
                return (
                  <button key={m} type="button" aria-pressed={on} data-meat={m} onClick={() => setFf({ ...ff, meat: on ? '' : m })} className={chipCls(on, 'amber')}>
                    {meatLabel(lang, m)}{n ? ' (' + n + ')' : ''}
                  </button>
                );
              })}
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3" data-row="dishes" aria-label={t('dishFilter')}>
              {dishChips.map((c) => {
                const on = !!ff.dish && foldDish(ff.dish) === foldDish(c.label);
                return (
                  <button key={c.label} type="button" aria-pressed={on} data-dish={c.label} onClick={() => setFf({ ...ff, dish: on ? '' : c.label })} className={chipCls(on, 'dark')}>
                    {c.label}{c.n ? ' (' + c.n + ')' : ''}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-2 sm:max-w-md" data-row="where">
          <label className="text-xs font-bold text-gray-600">
            {t('region')}
            <select value={where.region} onChange={(e) => setRegion(e.target.value)} data-filter="region"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm font-semibold text-gray-800">
              <option value="">{t('allRegions')}</option>
              {regionsOf('CM').map((r) => <option key={r.key} value={r.key}>{placeRegionLabel(r, lang)}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-gray-600">
            {t('town')}
            <select value={where.town} onChange={(e) => pickTown(e.target.value)} data-filter="town"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm font-semibold text-gray-800">
              <option value="">{t('allTowns')}</option>
              {townOpts.map((x) => <option key={x.town} value={x.town}>{x.town}{x.n ? ' (' + x.n + ')' : ''}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isGas && (
            <button type="button" aria-pressed={gasToday} onClick={() => setGasToday(!gasToday)}
              className={'rounded-xl px-3 py-2 text-sm font-bold ' + (gasToday ? 'bg-green-600 text-white' : 'border border-gray-200 bg-white text-gray-700')}>
              {t('gasTodayFilter')}
            </button>
          )}
          <button type="button" aria-pressed={openNow} onClick={() => setOpenNow(!openNow)}
            className={'rounded-xl px-3 py-2 text-sm font-bold ' + (openNow ? 'bg-teal-600 text-white' : 'border border-gray-200 bg-white text-gray-700')}>
            {t('openNowFilter')}
          </button>
          {filtersOn && (
            <button type="button" onClick={clearAll} className="px-2 py-2 text-sm font-semibold text-orange-700 underline">
              {t('clearFilters')}
            </button>
          )}
        </div>

        {!where.town && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">{t('startHere')}</p>
            <div className="flex flex-wrap gap-2">
              {LAUNCH_AREAS.map(({ city, area }) => (
                <button key={city + area.key} type="button" onClick={() => setWhere({ region: regionOfCity(city), town: townOfCity(city, area.key), area: area.key })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-800 hover:bg-orange-100">
                  <MapPin className="h-4 w-4" />{area.label} {'\u00b7'} {cityLabel(city, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {where.town && (
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" data-row="areas">
            <button type="button" onClick={() => setWhere({ ...where, area: '' })} className={chipCls(where.area === '', 'dark')}>
              {t('allAreas')}
            </button>
            {areaChips.map((a) => (
              <button key={a.key} type="button" onClick={() => setWhere({ ...where, area: a.key })} className={chipCls(where.area === a.key, 'dark')}>
                {a.label}{a.n !== null ? ' (' + a.n + ')' : ''}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600" data-count="1">
            {loading ? t('loading') : countLine(openNow ? shown.length : total)}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
        ) : err ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
            <p className="text-sm font-semibold text-red-700">{err}</p>
            <button type="button" onClick={() => void load(0)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">
              <RefreshCw className="h-4 w-4" />{t('retry')}
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center">
            <Store className="mx-auto h-10 w-10 text-orange-300" />
            <h2 className="mt-3 text-lg font-extrabold text-gray-900">{t('emptyTitle')}</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{t('emptyBody')}</p>
            <button type="button" onClick={() => navigate('/food-gas/new')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700">
              <Plus className="h-4 w-4" />{t('addBusiness')}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <PlaceCard key={p.id} p={p} lang={lang} t={t} section={section} onOpen={() => navigate('/food-gas/place/' + p.id)} />
              ))}
            </div>
            {rows.length < total && (
              <div className="mt-6 flex justify-center">
                <button type="button" disabled={loadingMore} onClick={() => void load(rows.length)}
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-bold text-orange-700 disabled:opacity-50">
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

export default function FoodGasPage() {
  const { pathname } = useLocation();
  const section: Section | 'hub' = /\/food-gas\/gas\/?$/.test(pathname) ? 'gas' : /\/food-gas\/food\/?$/.test(pathname) ? 'food' : 'hub';
  if (section === 'hub') return <Hub />;
  return <ListView key={section} section={section} />;
}
// BAMBEH_END_TOKEN__FOOD_GAS_PAGE_FIX792__COMPLETE
