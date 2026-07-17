// BAMBEH_DEPLOY_TOKEN__BULKUPLOAD_FIX104_CLEAN
/**
 * BulkUpload — FIX104 (REAL data)
 * ───────────────────────────────
 * Replaces the fake page (1.2s setTimeout that marked everything "success"
 * while saving NOTHING). Now:
 *  • Downloads a CSV template; accepts a .csv file or pasted CSV text
 *  • Validates every row (title required; price number; stock ≥ 1)
 *  • Inserts REAL rows into `listings` in batches, as the logged-in user
 *    (type: marketplace / service / rental / vehicle / job — the real
 *    values in your database), status 'active'
 *  • Shows a per-row success/failure report — nothing is faked
 */
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, UploadCloud, FileDown, Loader2, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/App';

const TYPES = ['marketplace', 'service', 'rental', 'vehicle', 'job'] as const;
type ListingType = typeof TYPES[number];

const TEMPLATE_HEADER = 'title,price,category,location,description,condition,stock_quantity';
const TEMPLATE_EXAMPLE = '"Samsung Galaxy A15",95000,Electronics,"Yaoundé, Centre","Brand new, sealed box",new,3';

const T = {
  en: {
    title: 'Bulk Upload', subtitle: 'Post many listings at once from a CSV file',
    step1: '1 · Download the template', template: 'Download CSV template',
    step2: '2 · Fill it and upload', chooseFile: 'Choose CSV file', orPaste: '…or paste CSV text below',
    pastePh: 'title,price,category,location,description,condition,stock_quantity\n"My item",5000,Electronics,Yaoundé,"Details here",used,1',
    step3: '3 · Review and publish', rows: 'rows detected', publish: 'Publish listings',
    publishing: 'Publishing…', listingType: 'Listing type',
    needLogin: 'Please log in to upload listings.',
    noRows: 'No valid rows found. Check your CSV format.',
    rowOk: 'Published', rowFail: 'Failed',
    done: 'published successfully', failed: 'failed',
    errTitle: 'title is required', errPrice: 'price must be a number',
    back: 'Back', reset: 'Start over',
  },
  fr: {
    title: 'Import en masse', subtitle: "Publiez plusieurs annonces d'un coup via un fichier CSV",
    step1: '1 · Téléchargez le modèle', template: 'Télécharger le modèle CSV',
    step2: '2 · Remplissez puis importez', chooseFile: 'Choisir le fichier CSV', orPaste: '…ou collez le texte CSV ci-dessous',
    pastePh: 'title,price,category,location,description,condition,stock_quantity\n"Mon article",5000,Électronique,Yaoundé,"Détails ici",used,1',
    step3: '3 · Vérifiez et publiez', rows: 'lignes détectées', publish: 'Publier les annonces',
    publishing: 'Publication…', listingType: "Type d'annonce",
    needLogin: 'Connectez-vous pour importer des annonces.',
    noRows: 'Aucune ligne valide. Vérifiez le format CSV.',
    rowOk: 'Publiée', rowFail: 'Échec',
    done: 'publiées avec succès', failed: 'en échec',
    errTitle: 'le titre est requis', errPrice: 'le prix doit être un nombre',
    back: 'Retour', reset: 'Recommencer',
  },
};

interface ParsedRow {
  title: string; price: number | null; category: string | null; location: string | null;
  description: string | null; condition: string | null; stock_quantity: number;
  error?: string;
}
interface RowResult { title: string; ok: boolean; message: string; }

// Small CSV line parser that respects double quotes.
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQ = false; }
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function parseCSV(text: string, t: typeof T['en']): ParsedRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const first = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const hasHeader = first.includes('title');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const idx = (name: string, fallback: number) => {
    const i = first.indexOf(name);
    return hasHeader ? i : fallback;
  };
  const iTitle = idx('title', 0), iPrice = idx('price', 1), iCat = idx('category', 2),
        iLoc = idx('location', 3), iDesc = idx('description', 4), iCond = idx('condition', 5),
        iStock = idx('stock_quantity', 6);

  return dataLines.map((line) => {
    const c = parseCSVLine(line);
    const get = (i: number) => (i >= 0 && i < c.length ? c[i] : '');
    const title = get(iTitle);
    const priceRaw = get(iPrice).replace(/[^\d.]/g, '');
    const price = priceRaw === '' ? null : Number(priceRaw);
    const stockRaw = get(iStock).replace(/[^\d]/g, '');
    const stock = stockRaw === '' ? 1 : Math.max(parseInt(stockRaw, 10) || 1, 1);
    let error: string | undefined;
    if (!title) error = t.errTitle;
    else if (price !== null && Number.isNaN(price)) error = t.errPrice;
    return {
      title,
      price: price !== null && !Number.isNaN(price) ? price : null,
      category: get(iCat) || null,
      location: get(iLoc) || null,
      description: get(iDesc) || null,
      condition: get(iCond) || null,
      stock_quantity: stock,
      error,
    };
  });
}

