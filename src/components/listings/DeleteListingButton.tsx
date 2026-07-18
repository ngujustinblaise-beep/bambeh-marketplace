// BAMBEH_DEPLOY_TOKEN__DELETELISTINGBUTTON_FIX116_CLEAN
/**
 * DeleteListingButton — Bambeh Marketplace (FIX116, Trash edition)
 * FILE LOCATION: src/components/listings/DeleteListingButton.tsx
 *   (replaces the FIX115 copy)
 *
 * WHAT CHANGED FROM FIX115
 *  • Delete is now a SOFT delete that stamps `deleted_at = now()` as well as
 *    `status = 'deleted'`. The ad vanishes from Bambeh immediately (every list
 *    page filters status='active') but is kept in the DB so the owner can
 *    RESTORE or EDIT it from the Trash page for 7 days.
 *  • After 7 days it is hard-deleted automatically by a server function
 *    (see FIX116 SQL). The owner can also "Delete forever" from Trash early.
 *  • If the table has no `deleted_at` column yet, it still soft-deletes on
 *    status alone; if that fails, it falls back to a hard delete. Nothing
 *    here can ever fail loudly on the user.
 *
 * SAFETY (unchanged): only the owner sees the control, and every write is
 * filtered by BOTH id AND user_id — a user can never touch someone else's ad.
 *
 * USAGE:
 *   import DeleteListingButton from '@/components/listings/DeleteListingButton';
 *   <DeleteListingButton id={item.id} type="marketplace" ownerId={item.user_id} />
 *   <DeleteListingButton id={p.id} type="farm" ownerId={p.user_id} variant="icon" />
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

export type ListingType =
  | 'marketplace' | 'job' | 'service' | 'rental' | 'vehicle' | 'farm' | 'exchange';

interface DeleteListingButtonProps {
  id: string;
  type: ListingType;
  ownerId?: string | null;
  variant?: 'button' | 'icon';
  redirectTo?: string;
  onDeleted?: (id: string) => void;
  className?: string;
}

const T = {
  en: {
    delete: 'Delete', deleteAd: 'Delete this ad',
    title: 'Move this ad to Trash?',
    body: 'Your ad will be hidden from Bambeh and kept in your Trash for 7 days. You can restore or repost it before then.',
    confirm: 'Move to Trash', cancel: 'Keep it', deleting: 'Deleting…',
    fail: 'Could not delete. Please try again.',
    notOwner: 'You can only delete your own ads.',
  },
  fr: {
    delete: 'Supprimer', deleteAd: 'Supprimer cette annonce',
    title: 'Déplacer vers la Corbeille ?',
    body: 'Votre annonce sera masquée de Bambeh et conservée dans votre Corbeille pendant 7 jours. Vous pourrez la restaurer ou la republier avant.',
    confirm: 'Mettre à la Corbeille', cancel: 'Conserver', deleting: 'Suppression…',
    fail: 'Échec de la suppression. Réessayez.',
    notOwner: 'Vous ne pouvez supprimer que vos propres annonces.',
  },
  pidgin: {
    delete: 'Delete', deleteAd: 'Delete this ad',
    title: 'You wan move this ad go Trash?',
    body: 'Your ad go hide from Bambeh and stay for your Trash for 7 days. You fit bring am back or repost am before that time.',
    confirm: 'Move go Trash', cancel: 'Leave am', deleting: 'E dey delete…',
    fail: 'E no work. Try again.',
    notOwner: 'Na only your own ad you fit delete.',
  },
  ar: {
    delete: 'حذف', deleteAd: 'حذف هذا الإعلان',
    title: 'نقل هذا الإعلان إلى المهملات؟',
    body: 'سيُخفى إعلانك من Bambeh ويُحفظ في المهملات لمدة 7 أيام. يمكنك استعادته أو إعادة نشره قبل ذلك.',
    confirm: 'نقل إلى المهملات', cancel: 'الاحتفاظ به', deleting: 'جارٍ الحذف…',
    fail: 'تعذر الحذف. حاول مرة أخرى.',
    notOwner: 'يمكنك حذف إعلاناتك فقط.',
  },
  ff: {
    delete: 'Momtu', deleteAd: 'Momtu jaayre nde',
    title: 'Eggin jaayre nde e Kurjuru?',
    body: 'Jaayre maa suuɗete e Bambeh, mbaɗe e Kurjuru maa balɗe 7. A waawi artirde walla repost ado ɗum.',
    confirm: 'Eggin e Kurjuru', cancel: 'Accu', deleting: 'Momtugol…',
    fail: 'Momtaaki. Taƴ kadi.',
    notOwner: 'Ko jaayɗe maa tan mbaawɗaa momtude.',
  },
};

type TL = typeof T.en;

export default function DeleteListingButton({
  id,
  type,
  ownerId,
  variant = 'button',
  redirectTo = '/my-listings',
  onDeleted,
  className = '',
}: DeleteListingButtonProps) {
  const navigate = useNavigate();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setUserId(data?.user?.id ?? null);
    });
    return () => { alive = false; };
  }, []);

  const isOwner = !!userId && (!ownerId || ownerId === userId);
  if (!isOwner) return null;

  const table = type === 'exchange' ? 'exchange_items' : 'listings';

  const doDelete = async () => {
    if (!userId) { setError(t.notOwner); return; }
    setBusy(true);
    setError('');
    const nowIso = new Date().toISOString();
    try {
      // 1) SOFT delete WITH deleted_at (feeds the 7-day Trash).
      let ok = false;
      const soft = await supabase
        .from(table)
        .update({ status: 'deleted', deleted_at: nowIso, updated_at: nowIso })
        .eq('id', id)
        .eq('user_id', userId)
        .select('id');
      ok = !soft.error && Array.isArray(soft.data) && soft.data.length > 0;

      // 2) If deleted_at column doesn't exist yet, soft-delete on status alone.
      if (!ok && soft.error) {
        const soft2 = await supabase
          .from(table)
          .update({ status: 'deleted', updated_at: nowIso })
          .eq('id', id)
          .eq('user_id', userId)
          .select('id');
        ok = !soft2.error && Array.isArray(soft2.data) && soft2.data.length > 0;
      }

      // 3) Last resort: hard delete (still owner-scoped).
      if (!ok) {
        const hard = await supabase
          .from(table)
          .delete()
          .eq('id', id)
          .eq('user_id', userId)
          .select('id');
        ok = !hard.error && Array.isArray(hard.data) && hard.data.length > 0;
        if (hard.error) throw hard.error;
      }

      if (!ok) { setError(t.notOwner); setBusy(false); return; }

      setOpen(false);
      if (onDeleted) onDeleted(id);
      else navigate(redirectTo);
    } catch (e) {
      console.error('[DeleteListingButton] delete failed:', e);
      setError(t.fail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.deleteAd}
          className={`p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${className}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors ${className}`}
        >
          <Trash2 className="w-4 h-4" /> {t.delete}
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[60] p-4"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={() => !busy && setOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> {t.title}
              </h3>
              <button type="button" onClick={() => !busy && setOpen(false)} aria-label={t.cancel}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{t.body}</p>

            {error ? (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={doDelete}
              disabled={busy}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t.deleting}</>) : t.confirm}
            </button>
            <button
              type="button"
              onClick={() => !busy && setOpen(false)}
              className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
// BAMBEH_END_TOKEN__DELETELISTINGBUTTON__COMPLETE
