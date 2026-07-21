// BAMBEH_DEPLOY_TOKEN__CORPORATETRASH_FIX155_CLEAN
/**
 * CorporateTrash.tsx — Bambeh Corporate (FIX155)
 * FILE LOCATION: src/features/corporate/CorporateTrash.tsx
 * ROUTE: /corporate/trash
 * REQUIRES: fix151_corp_trash_schema.sql (corporate_products.deleted_at)
 *
 * Mirrors the FIX116 listings trash, for corporate_products.
 *  • Lists the owner's soft-deleted products (deleted_at not null).
 *  • Restore → deleted_at = null, status = 'active'.
 *  • Delete forever → hard delete row.
 *  • "Auto-removes in N days" from deleted_at + 7d.
 *  • 5 languages + RTL, back-to-top, empty-safe.
 *
 * NOTE: soft-delete itself is stamped by the product delete action in the
 * dashboard (deleted_at = now(), status='deleted'); this page manages trash.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Trash2, RotateCcw, AlertCircle, PackageX, Store,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { fmtXAF, fetchMyStores } from './lib';
import CorporateLogo from './CorporateLogo';
import BackToTop from '@/components/ui/BackToTop';

const L = {
  en: {
    title: 'Trash', back: 'Back', noStore: 'You have no corporate store yet.',
    register: 'Register a store', empty: 'Trash is empty.',
    restore: 'Restore', deleteFwd: 'Delete forever', autoRemove: (n: number) => `Auto-removes in ${n} day${n === 1 ? '' : 's'}`,
    expired: 'Removing soon', loadErr: 'Could not load trash.', retry: 'Retry',
    confirmForever: 'Delete this product permanently? This cannot be undone.',
  },
  fr: {
    title: 'Corbeille', back: 'Retour', noStore: 'Vous n’avez pas encore de boutique.',
    register: 'Créer une boutique', empty: 'La corbeille est vide.',
    restore: 'Restaurer', deleteFwd: 'Supprimer définitivement', autoRemove: (n: number) => `Supprimé dans ${n} jour${n === 1 ? '' : 's'}`,
    expired: 'Suppression imminente', loadErr: 'Impossible de charger.', retry: 'Réessayer',
    confirmForever: 'Supprimer définitivement ce produit ? Irréversible.',
  },
  pidgin: {
    title: 'Trash', back: 'Back', noStore: 'You never get corporate store.',
    register: 'Register store', empty: 'Trash empty.',
    restore: 'Restore', deleteFwd: 'Delete forever', autoRemove: (n: number) => `E go comot for ${n} day${n === 1 ? '' : 's'}`,
    expired: 'E go soon comot', loadErr: 'Trash no gree load.', retry: 'Try again',
    confirmForever: 'You wan delete this product forever? E no fit come back.',
  },
  ar: {
    title: 'المهملات', back: 'رجوع', noStore: 'ليس لديك متجر بعد.',
    register: 'إنشاء متجر', empty: 'المهملات فارغة.',
    restore: 'استعادة', deleteFwd: 'حذف نهائي', autoRemove: (n: number) => `يُحذف خلال ${n} يوم`,
    expired: 'سيُحذف قريبًا', loadErr: 'تعذر التحميل.', retry: 'إعادة',
    confirmForever: 'حذف هذا المنتج نهائيًا؟ لا يمكن التراجع.',
  },
  ff: {
    title: 'Kurjuru', back: 'Rutto', noStore: 'A alaa butik tawo.',
    register: 'Winndito butik', empty: 'Kurjuru ɓolii.',
    restore: 'Artir', deleteFwd: 'Momtu haa laaɓi', autoRemove: (n: number) => `Ina momtee e nder balɗe ${n}`,
    expired: 'Ina ɓadtoo momteede', loadErr: 'Kurjuru loowaaki.', retry: 'Eto kadi',
    confirmForever: 'A yiɗi momtude huunde ndee haa laaɓi? Waawaa artude.',
  },
} as const;
type LS = (typeof L)['en'];
function useL(): { l: LS; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  return { l: (L as Record<string, LS>)[key] ?? L.en, isRtl: key === 'ar' };
}

interface TrashProduct {
  id: string; title: string; retail_price_xaf: number | null; unit: string | null;
  images: string[] | null; deleted_at: string;
}

export default function CorporateTrash() {
  const navigate = useNavigate();
  const { l, isRtl } = useL();

  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [items, setItems] = useState<TrashProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const mine = await fetchMyStores(uid);
      const st = mine && mine[0] ? mine[0] : null;
      if (!st) { setHasStore(false); return; }
      setHasStore(true);
      const { data, error: dbErr } = await supabase
        .from('corporate_products')
        .select('id, title, retail_price_xaf, unit, images, deleted_at')
        .eq('store_id', st.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      if (dbErr) throw new Error(dbErr.message);
      setItems((data ?? []) as TrashProduct[]);
    } catch {
      setError(l.loadErr);
    } finally {
      setLoading(false);
    }
  }, [navigate, l.loadErr]);

  useEffect(() => { void load(); }, [load]);

  async function restore(id: string) {
    setBusyId(id);
    try {
      const { error: dbErr } = await supabase
        .from('corporate_products')
        .update({ deleted_at: null, status: 'active' })
        .eq('id', id);
      if (dbErr) throw new Error(dbErr.message);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch {
      setError(l.loadErr);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteForever(id: string) {
    if (!window.confirm(l.confirmForever)) return;
    setBusyId(id);
    try {
      const { error: dbErr } = await supabase.from('corporate_products').delete().eq('id', id);
      if (dbErr) throw new Error(dbErr.message);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch {
      setError(l.loadErr);
    } finally {
      setBusyId(null);
    }
  }

  const daysLeft = (deletedAt: string): number => {
    const purge = new Date(deletedAt).getTime() + 7 * 24 * 60 * 60 * 1000;
    return Math.max(0, Math.ceil((purge - Date.now()) / (24 * 60 * 60 * 1000)));
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (hasStore === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Store className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-600 mb-4">{l.noStore}</p>
        <button onClick={() => navigate('/corporate/register')} className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold active:scale-95 transition-transform">{l.register}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {l.back}
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Trash2 className="w-5 h-5 text-slate-300" /> {l.title}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3 space-y-3">
        {error && <p className="text-sm text-red-500 font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}
          <button onClick={() => void load()} className="underline ml-1">{l.retry}</button></p>}

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <PackageX className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">{l.empty}</p>
          </div>
        ) : items.map((p) => {
          const d = daysLeft(p.deleted_at);
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {p.images && p.images[0]
                  ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                  : <PackageX className="w-5 h-5 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-500">{p.retail_price_xaf != null ? fmtXAF(p.retail_price_xaf) : ''}{p.unit ? ` · ${p.unit}` : ''}</p>
                <p className={`text-[11px] mt-0.5 ${d <= 1 ? 'text-red-500' : 'text-gray-400'}`}>{d <= 0 ? l.expired : l.autoRemove(d)}</p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => void restore(p.id)} disabled={busyId === p.id}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg active:scale-95 disabled:opacity-50">
                  {busyId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />} {l.restore}
                </button>
                <button onClick={() => void deleteForever(p.id)} disabled={busyId === p.id}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg active:scale-95 disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" /> {l.deleteFwd}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BackToTop rtl={isRtl} />
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATETRASH_FIX155__COMPLETE
