// BAMBEH_DEPLOY_TOKEN__TRASHPAGE_FIX116_CLEAN
/**
 * TrashPage — Bambeh Marketplace (FIX116)
 * FILE LOCATION: src/pages/TrashPage.tsx
 * ROUTE: add   <Route path="/trash" element={<MainLayout><AuthGate require="user"><TrashPage /></AuthGate></MainLayout>} />
 *        and   const TrashPage = lazy(() => import("@/pages/TrashPage"));
 *
 * The 7-day recycle bin. Shows the signed-in user's own deleted ads
 * (status='deleted') from BOTH `listings` and `exchange_items`, each with:
 *   • Restore  → status back to 'active', deleted_at cleared (ad reappears live)
 *   • Delete forever → hard delete now (owner-scoped)
 *   • "Auto-removes in N days" countdown from deleted_at + 7 days
 *
 * Server-side, a daily job hard-deletes anything past 7 days (FIX116 SQL),
 * so the trash cleans itself even if the user never opens this page.
 *
 * SAFETY: every read and write is filtered by user_id — a user only ever
 * sees and touches their own trashed ads.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2, RotateCcw, Loader2, AlertCircle, ArrowLeft, Clock, Tag, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

const RETENTION_DAYS = 7;

type Source = 'listings' | 'exchange_items';

interface TrashItem {
  id: string;
  source: Source;
  type: string;           // marketplace/job/service/rental/vehicle/farm | exchange
  title: string;
  price: number | null;
  image: string | null;
  deleted_at: string | null;
  created_at: string;
}

const T = {
  en: {
    title: 'Trash', subtitle: 'Deleted ads are kept here for 7 days',
    empty: 'Your Trash is empty.', back: 'Back',
    restore: 'Restore', forever: 'Delete forever',
    restored: 'Ad restored — it is live again.', purged: 'Ad permanently deleted.',
    fail: 'Action failed. Please try again.',
    loadError: 'Could not load your Trash. Check your connection.', retry: 'Retry',
    autoIn: (n: number) => `Auto-removes in ${n} day${n === 1 ? '' : 's'}`,
    autoSoon: 'Auto-removes soon',
    confirmTitle: 'Delete this ad forever?',
    confirmBody: 'This permanently removes the ad. It cannot be recovered.',
    confirmYes: 'Delete forever', cancel: 'Cancel', working: 'Working…',
  },
  fr: {
    title: 'Corbeille', subtitle: 'Les annonces supprimées sont conservées 7 jours',
    empty: 'Votre Corbeille est vide.', back: 'Retour',
    restore: 'Restaurer', forever: 'Supprimer définitivement',
    restored: 'Annonce restaurée — de nouveau en ligne.', purged: 'Annonce supprimée définitivement.',
    fail: "L'action a échoué. Réessayez.",
    loadError: 'Impossible de charger la Corbeille. Vérifiez votre connexion.', retry: 'Réessayer',
    autoIn: (n: number) => `Suppression auto dans ${n} jour${n === 1 ? '' : 's'}`,
    autoSoon: 'Suppression auto imminente',
    confirmTitle: 'Supprimer définitivement ?',
    confirmBody: 'Ceci supprime l’annonce définitivement. Elle est irrécupérable.',
    confirmYes: 'Supprimer définitivement', cancel: 'Annuler', working: 'En cours…',
  },
  pidgin: {
    title: 'Trash', subtitle: 'Deleted ads dey stay here for 7 days',
    empty: 'Your Trash empty.', back: 'Go back',
    restore: 'Bring am back', forever: 'Delete am forever',
    restored: 'Ad don come back — e dey live again.', purged: 'Ad don delete forever.',
    fail: 'E no work. Try again.',
    loadError: 'Trash no load. Check your network.', retry: 'Try again',
    autoIn: (n: number) => `E go auto-delete for ${n} day${n === 1 ? '' : 's'}`,
    autoSoon: 'E go auto-delete soon',
    confirmTitle: 'You wan delete this ad forever?',
    confirmBody: 'This one go remove the ad forever. You no fit bring am back.',
    confirmYes: 'Delete forever', cancel: 'Cancel', working: 'E dey work…',
  },
  ar: {
    title: 'المهملات', subtitle: 'تُحفظ الإعلانات المحذوفة هنا لمدة 7 أيام',
    empty: 'المهملات فارغة.', back: 'رجوع',
    restore: 'استعادة', forever: 'حذف نهائي',
    restored: 'تمت استعادة الإعلان — أصبح مباشرًا من جديد.', purged: 'تم حذف الإعلان نهائيًا.',
    fail: 'فشل الإجراء. حاول مرة أخرى.',
    loadError: 'تعذر تحميل المهملات. تحقق من اتصالك.', retry: 'إعادة المحاولة',
    autoIn: (n: number) => `حذف تلقائي خلال ${n} يوم`,
    autoSoon: 'حذف تلقائي قريبًا',
    confirmTitle: 'حذف هذا الإعلان نهائيًا؟',
    confirmBody: 'سيؤدي هذا إلى إزالة الإعلان نهائيًا. لا يمكن استرجاعه.',
    confirmYes: 'حذف نهائي', cancel: 'إلغاء', working: 'جارٍ التنفيذ…',
  },
  ff: {
    title: 'Kurjuru', subtitle: 'Jaayɗe momtaaɗe mbaɗete ɗoo balɗe 7',
    empty: 'Kurjuru maa ɓolii.', back: 'Rutto',
    restore: 'Artir', forever: 'Momtu haa poomaa',
    restored: 'Jaayre artiraama — hindi live kadi.', purged: 'Jaayre momtaama haa poomaa.',
    fail: 'Tinaaki. Taƴ kadi.',
    loadError: 'Kurjuru loowaaki. Ƴeew internet maa.', retry: 'Taƴ kadi',
    autoIn: (n: number) => `Momtete e hoore mum nder balɗe ${n}`,
    autoSoon: 'Momtete law',
    confirmTitle: 'Momtu jaayre nde haa poomaa?',
    confirmBody: 'Ɗum ina momta jaayre nde haa poomaa. Waawaa artireede.',
    confirmYes: 'Momtu haa poomaa', cancel: 'Haaytu', working: 'Golle…',
  },
};

type TL = typeof T.en;

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? null
    : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

function daysLeft(deletedAt: string | null): number {
  if (!deletedAt) return RETENTION_DAYS;
  const gone = new Date(deletedAt).getTime() + RETENTION_DAYS * 86400000;
  return Math.max(0, Math.ceil((gone - Date.now()) / 86400000));
}

const detailPath = (it: TrashItem): string => {
  if (it.source === 'exchange_items') return `/exchange/${it.id}`;
  switch (it.type) {
    case 'job':     return `/jobs/${it.id}`;
    case 'service': return `/services/${it.id}`;
    case 'rental':  return `/rentals/${it.id}`;
    case 'vehicle': return `/vehicles/${it.id}`;
    case 'farm':    return `/farm-fresh/${it.id}`;
    default:        return `/marketplace/${it.id}`;
  }
};

export default function TrashPage() {
  const navigate = useNavigate();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setItems([]); setLoading(false); return; }

      const collected: TrashItem[] = [];

      const { data: listRows, error: le } = await supabase
        .from('listings')
        .select('id, type, title, price, images, deleted_at, created_at, status')
        .eq('user_id', uid)
        .eq('status', 'deleted')
        .order('deleted_at', { ascending: false });
      if (le) throw le;
      for (const r of ((listRows ?? []) as Array<{
        id: string; type: string | null; title: string; price: number | null;
        images: string[] | null; deleted_at: string | null; created_at: string;
      }>)) {
        collected.push({
          id: r.id, source: 'listings', type: r.type ?? 'marketplace',
          title: r.title, price: r.price,
          image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
          deleted_at: r.deleted_at, created_at: r.created_at,
        });
      }

      // exchange_items — best-effort (skip if the table shape differs)
      try {
        const { data: exRows } = await supabase
          .from('exchange_items')
          .select('id, title, estimated_value_xaf, images, deleted_at, created_at, status')
          .eq('user_id', uid)
          .eq('status', 'deleted')
          .order('deleted_at', { ascending: false });
        for (const r of ((exRows ?? []) as Array<{
          id: string; title: string; estimated_value_xaf: number | null;
          images: string[] | null; deleted_at: string | null; created_at: string;
        }>)) {
          collected.push({
            id: r.id, source: 'exchange_items', type: 'exchange',
            title: r.title, price: r.estimated_value_xaf,
            image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
            deleted_at: r.deleted_at, created_at: r.created_at,
          });
        }
      } catch { /* exchange trash is best-effort */ }

      collected.sort((a, b) =>
        new Date(b.deleted_at ?? b.created_at).getTime() - new Date(a.deleted_at ?? a.created_at).getTime());
      setItems(collected);
    } catch (e) {
      console.error('[TrashPage] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const restore = async (it: TrashItem) => {
    if (!userId) return;
    setBusyId(it.id);
    try {
      const { error } = await supabase
        .from(it.source)
        .update({ status: 'active', deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', it.id)
        .eq('user_id', userId);
      if (error) throw error;
      setItems((xs) => xs.filter((x) => x.id !== it.id));
      flash(t.restored);
    } catch (e) {
      console.error('[TrashPage] restore failed:', e);
      flash(t.fail);
    } finally {
      setBusyId(null);
    }
  };

  const deleteForever = async (it: TrashItem) => {
    if (!userId) return;
    setBusyId(it.id);
    try {
      const { error } = await supabase
        .from(it.source)
        .delete()
        .eq('id', it.id)
        .eq('user_id', userId);
      if (error) throw error;
      setItems((xs) => xs.filter((x) => x.id !== it.id));
      setConfirmId(null);
      flash(t.purged);
    } catch (e) {
      console.error('[TrashPage] hard delete failed:', e);
      flash(t.fail);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trash2 className="w-6 h-6" /> {t.title}</h1>
        <p className="text-gray-300 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && <div className="flex justify-center py-16 text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && loadError && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{t.loadError}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-semibold">{t.retry}</button>
          </div>
        )}

        {!loading && !loadError && items.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Trash2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.empty}</p>
          </div>
        )}

        {!loading && !loadError && items.map((it) => {
          const n = daysLeft(it.deleted_at);
          const price = fmtXAF(it.price);
          return (
            <div key={`${it.source}-${it.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {it.image
                    ? <img src={it.image} alt={it.title} className="w-full h-full object-cover opacity-80" loading="lazy" />
                    : <Tag className="w-7 h-7 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{it.title}</h3>
                  {price ? <p className="text-sm font-bold text-gray-500 mt-0.5">{price}</p> : null}
                  <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {n > 0 ? t.autoIn(n) : t.autoSoon}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => restore(it)}
                  disabled={busyId === it.id}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {busyId === it.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><RotateCcw className="w-4 h-4" /> {t.restore}</>)}
                </button>
                <button
                  onClick={() => setConfirmId(it.id)}
                  disabled={busyId === it.id}
                  className="flex-1 py-2 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" /> {t.forever}
                </button>
              </div>

              {confirmId === it.id ? (
                <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[60] p-4"
                     onClick={() => busyId !== it.id && setConfirmId(null)}>
                  <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{t.confirmTitle}</h3>
                      <button onClick={() => busyId !== it.id && setConfirmId(null)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{t.confirmBody}</p>
                    <button onClick={() => deleteForever(it)} disabled={busyId === it.id}
                      className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                      {busyId === it.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t.confirmYes}
                    </button>
                    <button onClick={() => busyId !== it.id && setConfirmId(null)}
                      className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500">{t.cancel}</button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__TRASHPAGE__COMPLETE
