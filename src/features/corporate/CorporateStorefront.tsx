// BAMBEH_DEPLOY_TOKEN__CORPORATESTOREFRONT_FIX119_CLEAN
/**
 * CorporateStorefront.tsx — Bambeh Corporate storefront (FIX119)
 * FILE LOCATION: src/features/corporate/CorporateStorefront.tsx
 * ROUTE: /corporate/store/:key   (key = slug or id)
 *
 * The public enterprise profile from the blueprint. REAL data:
 *  • Header & trust block: logo, name, verified shield (tap → modal), sector, rating.
 *  • Dynamic B2B Action Panel (only for b2b/hybrid): MOQ/min-order banner,
 *    [Request Corporate Quote] (real form → corporate_quotes) + [Chat with Sales].
 *  • Tabs: All Products · Wholesale/Bulk · About Us (real RCCM/NIU legal block).
 *  • Bulk cards show a live quantity counter that recalculates the bulk unit price.
 *  • 5 languages + RTL.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, ShieldCheck, ArrowLeft, Loader2, AlertCircle, Star, MapPin,
  MessageSquare, FileText, X, Store, Tag, Minus, Plus, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import {
  corpStrings, fmtXAF, fetchStoreBySlugOrId, fetchStoreProducts, submitQuote,
  type CorporateStore, type CorporateProduct,
} from './lib';

type Tab = 'all' | 'bulk' | 'about';

export default function CorporateStorefront() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { s, isRtl } = corpStrings(useLang() as string);

  const [store, setStore] = useState<CorporateStore | null>(null);
  const [products, setProducts] = useState<CorporateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [showVerify, setShowVerify] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<CorporateProduct | null>(null);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setLoadError(false);
    try {
      const st = await fetchStoreBySlugOrId(key);
      if (!st) { setStore(null); setLoading(false); return; }
      setStore(st);
      const prods = await fetchStoreProducts(st.id);
      setProducts(prods);
    } catch (e) {
      console.error('[CorporateStorefront] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  const isB2B = !!store && (store.audience === 'b2b' || store.audience === 'hybrid');
  const bulkProducts = useMemo(() => products.filter(p => p.is_wholesale || p.bulk_price_xaf != null), [products]);
  const shown = tab === 'bulk' ? bulkProducts : products;

  const openQuote = (p?: CorporateProduct) => { setQuoteProduct(p ?? null); setShowQuote(true); };

  const chatSales = async () => {
    if (!store) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { navigate('/login'); return; }
    // route into the existing chat with the store owner as the counterparty
    navigate(`/chat?userId=${store.owner_id}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (loadError || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p className="text-sm text-gray-600 mb-4">{s.loadError}</p>
        <button onClick={() => navigate('/corporate')} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold">{s.back}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-900 relative">
        {store.banner_url ? <img src={store.banner_url} alt="" className="w-full h-full object-cover" /> : null}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-black/30 text-white p-2 rounded-xl">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Header & trust */}
      <div className="px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 rounded-xl bg-gray-100 border shrink-0 overflow-hidden flex items-center justify-center -mt-8 bg-white">
              {store.logo_url
                ? <img src={store.logo_url} alt={store.registered_name} className="w-full h-full object-cover" />
                : <Store className="w-7 h-7 text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-gray-900 truncate">{store.trading_name || store.registered_name}</h1>
                {store.verified ? (
                  <button onClick={() => setShowVerify(true)} aria-label={s.verified}>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">{s.pending}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                {store.rating ? <span className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {store.rating} ({store.order_count ?? 0})</span> : null}
                {store.city ? <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5" /> {store.city}</span> : null}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {s.sector}: {store.category === 'shopping' ? s.catShopping : store.category === 'services' ? s.catServices : s.catInfra}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification-pending banner */}
      {!store.verified ? (
        <div className="px-4 mt-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {s.verifyBanner}
          </div>
        </div>
      ) : null}

      {/* B2B Action Panel */}
      {isB2B ? (
        <div className="px-4 mt-3">
          <div className="bg-slate-800 text-white rounded-2xl p-4">
            <p className="font-bold text-sm flex items-center gap-1.5"><FileText className="w-4 h-4 text-amber-400" /> {s.b2bPortal}</p>
            <p className="text-xs text-slate-300 mt-1">{s.acceptsBulk}</p>
            {(store.moq_text || store.min_order_value_xaf) ? (
              <div className="mt-2 bg-white/10 rounded-lg px-3 py-1.5 text-xs">
                {s.minOrder}: {store.moq_text || fmtXAF(store.min_order_value_xaf)}
              </div>
            ) : null}
            <div className="flex gap-2 mt-3">
              <button onClick={() => openQuote()} className="flex-1 bg-amber-500 text-slate-900 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
                <FileText className="w-4 h-4" /> {s.reqQuote}
              </button>
              <button onClick={chatSales} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> {s.chatSales}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 border-b border-gray-200">
          {([['all', s.tabAll], ['bulk', s.tabBulk], ['about', s.tabAbout]] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`pb-2 px-1 text-sm font-semibold border-b-2 -mb-px ${tab === k ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 mt-4">
        {tab === 'about' ? (
          <div className="bg-white rounded-2xl border p-4 space-y-3">
            {store.about ? <p className="text-sm text-gray-600">{store.about}</p> : null}
            <div className="border-t pt-3">
              <p className="text-xs font-bold text-gray-700 mb-2">{s.aboutLegal}</p>
              <div className="space-y-1 text-xs text-gray-600">
                {store.rccm_number ? <div><span className="font-semibold">{s.rccm}:</span> {store.rccm_number}</div> : null}
                {store.niu_number ? <div><span className="font-semibold">{s.niu}:</span> {store.niu_number}</div> : null}
                {store.address ? <div><span className="font-semibold">{s.location}:</span> {store.address}{store.city ? `, ${store.city}` : ''}</div> : null}
              </div>
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{s.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {shown.map((p) => (
              <ProductCard key={p.id} p={p} tab={tab} s={s} onQuote={() => openQuote(p)} isB2B={isB2B} />
            ))}
          </div>
        )}
      </div>

      {/* Verify modal */}
      {showVerify ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4" onClick={() => setShowVerify(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{s.verified}</h3>
            <p className="text-sm text-gray-500 mb-4">{s.verifyModal}</p>
            <button onClick={() => setShowVerify(false)} className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm">OK</button>
          </div>
        </div>
      ) : null}

      {/* Quote modal */}
      {showQuote ? (
        <QuoteForm
          store={store}
          product={quoteProduct}
          s={s}
          isRtl={isRtl}
          onClose={() => setShowQuote(false)}
          onDone={() => { setShowQuote(false); flash(s.qDone); }}
          onNeedLogin={() => navigate('/login')}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 max-w-[90%] text-center">{toast}</div>
      ) : null}
    </div>
  );
}

// -------- product card with live bulk-price counter --------
function ProductCard({
  p, tab, s, onQuote, isB2B,
}: {
  p: CorporateProduct; tab: Tab; s: ReturnType<typeof corpStrings>['s'];
  onQuote: () => void; isB2B: boolean;
}) {
  const [qty, setQty] = useState(p.bulk_min_qty ?? 1);
  const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
  const bulkActive = p.bulk_price_xaf != null && p.bulk_min_qty != null && qty >= p.bulk_min_qty;
  const unitPrice = bulkActive ? p.bulk_price_xaf! : (p.retail_price_xaf ?? p.bulk_price_xaf ?? 0);
  const showBulk = tab === 'bulk' && p.bulk_price_xaf != null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
        {img ? <img src={img} alt={p.title} className="w-full h-full object-cover" loading="lazy" /> : <Tag className="w-7 h-7 text-gray-300" />}
      </div>
      <div className="p-2.5">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.title}</h3>
        {p.retail_price_xaf != null && tab !== 'bulk' ? (
          <p className="text-sm font-bold text-slate-800 mt-1">{fmtXAF(p.retail_price_xaf)}</p>
        ) : null}

        {showBulk ? (
          <>
            <p className="text-[10px] text-gray-400 mt-1">{s.bulkPrice} · {s.moq} {p.bulk_min_qty}{p.unit ? ` ${p.unit}` : ''}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <button onClick={() => setQty(Math.max((p.bulk_min_qty ?? 1), qty - 1))} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
              <input value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value.replace(/[^\d]/g, '') || '1', 10)))} className="w-12 text-center text-xs border border-gray-200 rounded-lg py-1" />
              <button onClick={() => setQty(qty + 1)} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
            </div>
            <p className={`text-sm font-bold mt-1 ${bulkActive ? 'text-emerald-700' : 'text-slate-800'}`}>
              {fmtXAF(unitPrice)} <span className="text-[10px] font-normal text-gray-400">{s.perUnit} {p.unit || 'unit'}</span>
            </p>
            <p className="text-[11px] text-gray-500">= {fmtXAF(unitPrice * qty)}</p>
          </>
        ) : null}

        {isB2B ? (
          <button onClick={onQuote} className="mt-2 w-full bg-slate-800 text-white py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1">
            <FileText className="w-3 h-3" /> {s.reqQuote}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// -------- real quote form → corporate_quotes --------
function QuoteForm({
  store, product, s, isRtl, onClose, onDone, onNeedLogin,
}: {
  store: CorporateStore; product: CorporateProduct | null;
  s: ReturnType<typeof corpStrings>['s']; isRtl: boolean;
  onClose: () => void; onDone: () => void; onNeedLogin: () => void;
}) {
  const [qty, setQty] = useState(String(product?.bulk_min_qty ?? 100));
  const [unit, setUnit] = useState(product?.unit ?? '');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    setError('');
    const q = parseInt(qty.replace(/[^\d]/g, '') || '0', 10);
    if (!q) { setError(s.reqField); return; }
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { onNeedLogin(); return; }
      await submitQuote({
        storeId: store.id, buyerId: uid, productId: product?.id ?? null,
        quantity: q, unit: unit.trim() || undefined, location: location.trim() || undefined,
        date: date || undefined, notes: notes.trim() || undefined,
      });
      // notify the store owner
      await supabase.from('notifications').insert({
        user_id: store.owner_id, title: 'New corporate quote request',
        body: `${q}${unit ? ' ' + unit : ''}${product ? ' — ' + product.title : ''}`,
        type: 'corporate', data: { store_id: store.id },
      }).select('id');
      onDone();
    } catch (e) {
      console.error('[QuoteForm] send failed:', e);
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
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5"><FileText className="w-5 h-5 text-slate-700" /> {s.quoteTitle}</h3>
          <button onClick={() => !busy && onClose()}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {product ? <p className="text-xs text-gray-500 mb-3">{product.title}</p> : null}
        {error ? <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p> : null}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{s.qQty} *</label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{s.qUnit}</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">{s.qLocation}</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">{s.qDate}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">{s.qNotes}</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} /></div>
        </div>

        <button onClick={send} disabled={busy} className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {s.qSending}</>) : (<><CheckCircle2 className="w-4 h-4" /> {s.qSend}</>)}
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATESTOREFRONT__COMPLETE
