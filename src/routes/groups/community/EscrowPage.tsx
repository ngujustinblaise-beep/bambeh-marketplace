/**
 * ---------------------------------------------------------------------------
 * FIX180-ESCROW-START
 * ESCROW PAGE — BAMBEH MARKETPLACE (production)
 *
 * Replaces the old MOCK_ESCROW demo stub entirely. No mock data, no Firebase.
 *
 * Data source (verified against live schema 2026-07-23):
 *   public.escrows        id, order_id(text), buyer_id, seller_id, seller_name,
 *                         seller_trust_score, item_name, item_image,
 *                         amount_xaf, amount_zerm, status,
 *                         can_confirm_receipt, can_raise_dispute,
 *                         deadline_date, dispute_window_ends_at,
 *                         created_at, updated_at
 *   public.escrow_steps   escrow_id, step_no, label, sublabel, step_date,
 *                         completed, active
 *
 * Money-moving actions go through existing server-side RPCs ONLY.
 * The client never writes to escrows, never releases funds:
 *   confirm_escrow_receipt(p_escrow_id, p_actor_id, p_idempotency_key)
 *   create_escrow_dispute(p_escrow_id, p_actor_id, p_reason, p_evidence_urls)
 *
 * Routes (App.tsx):
 *   /escrow            -> list mode  (every escrow where I am buyer or seller)
 *   /escrow/:orderId   -> detail mode
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";
import {
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Clock,
  Check,
  Loader2,
  PackageOpen,
  Lock,
  Scale,
  FileClock,
  X,
} from "lucide-react";

/* ===========================================================================
   Types — mirror the live tables exactly
   =========================================================================== */

