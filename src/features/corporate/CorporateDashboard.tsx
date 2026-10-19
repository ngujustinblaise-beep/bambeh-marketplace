// BAMBEH_DEPLOY_TOKEN__CORPORATEDASHBOARD_FIX835_CLEAN
/**
 * CorporateDashboard.tsx - FIX835 (was FIX156)
 * FILE LOCATION: src/features/corporate/CorporateDashboard.tsx
 * ROUTE: /corporate/dashboard   (AuthGate require="user")
 *
 * "My Corporate Dashboard", linked to Bambeh's check. Big, 18 Oct 2026: "register your enterprise and my corporate
 * dashboard and how it functions and is linked to the admin dashboard".
 *  - BAMBEH'S CHECK, at the top: waiting / Bambeh needs documents (each one with its Upload button) / Verified
 *    Corporate / not approved (the reason, "correct my details", "send it again") / suspended (the reason, "write to
 *    Bambeh"), with Bambeh's note and the date. It is what Command Center > Businesses (FIX836) decided.
 *  - DOCUMENTS: what was sent (open it - a private link only the business and Bambeh can use), take back a wrong one
 *    while Bambeh is still checking, add another.
 *  - WHAT HAPPENED, and when ("Bambeh" - never a staff member's name).
 *  - The quick actions now say what they open (they said Products / Quote requests / About Us / Support / Trash,
 *    whatever the button did) - in five languages.
 *  - Products: a picture uploaded from the phone (or a picture link), retail and bulk price, minimum order, unit.
 *    Quote requests as before.
 * Five languages, right-to-left for Arabic. If FIX832 has not run yet, the page works as before (badge only).
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, BarChart3, Building2, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, FileText, ImagePlus,
  LifeBuoy, Loader2, Package, Pencil, Plus, RotateCcw, Settings, ShieldAlert, ShieldCheck, Store, Tag, Trash2, Upload,
  UploadCloud, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import {
  corpStrings, fmtXAF, fetchMyStores, fetchStoreProducts,
  type CorporateStore, type CorporateProduct, type CorporateQuote,
} from './lib';
import CorporateLogo from './CorporateLogo';
import {
  DOC_KINDS, docLabel, eventLabel, failText, fetchMyBusinesses, fmtWhen, openBusinessDoc, removeBusinessDoc, resubmitBusiness,
  reviewStrings, stateText, stateTitle, uploadBusinessDoc, uploadProductPicture,
  type CorpDoc, type DocKind, type MyBusiness, type ReviewStrings,
} from './corpReview';

type Tab = 'products' | 'quotes';
type Note = { text: string; tone: 'red' | 'green' } | null;

const TONE: Record<string, { box: string; icon: string }> = {
  waiting: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'text-amber-500' },
  documents: { box: 'border-orange-300 bg-orange-50 text-orange-900', icon: 'text-orange-500' },
  approved: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'text-emerald-600' },
  refused: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'text-red-500' },
  suspended: { box: 'border-gray-300 bg-gray-100 text-gray-900', icon: 'text-gray-600' },
};

export default function CorporateDashboard() {
  const navigate = useNavigate();
  const lang = useLang() as string;
  const { s, isRtl } = corpStrings(lang);
  const { r } = reviewStrings(lang);

  const [store, setStore] = useState<CorporateStore | null>(null);
  const [review, setReview] = useState<MyBusiness | null>(null);
  const [products, setProducts] = useState<CorporateProduct[]>([]);
  const [quotes, setQuotes] = useState<CorporateQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>('products');
  const [showAdd, setShowAdd] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [askKind, setAskKind] = useState<DocKind>('rccm');
  const [confirmDoc, setConfirmDoc] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [resending, setResending] = useState(false);
  const docInput = useRef<HTMLInputElement | null>(null);
  const pendingKind = useRef<DocKind>('rccm');

  const say = (text: string, tone: 'red' | 'green' = 'green') => {
    setNote({ text, tone });
    if (tone === 'green') {
      try { window.setTimeout(() => setNote((n) => (n && n.text === text ? null : n)), 5000); } catch { /* no timer */ }
    }
  };

  const loadReview = useCallback(async (storeId: string) => {
    const res = await fetchMyBusinesses();
    if (res.ok) setReview(res.stores.find((b) => b.id === storeId) || null);
    else setReview(null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const mine = await fetchMyStores(uid);
      if (mine.length === 0) { setStore(null); setLoading(false); return; }
      const st = mine[0];
      setStore(st);
      const [prods, q] = await Promise.all([
        fetchStoreProducts(st.id),
        supabase.from('corporate_quotes').select('*').eq('store_id', st.id).order('created_at', { ascending: false }),
        loadReview(st.id),
      ]);
      setProducts(prods);
      setQuotes(((q && (q as { data?: unknown }).data) || []) as CorporateQuote[]);
    } catch (e) {
      console.error('[CorporateDashboard] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [navigate, loadReview]);

  useEffect(() => { void load(); }, [load]);

  const chooseDoc = (kind: DocKind) => {
    pendingKind.current = kind;
    setAskKind(kind);
    docInput.current?.click();
  };

  const sendDoc = async (file: File | undefined) => {
    if (!file || !store) return;
    const kind = pendingKind.current;
    setBusyDoc(kind);
    const res = await uploadBusinessDoc(store.id, kind, file);
    setBusyDoc(null);
    if (!res.ok) { say(failText(r, res), 'red'); return; }
    say(r.uploaded);
    await loadReview(store.id);
  };

  const takeBack = async (d: CorpDoc) => {
    if (!store) return;
    setConfirmDoc(null);
    setBusyDoc(d.id);
    const res = await removeBusinessDoc(d);
    setBusyDoc(null);
    if (!res.ok) { say(failText(r, res), 'red'); return; }
    say(r.removed);
    await loadReview(store.id);
  };

  const openDoc = async (d: CorpDoc) => {
    setBusyDoc(d.id);
    const res = await openBusinessDoc(d.path);
    setBusyDoc(null);
    if (!res.ok) { say(failText(r, res), 'red'); return; }
    try { window.open(res.url, '_blank', 'noopener'); } catch { window.location.href = res.url; }
  };

  const sendAgain = async () => {
    if (!store) return;
    setResending(true);
    const res = await resubmitBusiness(store.id);
    setResending(false);
    if (!res.ok) { say(failText(r, res), 'red'); return; }
    say(r.sentAgain);
    await loadReview(store.id);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-600"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'} data-fix="FIX835">
        <Building2 className="mb-3 h-12 w-12 text-gray-300" />
        <p className="mb-4 text-sm text-gray-500">{s.noStores}</p>
        <button onClick={() => navigate('/corporate/register')} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900">{s.registerCta}</button>
      </div>
    );
  }

  const state = review ? review.state : null;
  const canTakeBack = state === 'waiting' || state === 'documents' || state === 'refused';
  const asked = review ? review.docs_requested : [];
  const badge = state === 'approved' || (!review && store.verified)
    ? <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300" data-badge="verified"><ShieldCheck className="h-3.5 w-3.5" /> {s.verified}</span>
    : state === 'refused' || state === 'suspended'
      ? <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-200" data-badge={state}>{stateTitle(r, state)}</span>
      : <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300" data-badge="pending">{state ? stateTitle(r, state) : s.pending}</span>;

  const actions: Array<{ to: string; label: string; icon: ReactNode; key: string }> = [
    { key: 'bulk', to: '/corporate/bulk-upload', label: r.qa_bulk, icon: <UploadCloud className="h-4 w-4 text-teal-600" /> },
    { key: 'analytics', to: '/corporate/analytics', label: r.qa_analytics, icon: <BarChart3 className="h-4 w-4 text-indigo-600" /> },
    { key: 'settings', to: '/corporate/settings', label: r.qa_settings, icon: <Settings className="h-4 w-4 text-slate-500" /> },
    { key: 'support', to: '/corporate/support', label: r.qa_support, icon: <LifeBuoy className="h-4 w-4 text-amber-500" /> },
    { key: 'trash', to: '/corporate/trash', label: r.qa_trash, icon: <Trash2 className="h-4 w-4 text-slate-400" /> },
    { key: 'storefront', to: '/corporate/store/' + (store.slug || store.id), label: r.storefront, icon: <ExternalLink className="h-4 w-4 text-emerald-600" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'} data-fix="FIX835">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pb-6 pt-5 text-white">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate('/corporate')} className="mb-2 flex items-center gap-1 text-sm text-slate-300">
          <ArrowLeft className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} /> {s.back}
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-amber-400" />
          <h1 className="truncate text-xl font-bold">{store.trading_name || store.registered_name}</h1>
        </div>
        <div className="mt-2 flex items-center gap-2">{badge}</div>
      </div>

      {note ? (
        <div className={'mx-4 mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ' + (note.tone === 'red' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800')} data-note={note.tone}>
          {note.tone === 'red' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1">{note.text}</span>
          <button onClick={() => setNote(null)} aria-label={s.cancel}><X className="h-4 w-4 opacity-60" /></button>
        </div>
      ) : null}

      <input ref={docInput} type="file" accept="image/*,application/pdf" className="hidden" data-doc-input="1"
             onChange={(e) => { const f = e.target.files ? e.target.files[0] : undefined; e.target.value = ''; void sendDoc(f); }} />

      {/* Bambeh's check */}
      {review && state ? (
        <div className={'mx-4 mt-4 rounded-2xl border p-4 ' + TONE[state].box} data-review={state}>
          <div className="flex items-start gap-3">
            {state === 'approved' ? <ShieldCheck className={'h-6 w-6 shrink-0 ' + TONE[state].icon} />
              : state === 'refused' || state === 'suspended' ? <ShieldAlert className={'h-6 w-6 shrink-0 ' + TONE[state].icon} />
                : <Clock className={'h-6 w-6 shrink-0 ' + TONE[state].icon} />}
            <div className="min-w-0 flex-1">
              <p className="font-bold" data-review-title="1">{stateTitle(r, state)}</p>
              <p className="mt-0.5 text-sm opacity-90">{stateText(r, state)}</p>
              <p className="mt-1 text-xs opacity-70">
                {r.sentOn}: {fmtWhen(review.submitted_at, lang)}
                {review.reviewed_at ? ' - ' + r.decidedOn + ': ' + fmtWhen(review.reviewed_at, lang) : ''}
              </p>
              {review.note ? (
                <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-sm" data-review-note="1"><b>{r.bambehSays}:</b> {review.note}</p>
              ) : null}
            </div>
          </div>
          {state === 'documents' && asked.length ? (
            <div className="mt-3 space-y-2" data-asked="1">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{r.askedTitle}</p>
              {asked.map((k) => (
                <div key={k} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-gray-800" data-asked-doc={k}>
                  <FileText className="h-4 w-4 shrink-0 text-orange-500" />
                  <span className="flex-1">{docLabel(r, k)}</span>
                  <button onClick={() => chooseDoc(k)} disabled={!!busyDoc} className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60" data-upload-asked={k}>
                    {busyDoc === k ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {r.upload}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {state === 'refused' ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => navigate('/corporate/settings')} className="flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-700">
                <Pencil className="h-3.5 w-3.5" /> {r.fixDetails}
              </button>
              <button onClick={() => { void sendAgain(); }} disabled={resending} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60" data-send-again="1">
                {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} {r.sendAgain}
              </button>
            </div>
          ) : null}
          {state === 'suspended' ? (
            <button onClick={() => navigate('/corporate/support')} className="mt-3 flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white" data-write-bambeh="1">
              <LifeBuoy className="h-3.5 w-3.5" /> {r.writeBambeh}
            </button>
          ) : null}
        </div>
      ) : null}

      {/* the documents */}
      {review ? (
        <div className="mx-4 mt-4 rounded-2xl border border-gray-100 bg-white p-4" data-docs="1">
          <div className="mb-1 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <p className="flex-1 font-bold text-gray-900">{r.docsTitle}</p>
          </div>
          <p className="mb-3 text-xs text-gray-500">{r.docsPrivate}</p>
          {review.docs.length === 0 ? <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800" data-docs-none="1">{r.docsNone}</p> : null}
          <div className="space-y-2">
            {review.docs.map((d) => (
              <div key={d.id} className="rounded-xl border border-gray-100 px-3 py-2" data-doc={d.kind}>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{docLabel(r, d.kind)}</p>
                    <p className="truncate text-xs text-gray-500">{(d.name || '') + (d.name ? ' - ' : '') + fmtWhen(d.at, lang)}</p>
                  </div>
                  <button onClick={() => { void openDoc(d); }} disabled={busyDoc === d.id} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-slate-700" data-doc-open={d.id}>
                    {busyDoc === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : r.open}
                  </button>
                  {canTakeBack ? (
                    <button onClick={() => setConfirmDoc(confirmDoc === d.id ? null : d.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-600" data-doc-remove={d.id}>
                      {r.remove}
                    </button>
                  ) : null}
                </div>
                {confirmDoc === d.id ? (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" data-doc-confirm={d.id}>
                    <span className="flex-1">{r.confirmRemove}</span>
                    <button onClick={() => { void takeBack(d); }} className="rounded-md bg-red-600 px-2.5 py-1 font-bold text-white" data-doc-confirm-yes={d.id}>{r.remove}</button>
                    <button onClick={() => setConfirmDoc(null)} className="rounded-md border border-red-200 px-2.5 py-1 font-semibold">{s.cancel}</button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2" data-add-doc="1">
            <select value={askKind} onChange={(e) => setAskKind(e.target.value as DocKind)} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" aria-label={r.whichDoc} data-add-kind="1">
              {DOC_KINDS.map((k) => <option key={k} value={k}>{docLabel(r, k)}</option>)}
            </select>
            <button onClick={() => chooseDoc(askKind)} disabled={!!busyDoc} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" data-add-doc-btn="1">
              {busyDoc && DOC_KINDS.indexOf(busyDoc as DocKind) >= 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {busyDoc && DOC_KINDS.indexOf(busyDoc as DocKind) >= 0 ? r.uploading : r.addDoc}
            </button>
          </div>
          {review.history.length ? (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <button onClick={() => setShowHistory((v) => !v)} className="flex items-center gap-1 text-sm font-semibold text-slate-700" data-history-toggle="1">
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} {showHistory ? r.hideHistory : r.showHistory}
              </button>
              {showHistory ? <History r={r} lang={lang} items={review.history} /> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* quick actions: each says what it opens */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-4" data-actions="1">
        {actions.map((a) => (
          <button key={a.key} onClick={() => navigate(a.to)} data-action={a.key}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-1 py-2.5 text-center text-xs font-semibold text-slate-700 transition-transform active:scale-95">
            {a.icon} <span className="leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 px-4">
        <div className="flex gap-2 border-b border-gray-200">
          {([['products', s.dashProducts + ' (' + products.length + ')'], ['quotes', s.dashQuotes + ' (' + quotes.length + ')']] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} data-tab={k}
                    className={'-mb-px border-b-2 px-1 pb-2 text-sm font-semibold ' + (tab === k ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-400')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 px-4">
        {loadError ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-sm text-gray-600">{s.loadError}</p>
            <button onClick={() => { void load(); }} className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">{s.retry}</button>
          </div>
        ) : tab === 'products' ? (
          <>
            {state && state !== 'approved' ? <p className="mb-3 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600" data-products-wait="1">{r.productsWait}</p> : null}
            <button onClick={() => setShowAdd(true)} className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white" data-add-product="1">
              <Plus className="h-4 w-4" /> {s.addProduct}
            </button>
            {products.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
                <Package className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">{s.noProducts}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-white p-3" data-product={p.id}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {Array.isArray(p.images) && p.images[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Tag className="h-5 w-5 text-gray-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{p.title}</p>
                      <p className="text-xs text-gray-500">
                        {p.retail_price_xaf != null ? fmtXAF(p.retail_price_xaf) : ''}
                        {p.bulk_price_xaf != null ? ' - ' + s.bulkPrice + ' ' + fmtXAF(p.bulk_price_xaf) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          quotes.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <FileText className="mx-auto mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">{s.noQuotes}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quotes.map((q) => (
                <div key={q.id} className="rounded-xl border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{q.quantity}{q.unit ? ' ' + q.unit : ''}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{q.status}</span>
                  </div>
                  {q.delivery_location ? <p className="mt-0.5 text-xs text-gray-500">{q.delivery_location}</p> : null}
                  {q.notes ? <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">{q.notes}</p> : null}
                  <p className="mt-1 text-[10px] text-gray-400">{fmtWhen(q.created_at, lang)}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showAdd ? (
        <AddProductForm
          storeId={store.id} s={s} r={r} isRtl={isRtl}
          onClose={() => setShowAdd(false)}
          onAdded={(prod) => { setProducts((xs) => [prod, ...xs]); setShowAdd(false); say(s.addProduct + ' - ' + prod.title); }}
        />
      ) : null}
    </div>
  );
}

function History({ r, lang, items }: { r: ReviewStrings; lang: string; items: MyBusiness['history'] }) {
  return (
    <ol className="mt-2 space-y-2" data-history="1">
      {items.map((h, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className={'mt-1.5 h-2 w-2 shrink-0 rounded-full ' + (h.bambeh ? 'bg-amber-500' : 'bg-slate-300')} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800">
              {eventLabel(r, h.action)}
              {Array.isArray(h.docs) && h.docs.length ? ': ' + h.docs.map((d) => docLabel(r, d)).join(', ') : ''}
            </p>
            <p className="text-xs text-gray-500">{(h.bambeh ? r.bambeh : r.you) + ' - ' + fmtWhen(h.at, lang)}</p>
            {h.note ? <p className="mt-0.5 text-xs text-gray-600">{h.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

// -------- add a product -> corporate_products (a picture uploaded from the phone, or a link) --------
function AddProductForm({
  storeId, s, r, isRtl, onClose, onAdded,
}: {
  storeId: string; s: ReturnType<typeof corpStrings>['s']; r: ReviewStrings; isRtl: boolean;
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const pic = useRef<HTMLInputElement | null>(null);

  const upload = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    setError('');
    const res = await uploadProductPicture(storeId, f);
    setUploading(false);
    if (!res.ok) { setError(failText(r, res)); return; }
    setImageUrl(res.url);
  };

  const save = async () => {
    setError('');
    if (!title.trim()) { setError(s.reqField); return; }
    const link = imageUrl.trim();
    if (link && !/^https:\/\/\S+$/i.test(link)) { setError(r.r_bad_type); return; }
    setBusy(true);
    try {
      const { data, error: insErr } = await supabase
        .from('corporate_products')
        .insert({
          store_id: storeId,
          title: title.trim().slice(0, 140),
          retail_price_xaf: retail ? Number(retail.replace(/[^\d]/g, '')) : null,
          bulk_price_xaf: bulk ? Number(bulk.replace(/[^\d]/g, '')) : null,
          bulk_min_qty: moq ? parseInt(moq.replace(/[^\d]/g, ''), 10) : null,
          unit: unit.trim() || null,
          images: link ? [link] : [],
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

  const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center" dir={isRtl ? 'rtl' : 'ltr'} onClick={() => !busy && !uploading && onClose()} data-add-form="1">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><Store className="h-5 w-5 text-slate-700" /> {s.addProduct}</h3>
          <button onClick={() => !busy && onClose()} aria-label={s.cancel}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600" data-add-error="1">{error}</p> : null}

        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={s.dashProducts} className={inputCls} data-p="title" />
          <div className="grid grid-cols-2 gap-2">
            <input inputMode="numeric" value={retail} onChange={(e) => setRetail(e.target.value)} placeholder={s.retailPrice} className={inputCls} data-p="retail" />
            <input inputMode="numeric" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={s.bulkPrice} className={inputCls} data-p="bulk" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input inputMode="numeric" value={moq} onChange={(e) => setMoq(e.target.value)} placeholder={s.moq} className={inputCls} data-p="moq" />
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unit / box / ton" className={inputCls} data-p="unit" />
          </div>
          <div className="rounded-xl border border-dashed border-gray-300 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-600">{r.picture}</p>
            {imageUrl ? <img src={imageUrl} alt="" className="mb-2 h-28 w-full rounded-lg object-cover" data-p-preview="1" /> : null}
            <button type="button" onClick={() => pic.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700" data-p-upload="1">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} {uploading ? r.uploading : r.uploadPicture}
            </button>
            <input ref={pic} type="file" accept="image/*" className="hidden" data-p-file="1" onChange={(e) => { const f = e.target.files ? e.target.files[0] : undefined; e.target.value = ''; void upload(f); }} />
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={r.pictureLink} className={inputCls + ' mt-2'} dir="ltr" data-p="image" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={wholesale} onChange={(e) => setWholesale(e.target.checked)} /> {s.tabBulk}
          </label>
        </div>

        <button onClick={() => { void save(); }} disabled={busy || uploading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white disabled:opacity-60" data-p-save="1">
          {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> {s.submitting}</>) : (<><CheckCircle2 className="h-4 w-4" /> {s.addProduct}</>)}
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEDASHBOARD_FIX835__COMPLETE
