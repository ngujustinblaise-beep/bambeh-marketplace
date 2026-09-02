// BAMBEH_DEPLOY_TOKEN__CORPORATEBULKUPLOAD_FIX148_CLEAN
/**
 * CorporateBulkUpload.tsx — Bambeh Corporate (FIX148)
 * FILE LOCATION: src/features/corporate/CorporateBulkUpload.tsx
 * ROUTE (add in App.tsx later): /corporate/bulk-upload
 *
 * Production bulk product entry for a corporate store OWNER.
 * Real batch INSERT into corporate_products (confirmed schema, fix142 recon):
 *   store_id, title, description, category, retail_price_xaf, bulk_price_xaf,
 *   bulk_min_qty, unit, is_wholesale, in_stock, status, store_type.
 *
 *  • Two input modes: an editable grid (add rows) OR paste CSV / tab-separated.
 *  • Columns: title, retail_price_xaf, bulk_price_xaf, bulk_min_qty, unit, category.
 *  • Per-row validation; only valid rows are inserted; a clear result summary.
 *  • Inserts in one supabase call (array insert), status defaults to 'active'.
 *  • 5 languages + RTL. No stubs — every row maps to a real column.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Upload, Loader2, Check, AlertCircle,
  Table as TableIcon, ClipboardPaste, Store,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { fetchMyStores, fmtXAF, type CorporateStore } from './lib';
import CorporateLogo from './CorporateLogo';

const L = {
  en: {
    title: 'Bulk Upload', back: 'Back', noStore: 'You have no corporate store yet.',
    register: 'Register a store',
    modeGrid: 'Grid', modePaste: 'Paste CSV',
    pasteHint: 'Paste rows: title, retail price, bulk price, min qty, unit, category (one product per line, comma or tab separated).',
    parse: 'Load rows', addRow: 'Add row', clear: 'Clear',
    cTitle: 'Product title', cRetail: 'Retail (XAF)', cBulk: 'Bulk (XAF)',
    cMinQty: 'Min qty', cUnit: 'Unit', cCategory: 'Category',
    validRows: 'valid rows', upload: 'Upload products', uploading: 'Uploading…',
    done: 'products added', someBad: 'skipped (missing title or price)',
    needTitle: 'Each product needs a title and a retail price.',
    empty: 'No rows yet — add a row or paste your list.',
    uploadErr: 'Upload failed — check your connection and try again.',
  },
  fr: {
    title: 'Import groupé', back: 'Retour', noStore: 'Vous n’avez pas encore de boutique.',
    register: 'Créer une boutique',
    modeGrid: 'Grille', modePaste: 'Coller CSV',
    pasteHint: 'Collez les lignes : nom, prix détail, prix gros, qté min, unité, catégorie (un produit par ligne, séparé par virgule ou tab).',
    parse: 'Charger', addRow: 'Ajouter', clear: 'Vider',
    cTitle: 'Nom du produit', cRetail: 'Détail (XAF)', cBulk: 'Gros (XAF)',
    cMinQty: 'Qté min', cUnit: 'Unité', cCategory: 'Catégorie',
    validRows: 'lignes valides', upload: 'Importer', uploading: 'Import…',
    done: 'produits ajoutés', someBad: 'ignorés (nom ou prix manquant)',
    needTitle: 'Chaque produit doit avoir un nom et un prix détail.',
    empty: 'Aucune ligne — ajoutez ou collez votre liste.',
    uploadErr: 'Échec — vérifiez votre connexion.',
  },
  pidgin: {
    title: 'Bulk Upload', back: 'Back', noStore: 'You never get corporate store.',
    register: 'Register store',
    modeGrid: 'Grid', modePaste: 'Paste CSV',
    pasteHint: 'Paste rows: title, retail price, bulk price, min qty, unit, category (one product for one line, comma or tab).',
    parse: 'Load rows', addRow: 'Add row', clear: 'Clear',
    cTitle: 'Product name', cRetail: 'Retail (XAF)', cBulk: 'Bulk (XAF)',
    cMinQty: 'Min qty', cUnit: 'Unit', cCategory: 'Category',
    validRows: 'good rows', upload: 'Upload products', uploading: 'E dey upload…',
    done: 'products don enter', someBad: 'skip (no title or price)',
    needTitle: 'Every product need title and retail price.',
    empty: 'No row yet — add row or paste your list.',
    uploadErr: 'Upload fail — check network try again.',
  },
  ar: {
    title: 'رفع جماعي', back: 'رجوع', noStore: 'ليس لديك متجر بعد.',
    register: 'إنشاء متجر',
    modeGrid: 'جدول', modePaste: 'لصق CSV',
    pasteHint: 'الصق الصفوف: الاسم، سعر التجزئة، سعر الجملة، الحد الأدنى للكمية، الوحدة، الفئة (منتج واحد لكل سطر).',
    parse: 'تحميل', addRow: 'إضافة صف', clear: 'مسح',
    cTitle: 'اسم المنتج', cRetail: 'تجزئة (XAF)', cBulk: 'جملة (XAF)',
    cMinQty: 'أدنى كمية', cUnit: 'الوحدة', cCategory: 'الفئة',
    validRows: 'صفوف صالحة', upload: 'رفع المنتجات', uploading: 'جارٍ الرفع…',
    done: 'منتجات أُضيفت', someBad: 'تم تخطيها (بدون اسم أو سعر)',
    needTitle: 'كل منتج يحتاج اسمًا وسعر تجزئة.',
    empty: 'لا صفوف بعد — أضف أو الصق قائمتك.',
    uploadErr: 'فشل الرفع — تحقق من اتصالك.',
  },
  ff: {
    title: 'Loowgol Denndaangal', back: 'Rutto', noStore: 'A alaa butik tawo.',
    register: 'Winndito butik',
    modeGrid: 'Grij', modePaste: 'Ɗakku CSV',
    pasteHint: 'Ɗakku: innde, coggu detay, coggu julle, keewal famɗi, ñeñal, catégorie (huunde gootel e gasol).',
    parse: 'Loowde', addRow: 'Ɓeydu', clear: 'Momtu',
    cTitle: 'Innde huunde', cRetail: 'Detay (XAF)', cBulk: 'Julle (XAF)',
    cMinQty: 'Keewal famɗi', cUnit: 'Ñeñal', cCategory: 'Catégorie',
    validRows: 'gasooje moƴƴe', upload: 'Loowde ku­ɗe', uploading: 'Ina loowa…',
    done: 'kuɗe naatii', someBad: ' tekkaama (alaa innde walla coggu)',
    needTitle: 'Huunde fof ina naamnii innde e coggu detay.',
    empty: 'Alaa gasol tawo — ɓeydu walla ɗakku.',
    uploadErr: 'Loowgol hawrii — ƴeew ceɗeele.',
  },
} as const;
type LS = (typeof L)['en'];
function useL(): { l: LS; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  return { l: (L as Record<string, LS>)[key] ?? L.en, isRtl: key === 'ar' };
}

type Row = {
  title: string; retail: string; bulk: string; minQty: string; unit: string; category: string;
};
const emptyRow = (): Row => ({ title: '', retail: '', bulk: '', minQty: '', unit: '', category: '' });

function rowValid(r: Row): boolean {
  return r.title.trim().length > 0 && (Number(r.retail) > 0);
}

export default function CorporateBulkUpload() {
  const navigate = useNavigate();
  const { l, isRtl } = useL();

  const [store, setStore] = useState<CorporateStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'grid' | 'paste'>('grid');
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [pasteText, setPasteText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: number; bad: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getSession();
        const uid = auth?.session?.user?.id;
        if (!uid) { navigate('/login'); return; }
        const mine = await fetchMyStores(uid);
        setStore((mine && mine[0]) || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const validCount = useMemo(() => rows.filter(rowValid).length, [rows]);

  const setCell = (i: number, k: keyof Row, v: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const delRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));
  const clearAll = () => { setRows([emptyRow()]); setResult(null); setError(null); };

  const parsePaste = useCallback(() => {
    const lines = pasteText.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    const parsed: Row[] = lines.map((line) => {
      const parts = line.split(/\t|,/).map((p) => p.trim());
      return {
        title: parts[0] ?? '',
        retail: (parts[1] ?? '').replace(/[^\d.]/g, ''),
        bulk: (parts[2] ?? '').replace(/[^\d.]/g, ''),
        minQty: (parts[3] ?? '').replace(/[^\d]/g, ''),
        unit: parts[4] ?? '',
        category: parts[5] ?? '',
      };
    });
    if (parsed.length) { setRows(parsed); setMode('grid'); setResult(null); setError(null); }
  }, [pasteText]);

  async function upload() {
    if (!store) return;
    const valid = rows.filter(rowValid);
    if (valid.length === 0) { setError(l.needTitle); return; }
    setUploading(true); setError(null); setResult(null);
    try {
      const payload = valid.map((r) => ({
        store_id: store.id,
        title: r.title.trim(),
        description: null,
        category: r.category.trim() || null,
        retail_price_xaf: Number(r.retail) || 0,
        bulk_price_xaf: r.bulk.trim() ? Number(r.bulk) : null,
        bulk_min_qty: r.minQty.trim() ? Number(r.minQty) : null,
        unit: r.unit.trim() || null,
        is_wholesale: !!(r.bulk.trim() && Number(r.bulk) > 0),
        in_stock: true,
        status: 'active',
        store_type: 'corporate',
      }));
      const { error: dbErr } = await supabase.from('corporate_products').insert(payload);
      if (dbErr) throw new Error(dbErr.message);
      setResult({ ok: valid.length, bad: rows.length - valid.length });
      setRows([emptyRow()]);
      setPasteText('');
    } catch {
      setError(l.uploadErr);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Store className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-600 mb-4">{l.noStore}</p>
        <button onClick={() => navigate('/corporate/register')} className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold active:scale-95 transition-transform">{l.register}</button>
      </div>
    );
  }

  const cell = 'bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-300 w-full';

  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {l.back}
        </button>
        <h1 className="text-xl font-bold">{l.title}</h1>
        <p className="text-slate-300 text-xs mt-1 truncate">{store.trading_name || store.registered_name}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-3 space-y-4">
        {/* Mode toggle */}
        <div className="bg-white rounded-2xl shadow-sm border p-1.5 flex gap-1.5">
          <button onClick={() => setMode('grid')} className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${mode === 'grid' ? 'bg-teal-600 text-white' : 'text-gray-600'}`}>
            <TableIcon className="w-4 h-4" /> {l.modeGrid}
          </button>
          <button onClick={() => setMode('paste')} className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${mode === 'paste' ? 'bg-teal-600 text-white' : 'text-gray-600'}`}>
            <ClipboardPaste className="w-4 h-4" /> {l.modePaste}
          </button>
        </div>

        {mode === 'paste' ? (
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500 mb-2">{l.pasteHint}</p>
            <textarea rows={8} value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-teal-300"
              placeholder={"Rice 25kg, 18000, 16500, 10, bag, Food\nCooking oil 5L, 6500, 6000, 12, jug, Food"} />
            <button onClick={parsePaste} disabled={!pasteText.trim()}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold active:scale-95 disabled:opacity-50">
              {l.parse}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-y-1.5">
              <thead>
                <tr className="text-[11px] text-gray-400 text-left">
                  <th className="px-1 font-medium">{l.cTitle}</th>
                  <th className="px-1 font-medium">{l.cRetail}</th>
                  <th className="px-1 font-medium">{l.cBulk}</th>
                  <th className="px-1 font-medium">{l.cMinQty}</th>
                  <th className="px-1 font-medium">{l.cUnit}</th>
                  <th className="px-1 font-medium">{l.cCategory}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={rowValid(r) ? '' : 'opacity-90'}>
                    <td className="px-0.5"><input className={cell} value={r.title} onChange={(e) => setCell(i, 'title', e.target.value)} /></td>
                    <td className="px-0.5"><input inputMode="numeric" className={cell} value={r.retail} onChange={(e) => setCell(i, 'retail', e.target.value.replace(/[^\d.]/g, ''))} /></td>
                    <td className="px-0.5"><input inputMode="numeric" className={cell} value={r.bulk} onChange={(e) => setCell(i, 'bulk', e.target.value.replace(/[^\d.]/g, ''))} /></td>
                    <td className="px-0.5"><input inputMode="numeric" className={cell} value={r.minQty} onChange={(e) => setCell(i, 'minQty', e.target.value.replace(/[^\d]/g, ''))} /></td>
                    <td className="px-0.5"><input className={cell} value={r.unit} onChange={(e) => setCell(i, 'unit', e.target.value)} /></td>
                    <td className="px-0.5"><input className={cell} value={r.category} onChange={(e) => setCell(i, 'category', e.target.value)} /></td>
                    <td className="px-0.5">
                      <button onClick={() => delRow(i)} className="text-gray-300 hover:text-red-500 p-1" aria-label="delete row">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button onClick={addRow} className="inline-flex items-center gap-1 text-sm text-teal-700 font-medium px-2 py-1"><Plus className="w-4 h-4" /> {l.addRow}</button>
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-sm text-gray-400 font-medium px-2 py-1">{l.clear}</button>
            </div>
          </div>
        )}

        {rows.length === 0 && <p className="text-center text-gray-400 text-sm py-4">{l.empty}</p>}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800 flex items-center gap-2">
            <Check className="w-5 h-5" /> {result.ok} {l.done}{result.bad > 0 ? ` · ${result.bad} ${l.someBad}` : ''}
          </div>
        )}
        {error && <p className="text-sm text-red-500 font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</p>}
      </div>

      {/* Sticky upload bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">{validCount} {l.validRows}</span>
          <button onClick={() => void upload()} disabled={uploading || validCount === 0}
            className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> {l.uploading}</> : <><Upload className="w-4 h-4" /> {l.upload}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEBULKUPLOAD_FIX148__COMPLETE