type EscrowRow = {
  id: string;
  order_id: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  seller_name: string | null;
  seller_trust_score: number | null;
  item_name: string | null;
  item_image: string | null;
  amount_xaf: number | null;
  amount_zerm: number | null;
  status: string | null;
  can_confirm_receipt: boolean | null;
  can_raise_dispute: boolean | null;
  deadline_date: string | null;
  dispute_window_ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type StepRow = {
  id: number;
  escrow_id: string;
  step_no: number | null;
  label: string | null;
  sublabel: string | null;
  step_date: string | null;
  completed: boolean | null;
  active: boolean | null;
};

type Role = "buyer" | "seller" | "none";
type LangKey = "en" | "fr" | "pidgin" | "ar" | "ff";

/* ===========================================================================
   Copy — 5 languages. Keys match useAppLang() output codes.
   =========================================================================== */

const COPY: Record<LangKey, Record<string, string>> = {
  en: {
    back: "Back to Orders",
    title: "Escrow Protection",
    listTitle: "Your protected transactions",
    listSubtitle: "Every order where your money is being held safely.",
    emptyTitle: "No protected transactions yet",
    emptyBody:
      "When you buy something on Bambeh, your payment is held here until you confirm the item arrived.",
    emptyCta: "Browse the marketplace",
    loading: "Loading your escrow…",
    notFound: "Escrow not found",
    notFoundBody:
      "No escrow exists for this order, or it does not belong to your account.",
    youAreBuyer: "You are the buyer",
    youAreSeller: "You are the seller",
    safeTitle: "Your money is safe",
    safeBody:
      "Funds stay locked until you confirm delivery or a dispute is resolved. The seller cannot touch them before then.",
    order: "Order",
    escrowId: "Escrow ID",
    deadline: "Deadline",
    disputeWindow: "Dispute window closes",
    soldBy: "Sold by",
    trust: "Trust score",
    progress: "Transaction progress",
    progressEmpty:
      "No steps recorded yet. Here is how every Bambeh escrow works:",
    hiw1: "Buyer pays — funds are locked in escrow",
    hiw2: "Seller ships or hands over the item",
    hiw3: "Buyer confirms the item arrived",
    hiw4: "Funds are released to the seller",
    actions: "Your actions",
    confirmBtn: "Confirm I received my item",
    disputeBtn: "Report a problem",
    sellerWait: "Waiting on the buyer",
    sellerWaitBody:
      "Funds are held for you. They are released once the buyer confirms the item arrived.",
    noActions: "No actions available on this transaction right now.",
    confirmTitle: "Confirm receipt",
    confirmBody:
      "This releases the payment to the seller. Only do this after you have the item in hand and it is what you expected.",
    confirmRelease: "You are releasing",
    confirmYes: "Yes, release payment",
    cancel: "Cancel",
    working: "Working…",
    disputeTitle: "Report a problem",
    disputeBody:
      "Describe what went wrong. Funds stay frozen while our team reviews the case.",
    disputeLabel: "What happened?",
    disputePlaceholder:
      "Item never arrived, item is damaged, item is different from the listing…",
    disputeSubmit: "Submit report",
    okConfirm: "Receipt confirmed. The payment is being released to the seller.",
    okDispute: "Report submitted. Our team will review it within 48 hours.",
    errGeneric: "That did not go through. Check your connection and try again.",
    protections: "How Bambeh protects you",
    p1t: "Funds stay frozen",
    p1b: "The seller cannot access the money until release is approved.",
    p2t: "48-hour review",
    p2b: "Reported problems are reviewed within two days.",
    p3t: "Server-verified",
    p3b: "Every release is validated on our servers, never in the app.",
    p4t: "Full audit trail",
    p4b: "Every escrow event is logged and cannot be edited.",
    view: "View details",
  },
  fr: {
    back: "Retour aux commandes",
    title: "Protection Escrow",
    listTitle: "Vos transactions protégées",
    listSubtitle: "Chaque commande dont l'argent est conservé en sécurité.",
    emptyTitle: "Aucune transaction protégée",
    emptyBody:
      "Quand vous achetez sur Bambeh, votre paiement est conservé ici jusqu'à ce que vous confirmiez la réception.",
    emptyCta: "Parcourir la marketplace",
    loading: "Chargement de votre escrow…",
    notFound: "Escrow introuvable",
    notFoundBody:
      "Aucun escrow pour cette commande, ou il n'appartient pas à votre compte.",
    youAreBuyer: "Vous êtes l'acheteur",
    youAreSeller: "Vous êtes le vendeur",
    safeTitle: "Votre argent est en sécurité",
    safeBody:
      "Les fonds restent bloqués jusqu'à confirmation de la livraison ou résolution du litige. Le vendeur ne peut pas y toucher avant.",
    order: "Commande",
    escrowId: "ID Escrow",
    deadline: "Échéance",
    disputeWindow: "Fin du délai de litige",
    soldBy: "Vendu par",
    trust: "Score de confiance",
    progress: "Progression de la transaction",
    progressEmpty:
      "Aucune étape enregistrée. Voici comment fonctionne chaque escrow Bambeh :",
    hiw1: "L'acheteur paie — les fonds sont bloqués",
    hiw2: "Le vendeur expédie ou remet l'article",
    hiw3: "L'acheteur confirme la réception",
    hiw4: "Les fonds sont versés au vendeur",
    actions: "Vos actions",
    confirmBtn: "Confirmer que j'ai reçu mon article",
    disputeBtn: "Signaler un problème",
    sellerWait: "En attente de l'acheteur",
    sellerWaitBody:
      "Les fonds sont conservés pour vous. Ils seront versés dès que l'acheteur confirmera la réception.",
    noActions: "Aucune action disponible sur cette transaction actuellement.",
    confirmTitle: "Confirmer la réception",
    confirmBody:
      "Ceci verse le paiement au vendeur. Ne le faites qu'après avoir reçu l'article et vérifié qu'il correspond.",
    confirmRelease: "Vous versez",
    confirmYes: "Oui, verser le paiement",
    cancel: "Annuler",
    working: "En cours…",
    disputeTitle: "Signaler un problème",
    disputeBody:
      "Décrivez ce qui s'est passé. Les fonds restent gelés pendant l'examen du dossier.",
    disputeLabel: "Que s'est-il passé ?",
    disputePlaceholder:
      "L'article n'est jamais arrivé, il est endommagé, il ne correspond pas à l'annonce…",
    disputeSubmit: "Envoyer le signalement",
    okConfirm: "Réception confirmée. Le paiement est versé au vendeur.",
    okDispute: "Signalement envoyé. Notre équipe l'examinera sous 48 heures.",
    errGeneric: "Cela n'a pas fonctionné. Vérifiez votre connexion et réessayez.",
    protections: "Comment Bambeh vous protège",
    p1t: "Fonds toujours gelés",
    p1b: "Le vendeur ne peut pas accéder à l'argent avant approbation.",
    p2t: "Examen sous 48 h",
    p2b: "Les problèmes signalés sont examinés sous deux jours.",
    p3t: "Vérifié côté serveur",
    p3b: "Chaque versement est validé sur nos serveurs, jamais dans l'application.",
    p4t: "Piste d'audit complète",
    p4b: "Chaque événement est journalisé et ne peut être modifié.",
    view: "Voir les détails",
  },
  pidgin: {
    back: "Go back to Orders",
    title: "Escrow Protection",
    listTitle: "Your protected transactions",
    listSubtitle: "Every order wey your money dey hold safe.",
    emptyTitle: "You never get any protected transaction",
    emptyBody:
      "When you buy something for Bambeh, we go hold your money here until you confirm say the thing don reach.",
    emptyCta: "Go check marketplace",
    loading: "We dey load your escrow…",
    notFound: "We no see this escrow",
    notFoundBody:
      "No escrow dey for this order, or e no belong to your account.",
    youAreBuyer: "Na you be the buyer",
    youAreSeller: "Na you be the seller",
    safeTitle: "Your money dey safe",
    safeBody:
      "Money go stay lock until you confirm say the thing don reach, or until dispute settle. Seller no fit touch am before then.",
    order: "Order",
    escrowId: "Escrow ID",
    deadline: "Deadline",
    disputeWindow: "Time to report problem go close",
    soldBy: "Seller na",
    trust: "Trust score",
    progress: "How the transaction dey go",
    progressEmpty: "No step dey recorded yet. Na so every Bambeh escrow dey work:",
    hiw1: "Buyer pay — money lock for escrow",
    hiw2: "Seller send or give the item",
    hiw3: "Buyer confirm say the thing don reach",
    hiw4: "Money go enter seller hand",
    actions: "Your actions",
    confirmBtn: "Confirm say I don receive my item",
    disputeBtn: "Report problem",
    sellerWait: "We dey wait the buyer",
    sellerWaitBody:
      "We dey hold the money for you. E go release once buyer confirm say the thing don reach.",
    noActions: "No action dey for this transaction now.",
    confirmTitle: "Confirm say you don receive am",
    confirmBody:
      "This one go send the money go seller. Only do am after the item don reach your hand and e correct.",
    confirmRelease: "You dey release",
    confirmYes: "Yes, release the money",
    cancel: "Cancel",
    working: "E dey work…",
    disputeTitle: "Report problem",
    disputeBody:
      "Explain wetin happen. Money go remain freeze while our team dey check am.",
    disputeLabel: "Wetin happen?",
    disputePlaceholder:
      "Item no reach, item spoil, or item no be wetin dem post…",
    disputeSubmit: "Send report",
    okConfirm: "You don confirm. We dey release the money go seller.",
    okDispute: "Report don enter. Our team go check am within 48 hours.",
    errGeneric: "E no work. Check your network make you try again.",
    protections: "How Bambeh dey protect you",
    p1t: "Money always freeze",
    p1b: "Seller no fit collect the money until dem approve release.",
    p2t: "48 hours review",
    p2b: "Any problem wey you report, dem go check am within two days.",
    p3t: "Server dey verify",
    p3b: "Every release dey checked for our server, no be for the app.",
    p4t: "Full audit trail",
    p4b: "Every escrow event dey logged and nobody fit edit am.",
    view: "See details",
  },
  ar: {
    back: "العودة إلى الطلبات",
    title: "حماية الضمان",
    listTitle: "معاملاتك المحمية",
    listSubtitle: "كل طلب يتم الاحتفاظ بأمواله بأمان.",
    emptyTitle: "لا توجد معاملات محمية بعد",
    emptyBody:
      "عند الشراء من Bambeh، يتم الاحتفاظ بمبلغك هنا حتى تؤكد وصول المنتج.",
    emptyCta: "تصفح السوق",
    loading: "جارٍ تحميل الضمان…",
    notFound: "لم يتم العثور على الضمان",
    notFoundBody: "لا يوجد ضمان لهذا الطلب، أو أنه لا يخص حسابك.",
    youAreBuyer: "أنت المشتري",
    youAreSeller: "أنت البائع",
    safeTitle: "أموالك في أمان",
    safeBody:
      "تبقى الأموال مقفلة حتى تؤكد الاستلام أو يُحل النزاع. لا يمكن للبائع الوصول إليها قبل ذلك.",
    order: "الطلب",
    escrowId: "رقم الضمان",
    deadline: "الموعد النهائي",
    disputeWindow: "انتهاء مدة النزاع",
    soldBy: "البائع",
    trust: "درجة الثقة",
    progress: "تقدم المعاملة",
    progressEmpty: "لا توجد خطوات مسجلة بعد. هكذا يعمل الضمان في Bambeh:",
    hiw1: "يدفع المشتري — تُقفل الأموال في الضمان",
    hiw2: "يشحن البائع المنتج أو يسلمه",
    hiw3: "يؤكد المشتري وصول المنتج",
    hiw4: "تُحوَّل الأموال إلى البائع",
    actions: "إجراءاتك",
    confirmBtn: "تأكيد استلام المنتج",
    disputeBtn: "الإبلاغ عن مشكلة",
    sellerWait: "في انتظار المشتري",
    sellerWaitBody:
      "الأموال محفوظة لك. سيتم تحويلها بمجرد تأكيد المشتري وصول المنتج.",
    noActions: "لا توجد إجراءات متاحة لهذه المعاملة حالياً.",
    confirmTitle: "تأكيد الاستلام",
    confirmBody:
      "هذا يحوّل المبلغ إلى البائع. لا تفعل ذلك إلا بعد استلام المنتج والتأكد من مطابقته.",
    confirmRelease: "أنت تحوّل",
    confirmYes: "نعم، حوّل المبلغ",
    cancel: "إلغاء",
    working: "جارٍ التنفيذ…",
    disputeTitle: "الإبلاغ عن مشكلة",
    disputeBody: "صف ما حدث. تبقى الأموال مجمدة أثناء مراجعة فريقنا للحالة.",
    disputeLabel: "ماذا حدث؟",
    disputePlaceholder: "لم يصل المنتج، أو تالف، أو مختلف عن الإعلان…",
    disputeSubmit: "إرسال البلاغ",
    okConfirm: "تم تأكيد الاستلام. يتم تحويل المبلغ إلى البائع.",
    okDispute: "تم إرسال البلاغ. سيراجعه فريقنا خلال 48 ساعة.",
    errGeneric: "لم تنجح العملية. تحقق من اتصالك وحاول مرة أخرى.",
    protections: "كيف يحميك Bambeh",
    p1t: "الأموال مجمدة دائماً",
    p1b: "لا يمكن للبائع الوصول إلى المال قبل الموافقة على التحويل.",
    p2t: "مراجعة خلال 48 ساعة",
    p2b: "تتم مراجعة المشكلات المبلَّغ عنها خلال يومين.",
    p3t: "تحقق من الخادم",
    p3b: "كل تحويل يتم التحقق منه على خوادمنا، وليس داخل التطبيق.",
    p4t: "سجل تدقيق كامل",
    p4b: "كل حدث ضمان مسجل ولا يمكن تعديله.",
    view: "عرض التفاصيل",
  },
  ff: {
    back: "Rutto e Ordoruuji",
    title: "Kisal Escrow",
    listTitle: "Njuɓɓudi maa reenaaɗi",
    listSubtitle: "Kala ordoru mo kaalis maa reenaa e jam.",
    emptyTitle: "A alaa njuɓɓudi reenaaɗi tawo",
    emptyBody:
      "So a soodii e Bambeh, kaalis maa reenete ɗoo haa nde kaɓɓitiɗaa ko kuutorɗam heɓii.",
    emptyCta: "Yiy luumo",
    loading: "Escrow maa ina loowee…",
    notFound: "Escrow oo yiytaaka",
    notFoundBody: "Escrow alaa e ndee ordoru, walla o wonaa konte maa.",
    youAreBuyer: "Aan woni soodoowo",
    youAreSeller: "Aan woni jeeyoowo",
    safeTitle: "Kaalis maa ina e jam",
    safeBody:
      "Kaalis oo ina uddaa haa nde kaɓɓitiɗaa jaɓgol walla nde luural ngal timmi. Jeeyoowo oo waawaa memde mo hade ɗum.",
    order: "Ordoru",
    escrowId: "Tonngoode Escrow",
    deadline: "Happoore",
    disputeWindow: "Sahaa luural ina uddoo",
    soldBy: "Jeeyaa e",
    trust: "Hoolaare",
    progress: "Yahdu njuɓɓudi ndi",
    progressEmpty: "Alaa tappe winndaaɗe tawo. Ko nii escrow Bambeh gollortoo:",
    hiw1: "Soodoowo yoɓii — kaalis uddaa e escrow",
    hiw2: "Jeeyoowo neldii walla hokkii kuutorɗam",
    hiw3: "Soodoowo kaɓɓitii ko kuutorɗam heɓii",
    hiw4: "Kaalis oo yaha to jeeyoowo",
    actions: "Golle maa",
    confirmBtn: "Kaɓɓito mi heɓii kuutorɗam am",
    disputeBtn: "Wiy caɗeele",
    sellerWait: "Ina fadaa soodoowo",
    sellerWaitBody:
      "Kaalis oo ina reenanaa ma. O yaltata so soodoowo kaɓɓitii ko heɓii.",
    noActions: "Alaa golle gaadanteeɗe e ndee njuɓɓudi jooni.",
    confirmTitle: "Kaɓɓito jaɓgol",
    confirmBody:
      "Ɗum na neldana jeeyoowo kaalis. Waɗ ɗum tan so kuutorɗam heɓii e juuɗe maa e ina moƴƴi.",
    confirmRelease: "Aɗa yaltina",
    confirmYes: "Eey, yaltin kaalis",
    cancel: "Haaytu",
    working: "Ina golloo…",
    disputeTitle: "Wiy caɗeele",
    disputeBody:
      "Sifo ko waɗi. Kaalis oo heddoto uddaaɗo fewndo ko yiilirde amen ndaarata.",
    disputeLabel: "Ko waɗi?",
    disputePlaceholder:
      "Kuutorɗam heɓaaki, walla bonii, walla o wonaa no winndaa…",
    disputeSubmit: "Neldu wiyoore",
    okConfirm: "Jaɓgol kaɓɓitaama. Kaalis ina yaltinee to jeeyoowo.",
    okDispute: "Wiyoore neldaama. Yiilirde amen ndaarat nde e nder 48 waktuuji.",
    errGeneric: "Ɗum yahaani. Ƴeew jokkondiral maa ndaraa kadi.",
    protections: "No Bambeh reenirta ma",
    p1t: "Kaalis ina uddaa sahaa kala",
    p1b: "Jeeyoowo waawaa heɓde kaalis haa nde yamiraama.",
    p2t: "Ndaarngal 48 waktuuji",
    p2b: "Caɗeele wiyaaɗe ndaaretee e nder balɗe ɗiɗi.",
    p3t: "Ƴeewndaaɗo e server",
    p3b: "Kala yaltingol ƴeewndete e serveruuji amen, wonaa e app oo.",
    p4t: "Winndannde timmunde",
    p4b: "Kala ko waɗata e escrow winndete, hay gooto waawaa waylude ɗum.",
    view: "Yiy geɗe ɗee",
  },
};

/* ===========================================================================
   Helpers
   =========================================================================== */

function resolveLang(raw: unknown): LangKey {
  const v = String(raw ?? "en").toLowerCase();
  if (v === "pcm" || v === "pidgin") return "pidgin";
  if (v === "fr" || v === "fra") return "fr";
  if (v === "ar" || v === "ara") return "ar";
  if (v === "ff" || v === "ful" || v === "fuv") return "ff";
  return "en";
}

function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString("fr-FR");
}

