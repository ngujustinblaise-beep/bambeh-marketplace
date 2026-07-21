// BAMBEH_DEPLOY_TOKEN__CORPORATEDASHBOARD_FIX156_ACTIONS_CLEAN
/**
 * CorporateDashboard.tsx — Bambeh Corporate owner dashboard (FIX119)
 * FILE LOCATION: src/features/corporate/CorporateDashboard.tsx
 * ROUTE: /corporate/dashboard   (AuthGate require="user")
 *
 * The manager's cockpit. REAL data only:
 *  • Shows the user's store(s) + verification status.
 *  • Products tab: list + add product (real insert into corporate_products,
 *    with retail + bulk price + MOQ + unit + wholesale flag).
 *  • Quotes tab: incoming corporate_quotes for the store.
 *  • "View public storefront" link.
 *  • 5 languages + RTL.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Loader2, AlertCircle, ShieldCheck, Plus, X,
  Settings, UploadCloud, // FIX149
  BarChart3, LifeBuoy, Trash2, // FIX156
  Package, FileText, ExternalLink, Store, Tag, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import {
  corpStrings, fmtXAF, fetchMyStores, fetchStoreProducts,
  type CorporateStore, type CorporateProduct, type CorporateQuote,
} from './lib';
import CorporateLogo from './CorporateLogo'; // FIX144

type Tab = 'products' | 'quotes';

export default function CorporateDashboard() {
  const navigate = useNavigate();
  const { s, isRtl } = corpStrings(useLang() as string);

  const [store, setStore] = useState<CorporateStore | null>(null);
  const [products, setProducts] = useState<CorporateProduct[]>([]);
  const [quotes, setQuotes] = useState<CorporateQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>('products');
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const mine = await fetchMyStores(uid);
      if (mine.length === 0) { setStore(null); setLoading(false); return; }
      const st = mine[0];
      setStore(st);
      const [prods, { data: qs }] = await Promise.all([
        fetchStoreProducts(st.id),
        supabase.from('corporate_quotes').select('*').eq('store_id', st.id).order('created_at', { ascending: false }),
      ]);
      setProducts(prods);
      setQuotes((qs ?? []) as CorporateQuote[]);
    } catch (e) {
      console.error('[CorporateDashboard] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Building2 className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{s.noStores}</p>
        <button onClick={() => navigate('/corporate/register')} className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 text-sm font-bold">{s.registerCta}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        {/* FIX144: clickable logo -> corporate home */}
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate('/corporate')} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {s.back}
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl font-bold truncate">{store.trading_name || store.registered_name}</h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {store.verified ? (
            <span className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {s.verified}
            </span>
          ) : (
            <span className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-amber-500/20 text-amber-300">{s.pending}</span>
          )}
          <button onClick={() => navigate(`/corporate/store/${store.slug ?? store.id}`)} className="text-[11px] text-slate-300 underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> {s.tabAbout}
          </button>
        </div>
      </div>

      {/* FIX156: owner quick actions (2x3 grid) */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        <button onClick={() => navigate('/corporate/bulk-upload')}
          className="bg-white border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <UploadCloud className="w-4 h-4 text-teal-600" /> {s.dashProducts}
        </button>
        <button onClick={() => navigate('/corporate/analytics')}
          className="bg-white border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <BarChart3 className="w-4 h-4 text-indigo-600" /> {s.dashQuotes}
        </button>
        <button onClick={() => navigate('/corporate/settings')}
          className="bg-white border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <Settings className="w-4 h-4 text-slate-500" /> {s.tabAbout}
        </button>
        <button onClick={() => navigate('/corporate/support')}
          className="bg-white border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <LifeBuoy className="w-4 h-4 text-amber-500" /> Support
        </button>
        <button onClick={() => navigate('/corporate/trash')}
          className="bg-white border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
          <Trash2 className="w-4 h-4 text-slate-400" /> Trash
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 border-b border-gray-200">
          {([['products', `${s.dashProducts} (${products.length})`], ['quotes', `${s.dashQuotes} (${quotes.length})`]] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`pb-2 px-1 text-sm font-semibold border-b-2 -mb-px ${tab === k ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {loadError ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{s.loadError}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold">{s.retry}</button>
          </div>
        ) : tab === 'products' ? (
          <>
            <button onClick={() => setShowAdd(true)} className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 mb-3">
              <Plus className="w-4 h-4" /> {s.addProduct}
            </button>
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{s.noProducts}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border p-3 flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                      {Array.isArray(p.images) && p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Tag className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500">
                        {p.retail_price_xaf != null ? fmtXAF(p.retail_price_xaf) : ''}
                        {p.bulk_price_xaf != null ? ` · ${s.bulkPrice} ${fmtXAF(p.bulk_price_xaf)}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          quotes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{s.noQuotes}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quotes.map((q) => (
                <div key={q.id} className="bg-white rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{q.quantity}{q.unit ? ` ${q.unit}` : ''}</p>
                    <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-700">{q.status}</span>
                  </div>
                  {q.delivery_location ? <p className="text-xs text-gray-500 mt-0.5">{q.delivery_location}</p> : null}
                  {q.notes ? <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{q.notes}</p> : null}
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(q.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showAdd ? (
        <AddProductForm
          storeId={store.id}
          s={s}
          isRtl={isRtl}
          onClose={() => setShowAdd(false)}
          onAdded={(prod) => { setProducts((xs) => [prod, ...xs]); setShowAdd(false); flash(s.addProduct); }}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}

// -------- real add-product form → corporate_products --------
function AddProductForm({
  storeId, s, isRtl, onClose, onAdded,
}: {
  storeId: string; s: ReturnType<typeof corpStrings>['s']; isRtl: boolean;
  onClose: () => void; onAdded: (p: CorporateProduct) => void;
}) {
  const [title, setTitle] = useState('');
  const [retail, setRetail] = useState('');
  const [bulk, setBulk] = useState('');
  const [moq, setMoq] = useState('');
  const [unit, setUnit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [wholesale, setWholesale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (!title.trim()) { setError(s.reqField); return; }
    setBusy(true);
    try {
      const { data, error: insErr } = await supabase
        .from('corporate_products')
        .insert({
          store_id: storeId,
          title: title.trim(),
          retail_price_xaf: retail ? Number(retail.replace(/[^\d]/g, '')) : null,
          bulk_price_xaf: bulk ? Number(bulk.replace(/[^\d]/g, '')) : null,
          bulk_min_qty: moq ? parseInt(moq.replace(/[^\d]/g, ''), 10) : null,
          unit: unit.trim() || null,
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
          is_wholesale: wholesale,
          store_type: 'corporate',
          in_stock: true,
          status: 'active',
        })
        .select('*')
        .single();
      if (insErr) throw insErr;
      onAdded(data as CorporateProduct);
    } catch (e) {
      console.error('[AddProductForm] save failed:', e);
      setError((e as { message?: string })?.message || s.reqField);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[60] p-4" dir={isRtl ? 'rtl' : 'ltr'} onClick={() => !busy && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5"><Store className="w-5 h-5 text-slate-700" /> {s.addProduct}</h3>
          <button onClick={() => !busy && onClose()}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {error ? <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p> : null}

        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={s.dashProducts} className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={retail} onChange={(e) => setRetail(e.target.value)} placeholder={s.retailPrice} className={inputCls} />
            <input value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={s.bulkPrice} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={moq} onChange={(e) => setMoq(e.target.value)} placeholder={s.moq} className={inputCls} />
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unit / box / ton" className={inputCls} />
          </div>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (https://…)" className={inputCls} />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={wholesale} onChange={(e) => setWholesale(e.target.checked)} /> {s.tabBulk}
          </label>
        </div>

        <button onClick={save} disabled={busy} className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {s.submitting}</>) : (<><CheckCircle2 className="w-4 h-4" /> {s.addProduct}</>)}
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEDASHBOARD_FIX156__COMPLETE
