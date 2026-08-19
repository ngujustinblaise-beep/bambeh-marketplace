// BAMBEH_DEPLOY_TOKEN__TRACKINGPAGE_FIX359_CLEAN
/**
 * src/pages/TrackingPage.tsx — Bambeh Marketplace
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  FIX359 — THIS PAGE HAD NEVER WORKED. NOT ONCE.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  (1) IT QUERIED A TABLE THAT DOES NOT EXIST.
 *      `from("vendor_orders")` — Postgres answers
 *      `42P01: relation "vendor_orders" does not exist`. That table went
 *      with the old vendor-driven system. Every single lookup therefore
 *      failed and the buyer was told "tracking number not found", which was
 *      a lie: their order was fine, the page was looking in a ghost.
 *      It now reads `orders`, the table the payments Edge Function
 *      actually writes.
 *
 *  (2) IT INVENTED A LOCATION. The old code set
 *      `currentLocation: "Cameroun"` and drew a MAP PIN beside it, plus a
 *      `carrierName: "Livraison Bambeh"`. Bambeh has no GPS and no courier
 *      integration. Showing a pin implies a position we do not have. Both
 *      are gone. Nothing on this page is now claimed that the database
 *      cannot prove.
 *
 *  (3) IT WAS HARDCODED FRENCH while importing useLang and never calling
 *      it — 14 broken-accent strings on top ("Commande re?ue", "Exp?di?e",
 *      "?tape"). Five languages now, mojibake gone.
 *
 *  WHAT THE TIMELINE SHOWS, AND WHY EACH STEP IS HONEST:
 *      Order placed      — the row exists.            created_at
 *      Payment confirmed — status = 'paid'.           paid_at
 *      Held safely       — escrow_status 'held'.      Bambeh is holding it
 *      Received, seller paid — escrow_status 'released'
 *    Every step is read from a real column. There is no step we cannot
 *    evidence. A failed order shows CamPay's own reason through the same
 *    translator the checkout uses, and a refunded one says so plainly.
 */