function shortDate(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Never hardcode the status vocabulary — the DB owns it. Known statuses get a
 * colour; anything unknown is prettified so the page can never break on a
 * status we have not seen before.
 */
function statusTheme(status: string | null | undefined) {
  const s = String(status ?? "").toLowerCase();
  if (s.includes("complete") || s.includes("released"))
    return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("dispute") || s.includes("problem"))
    return "bg-red-100 text-red-800 border-red-200";
  if (s.includes("refund"))
    return "bg-gray-100 text-gray-800 border-gray-200";
  if (s.includes("deliver"))
    return "bg-teal-100 text-teal-800 border-teal-200";
  if (s.includes("transit") || s.includes("ship"))
    return "bg-purple-100 text-purple-800 border-purple-200";
  if (s.includes("pending") || s.includes("await"))
    return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
}

function prettyStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return String(status)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ===========================================================================
   Small presentational pieces
   =========================================================================== */

function StatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTheme(
        status
      )}`}
    >
      {prettyStatus(status)}
    </span>
  );
}

function Sheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ===========================================================================
   Main component
   =========================================================================== */

export default function EscrowPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const rawLang = useLang();
  const lang = resolveLang(rawLang);
  const c = COPY[lang];
  const rtl = lang === "ar";

  const [userId, setUserId] = useState<string | null>(null);
  const [escrow, setEscrow] = useState<EscrowRow | null>(null);
  const [list, setList] = useState<EscrowRow[]>([]);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState("");

  /* ---------------------------------------------------------------- load */

  const load = useCallback(async () => {
    setLoading(true);
    setProblem(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      // ---- LIST MODE ----------------------------------------------------
      if (!orderId) {
        const { data, error } = await supabase
          .from("escrows")
          .select("*")
          .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setList((data as EscrowRow[]) ?? []);
        setEscrow(null);
        setSteps([]);
        setLoading(false);
        return;
      }

      // ---- DETAIL MODE --------------------------------------------------
      // order_id is TEXT in this schema. Try order_id first, then fall back
      // to the escrow's own uuid so either link shape works.
      let row: EscrowRow | null = null;

      const byOrder = await supabase
        .from("escrows")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (byOrder.data) {
        row = byOrder.data as EscrowRow;
      } else {
        const looksUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            orderId
          );
        if (looksUuid) {
          const byId = await supabase
            .from("escrows")
            .select("*")
            .eq("id", orderId)
            .maybeSingle();
          if (byId.data) row = byId.data as EscrowRow;
        }
      }

      if (!row) {
        setEscrow(null);
        setSteps([]);
        setLoading(false);
        return;
      }

      // Ownership check on top of RLS — belt and braces.
      if (row.buyer_id !== uid && row.seller_id !== uid) {
        setEscrow(null);
        setSteps([]);
        setLoading(false);
        return;
      }

      setEscrow(row);

      const { data: stepRows } = await supabase
        .from("escrow_steps")
        .select("*")
        .eq("escrow_id", row.id)
        .order("step_no", { ascending: true });

      setSteps((stepRows as StepRow[]) ?? []);
    } catch (e: any) {
      setProblem(e?.message || c.errGeneric);
    } finally {
      setLoading(false);
    }
  }, [orderId, c.errGeneric]);

  useEffect(() => {
    load();
  }, [load]);

  /* --------------------------------------------------------------- role */

  const role: Role = useMemo(() => {
    if (!escrow || !userId) return "none";
    if (escrow.buyer_id === userId) return "buyer";
    if (escrow.seller_id === userId) return "seller";
    return "none";
  }, [escrow, userId]);

  const canConfirm = role === "buyer" && escrow?.can_confirm_receipt === true;
  const canDispute = role === "buyer" && escrow?.can_raise_dispute === true;

  /* ------------------------------------------------------------ actions */

  async function doConfirm() {
    if (!escrow || !userId) return;
    setBusy(true);
    setProblem(null);
    try {
      // Stable key: a double-tap can never release funds twice.
      const { data, error } = await supabase.rpc("confirm_escrow_receipt", {
        p_escrow_id: escrow.id,
        p_actor_id: userId,
        p_idempotency_key: `confirm:${escrow.id}:${userId}`,
      });
      if (error) throw error;

      const msg =
        (data && typeof data === "object" && (data as any).message) || c.okConfirm;
      setNotice(String(msg));
      setConfirmOpen(false);
      await load();
    } catch (e: any) {
      setProblem(e?.message || c.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function doDispute() {
    if (!escrow || !userId || !reason.trim()) return;
    setBusy(true);
    setProblem(null);
    try {
      const args: Record<string, unknown> = {
        p_escrow_id: escrow.id,
        p_actor_id: userId,
        p_reason: reason.trim(),
        p_evidence_urls: [],
      };

      let { data, error } = await supabase.rpc("create_escrow_dispute", args);

      // If the deployed signature has no evidence parameter, retry without it.
      if (error && /p_evidence_urls|does not exist|PGRST202/i.test(error.message || "")) {
        delete args.p_evidence_urls;
        ({ data, error } = await supabase.rpc("create_escrow_dispute", args));
      }
      if (error) throw error;

      const msg =
        (data && typeof data === "object" && (data as any).message) || c.okDispute;
      setNotice(String(msg));
      setReason("");
      setDisputeOpen(false);
      await load();
    } catch (e: any) {
      setProblem(e?.message || c.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------- render */

  const shell =
    "min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 px-4 py-8";

  if (loading) {
    return (
      <div className={shell} dir={rtl ? "rtl" : "ltr"}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <Loader2 className="animate-spin text-teal-600" size={20} />
          <span className="text-gray-700">{c.loading}</span>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className={shell} dir={rtl ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-gray-800">{c.notFoundBody}</p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white hover:bg-teal-700"
          >
            {c.title}
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------- LIST MODE */

  if (!orderId) {
    return (
      <div className={shell} dir={rtl ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-3xl">
          <header className="mb-6">
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900"
            >
              <ArrowLeft size={16} /> {c.back}
            </Link>
            <h1 className="mt-4 flex items-center gap-2 text-3xl font-bold text-gray-900">
              <ShieldCheck className="text-teal-600" size={28} />
              {c.listTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{c.listSubtitle}</p>
          </header>

          {problem && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{problem}</span>
            </div>
          )}

          {list.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <PackageOpen className="mx-auto mb-4 text-gray-300" size={48} />
              <h2 className="text-lg font-bold text-gray-900">{c.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                {c.emptyBody}
              </p>
              <Link
                to="/marketplace"
                className="mt-6 inline-block rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
              >
                {c.emptyCta}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/escrow/${encodeURIComponent(e.order_id || e.id)}`}
                    className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {e.item_image ? (
                      <img
                        src={e.item_image}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <PackageOpen className="text-gray-400" size={22} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        {e.item_name || "—"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {c.order} #{e.order_id || e.id.slice(0, 8)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={e.status} />
                      </div>
                    </div>
                    <div className={rtl ? "text-left" : "text-right"}>
                      <div className="font-bold text-teal-700">
                        {money(e.amount_xaf)} XAF
                      </div>
                      {e.amount_zerm ? (
                        <div className="text-xs text-gray-500">
                          {money(e.amount_zerm)} Zerm
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------- DETAIL MODE */

  if (!escrow) {
    return (
      <div className={shell} dir={rtl ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 text-amber-500" size={40} />
          <h2 className="text-lg font-bold text-gray-900">{c.notFound}</h2>
          <p className="mt-2 text-sm text-gray-600">{c.notFoundBody}</p>
          <Link
            to="/escrow"
            className="mt-6 inline-block rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
          >
            {c.listTitle}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={shell} dir={rtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-6">
          <Link
            to="/escrow"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft size={16} /> {c.back}
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                <ShieldCheck className="text-teal-600" size={28} />
                {c.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {c.order} #{escrow.order_id || escrow.id.slice(0, 8)} ·{" "}
                <span className="font-medium text-gray-700">
                  {role === "buyer"
                    ? c.youAreBuyer
                    : role === "seller"
                    ? c.youAreSeller
                    : ""}
                </span>
              </p>
            </div>
            <StatusBadge status={escrow.status} />
          </div>
        </header>

        {notice && (
          <div
            className="mb-5 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            aria-live="polite"
          >
            <Check size={18} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
        {problem && (
          <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{problem}</span>
          </div>
        )}

        {/* Reassurance banner */}
        <section className="mb-6 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 p-5 text-white shadow-lg">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Lock size={18} /> {c.safeTitle}
          </h2>
          <p className="mt-1 text-sm text-teal-50">{c.safeBody}</p>
        </section>

        {/* Item + money */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {escrow.item_image ? (
              <img
                src={escrow.item_image}
                alt={escrow.item_name || ""}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100">
                <PackageOpen className="text-gray-400" size={26} />
              </div>
            )}
            <div className="min-w-[12rem] flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                {escrow.item_name || "—"}
              </h2>
              {escrow.seller_name && (
                <p className="mt-1 text-sm text-gray-600">
                  {c.soldBy}{" "}
                  <span className="font-semibold text-teal-700">
                    {escrow.seller_name}
                  </span>
                </p>
              )}
              {escrow.seller_trust_score !== null && (
                <p className="mt-0.5 text-sm text-gray-600">
                  {c.trust}: {Number(escrow.seller_trust_score).toFixed(1)}
                </p>
              )}
            </div>
            <div className={rtl ? "text-left" : "text-right"}>
              <div className="text-2xl font-bold text-teal-700">
                {money(escrow.amount_xaf)} XAF
              </div>
              {escrow.amount_zerm ? (
                <div className="text-xs text-gray-500">
                  {money(escrow.amount_zerm)} Zerm
                </div>
              ) : null}
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-400">{c.escrowId}</dt>
              <dd className="font-mono text-xs font-semibold text-gray-700">
                {escrow.id.slice(0, 8)}…
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">{c.deadline}</dt>
              <dd className="font-semibold text-gray-700">
                {shortDate(escrow.deadline_date)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">{c.disputeWindow}</dt>
              <dd className="font-semibold text-gray-700">
                {shortDate(escrow.dispute_window_ends_at)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Timeline */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <FileClock size={18} className="text-teal-600" /> {c.progress}
          </h3>

          {steps.length > 0 ? (
            <ol className="space-y-4">
              {steps.map((s) => (
                <li key={s.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      s.completed
                        ? "bg-teal-600 text-white"
                        : s.active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s.completed ? <Check size={16} /> : s.step_no ?? "•"}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        s.completed || s.active ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {s.label || "—"}
                    </p>
                    {s.sublabel && (
                      <p className="text-sm text-gray-500">{s.sublabel}</p>
                    )}
                    {s.step_date && (
                      <p className="mt-0.5 text-xs font-medium text-teal-700">
                        {s.step_date}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">{c.progressEmpty}</p>
              <ol className="space-y-3">
                {[c.hiw1, c.hiw2, c.hiw3, c.hiw4].map((label, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700">{label}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>

        {/* Actions */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-gray-900">{c.actions}</h3>

          {role === "seller" ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="flex items-center gap-2 font-semibold text-blue-900">
                <Clock size={16} /> {c.sellerWait}
              </p>
              <p className="mt-1 text-sm text-blue-800">{c.sellerWaitBody}</p>
            </div>
          ) : canConfirm || canDispute ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={!canConfirm || busy}
                className="w-full rounded-xl bg-teal-600 py-3.5 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {c.confirmBtn}
              </button>
              <button
                type="button"
                onClick={() => setDisputeOpen(true)}
                disabled={!canDispute || busy}
                className="w-full rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {c.disputeBtn}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{c.noActions}</p>
          )}
        </section>

        {/* Protections */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Scale size={18} className="text-teal-600" /> {c.protections}
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            {[
              [c.p1t, c.p1b],
              [c.p2t, c.p2b],
              [c.p3t, c.p3b],
              [c.p4t, c.p4b],
            ].map(([t, b]) => (
              <li key={t}>
                <span className="font-semibold text-gray-900">{t}:</span> {b}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Confirm receipt */}
      <Sheet
        open={confirmOpen}
        title={c.confirmTitle}
        onClose={() => setConfirmOpen(false)}
      >
        <p className="text-sm text-gray-700">{c.confirmBody}</p>
        <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900">
          {c.confirmRelease} {money(escrow.amount_xaf)} XAF
          {escrow.amount_zerm ? ` (${money(escrow.amount_zerm)} Zerm)` : ""}
          {escrow.seller_name ? ` → ${escrow.seller_name}` : ""}
        </p>
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={doConfirm}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? c.working : c.confirmYes}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200"
          >
            {c.cancel}
          </button>
        </div>
      </Sheet>

      {/* Raise dispute */}
      <Sheet
        open={disputeOpen}
        title={c.disputeTitle}
        onClose={() => setDisputeOpen(false)}
      >
        <p className="text-sm text-gray-700">{c.disputeBody}</p>
        <label
          htmlFor="escrow-dispute-reason"
          className="mb-2 mt-4 block text-sm font-medium text-gray-700"
        >
          {c.disputeLabel}
        </label>
        <textarea
          id="escrow-dispute-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
          placeholder={c.disputePlaceholder}
        />
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={doDispute}
            disabled={busy || !reason.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? c.working : c.disputeSubmit}
          </button>
          <button
            type="button"
            onClick={() => setDisputeOpen(false)}
            className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200"
          >
            {c.cancel}
          </button>
        </div>
      </Sheet>
    </div>
  );
}

/* FIX180-ESCROW-END */
