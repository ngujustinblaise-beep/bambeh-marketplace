// BAMBEH_DEPLOY_TOKEN__ESCROWPAGE_FIX113_CLEAN
/**
 * EscrowPage — FIX113 (REAL data — the last fake page falls)
 * FILE LOCATION: src/routes/groups/payments/EscrowPage.tsx
 *   (confirm with: Select-String C:\Dev\bambe-android\src\App.tsx -Pattern "EscrowPage")
 *
 * Replaces the MOCK_ESCROW page (one hardcoded Samsung order, "TODO: Firebase").
 *  • /escrow            → list of THIS user's escrow transactions (buyer OR seller)
 *  • /escrow/:orderId   → detail with 6-step tracker, confirm-receipt, dispute
 *  • Data: escrow_ledger (id, order_id, buyer_id, seller_id, amount_xaf, status,
 *    created_at, updated_at) joined to orders (order_number, status, items,
 *    escrow_status). Amounts shown in XAF and Zerm (1 Zerm = 100 XAF).
 *  • Buyer "Confirm receipt" → status 'released' (DB transition trigger enforces
 *    legality); "Raise dispute" → status 'disputed' + notification to admin/seller.
 *  • 5 languages (EN/FR/Pidgin/AR-RTL/FF), loading/empty/error states, chat-only.
 *
 * Escrow lifecycle used here (maps to escrow_ledger.status):
 *   held → shipped → released   (or → disputed → refunded/released by admin)
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock,
  Truck, PackageCheck, Flag, X, Lock, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

const ZERM_RATE = 100; // 1 Zerm = 100 XAF

type EscrowStatus = 'held' | 'shipped' | 'released' | 'disputed' | 'refunded' | 'pending';

interface OrderLite {
  order_number: string | null;
  status: string | null;
  items: unknown;
  escrow_status: string | null;
}
interface EscrowRow {
  id: string;
  order_id: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  amount_xaf: number | null;
  status: EscrowStatus;
  created_at: string;
  updated_at: string | null;
  orders?: OrderLite | null;
}

const T = {
  en: {
    title: 'Escrow & Buyer Protection',
    subtitle: 'Your Zerm Coins are held safely until you confirm your item',
    listEmpty: 'No escrow transactions yet. They appear here when you buy or sell with buyer protection.',
    loadError: 'Could not load your escrow. Check your connection.', retry: 'Retry', back: 'Back',
    asBuyer: 'Buying', asSeller: 'Selling', order: 'Order', held: 'held in escrow',
    view: 'View', notFound: 'Escrow transaction not found.',
    protectedTitle: 'You are protected',
    protectedBody: 'Your Zerm Coins stay frozen until you confirm you received your item. If anything goes wrong, we refund you in full.',
    confirmReceipt: 'Confirm receipt', raiseDispute: 'Raise a dispute',
    confirmTitle: 'Confirm you received your item?',
    confirmBody: 'This releases the held Zerm Coins to the seller. Only do this once you have the item in hand.',
    confirmYes: 'Yes, release funds', cancel: 'Cancel', working: 'Working…',
    disputeTitle: 'Raise a dispute', disputePh: 'Tell us what went wrong…',
    disputeSend: 'Submit dispute', disputeRaised: 'Your dispute has been raised. Our team responds within 48 hours.',
    released: 'Funds released to seller.', needLogin: 'Please log in.',
    actionFail: 'Action failed. Please try again.', disputeReq: 'Please describe the problem.',
    // steps
    s1: 'Order Placed', s1s: 'Buyer confirmed the order',
    s2: 'Zerm Held in Escrow', s2s: 'Coins frozen safely',
    s3: 'Seller Notified', s3s: 'Seller preparing the item',
    s4: 'Item Shipped / Ready', s4s: 'Awaiting delivery confirmation',
    s5: 'Buyer Confirms Receipt', s5s: 'Coins released to seller',
    s6: 'Transaction Complete', s6s: 'Both parties protected',
    st_held: 'Funds Held', st_shipped: 'Shipped', st_released: 'Completed',
    st_disputed: 'Disputed', st_refunded: 'Refunded', st_pending: 'Pending',
  },
  fr: {
    title: 'Séquestre et Protection Acheteur',
    subtitle: "Vos pièces Zerm sont conservées en sécurité jusqu'à confirmation de réception",
    listEmpty: "Aucune transaction sous séquestre. Elles apparaissent ici lors d'un achat ou d'une vente protégée.",
    loadError: 'Impossible de charger vos séquestres. Vérifiez votre connexion.', retry: 'Réessayer', back: 'Retour',
    asBuyer: 'Achat', asSeller: 'Vente', order: 'Commande', held: 'sous séquestre',
    view: 'Voir', notFound: 'Transaction sous séquestre introuvable.',
    protectedTitle: 'Vous êtes protégé',
    protectedBody: "Vos pièces Zerm restent gelées jusqu'à confirmation de réception. En cas de problème, remboursement intégral.",
    confirmReceipt: 'Confirmer la réception', raiseDispute: 'Ouvrir un litige',
    confirmTitle: 'Confirmer la réception de votre article ?',
    confirmBody: 'Ceci libère les pièces Zerm au vendeur. À faire uniquement une fois l’article en main.',
    confirmYes: 'Oui, libérer les fonds', cancel: 'Annuler', working: 'En cours…',
    disputeTitle: 'Ouvrir un litige', disputePh: "Dites-nous ce qui s'est passé…",
    disputeSend: 'Envoyer le litige', disputeRaised: 'Votre litige a été ouvert. Réponse sous 48 heures.',
    released: 'Fonds libérés au vendeur.', needLogin: 'Veuillez vous connecter.',
    actionFail: "L'action a échoué. Réessayez.", disputeReq: 'Veuillez décrire le problème.',
    s1: 'Commande passée', s1s: "L'acheteur a confirmé",
    s2: 'Zerm sous séquestre', s2s: 'Pièces gelées en sécurité',
    s3: 'Vendeur notifié', s3s: "Le vendeur prépare l'article",
    s4: 'Article expédié / prêt', s4s: 'En attente de confirmation',
    s5: "Acheteur confirme réception", s5s: 'Pièces libérées au vendeur',
    s6: 'Transaction terminée', s6s: 'Les deux parties protégées',
    st_held: 'Fonds gelés', st_shipped: 'Expédié', st_released: 'Terminé',
    st_disputed: 'Litige', st_refunded: 'Remboursé', st_pending: 'En attente',
  },
  pidgin: {
    title: 'Escrow & Buyer Protection',
    subtitle: 'Your Zerm Coins dey hold safe until you confirm say you don receive your item',
    listEmpty: 'No escrow dey yet. E go show here when you buy or sell with buyer protection.',
    loadError: 'Your escrow no load. Check your network.', retry: 'Try again', back: 'Go back',
    asBuyer: 'You dey buy', asSeller: 'You dey sell', order: 'Order', held: 'dey escrow',
    view: 'See am', notFound: 'We no find this escrow.',
    protectedTitle: 'You dey protected',
    protectedBody: 'Your Zerm Coins go freeze until you confirm say you don collect your item. If anything spoil, we refund you complete.',
    confirmReceipt: 'Confirm say you don receive', raiseDispute: 'Raise palava',
    confirmTitle: 'You don receive your item?',
    confirmBody: 'This one go release the Zerm Coins give the seller. Do am only when the item don reach your hand.',
    confirmYes: 'Yes, release the money', cancel: 'Cancel', working: 'E dey work…',
    disputeTitle: 'Raise palava', disputePh: 'Tell us wetin go wrong…',
    disputeSend: 'Send palava', disputeRaised: 'We don receive your palava. Our team go respond within 48 hours.',
    released: 'Money don release give seller.', needLogin: 'Abeg login.',
    actionFail: 'E no work. Try again.', disputeReq: 'Abeg explain the problem.',
    s1: 'Order Placed', s1s: 'Buyer confirm the order',
    s2: 'Zerm Dey Escrow', s2s: 'Coins freeze safe',
    s3: 'Seller Notified', s3s: 'Seller dey prepare the item',
    s4: 'Item Shipped / Ready', s4s: 'We dey wait delivery confirm',
    s5: 'Buyer Confirm Receipt', s5s: 'Coins release give seller',
    s6: 'Transaction Complete', s6s: 'Both side protected',
    st_held: 'Money Hold', st_shipped: 'Shipped', st_released: 'Complete',
    st_disputed: 'Palava', st_refunded: 'Refunded', st_pending: 'Pending',
  },
  ar: {
    title: 'الضمان وحماية المشتري',
    subtitle: 'تُحفظ عملات زيرم بأمان حتى تؤكد استلام سلعتك',
    listEmpty: 'لا توجد معاملات ضمان بعد. تظهر هنا عند الشراء أو البيع مع حماية المشتري.',
    loadError: 'تعذر تحميل معاملات الضمان. تحقق من اتصالك.', retry: 'إعادة المحاولة', back: 'رجوع',
    asBuyer: 'شراء', asSeller: 'بيع', order: 'طلب', held: 'محتجز في الضمان',
    view: 'عرض', notFound: 'لم يتم العثور على معاملة الضمان.',
    protectedTitle: 'أنت محمي',
    protectedBody: 'تبقى عملات زيرم مجمّدة حتى تؤكد استلام سلعتك. إذا حدث خطأ، نعيد لك المبلغ كاملًا.',
    confirmReceipt: 'تأكيد الاستلام', raiseDispute: 'فتح نزاع',
    confirmTitle: 'هل تؤكد استلام سلعتك؟',
    confirmBody: 'هذا يحرّر عملات زيرم للبائع. لا تفعل ذلك إلا بعد استلام السلعة فعليًا.',
    confirmYes: 'نعم، حرّر الأموال', cancel: 'إلغاء', working: 'جارٍ التنفيذ…',
    disputeTitle: 'فتح نزاع', disputePh: 'أخبرنا بما حدث…',
    disputeSend: 'إرسال النزاع', disputeRaised: 'تم فتح نزاعك. يرد فريقنا خلال 48 ساعة.',
    released: 'تم تحرير الأموال للبائع.', needLogin: 'يرجى تسجيل الدخول.',
    actionFail: 'فشل الإجراء. حاول مرة أخرى.', disputeReq: 'يرجى وصف المشكلة.',
    s1: 'تم الطلب', s1s: 'أكد المشتري الطلب',
    s2: 'زيرم في الضمان', s2s: 'العملات مجمّدة بأمان',
    s3: 'تم إشعار البائع', s3s: 'البائع يجهّز السلعة',
    s4: 'تم الشحن / جاهز', s4s: 'بانتظار تأكيد التسليم',
    s5: 'المشتري يؤكد الاستلام', s5s: 'تُحرَّر العملات للبائع',
    s6: 'اكتملت المعاملة', s6s: 'كلا الطرفين محميّان',
    st_held: 'أموال محتجزة', st_shipped: 'تم الشحن', st_released: 'مكتمل',
    st_disputed: 'نزاع', st_refunded: 'مُسترد', st_pending: 'قيد الانتظار',
  },
  ff: {
    title: 'Reenugol e Reende Coodoowo',
    subtitle: 'Zerm Coinɗe maa mbaɗete e hoore reenaande haa a tabitina kaake maa',
    listEmpty: 'Alaa liɓɓitol reenugol tawo. Ɗi ngartata ɗoo so a soodii walla a yeeyii e reende.',
    loadError: 'Reenugol maa loowaaki. Ƴeew internet maa.', retry: 'Taƴ kadi', back: 'Rutto',
    asBuyer: 'Soodgol', asSeller: 'Yeeygol', order: 'Sar', held: 'e reenugol',
    view: 'Yiy', notFound: 'Liɓɓitol reenugol ngol yiyaaka.',
    protectedTitle: 'A reenaama',
    protectedBody: 'Zerm Coinɗe maa mbaɗete haa a tabitina kaake maa keɓii. So huunde bonii, min ruttanma fof.',
    confirmReceipt: 'Tabitin keɓgol', raiseDispute: 'Ummin luural',
    confirmTitle: 'A tabitinii keɓde kaake maa?',
    confirmBody: 'Ɗum ina wurtina Zerm Coinɗe e yeeyoowo. Waɗ ɗum tan so kaake keɓii junngo maa.',
    confirmYes: 'Eey, wurtin kaalisi', cancel: 'Haaytu', working: 'Golle…',
    disputeTitle: 'Ummin luural', disputePh: 'Wonaango min ko bonii…',
    disputeSend: 'Neldu luural', disputeRaised: 'Luural maa umminaama. Terɗe amen njaaboto nder 48h.',
    released: 'Kaalisi wurtinaama e yeeyoowo.', needLogin: 'Naat.',
    actionFail: 'Tinaaki. Taƴ kadi.', disputeReq: 'Sifo caɗeele ɗe.',
    s1: 'Sar waɗaama', s1s: 'Soodoowo tabitinii sar',
    s2: 'Zerm e Reenugol', s2s: 'Coinɗe reenaama',
    s3: 'Yeeyoowo humpitaama', s3s: 'Yeeyoowo ina heblo kaake',
    s4: 'Kaake neldaama / hebli', s4s: 'Habbiima tabitingol jottingol',
    s5: 'Soodoowo tabitina keɓgol', s5s: 'Coinɗe wurtinaa e yeeyoowo',
    s6: 'Liɓɓitol timmii', s6s: 'Ɗiɗo fof reenaama',
    st_held: 'Kaalisi Reenaa', st_shipped: 'Neldaama', st_released: 'Timmii',
    st_disputed: 'Luural', st_refunded: 'Ruttaama', st_pending: 'Habbiima',
  },
};

type TL = typeof T.en;

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '—' : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

// Which of the 6 tracker steps are complete, given the ledger status.
function stepStateFor(status: EscrowStatus): { completed: number; active: number } {
  switch (status) {
    case 'pending':  return { completed: 1, active: 2 };
    case 'held':     return { completed: 3, active: 4 };
    case 'shipped':  return { completed: 4, active: 5 };
    case 'released': return { completed: 6, active: 0 };
    case 'refunded': return { completed: 6, active: 0 };
    case 'disputed': return { completed: 4, active: 4 };
    default:         return { completed: 2, active: 3 };
  }
}

function statusBadge(status: EscrowStatus, t: TL): { label: string; cls: string } {
  const map: Record<EscrowStatus, { label: string; cls: string }> = {
    pending:  { label: t.st_pending,  cls: 'bg-yellow-100 text-yellow-700' },
    held:     { label: t.st_held,     cls: 'bg-blue-100 text-blue-700' },
    shipped:  { label: t.st_shipped,  cls: 'bg-indigo-100 text-indigo-700' },
    released: { label: t.st_released, cls: 'bg-emerald-100 text-emerald-700' },
    disputed: { label: t.st_disputed, cls: 'bg-red-100 text-red-700' },
    refunded: { label: t.st_refunded, cls: 'bg-gray-100 text-gray-600' },
  };
  return map[status] ?? map.held;
}

export default function EscrowPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<EscrowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setRows([]); setLoading(false); return; }

      let query = supabase
        .from('escrow_ledger')
        .select('id, order_id, buyer_id, seller_id, amount_xaf, status, created_at, updated_at, orders:order_id(order_number, status, items, escrow_status)')
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .order('created_at', { ascending: false });

      if (orderId) query = supabase
        .from('escrow_ledger')
        .select('id, order_id, buyer_id, seller_id, amount_xaf, status, created_at, updated_at, orders:order_id(order_number, status, items, escrow_status)')
        .eq('order_id', orderId)
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .limit(1);

      const { data, error } = await query;
      if (error) throw error;
      setRows((data ?? []) as unknown as EscrowRow[]);
    } catch (e) {
      console.error('[EscrowPage] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const current = orderId ? rows[0] : null;
  const isBuyer = !!current && current.buyer_id === userId;

  const confirmReceipt = async () => {
    if (!current || !userId) { flash(t.needLogin); return; }
    setBusy(true);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('escrow_ledger')
        .update({ status: 'released', updated_at: nowIso })
        .eq('id', current.id)
        .eq('buyer_id', userId); // only the buyer may release
      if (error) throw error;

      if (current.order_id) {
        await supabase.from('orders')
          .update({ escrow_status: 'released', status: 'completed', updated_at: nowIso })
          .eq('id', current.order_id);
      }
      if (current.seller_id) {
        await supabase.from('notifications').insert({
          user_id: current.seller_id,
          title: 'Escrow released',
          body: 'The buyer confirmed receipt. Your Zerm Coins have been released.',
          type: 'escrow',
          data: { order_id: current.order_id, escrow_id: current.id },
        });
      }
      setShowConfirm(false);
      flash(t.released);
      await load();
    } catch (e) {
      console.error('[EscrowPage] release failed:', e);
      flash(t.actionFail);
    } finally {
      setBusy(false);
    }
  };

  const raiseDispute = async () => {
    if (!current || !userId) { flash(t.needLogin); return; }
    if (!disputeReason.trim()) { flash(t.disputeReq); return; }
    setBusy(true);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('escrow_ledger')
        .update({ status: 'disputed', updated_at: nowIso })
        .eq('id', current.id)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      if (error) throw error;

      if (current.order_id) {
        await supabase.from('orders')
          .update({ escrow_status: 'disputed', updated_at: nowIso })
          .eq('id', current.order_id);
      }
      // Notify the counterparty so they know a dispute is open.
      const other = current.buyer_id === userId ? current.seller_id : current.buyer_id;
      if (other) {
        await supabase.from('notifications').insert({
          user_id: other,
          title: 'Escrow dispute opened',
          body: disputeReason.trim().slice(0, 200),
          type: 'escrow',
          priority: 'high',
          data: { order_id: current.order_id, escrow_id: current.id },
        });
      }
      setShowDispute(false);
      setDisputeReason('');
      flash(t.disputeRaised);
      await load();
    } catch (e) {
      console.error('[EscrowPage] dispute failed:', e);
      flash(t.actionFail);
    } finally {
      setBusy(false);
    }
  };

  // ---------------- LIST VIEW ----------------
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 pt-5 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-teal-100 text-sm mb-2">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> {t.title}</h1>
          <p className="text-teal-100 text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="px-4 mt-4 space-y-3">
          {loading && <div className="flex justify-center py-16 text-teal-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}

          {!loading && loadError && (
            <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{t.loadError}</p>
              <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold">{t.retry}</button>
            </div>
          )}

          {!loading && !loadError && rows.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <Lock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t.listEmpty}</p>
            </div>
          )}

          {!loading && !loadError && rows.map((r) => {
            const badge = statusBadge(r.status, t);
            const role = r.buyer_id === userId ? t.asBuyer : t.asSeller;
            const zerm = r.amount_xaf != null ? Math.round(r.amount_xaf / ZERM_RATE) : null;
            return (
              <Link
                key={r.id}
                to={`/escrow/${r.order_id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${badge.cls}`}>{badge.label}</span>
                  <span className="text-[11px] text-gray-400">{role}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1.5">
                  {t.order} {r.orders?.order_number ?? (r.order_id ? r.order_id.slice(0, 8) : '—')}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm">
                    <span className="font-bold text-teal-700">{fmtXAF(r.amount_xaf)}</span>
                    {zerm != null ? <span className="text-gray-400 text-xs"> · {zerm.toLocaleString()} Zerm</span> : null}
                    <span className="text-gray-400 text-xs"> {t.held}</span>
                  </p>
                  <ChevronRight className={`w-4 h-4 text-gray-300 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </Link>
            );
          })}
        </div>

        {toast ? (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
        ) : null}
      </div>
    );
  }

  // ---------------- DETAIL VIEW ----------------
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-teal-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (loadError || !current) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p className="text-sm text-gray-600 mb-4">{loadError ? t.loadError : t.notFound}</p>
        <Link to="/escrow" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold">{t.back}</Link>
      </div>
    );
  }

  const badge = statusBadge(current.status, t);
  const zerm = current.amount_xaf != null ? Math.round(current.amount_xaf / ZERM_RATE) : null;
  const { completed, active } = stepStateFor(current.status);
  const steps = [
    { n: 1, label: t.s1, sub: t.s1s },
    { n: 2, label: t.s2, sub: t.s2s },
    { n: 3, label: t.s3, sub: t.s3s },
    { n: 4, label: t.s4, sub: t.s4s },
    { n: 5, label: t.s5, sub: t.s5s },
    { n: 6, label: t.s6, sub: t.s6s },
  ];
  const canAct = isBuyer && (current.status === 'held' || current.status === 'shipped');

  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 pt-5 pb-6">
        <Link to="/escrow" className="flex items-center gap-1 text-teal-100 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> {t.title}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
        </div>
      </div>

      <div className="px-4 -mt-3">
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-sm font-semibold text-gray-900">
            {t.order} {current.orders?.order_number ?? (current.order_id ? current.order_id.slice(0, 8) : '—')}
          </p>
          <p className="text-2xl font-black text-teal-700 mt-1">{fmtXAF(current.amount_xaf)}</p>
          {zerm != null ? <p className="text-xs text-gray-400">{zerm.toLocaleString()} Zerm {t.held}</p> : null}
        </div>
      </div>

      {/* Protection banner */}
      <div className="px-4 mt-3">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-800">{t.protectedTitle}</p>
            <p className="text-xs text-teal-600 mt-0.5">{t.protectedBody}</p>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl border p-4">
          {steps.map((s, i) => {
            const done = s.n <= completed;
            const isActive = s.n === active;
            const Icon = s.n === 4 ? Truck : s.n === 5 ? PackageCheck : s.n === 6 ? CheckCircle2 : done ? CheckCircle2 : Clock;
            return (
              <div key={s.n} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    done ? 'bg-emerald-500 text-white' : isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {i < steps.length - 1 ? <div className={`w-0.5 flex-1 min-h-[18px] ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} /> : null}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-semibold ${done || isActive ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buyer actions */}
      {canAct ? (
        <div className="px-4 mt-4 space-y-2">
          <button onClick={() => setShowConfirm(true)}
            className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <PackageCheck className="w-4 h-4" /> {t.confirmReceipt}
          </button>
          <button onClick={() => setShowDispute(true)}
            className="w-full border-2 border-red-200 text-red-600 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
            <Flag className="w-4 h-4" /> {t.raiseDispute}
          </button>
        </div>
      ) : null}

      {/* Confirm modal */}
      {showConfirm ? (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => !busy && setShowConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">{t.confirmTitle}</h3>
              <button onClick={() => !busy && setShowConfirm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{t.confirmBody}</p>
            <button onClick={confirmReceipt} disabled={busy}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t.confirmYes}
            </button>
            <button onClick={() => !busy && setShowConfirm(false)} className="w-full mt-2 py-2.5 text-sm font-semibold text-gray-500">{t.cancel}</button>
          </div>
        </div>
      ) : null}

      {/* Dispute modal */}
      {showDispute ? (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => !busy && setShowDispute(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">{t.disputeTitle}</h3>
              <button onClick={() => !busy && setShowDispute(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} rows={4}
              placeholder={t.disputePh}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-300 mb-3" />
            <button onClick={raiseDispute} disabled={busy}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t.disputeSend}
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ESCROWPAGE__COMPLETE
