/**
 * SubscriptionPlans.tsx - Bambeh Marketplace (canonical subscription page)
 *
 * PRODUCTION RULES ENFORCED HERE:
 *  - Payment initiated ONLY via backend: POST /api/payments/subscribe
 *  - Activation is SERVER-SIDE ONLY (CamPay webhook). No client upsert.
 *  - No localStorage entitlement grants. Entitlement read from Supabase.
 *  - Translated into the 5 app languages: EN, FR, Pidgin, Arabic, Fulfulde.
 *  - Phone normalized/validated to Cameroon format (2376XXXXXXXX).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, CheckCircle, Crown, Loader2, Star, XCircle, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";

const API_BASE =
  ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) ||
  "https://bambeh-backend-production-6bca.up.railway.app";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ff";

function normalizeLang(v: unknown): LangCode {
  let code = "";
  if (typeof v === "string") code = v;
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    code = String(o.lang || o.language || o.currentLang || o.code || "");
  }
  code = code.toLowerCase();
  if (code.startsWith("fr")) return "fr";
  if (code.startsWith("ar")) return "ar";
  if (code.startsWith("ff") || code.startsWith("ful")) return "ff";
  if (code.startsWith("pcm") || code.includes("pidgin") || code === "pg") return "pcm";
  return "en";
}

const STRINGS: Record<LangCode, Record<string, string>> = {
  en: {
    title: "Subscribe to Bambeh",
    subtitle: "Pay with MTN MoMo or Orange Money. Your plan activates automatically once payment is confirmed.",
    back: "Back",
    backToPlans: "Back to plans",
    mostPopular: "MOST POPULAR",
    whatYouGet: "What you get:",
    select: "Select",
    phoneLabel: "Mobile Money number",
    phonePlaceholder: "6XX XX XX XX",
    phoneInvalid: "Enter a valid Cameroon number (9 digits starting with 6).",
    pay: "Pay",
    initiating: "Contacting payment service...",
    waiting: "Confirm the payment on your phone",
    waitingHint: "Dial your Mobile Money menu if no prompt appears. We are checking automatically.",
    success: "Payment confirmed!",
    successHint: "Your plan is being activated. Redirecting to the marketplace...",
    failed: "Payment was not completed.",
    timeout: "We could not confirm the payment in time. If you were charged, your plan will still activate automatically.",
    retry: "Try again",
    alreadyActive: "Subscription active",
    yourPlanIs: "Your current plan:",
    goMarketplace: "Go to Marketplace",
    loginFirst: "Please sign in to subscribe.",
    signIn: "Sign in",
    perDay: "24 hours",
    perWeek: "7 days",
    perMonth: "30 days",
    planDaily: "Daily Pass",
    planWeekly: "Weekly Plan",
    planMonthly: "Monthly Plan",
    securedBy: "Secured by CamPay - BAMBEH SARL - support@bambeh.com",
  },
  fr: {
    title: "Abonnez-vous \u00e0 Bambeh",
    subtitle: "Payez avec MTN MoMo ou Orange Money. Votre forfait s'active automatiquement apr\u00e8s confirmation du paiement.",
    back: "Retour",
    backToPlans: "Retour aux forfaits",
    mostPopular: "LE PLUS POPULAIRE",
    whatYouGet: "Ce que vous obtenez :",
    select: "Choisir",
    phoneLabel: "Num\u00e9ro Mobile Money",
    phonePlaceholder: "6XX XX XX XX",
    phoneInvalid: "Entrez un num\u00e9ro camerounais valide (9 chiffres commen\u00e7ant par 6).",
    pay: "Payer",
    initiating: "Connexion au service de paiement...",
    waiting: "Confirmez le paiement sur votre t\u00e9l\u00e9phone",
    waitingHint: "Composez votre menu Mobile Money si aucune demande n'appara\u00eet. V\u00e9rification automatique en cours.",
    success: "Paiement confirm\u00e9 !",
    successHint: "Votre forfait est en cours d'activation. Redirection vers le march\u00e9...",
    failed: "Le paiement n'a pas \u00e9t\u00e9 effectu\u00e9.",
    timeout: "Impossible de confirmer le paiement \u00e0 temps. Si vous avez \u00e9t\u00e9 d\u00e9bit\u00e9, votre forfait sera quand m\u00eame activ\u00e9 automatiquement.",
    retry: "R\u00e9essayer",
    alreadyActive: "Abonnement actif",
    yourPlanIs: "Votre forfait actuel :",
    goMarketplace: "Aller au March\u00e9",
    loginFirst: "Veuillez vous connecter pour vous abonner.",
    signIn: "Se connecter",
    perDay: "24 heures",
    perWeek: "7 jours",
    perMonth: "30 jours",
    planDaily: "Pass Journalier",
    planWeekly: "Forfait Hebdomadaire",
    planMonthly: "Forfait Mensuel",
    securedBy: "S\u00e9curis\u00e9 par CamPay - BAMBEH SARL - support@bambeh.com",
  },
  pcm: {
    title: "Subscribe for Bambeh",
    subtitle: "Pay with MTN MoMo or Orange Money. Your plan go activate by itself once payment confirm.",
    back: "Go back",
    backToPlans: "Go back for plans",
    mostPopular: "PEOPLE DEY LIKE AM PASS",
    whatYouGet: "Wetin you go get:",
    select: "Choose am",
    phoneLabel: "Mobile Money number",
    phonePlaceholder: "6XX XX XX XX",
    phoneInvalid: "Put correct Cameroon number (9 digit wey start with 6).",
    pay: "Pay",
    initiating: "We dey call payment service...",
    waiting: "Confirm the payment for your phone",
    waitingHint: "If nothing show, dial your Mobile Money menu. We dey check am automatic.",
    success: "Payment don confirm!",
    successHint: "Your plan dey activate. We dey carry you go marketplace...",
    failed: "Payment no complete.",
    timeout: "We no fit confirm the payment for time. If dem don charge you, your plan go still activate by itself.",
    retry: "Try again",
    alreadyActive: "Subscription dey active",
    yourPlanIs: "Your plan now na:",
    goMarketplace: "Go Marketplace",
    loginFirst: "Abeg sign in first before you subscribe.",
    signIn: "Sign in",
    perDay: "24 hours",
    perWeek: "7 days",
    perMonth: "30 days",
    planDaily: "Daily Pass",
    planWeekly: "Weekly Plan",
    planMonthly: "Monthly Plan",
    securedBy: "Secured by CamPay - BAMBEH SARL - support@bambeh.com",
  },
  ar: {
    title: "\u0627\u0634\u062a\u0631\u0643 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647",
    subtitle: "\u0627\u062f\u0641\u0639 \u0639\u0628\u0631 MTN MoMo \u0623\u0648 Orange Money. \u064a\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u062e\u0637\u062a\u0643 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639.",
    back: "\u0631\u062c\u0648\u0639",
    backToPlans: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u062e\u0637\u0637",
    mostPopular: "\u0627\u0644\u0623\u0643\u062b\u0631 \u0634\u0639\u0628\u064a\u0629",
    whatYouGet: "\u0645\u0627\u0630\u0627 \u0633\u062a\u062d\u0635\u0644 \u0639\u0644\u064a\u0647:",
    select: "\u0627\u062e\u062a\u0631",
    phoneLabel: "\u0631\u0642\u0645 Mobile Money",
    phonePlaceholder: "6XX XX XX XX",
    phoneInvalid: "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645\u0627\u064b \u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a\u0627\u064b \u0635\u062d\u064a\u062d\u0627\u064b (9 \u0623\u0631\u0642\u0627\u0645 \u062a\u0628\u062f\u0623 \u0628\u0640 6).",
    pay: "\u0627\u062f\u0641\u0639",
    initiating: "\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u062e\u062f\u0645\u0629 \u0627\u0644\u062f\u0641\u0639...",
    waiting: "\u0623\u0643\u062f \u0627\u0644\u062f\u0641\u0639 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0643",
    waitingHint: "\u0627\u0637\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 Mobile Money \u0625\u0630\u0627 \u0644\u0645 \u064a\u0638\u0647\u0631 \u0623\u064a \u0637\u0644\u0628. \u0646\u062d\u0646 \u0646\u062a\u062d\u0642\u0642 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b.",
    success: "\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639!",
    successHint: "\u064a\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u062e\u0637\u062a\u0643 \u0627\u0644\u0622\u0646. \u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0642...",
    failed: "\u0644\u0645 \u064a\u0643\u062a\u0645\u0644 \u0627\u0644\u062f\u0641\u0639.",
    timeout: "\u0644\u0645 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062d\u062f\u062f. \u0625\u0630\u0627 \u062a\u0645 \u062e\u0635\u0645 \u0627\u0644\u0645\u0628\u0644\u063a \u0641\u0633\u064a\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u062e\u0637\u062a\u0643 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b.",
    retry: "\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649",
    alreadyActive: "\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0645\u0641\u0639\u0644",
    yourPlanIs: "\u062e\u0637\u062a\u0643 \u0627\u0644\u062d\u0627\u0644\u064a\u0629:",
    goMarketplace: "\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0642",
    loginFirst: "\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0627\u0634\u062a\u0631\u0627\u0643.",
    signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    perDay: "24 \u0633\u0627\u0639\u0629",
    perWeek: "7 \u0623\u064a\u0627\u0645",
    perMonth: "30 \u064a\u0648\u0645\u0627\u064b",
    planDaily: "\u0628\u0637\u0627\u0642\u0629 \u064a\u0648\u0645\u064a\u0629",
    planWeekly: "\u062e\u0637\u0629 \u0623\u0633\u0628\u0648\u0639\u064a\u0629",
    planMonthly: "\u062e\u0637\u0629 \u0634\u0647\u0631\u064a\u0629",
    securedBy: "\u0645\u0624\u0645\u0646 \u0628\u0648\u0627\u0633\u0637\u0629 CamPay - BAMBEH SARL - support@bambeh.com",
  },
  ff: {
    title: "Winndito e Bambeh",
    subtitle: "Yobu e MTN MoMo walla Orange Money. Plan maa ina udditee e hoore mum so njobdi ndi tee\u0257aama.",
    back: "Rutto",
    backToPlans: "Rutto e planuuji",
    mostPopular: "KO \u0181URI YI\u018aEEDE",
    whatYouGet: "Ko ke\u0253ataa:",
    select: "Su\u0253o",
    phoneLabel: "Tonngoode Mobile Money",
    phonePlaceholder: "6XX XX XX XX",
    phoneInvalid: "Naatnu tonngoode Kameruun mo\u01b4\u01b4ere (limle 9 pu\u0257\u0257ortoo\u0257e e 6).",
    pay: "Yobu",
    initiating: "Mi\u0257en njokkondira e sarwiis njobdi...",
    waiting: "Tee\u0257to njobdi ndi e noddirgel maa",
    waitingHint: "So huunde fee\u00f1aani, uddit menu Mobile Money maa. Mi\u0257en ndaara e hoore amen.",
    success: "Njobdi ndi tee\u0257aama!",
    successHint: "Plan maa ina uddittee jooni. Mi\u0257en nawa ma to luumo...",
    failed: "Njobdi ndi timmaani.",
    timeout: "Min mbaawaani tee\u0257taade njobdi ndi e saanga. So a yo\u0253ii, plan maa ina uddittee tan e hoore mum.",
    retry: "Eto kadi",
    alreadyActive: "Winnditagol ina huu\u0253i",
    yourPlanIs: "Plan maa jooni ko:",
    goMarketplace: "Yah to Luumo",
    loginFirst: "Tii\u0257no naatu ko adii winnditagol.",
    signIn: "Naatu",
    perDay: "waktuuji 24",
    perWeek: "bal\u0257e 7",
    perMonth: "bal\u0257e 30",
    planDaily: "Pass \u00d1alawma",
    planWeekly: "Plan Yontere",
    planMonthly: "Plan Lewru",
    securedBy: "Hisnaama e CamPay - BAMBEH SARL - support@bambeh.com",
  },
};

const FEATURES: Record<LangCode, Record<string, string[]>> = {
  en: {
    daily: ["Full marketplace access", "Contact any seller", "Basic support"],
    weekly: ["All Daily features", "Unlimited seller contacts", "Advanced search filters", "Priority support"],
    monthly: ["All Weekly features", "VIP support (24/7)", "Featured listings", "Ad-free experience"],
  },
  fr: {
    daily: ["Acc\u00e8s complet au march\u00e9", "Contactez tout vendeur", "Assistance de base"],
    weekly: ["Tout le forfait Journalier", "Contacts vendeurs illimit\u00e9s", "Filtres de recherche avanc\u00e9s", "Assistance prioritaire"],
    monthly: ["Tout le forfait Hebdomadaire", "Assistance VIP (24h/24)", "Annonces en vedette", "Exp\u00e9rience sans publicit\u00e9"],
  },
  pcm: {
    daily: ["Full marketplace access", "Contact any seller", "Basic support"],
    weekly: ["All Daily things", "Contact seller anyhow you want", "Better search filter", "Priority support"],
    monthly: ["All Weekly things", "VIP support (24/7)", "Your listing go show for front", "No advert go worry you"],
  },
  ar: {
    daily: ["\u0648\u0635\u0648\u0644 \u0643\u0627\u0645\u0644 \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0642", "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u064a \u0628\u0627\u0626\u0639", "\u062f\u0639\u0645 \u0623\u0633\u0627\u0633\u064a"],
    weekly: ["\u0643\u0644 \u0645\u064a\u0632\u0627\u062a \u0627\u0644\u064a\u0648\u0645\u064a\u0629", "\u062a\u0648\u0627\u0635\u0644 \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639\u064a\u0646", "\u0641\u0644\u0627\u062a\u0631 \u0628\u062d\u062b \u0645\u062a\u0642\u062f\u0645\u0629", "\u062f\u0639\u0645 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629"],
    monthly: ["\u0643\u0644 \u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064a\u0629", "\u062f\u0639\u0645 VIP \u0639\u0644\u0649 \u0645\u062f\u0627\u0631 \u0627\u0644\u0633\u0627\u0639\u0629", "\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u0645\u064a\u0632\u0629", "\u062a\u062c\u0631\u0628\u0629 \u0628\u062f\u0648\u0646 \u0625\u0639\u0644\u0627\u0646\u0627\u062a"],
  },
  ff: {
    daily: ["Naatgol timmungol e luumo", "Jokkondir e kala jeeyoowo", "Ballal gadanal"],
    weekly: ["Fof ko woni e \u00d1alawma", "Jokkondiral jeeyoo\u0253e keeriindi", "Filteruuji njiilaw \u0253ur\u0257i", "Ballal adii\u0257um"],
    monthly: ["Fof ko woni e Yontere", "Ballal VIP (24/7)", "Jaayndeeji \u0253ur\u0257i fee\u00f1de", "Alaa jaaynde haljinoore"],
  },
};

const PLANS = [
  { id: "daily", price: 100, nameKey: "planDaily", durKey: "perDay", icon: Star, gradient: "from-amber-500 to-amber-700", popular: false },
  { id: "weekly", price: 500, nameKey: "planWeekly", durKey: "perWeek", icon: Zap, gradient: "from-teal-500 to-blue-600", popular: true },
  { id: "monthly", price: 1500, nameKey: "planMonthly", durKey: "perMonth", icon: Crown, gradient: "from-purple-600 to-indigo-700", popular: false },
] as const;

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^6\d{8}$/.test(digits)) return "237" + digits;
  if (/^2376\d{8}$/.test(digits)) return digits;
  return null;
}

type Phase = "idle" | "initiating" | "polling" | "success" | "failed";

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const auth = useAuth() as { user?: { id?: string } | null };
  const user = auth && auth.user ? auth.user : null;
  const userId = user && user.id ? user.id : null;

  const langState = useLang() as unknown;
  const lang = normalizeLang(langState);
  const t = (k: string): string => {
    const table = STRINGS[lang] || STRINGS.en;
    return table[k] !== undefined ? table[k] : (STRINGS.en[k] !== undefined ? STRINGS.en[k] : k);
  };
  const feats = (planId: string): string[] => {
    const table = FEATURES[lang] || FEATURES.en;
    return table[planId] || FEATURES.en[planId] || [];
  };
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [checkingActive, setCheckingActive] = useState(true);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [selected, setSelected] = useState<(typeof PLANS)[number] | null>(null);
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function checkEntitlement() {
      if (!userId) { setCheckingActive(false); return; }
      try {
        const { data } = await supabase
          .from("subscriptions")
          .select("plan_type,status,expires_at")
          .eq("user_id", userId)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();
        if (mounted && data && data.plan_type) setActivePlan(String(data.plan_type));
      } catch {
        /* entitlement check is best-effort; server remains source of truth */
      } finally {
        if (mounted) setCheckingActive(false);
      }
    }
    checkEntitlement();
    return () => { mounted = false; };
  }, [userId]);

  async function pollStatus(reference: string): Promise<"SUCCESSFUL" | "FAILED" | "TIMEOUT"> {
    const deadline = Date.now() + 180000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const res = await fetch(API_BASE + "/api/payments/status/" + encodeURIComponent(reference));
        const j = await res.json().catch(() => ({} as Record<string, unknown>));
        const raw = (j && (j.status || (j.data && (j.data as Record<string, unknown>).status))) || "";
        const st = String(raw).toUpperCase();
        if (st === "SUCCESSFUL" || st === "SUCCESS") return "SUCCESSFUL";
        if (st === "FAILED" || st === "CANCELLED") return "FAILED";
      } catch {
        /* transient network error: keep polling */
      }
    }
    return "TIMEOUT";
  }

  async function pay() {
    if (!selected || !userId) return;
    const normalized = normalizePhone(phone);
    if (!normalized) { setErrorMsg(t("phoneInvalid")); return; }
    setErrorMsg("");
    setPhase("initiating");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const { data } = await supabase.auth.getSession();
        const token = data && data.session ? data.session.access_token : null;
        if (token) headers["Authorization"] = "Bearer " + token;
      } catch { /* proceed without token; backend validates userId */ }

      const res = await fetch(API_BASE + "/api/payments/subscribe", {
        method: "POST",
        headers,
        body: JSON.stringify({ phone: normalized, planName: selected.id, userId }),
      });
      const j = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        const msg = (j && (j.message || j.error)) ? String(j.message || j.error) : ("HTTP " + res.status);
        throw new Error(msg);
      }
      const d = (j && j.data) ? (j.data as Record<string, unknown>) : ({} as Record<string, unknown>);
      const reference = String(j.reference || d.reference || j.external_reference || d.external_reference || "");
      if (!reference) throw new Error("No payment reference returned");

      setPhase("polling");
      const outcome = await pollStatus(reference);
      if (outcome === "SUCCESSFUL") {
        setPhase("success");
        setTimeout(() => navigate("/marketplace"), 3000);
      } else {
        setPhase("failed");
        setErrorMsg(outcome === "TIMEOUT" ? t("timeout") : t("failed"));
      }
    } catch (e) {
      setPhase("failed");
      const msg = e instanceof Error && e.message ? e.message : t("failed");
      setErrorMsg(msg);
    }
  }

  /* ---------- render states ---------- */

  if (checkingActive) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("loginFirst")}</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700"
          >
            {t("signIn")}
          </button>
        </div>
      </div>
    );
  }

  if (activePlan) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("alreadyActive")}</h2>
          <p className="text-gray-600 mb-4">{t("yourPlanIs")} {activePlan}</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700"
          >
            {t("goMarketplace")}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">{t("success")}</h2>
          <p className="text-gray-600">{t("successHint")}</p>
        </div>
      </div>
    );
  }

  if (selected) {
    const Icon = selected.icon;
    const busy = phase === "initiating" || phase === "polling";
    return (
      <div dir={dir} className="min-h-screen bg-gray-50">
        <div className={"bg-gradient-to-r " + selected.gradient + " text-white p-6"}>
          <button
            onClick={() => { if (!busy) { setSelected(null); setPhase("idle"); setErrorMsg(""); } }}
            className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 text-sm"
            disabled={busy}
          >
            <ArrowLeft className="h-5 w-5" /> {t("backToPlans")}
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full"><Icon className="h-7 w-7 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold">{t(selected.nameKey)}</h1>
              <p className="text-sm opacity-80">{t(selected.durKey)} - {selected.price.toLocaleString()} XAF</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">{t("whatYouGet")}</h3>
            <ul className="space-y-2">
              {feats(selected.id).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <label className="block font-semibold text-gray-800 mb-2">{t("phoneLabel")}</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePlaceholder")}
              disabled={busy}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />

            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            {phase === "polling" && (
              <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg p-3 mb-3">
                <Loader2 className="h-5 w-5 text-teal-600 animate-spin flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-teal-800">{t("waiting")}</p>
                  <p className="text-xs text-teal-700 mt-1">{t("waitingHint")}</p>
                </div>
              </div>
            )}

            <button
              onClick={pay}
              disabled={busy}
              className={"w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r " + selected.gradient + " hover:opacity-90 transition-opacity disabled:opacity-50"}
            >
              {phase === "initiating"
                ? t("initiating")
                : phase === "polling"
                  ? t("waiting")
                  : (phase === "failed" ? t("retry") : (t("pay") + " - " + selected.price.toLocaleString() + " XAF"))}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 text-sm"
        >
          <ArrowLeft className="h-5 w-5" /> {t("back")}
        </button>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm opacity-80 mt-1">{t("subtitle")}</p>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className="bg-white rounded-xl shadow overflow-hidden">
              {plan.popular && (
                <div className="bg-teal-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                  {t("mostPopular")}
                </div>
              )}
              <div className={"bg-gradient-to-r " + plan.gradient + " p-4 flex items-center justify-between"}>
                <div className="flex items-center gap-3">
                  <Icon className="h-7 w-7 text-white" />
                  <div>
                    <h3 className="text-white font-bold text-lg">{t(plan.nameKey)}</h3>
                    <p className="text-white/75 text-sm">{t(plan.durKey)}</p>
                  </div>
                </div>
                <div className="text-white text-right">
                  <span className="text-2xl font-bold">{plan.price.toLocaleString()}</span>
                  <span className="text-sm ml-1">XAF</span>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-1.5 mb-4">
                  {feats(plan.id).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelected(plan); setPhase("idle"); setErrorMsg(""); }}
                  className={"w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r " + plan.gradient + " hover:opacity-90 transition-opacity"}
                >
                  {t("select")} - {plan.price.toLocaleString()} XAF
                </button>
              </div>
            </div>
          );
        })}

        <p className="text-xs text-gray-400 text-center">{t("securedBy")}</p>
      </div>
    </div>
  );
}
