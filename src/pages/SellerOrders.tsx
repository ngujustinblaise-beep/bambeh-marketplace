// BAMBEH_DEPLOY_TOKEN__SELLERORDERS_FIX361_CLEAN
/**
 * src/pages/SellerOrders.tsx — Bambeh Marketplace
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  FIX361 — THE SELLER CAN SEE THEIR SALES, AND REPORT PROGRESS ON THEM.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Until now `Orders.tsx` filtered on buyer_id and there was no seller
 *  equivalent anywhere. A seller who made a sale was simply never told.
 *
 *  EVERYTHING HERE IS REAL:
 *    · the list comes from the `get_seller_orders` RPC, which filters on
 *      auth.uid() inside the database — no mock rows, no sample fallback,
 *      and an honest empty state when there are genuinely no sales.
 *    · each button calls `set_delivery_status`, the RPC that verifies the
 *      caller IS the seller and that the order is PAID before writing.
 *    · every failure is SHOWN. The RPC returns a JSON verdict
 *      (not_your_order, not_paid, bad_status) and the seller reads it in
 *      their own language instead of a silent no-op.
 *
 *  WHAT IT DELIBERATELY DOES NOT DO:
 *    · it never shows the buyer's phone, email or address — only a display
 *      name. Bambeh's contact guard exists to keep deals on-platform, and a
 *      seller does not need contact details to pack a parcel.
 *    · marking "Delivered" does NOT release the money. Only the buyer
 *      confirming receipt does that. The page says so plainly, because a
 *      seller who expects payment on their own say-so will be angry later.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Loader2, RefreshCw, ShieldCheck, CheckCircle, Clock,
  AlertCircle, Truck, Box, ClipboardCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
type DeliveryStatus = "pending" | "confirmed" | "preparing" | "handed_over" | "delivered";

const STEPS: DeliveryStatus[] = ["confirmed", "preparing", "handed_over", "delivered"];

const S: Record<Lang, {
  title: string; subtitle: string; refresh: string; loading: string;
  none: string; noneDesc: string; browse: string;
  buyer: string; youReceive: string; held: string; released: string; refunded: string;
  progress: string; confirmed: string; preparing: string; handed_over: string; delivered: string;
  notYet: string; saving: string; moneyNote: string; failedNote: string;
  e_not_signed_in: string; e_not_your_order: string; e_not_paid: string;
  e_bad_status: string; e_order_not_found: string; e_network: string;
}> = {
  en: {
    title: "My sales", subtitle: "Orders buyers placed with you.",
    refresh: "Refresh", loading: "Loading your sales...",
    none: "No sales yet", noneDesc: "When someone buys from you, the order appears here.",
    browse: "See my listings",
    buyer: "Buyer", youReceive: "You receive",
    held: "Money held safely by Bambeh", released: "Paid out to you", refunded: "Refunded to the buyer",
    progress: "Tell the buyer where it is",
    confirmed: "Order confirmed", preparing: "Preparing it", handed_over: "Handed to delivery", delivered: "Delivered",
    notYet: "Nothing reported yet", saving: "Saving...",
    moneyNote: "Marking Delivered does not pay you. The buyer confirms receipt, then Bambeh releases the money.",
    failedNote: "This payment did not go through, so there is nothing to deliver.",
    e_not_signed_in: "You are signed out. Sign in and try again.",
    e_not_your_order: "This is not your order.",
    e_not_paid: "The buyer has not paid for this order yet.",
    e_bad_status: "That status is not allowed.",
    e_order_not_found: "That order no longer exists.",
    e_network: "Could not reach the server. Try again.",
  },
  fr: {
    title: "Mes ventes", subtitle: "Les commandes que des acheteurs ont passées chez vous.",
    refresh: "Actualiser", loading: "Chargement de vos ventes...",
    none: "Aucune vente pour l'instant", noneDesc: "Quand quelqu'un vous achète un article, la commande apparaît ici.",
    browse: "Voir mes annonces",
    buyer: "Acheteur", youReceive: "Vous recevez",
    held: "Argent conservé en sécurité par Bambeh", released: "Versé sur votre compte", refunded: "Remboursé à l'acheteur",
    progress: "Dites à l'acheteur où en est la commande",
    confirmed: "Commande confirmée", preparing: "En préparation", handed_over: "Remise au livreur", delivered: "Livrée",
    notYet: "Rien signalé pour l'instant", saving: "Enregistrement...",
    moneyNote: "Marquer Livrée ne vous paie pas. L'acheteur confirme la réception, puis Bambeh verse l'argent.",
    failedNote: "Ce paiement n'a pas abouti, il n'y a donc rien à livrer.",
    e_not_signed_in: "Vous êtes déconnecté. Reconnectez-vous et réessayez.",
    e_not_your_order: "Cette commande n'est pas la vôtre.",
    e_not_paid: "L'acheteur n'a pas encore payé cette commande.",
    e_bad_status: "Ce statut n'est pas autorisé.",
    e_order_not_found: "Cette commande n'existe plus.",
    e_network: "Impossible de joindre le serveur. Réessayez.",
  },
  pidgin: {
    title: "My sales", subtitle: "Orders wey buyers don make for your side.",
    refresh: "Refresh", loading: "We dey load your sales...",
    none: "No sale yet", noneDesc: "When person buy from you, di order go show here.",
    browse: "See my things wey I post",
    buyer: "Buyer", youReceive: "You go collect",
    held: "Bambeh dey hold di money safe", released: "Dem don pay you", refunded: "Dem don return money give buyer",
    progress: "Tell di buyer wia di thing dey",
    confirmed: "Order don confirm", preparing: "I dey prepare am", handed_over: "I don give am to delivery", delivered: "E don reach",
    notYet: "You never talk anything", saving: "E dey save...",
    moneyNote: "Marking Delivered no go pay you. Buyer must confirm say e reach, na den Bambeh go release di money.",
    failedNote: "Dis payment no pass, so notin dey to deliver.",
    e_not_signed_in: "You don log out. Login and try again.",
    e_not_your_order: "Dis order no be your own.",
    e_not_paid: "Buyer never pay for dis order.",
    e_bad_status: "Dat status no dey allowed.",
    e_order_not_found: "Dis order no dey again.",
    e_network: "We no fit reach di server. Try again.",
  },
  ar: {
    title: "مبيعاتي", subtitle: "الطلبات التي قدّمها المشترون لديك.",
    refresh: "تحديث", loading: "جارٍ تحميل مبيعاتك...",
    none: "لا توجد مبيعات بعد", noneDesc: "عندما يشتري أحد منك، يظهر الطلب هنا.",
    browse: "عرض إعلاناتي",
    buyer: "المشتري", youReceive: "ستستلم",
    held: "Bambeh تحتفظ بالمبلغ بأمان", released: "تم الدفع لك", refunded: "أُعيد المبلغ إلى المشتري",
    progress: "أخبر المشتري أين وصل الطلب",
    confirmed: "تم تأكيد الطلب", preparing: "قيد التحضير", handed_over: "سُلّم للتوصيل", delivered: "تم التسليم",
    notYet: "لم يُبلَّغ عن شيء بعد", saving: "جارٍ الحفظ...",
    moneyNote: "تحديد «تم التسليم» لا يدفع لك. يؤكّد المشتري الاستلام، ثم تحوّل Bambeh المبلغ.",
    failedNote: "لم تتم عملية الدفع هذه، فلا شيء لتسليمه.",
    e_not_signed_in: "أنت غير مسجّل الدخول. سجّل الدخول وأعد المحاولة.",
    e_not_your_order: "هذا الطلب ليس طلبك.",
    e_not_paid: "لم يدفع المشتري ثمن هذا الطلب بعد.",
    e_bad_status: "هذه الحالة غير مسموح بها.",
    e_order_not_found: "هذا الطلب لم يعد موجوداً.",
    e_network: "تعذّر الوصول إلى الخادم. أعد المحاولة.",
  },
  ff: {
    title: "Njeeygu am", subtitle: "Kommaandaaji ɗi soodooɓe ngaddi e maa.",
    refresh: "Hesɗitin", loading: "Habbi njeeygu maa...",
    none: "Njeeygu woo alaa tawo", noneDesc: "So neɗɗo soodii e maa, kommaand ndeen feeñan ɗoo.",
    browse: "Ndaaru njeeyanndeeji am",
    buyer: "Soodoowo", youReceive: "Aɗa heɓa",
    held: "Bambeh nanngi kaalis on e hisnde", released: "Yoɓaama e maa", refunded: "Ruttaama e soodoowo",
    progress: "Humpit soodoowo ɗo kaake ɗen ngoni",
    confirmed: "Kommaand teeŋtinaama", preparing: "Miɗo hebbina", handed_over: "Hokkaama neldoowo", delivered: "Yottiima",
    notYet: "Huunde humpitaaka tawo", saving: "Miɗo danndude...",
    moneyNote: "Maandinde «Yottiima» yoɓataa ma. Soodoowo teeŋtinan jaɓgol, ndeen Bambeh neldan kaalis.",
    failedNote: "Ngal yoɓgol yahaani, ko waɗi si huunde alaa neldeede.",
    e_not_signed_in: "A yaltii. Naatu ndeen fuɗɗitaa.",
    e_not_your_order: "Ngal kommaand wonaa maa.",
    e_not_paid: "Soodoowo yoɓaani ngal kommaand tawo.",
    e_bad_status: "Ngal ngonka jaɓaaka.",
    e_order_not_found: "Ngal kommaand alaa kadi.",
    e_network: "Waawaa yettaade serwer oo. Fuɗɗit kadi.",
  },
};

interface SaleRow {
  id: string;
  order_number: string | null;
  status: string | null;
  escrow: boolean | null;
  escrow_status: string | null;
  delivery_status: string | null;
  delivery_updated_at: string | null;
  total_xaf: number | null;
  seller_payout_xaf: number | null;
  items: unknown;
  created_at: string | null;
  paid_at: string | null;
  buyer_name: string | null;
}

const STEP_ICON: Record<DeliveryStatus, typeof Box> = {
  pending: Clock, confirmed: ClipboardCheck, preparing: Box, handed_over: Truck, delivered: CheckCircle,
};

export default function SellerOrders() {
  const navigate = useNavigate();
  const rawLang = useLang();
  const lang: Lang =
    rawLang === "fr" || rawLang === "pidgin" || rawLang === "ar" || rawLang === "ff" ? rawLang : "en";
  const s = S[lang];

  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.rpc("get_seller_orders", { p_limit: 50 });
      if (error) {
        console.error("[seller-orders] rpc failed:", error.message);
        setErrorMsg(s.e_network);
        setRows([]);
        return;
      }
      setRows(Array.isArray(data) ? (data as SaleRow[]) : []);
    } catch (e) {
      console.error("[seller-orders] threw:", e);
      setErrorMsg(s.e_network);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [s]);

  useEffect(() => { void load(); }, [load]);

  // Translate the RPC's own verdict. Never swallow a refusal.
  function verdictMessage(code: string): string {
    switch (code) {
      case "not_signed_in":   return s.e_not_signed_in;
      case "not_your_order":  return s.e_not_your_order;
      case "not_paid":        return s.e_not_paid;
      case "bad_status":      return s.e_bad_status;
      case "order_not_found": return s.e_order_not_found;
      default:                return s.e_network;
    }
  }

  async function mark(orderId: string, next: DeliveryStatus) {
    setBusyId(orderId);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.rpc("set_delivery_status", {
        p_order_id: orderId, p_status: next,
      });
      if (error) {
        console.error("[seller-orders] set_delivery_status failed:", error.message);
        setErrorMsg(s.e_network);
        return;
      }
      const verdict = (data ?? {}) as { ok?: boolean; error?: string };
      if (!verdict.ok) {
        setErrorMsg(verdictMessage(String(verdict.error ?? "")));
        return;
      }
      // Update in place - no full reload, so the seller keeps their scroll.
      setRows(prev => prev.map(r =>
        r.id === orderId
          ? { ...r, delivery_status: next, delivery_updated_at: new Date().toISOString() }
          : r));
    } catch (e) {
      console.error("[seller-orders] threw:", e);
      setErrorMsg(s.e_network);
    } finally {
      setBusyId(null);
    }
  }

  const money = (n: number | null) =>
    new Intl.NumberFormat("fr-CM").format(Math.round(Number(n ?? 0))) + " XAF";

  function firstItemTitle(items: unknown, fallback: string): string {
    if (Array.isArray(items) && items.length > 0) {
      const it = items[0] as { title?: unknown };
      if (typeof it?.title === "string" && it.title.trim()) {
        return items.length > 1 ? `${it.title} +${items.length - 1}` : it.title;
      }
    }
    return fallback;
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{s.title}</h1>
          <button
            type="button" onClick={() => void load()}
            className="p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={s.refresh}>
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">{s.subtitle}</p>

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 mb-5 bg-red-50 border-2 border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{s.loading}</p>
          </div>
        )}

        {/* An honest empty state. No sample rows, ever. */}
        {!loading && rows.length === 0 && !errorMsg && (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">{s.none}</h2>
            <p className="text-gray-500 text-sm mb-6">{s.noneDesc}</p>
            <button
              type="button" onClick={() => navigate("/my-listings")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
              {s.browse}
            </button>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="space-y-4">
            {rows.map((row) => {
              const current = (row.delivery_status ?? "pending") as DeliveryStatus;
              const reached = STEPS.indexOf(current);
              const escrowState = String(row.escrow_status ?? "").toLowerCase();
              const failed = String(row.status ?? "").toLowerCase() === "failed";
              const busy = busyId === row.id;

              return (
                <div key={row.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 leading-tight break-words">
                        {firstItemTitle(row.items, row.order_number ?? s.title)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 font-mono break-all">{row.order_number}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {s.buyer}: <span className="font-medium text-gray-900">{row.buyer_name}</span>
                      </p>
                      <p className="text-base font-bold text-teal-600 mt-1">
                        {s.youReceive} {money(row.seller_payout_xaf)}
                      </p>
                      {row.created_at && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(row.created_at).toLocaleDateString(lang === "ar" ? "ar" : "fr-CM")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Escrow state - read from the database, never assumed. */}
                  {escrowState === "released" ? (
                    <p className="mt-3 text-xs text-teal-700 font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />{s.released}
                    </p>
                  ) : escrowState.startsWith("refund") ? (
                    <p className="mt-3 text-xs text-blue-700 font-medium flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />{s.refunded}
                    </p>
                  ) : row.escrow ? (
                    <p className="mt-3 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />{s.held}
                    </p>
                  ) : null}

                  {failed ? (
                    <p className="mt-3 text-xs text-red-700">{s.failedNote}</p>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-2">{s.progress}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {STEPS.map((step, idx) => {
                          const Icon = STEP_ICON[step];
                          const done = reached >= idx;
                          const isNext = reached === idx - 1 || (reached === -1 && idx === 0);
                          return (
                            <button
                              key={step}
                              type="button"
                              disabled={busy}
                              onClick={() => void mark(row.id, step)}
                              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 ${
                                done
                                  ? "bg-teal-600 text-white"
                                  : isNext
                                    ? "bg-teal-50 text-teal-800 border-2 border-teal-300"
                                    : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{s[step]}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2 leading-snug">
                        {busy ? s.saving : reached < 0 ? s.notYet : s.moneyNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__SELLERORDERS_FIX361__COMPLETE
