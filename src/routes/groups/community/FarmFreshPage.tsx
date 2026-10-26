// BAMBEH_DEPLOY_TOKEN__FARMFRESHPAGE_FIX866_CLEAN
/**
 * src/routes/groups/community/FarmFreshPage.tsx - Bambeh Marketplace (route /farm-fresh)
 *
 * FIX866 (replaces FIX405/FIX857) - FARM FRESH, REBUILT (Big, 19 Oct 2026: "please fix this and make it fully
 * functional and beautiful"; 25 Oct: one job per screen, photo first, room to breathe).
 *   - This screen has one job: find produce. Each product is its photo with the market price tag on it, its name and
 *     its town - nothing else. The farmer, organic, delivery, reviews and buying are on the product page (FIX867).
 *   - Search (produce, farmer, town) and the categories the seller page uses, in the five app languages. A slow
 *     answer to an old search never replaces the answer to the newest one.
 *   - Read through bambeh_farm_products() (FIX861): no phone number ever reaches this page.
 *   - Farmers: "Sell your harvest" at the top and at the end.
 *   - Colours are the app's theme classes, so the coming Bambeh palette reaches this page with one theme change.
 * Five languages (FIX863), right-to-left for Arabic. (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, Search, ShoppingBasket, Sprout, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/hooks/useAppLang';
import { FARM_CATEGORIES, FARM_STR, categoryLabel, farmFill, farmLang } from '@/features/farm/farmText';
import type { FarmKey } from '@/features/farm/farmText';
import { fetchFarmProducts } from '@/features/farm/farmApi';
import type { FarmCard } from '@/features/farm/farmApi';
import { FarmPhoto, PriceTag } from '@/features/farm/farmUi';

export default function FarmFreshPage() {
  const navigate = useNavigate();
  const lang = farmLang(useLang());
  const t = FARM_STR[lang];
  const w = (k: FarmKey) => t[k];
  const rtl = lang === 'ar';
  const { items: cartItems } = useCart();

  const [items, setItems] = useState<FarmCard[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [typed, setTyped] = useState('');
  const alive = useRef(true);
  const asked = useRef(0);

  const load = useCallback(async () => {
    const mine = ++asked.current;
    setFailed(false);
    const r = await fetchFarmProducts({ category, q: query });
    if (!alive.current || mine !== asked.current) return; // an older search answered late: keep the newest
    if (r.ok) setItems(r.items);
    else { setFailed(true); setItems((prev) => prev ?? []); }
  }, [category, query]);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { void load(); }, [load]);

  // a farmer posting new produce shows up without a refresh
  useEffect(() => {
    const ch = supabase.channel('farm_products_fix866')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'farm_products' }, () => { void load(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // search as you type, without asking the database at every letter
  useEffect(() => {
    const id = window.setTimeout(() => setQuery(typed.trim()), 350);
    return () => window.clearTimeout(id);
  }, [typed]);

  const cartCount = (cartItems || []).reduce((n: number, i: { quantity?: number }) => n + (Number(i.quantity) || 0), 0);
  const filtered = !!query || category !== 'All';
  const resetAll = () => { setTyped(''); setQuery(''); setCategory('All'); };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX866" translate="no">
      <header className="px-4 pb-2 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Sprout className="h-6 w-6 shrink-0 text-teal-800" aria-hidden="true" />
            <span className="break-words">{w('title')}</span>
          </h1>
          <button type="button" onClick={() => navigate('/farm-fresh/sell')} data-go="sell"
                  className="shrink-0 rounded-full border border-teal-800 px-3.5 py-1.5 text-xs font-bold text-teal-800">
            {w('sell')}
          </button>
        </div>

        <label className="relative mt-5 block">
          <span className="sr-only">{w('search')}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input value={typed} onChange={(e) => setTyped(e.target.value.slice(0, 60))} placeholder={w('search')}
                 className="w-full rounded-full border border-gray-200 bg-white py-3 pe-11 ps-11 text-[15px] outline-none placeholder:text-gray-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/15"
                 enterKeyHint="search" data-search="1" />
          {typed ? (
            <button type="button" onClick={() => { setTyped(''); setQuery(''); }} aria-label={w('clearSearch')}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <div className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label={w('title')}>
          {FARM_CATEGORIES.map((c) => {
            const on = category === c.value;
            return (
              <button key={c.value} type="button" role="tab" aria-selected={on} onClick={() => setCategory(c.value)} data-cat={c.value}
                      className={'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs '
                        + (on ? 'border-teal-800 bg-teal-50 font-bold text-teal-900' : 'border-gray-200 bg-white font-medium text-gray-600')}>
                {c.label[lang]}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-4 pt-3">
        {failed ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700"
               role="alert" data-load-error="1">
            <span>{w('loadErr')}</span>
            <button type="button" onClick={() => { void load(); }} className="flex shrink-0 items-center gap-1 font-bold">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> {w('retry')}
            </button>
          </div>
        ) : null}

        {items === null ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" data-loading="1">
            <span className="sr-only">{w('loading')}</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
                <div className="mt-2.5 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-14 text-center" data-empty="1">
            <Sprout className="mx-auto h-12 w-12 text-teal-800" aria-hidden="true" />
            <p className="mt-3 text-lg font-extrabold">
              {filtered ? farmFill(w('noMatch'), { q: query || categoryLabel(category, lang) }) : w('emptyTitle')}
            </p>
            {filtered ? (
              <button type="button" onClick={resetAll} className="mt-4 text-sm font-bold text-teal-800 underline">{w('showAll')}</button>
            ) : (
              <>
                <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">{w('emptyBody')}</p>
                <button type="button" onClick={() => navigate('/farm-fresh/sell')}
                        className="mt-6 rounded-full bg-teal-800 px-6 py-3 text-sm font-bold text-white">
                  {w('sell')}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-medium text-gray-500" data-count={items.length}>
              {items.length === 1 ? w('oneProduct') : farmFill(w('manyProducts'), { n: items.length })}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4" data-grid="1">
              {items.map((p, i) => (
                <li key={p.id} data-product={p.id}>
                  <button type="button" onClick={() => navigate('/farm-fresh/' + p.id)} className="block w-full text-start" aria-label={p.title}>
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                      <FarmPhoto src={p.image} alt={p.title} category={p.category} lang={lang} eager={i < 4} />
                      {p.sold_out ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800" data-sold-out="1">{w('soldOut')}</span>
                        </div>
                      ) : null}
                      <span className="absolute bottom-2 start-2"><PriceTag price={p.price} unit={p.unit} lang={lang} /></span>
                    </div>
                    <h3 className="mt-2.5 line-clamp-1 text-[15px] font-semibold leading-snug">{p.title}</h3>
                    {p.location ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" /> <span className="truncate">{p.location}</span>
                      </p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>

            <section className="mt-12 rounded-3xl bg-teal-50 px-5 py-6" data-farmer-cta="1">
              <p className="text-lg font-extrabold text-teal-900">{w('ctaTitle')}</p>
              <p className="mt-1 max-w-md text-sm text-gray-600">{w('ctaBody')}</p>
              <button type="button" onClick={() => navigate('/farm-fresh/sell')}
                      className="mt-4 rounded-full border border-teal-800 bg-white px-4 py-2 text-sm font-bold text-teal-800">
                {w('sell')}
              </button>
            </section>
          </>
        )}
      </main>

      {cartCount > 0 ? (
        <button type="button" onClick={() => navigate('/cart')} data-cart-floater="1"
                className="fixed bottom-24 end-4 z-40 flex items-center gap-2 rounded-full border border-teal-800 bg-white px-4 py-3 text-sm font-bold text-teal-800 shadow-lg">
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" /> {farmFill(w('cart'), { n: cartCount })}
        </button>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__FARMFRESHPAGE_FIX866__COMPLETE
