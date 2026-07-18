// BAMBEH_DEPLOY_TOKEN__CORPORATEPAGE_FIX119_CLEAN
/**
 * CorporatePage.tsx — Bambeh Corporate directory / landing (FIX119)
 * FILE LOCATION: src/features/corporate/CorporatePage.tsx  (REPLACES the existing routed page)
 *
 * The public entry point at /corporate. REAL data — no mocks:
 *  • Three category tabs (Corporate Shopping / Professional Services / Infrastructure).
 *  • Live grid of verified, active enterprises from `corporate_stores`.
 *  • Search box (filters by name/city).
 *  • "Register your Enterprise" CTA → /corporate/register.
 *  • "My Corporate Dashboard" appears if the signed-in user owns/manages a store.
 *  • Tapping a store → /corporate/store/:slug storefront.
 *  • 5 languages + RTL.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Store, Briefcase, Truck, ShieldCheck, Search, Loader2,
  AlertCircle, Plus, LayoutDashboard, ChevronRight, Star, MapPin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import {
  corpStrings, fetchActiveStores, fetchMyStores,
  type CorpCategory, type CorporateStore,
} from './lib';

const CATEGORIES: { key: CorpCategory; icon: React.ComponentType<{ className?: string }>; }[] = [
  { key: 'shopping',       icon: Store },
  { key: 'services',       icon: Briefcase },
  { key: 'infrastructure', icon: Truck },
];

export default function CorporatePage() {
  const navigate = useNavigate();
  const { s, isRtl } = corpStrings(useLang() as string);

  const [category, setCategory] = useState<CorpCategory>('shopping');
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<CorporateStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasStore, setHasStore] = useState(false);

  const catLabel = (k: CorpCategory) =>
    k === 'shopping' ? s.catShopping : k === 'services' ? s.catServices : s.catInfra;
  const catSub = (k: CorpCategory) =>
    k === 'shopping' ? s.subShopping : k === 'services' ? s.subServices : s.subInfra;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const rows = await fetchActiveStores(category, search);
      setStores(rows);
    } catch (e) {
      console.error('[CorporatePage] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { setHasStore(false); return; }
      try {
        const mine = await fetchMyStores(uid);
        setHasStore(mine.length > 0);
      } catch { setHasStore(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold">{s.corporate}</h1>
        </div>
        <p className="text-slate-300 text-sm">{s.tagline}</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate('/corporate/register')}
            className="flex-1 bg-amber-500 text-slate-900 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> {s.registerCta}
          </button>
          {hasStore ? (
            <button
              onClick={() => navigate('/corporate/dashboard')}
              className="px-4 bg-white/10 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" /> {s.myStore}
            </button>
          ) : null}
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border p-2 grid grid-cols-3 gap-1">
          {CATEGORIES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`py-2.5 rounded-xl text-center transition-colors ${
                category === key ? 'bg-slate-800 text-white' : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-[11px] font-semibold leading-tight block">{catLabel(key)}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">{catSub(category)}</p>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={s.searchStores}
            className={`w-full bg-white border border-gray-200 rounded-xl py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
          />
        </div>
      </div>

      {/* Store grid */}
      <div className="px-4 mt-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> {s.browseStores}
        </h2>

        {loading && <div className="flex justify-center py-16 text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && loadError && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{s.loadError}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold">{s.retry}</button>
          </div>
        )}

        {!loading && !loadError && stores.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{s.noStores}</p>
            <button
              onClick={() => navigate('/corporate/register')}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-900 text-sm font-bold"
            >
              {s.registerCta}
            </button>
          </div>
        )}

        {!loading && !loadError && stores.length > 0 && (
          <div className="space-y-3">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => navigate(`/corporate/store/${store.slug ?? store.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="h-20 bg-gradient-to-r from-slate-200 to-slate-300 relative">
                  {store.banner_url ? (
                    <img src={store.banner_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <div className="p-3 flex gap-3 items-start -mt-8">
                  <div className="w-14 h-14 rounded-xl bg-white border shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
                    {store.logo_url
                      ? <img src={store.logo_url} alt={store.registered_name} className="w-full h-full object-cover" loading="lazy" />
                      : <Store className="w-6 h-6 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-6">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {store.trading_name || store.registered_name}
                      </h3>
                      {store.verified ? <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> : null}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      {store.rating ? (
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {store.rating}</span>
                      ) : null}
                      {store.city ? <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {store.city}</span> : null}
                    </div>
                    {store.audience !== 'b2c' ? (
                      <span className="inline-block mt-1 text-[9px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-700">
                        {s.b2bPortal}
                      </span>
                    ) : null}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 mt-8 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEPAGE__COMPLETE