import React, { useState, useCallback } from "react";
import { Package, CheckCircle, Clock, ShieldCheck, RefreshCw, Search, AlertCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";
import { campayFailureMessage } from "@/lib/campayReasons";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string; hint: string; placeholder: string; button: string;
  notFound: string; searchError: string; stepPlaced: string; stepPaid: string;
  stepHeld: string; stepReleased: string; descPlaced: string; descPaid: string;
  descHeld: string; descReleased: string; history: string; order: string;
  total: string; failed: string; refunded: string; awaiting: string;
}> = {
  en: {
    title: "Track your order", hint: "Enter your order number or payment reference.",
    placeholder: "Order number or reference", button: "Track",
    notFound: "No order found with that number. Check it and try again.",
    searchError: "Could not reach the server. Please try again.",
    stepPlaced: "Order placed", stepPaid: "Payment confirmed",
    stepHeld: "Money held safely", stepReleased: "Received — seller paid",
    descPlaced: "Your order was created.",
    descPaid: "Your mobile money payment went through.",
    descHeld: "Bambeh is holding your money until you confirm the item arrived.",
    descReleased: "You confirmed receipt and the seller was paid.",
    history: "Progress", order: "Order", total: "Total",
    failed: "This payment did not go through.", refunded: "This order was refunded.",
    awaiting: "Waiting for your payment to be confirmed.",
  },
  fr: {
    title: "Suivre votre commande", hint: "Saisissez votre numéro de commande ou référence de paiement.",
    placeholder: "Numéro de commande ou référence", button: "Suivre",
    notFound: "Aucune commande trouvée avec ce numéro. Vérifiez et réessayez.",
    searchError: "Impossible de joindre le serveur. Veuillez réessayer.",
    stepPlaced: "Commande créée", stepPaid: "Paiement confirmé",
    stepHeld: "Argent sécurisé", stepReleased: "Reçue — vendeur payé",
    descPlaced: "Votre commande a été créée.",
    descPaid: "Votre paiement Mobile Money est passé.",
    descHeld: "Bambeh garde votre argent jusqu'à ce que vous confirmiez la réception.",
    descReleased: "Vous avez confirmé la réception et le vendeur a été payé.",
    history: "Progression", order: "Commande", total: "Total",
    failed: "Ce paiement n'a pas abouti.", refunded: "Cette commande a été remboursée.",
    awaiting: "En attente de la confirmation de votre paiement.",
  },
  pidgin: {
    title: "Track your order", hint: "Put your order number or payment reference.",
    placeholder: "Order number or reference", button: "Track am",
    notFound: "We no see any order with dat number. Check am well and try again.",
    searchError: "We no fit reach di server. Abeg try again.",
    stepPlaced: "Order don enter", stepPaid: "Payment don confirm",
    stepHeld: "Money dey safe", stepReleased: "You don collect — seller don chop",
    descPlaced: "Dem create your order.",
    descPaid: "Your Mobile Money payment pass.",
    descHeld: "Bambeh dey hold your money till you confirm say di thing don reach.",
    descReleased: "You confirm say e reach and dem pay di seller.",
    history: "How e dey go", order: "Order", total: "Total",
    failed: "Dis payment no pass.", refunded: "Dem don refund dis order.",
    awaiting: "We dey wait make your payment confirm.",
  },
  ar: {
    title: "تتبع طلبك", hint: "أدخل رقم الطلب أو مرجع الدفع.",
    placeholder: "رقم الطلب أو المرجع", button: "تتبع",
    notFound: "لم يُعثر على طلب بهذا الرقم. تحقّق منه وأعد المحاولة.",
    searchError: "تعذّر الوصول إلى الخادم. يرجى المحاولة مرة أخرى.",
    stepPlaced: "تم إنشاء الطلب", stepPaid: "تم تأكيد الدفع",
    stepHeld: "الأموال محفوظة بأمان", stepReleased: "تم الاستلام — دُفع للبائع",
    descPlaced: "تم إنشاء طلبك.",
    descPaid: "تمت عملية الدفع عبر المحفظة بنجاح.",
    descHeld: "تحتفظ Bambeh بأموالك حتى تؤكّد وصول المنتج.",
    descReleased: "أكّدت الاستلام وتم الدفع للبائع.",
    history: "التقدّم", order: "الطلب", total: "الإجمالي",
    failed: "لم تتم عملية الدفع هذه.", refunded: "تم استرداد مبلغ هذا الطلب.",
    awaiting: "في انتظار تأكيد الدفع.",
  },
  ff: {
    title: "Rewindo kommaand maa", hint: "Naatnu limngal kommaand walla maandeeji yoɓgol.",
    placeholder: "Limngal kommaand walla maandeeji", button: "Rewindo",
    notFound: "Kommaand woo yiyaaka e ngal limngal. Ƴeewndo ndeen fuɗɗitaa.",
    searchError: "Waawaa yettaade serwer oo. Tiiɗno fuɗɗit kadi.",
    stepPlaced: "Kommaand sosaama", stepPaid: "Yoɓgol teeŋtinaama",
    stepHeld: "Kaalis no hisi", stepReleased: "Jaɓaama — njeeyoowo yoɓaama",
    descPlaced: "Kommaand maa nden sosaama.",
    descPaid: "Yoɓgol maa Mobile Money yahii.",
    descHeld: "Bambeh nanngi kaalis maa haa teeŋtinaa yottaade kaake ɗen.",
    descReleased: "Teeŋtin-ɗaa jaɓgol ndeen njeeyoowo oo yoɓaa.",
    history: "Ɗo woni", order: "Kommaand", total: "Denndaangal",
    failed: "Ngal yoɓgol yahaani.", refunded: "Ngal kommaand ruttaama.",
    awaiting: "Habbi teeŋtingol yoɓgol maa.",
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Found {
  id: string;
  orderNumber: string;
  status: string;
  escrowStatus: string;
  totalXAF: number;
  createdAt: string | null;
  paidAt: string | null;
  updatedAt: string | null;
  failureReason: string | null;
}

const TrackingPage: React.FC = () => {
  const raw = useLang();
  const lang: Lang = (raw === "fr" || raw === "pidgin" || raw === "ar" || raw === "ff") ? raw : "en";
  const s = S[lang];

  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setFound(null);
    try {
      // FIX359 - select("*") on purpose: naming a column that does not exist
      // makes PostgREST reject the WHOLE query, and this page has already
      // been broken once by a schema assumption.
      // A UUID can be matched on id; anything else is an order number or a
      // CamPay reference. Comparing a non-UUID to id would throw.
      const filter = UUID_RE.test(trimmed)
        ? `id.eq.${trimmed}`
        : `order_number.eq.${trimmed},payment_reference.eq.${trimmed},payment_ref.eq.${trimmed}`;

      const { data, error: dbErr } = await supabase
        .from("orders")
        .select("*")
        .or(filter)
        .limit(1);

      if (dbErr) {
        console.error("[tracking] lookup failed:", dbErr.message);
        setError(s.searchError);
        return;
      }
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as Record<string, unknown>) : null;
      if (!row) { setError(s.notFound); return; }

      setFound({
        id: String(row.id ?? ""),
        orderNumber: String(row.order_number ?? row.id ?? ""),
        status: String(row.status ?? "pending").toLowerCase(),
        escrowStatus: String(row.escrow_status ?? "").toLowerCase(),
        totalXAF: Number(row.total_xaf ?? 0),
        createdAt: (row.created_at as string) ?? null,
        paidAt: (row.paid_at as string) ?? null,
        updatedAt: (row.updated_at as string) ?? null,
        failureReason: (row.failure_reason as string) ?? null,
      });
    } catch (e) {
      console.error("[tracking] threw:", e);
      setError(s.searchError);
    } finally {
      setLoading(false);
    }
  }, [s]);

  const money = (n: number) => new Intl.NumberFormat("fr-CM").format(n) + " XAF";
  const when = (v: string | null) => (v ? new Date(v).toLocaleString(lang === "ar" ? "ar" : "fr-CM") : "");

  // Every step below is derived from a real column. Nothing is assumed.
  const steps = found
    ? [
        { key: "placed",   label: s.stepPlaced,   desc: s.descPlaced,   done: true,
          at: found.createdAt },
        { key: "paid",     label: s.stepPaid,     desc: s.descPaid,
          done: found.status === "paid" || found.escrowStatus === "held" || found.escrowStatus === "released",
          at: found.paidAt },
        { key: "held",     label: s.stepHeld,     desc: s.descHeld,
          done: found.escrowStatus === "held" || found.escrowStatus === "released",
          at: null },
        { key: "released", label: s.stepReleased, desc: s.descReleased,
          done: found.escrowStatus === "released",
          at: found.escrowStatus === "released" ? found.updatedAt : null },
      ]
    : [];
  const activeIdx = steps.findIndex((x) => !x.done);

  const failed = found?.status === "failed";
  const refunded = found?.status === "refunded" || found?.escrowStatus === "refunded";

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2">
        <Package className="w-6 h-6 text-teal-600 flex-shrink-0" />
        <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
      </div>
      <p className="text-sm text-gray-500 -mt-3">{s.hint}</p>

      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 focus-within:border-teal-500">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void search(query); }}
            placeholder={s.placeholder}
            className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <button
          type="button"
          onClick={() => void search(query)}
          disabled={loading || !query.trim()}
          className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-1">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : s.button}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {found && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border-2 ${
            refunded ? "bg-amber-50 border-amber-300"
              : failed ? "bg-red-50 border-red-300"
              : found.escrowStatus === "released" ? "bg-green-50 border-green-300"
              : "bg-teal-50 border-teal-300"}`}>
            <div className="flex items-center gap-3">
              {refunded ? <RefreshCw className="w-8 h-8 text-amber-600 flex-shrink-0" />
                : failed ? <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                : found.escrowStatus === "released" ? <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                : found.status === "paid" ? <ShieldCheck className="w-8 h-8 text-teal-600 flex-shrink-0" />
                : <Clock className="w-8 h-8 text-teal-600 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 break-words">
                  {refunded ? s.refunded
                    : failed ? s.failed
                    : found.escrowStatus === "released" ? s.stepReleased
                    : found.status === "paid" ? s.stepHeld
                    : s.awaiting}
                </p>
                <p className="text-sm text-gray-500 font-mono break-all">{found.orderNumber}</p>
                {found.totalXAF > 0 && (
                  <p className="text-sm text-gray-700 mt-0.5">{s.total}: <b>{money(found.totalXAF)}</b></p>
                )}
              </div>
            </div>

            {/* A failed payment says WHY, in the buyer's language - the same
                translator the checkout uses. No new dictionary. */}
            {failed && (
              <p className="text-sm text-red-700 mt-3 pt-3 border-t border-red-200">
                {campayFailureMessage(found.failureReason, lang)}
              </p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4">{s.history}</h2>
            {steps.map((step, idx) => (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? "bg-teal-600"
                      : idx === activeIdx ? "bg-teal-100 border-2 border-teal-600"
                      : "bg-gray-100 border-2 border-gray-200"}`}>
                    {step.done && <CheckCircle className="w-3 h-3 text-white" />}
                    {!step.done && idx === activeIdx && <div className="w-2 h-2 bg-teal-600 rounded-full" />}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-10 ${step.done ? "bg-teal-600" : "bg-gray-200"}`} />
                  )}
                </div>
                <div className="pb-5 flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    step.done ? "text-gray-900" : idx === activeIdx ? "text-teal-700" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{step.desc}</p>
                  {step.at && <p className="text-xs text-gray-400 mt-1">{when(step.at)}</p>}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackingPage;
// BAMBEH_END_TOKEN__TRACKINGPAGE_FIX359__COMPLETE