export default function BulkUpload() {
  const navigate = useNavigate();
  const { language } = useLanguage() as { language?: string };
  const t = T[language === 'fr' ? 'fr' : 'en'];
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [listingType, setListingType] = useState<ListingType>('marketplace');
  const [csvText, setCsvText] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const downloadTemplate = () => {
    const blob = new Blob([`${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE}\n`], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bambeh_bulk_template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleText = (text: string) => {
    setCsvText(text);
    setResults(null);
    setRows(parseCSV(text, t));
  };

  const handleFile = async (f: File | null) => {
    if (!f) return;
    const text = await f.text();
    handleText(text);
  };

  const publish = async () => {
    const valid = rows.filter((r) => !r.error);
    if (valid.length === 0) { flash(t.noRows); return; }
    setBusy(true);
    setResults(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { flash(t.needLogin); setBusy(false); return; }

      const out: RowResult[] = rows
        .filter((r) => r.error)
        .map((r) => ({ title: r.title || '(no title)', ok: false, message: r.error as string }));

      const CHUNK = 25;
      for (let i = 0; i < valid.length; i += CHUNK) {
        const chunk = valid.slice(i, i + CHUNK);
        const payload = chunk.map((r) => ({
          user_id: uid,
          type: listingType,
          title: r.title,
          description: r.description,
          price: r.price,
          category: r.category,
          location: r.location,
          condition: r.condition,
          stock_quantity: r.stock_quantity,
          status: 'active',
          images: [] as string[],
          negotiable: true,
        }));
        const { error } = await supabase.from('listings').insert(payload);
        if (error) {
          console.error('[BulkUpload] chunk failed:', error);
          // fall back to row-by-row so one bad row doesn't sink the chunk
          for (const [j, single] of payload.entries()) {
            const { error: e2 } = await supabase.from('listings').insert(single);
            out.push({ title: chunk[j].title, ok: !e2, message: e2 ? (e2.message || t.rowFail) : t.rowOk });
          }
        } else {
          chunk.forEach((r) => out.push({ title: r.title, ok: true, message: t.rowOk }));
        }
      }
      setResults(out);
    } catch (e) {
      console.error('[BulkUpload] publish failed:', e);
      flash(t.rowFail);
    } finally {
      setBusy(false);
    }
  };

  const okCount = results?.filter((r) => r.ok).length ?? 0;
  const failCount = results ? results.length - okCount : 0;
  const validRows = rows.filter((r) => !r.error).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-teal-100 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><UploadCloud className="w-6 h-6" /> {t.title}</h1>
        <p className="text-teal-100 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Step 1 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-gray-800 mb-2">{t.step1}</p>
          <button onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 rounded-xl px-3 py-2">
            <FileDown className="w-4 h-4" /> {t.template}
          </button>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-gray-800 mb-2">{t.step2}</p>
          <label className="text-xs font-medium text-gray-600">{t.listingType}</label>
          <select value={listingType} onChange={(e) => setListingType(e.target.value as ListingType)}
            className="mt-1 mb-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none">
            {TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
          </select>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-300 text-sm font-semibold text-teal-700">
            {t.chooseFile}
          </button>
          <p className="text-[11px] text-gray-400 mt-2">{t.orPaste}</p>
          <textarea value={csvText} onChange={(e) => handleText(e.target.value)} rows={5}
            placeholder={t.pastePh}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-teal-500" />
        </div>

        {/* Step 3 */}
        {rows.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-bold text-gray-800 mb-2">{t.step3}</p>
            <p className="text-xs text-gray-500 mb-3">{rows.length} {t.rows} · {validRows} OK</p>
            <div className="max-h-56 overflow-y-auto space-y-1.5 mb-3">
              {rows.slice(0, 100).map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {r.error
                    ? <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  <span className="truncate flex-1 text-gray-700">{r.title || '(no title)'}</span>
                  <span className="text-gray-400">{r.error ?? (r.price != null ? `${r.price} FCFA` : '')}</span>
                </div>
              ))}
            </div>
            <button onClick={publish} disabled={busy || validRows === 0}
              className="w-full py-3 rounded-xl bg-teal-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t.publishing}</>) : `${t.publish} (${validRows})`}
            </button>
          </div>
        ) : null}

        {/* Results */}
        {results ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              {failCount === 0
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                : <AlertCircle className="w-5 h-5 text-amber-500" />}
              <p className="text-sm font-bold text-gray-800">{okCount} {t.done}{failCount > 0 ? ` · ${failCount} ${t.failed}` : ''}</p>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {r.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                  <span className="truncate flex-1 text-gray-700">{r.title}</span>
                  <span className="text-gray-400 truncate max-w-[40%]">{r.message}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setRows([]); setCsvText(''); setResults(null); }}
              className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
              {t.reset}
            </button>
          </div>
        ) : null}
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__BULKUPLOAD__COMPLETE
