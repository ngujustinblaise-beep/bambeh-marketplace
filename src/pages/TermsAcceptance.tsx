/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TERMS ACCEPTANCE — BAMBEH MARKETPLACE
 * FILE: src/pages/TermsAcceptance.tsx
 * ---------------------------------------------------------------------------
 * Self-contained. Does NOT import "@/hooks/useAppLang" (that import was the
 * likely cause of the onboarding freeze: if the hook is missing/broken the
 * page crashed on mount, so the app appeared stuck on language selection).
 * Language is read directly from localStorage and kept in sync via the
 * "bambeh:langchange" + "storage" events. Full legal body is included here.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScrollText, Mail, Building2, CheckCircle2 } from "lucide-react";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANG_KEY = "Bambeh_language";
const ACCEPTED_KEY = "Bambeh_terms_accepted";
const ACCEPTED_DATE_KEY = "Bambeh_terms_accepted_date";

/** Resolve any stored value to a known LangCode (mirrors App.tsx). */
function resolveLang(raw: string | null): Lang {
  const valid: Lang[] = ["en", "fr", "pidgin", "ar", "ff"];
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde") return "ff";
  return valid.includes(raw as Lang) ? (raw as Lang) : "en";
}

/**
 * Tiny self-contained language hook. Reads localStorage on mount and updates
 * when either the inline App provider OR the LanguageSelection page fires
 * "bambeh:langchange" (detail may be a string OR { language }), and on the
 * cross-tab "storage" event. No external file dependency = no crash risk.
 */
function useOnboardingLang(): Lang {
  const [lang, setLang] = useState<Lang>(() =>
    resolveLang(typeof window !== "undefined" ? localStorage.getItem(LANG_KEY) : null)
  );

  useEffect(() => {
    const onLangChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const raw =
        typeof detail === "string"
          ? detail
          : detail && typeof detail === "object" && "language" in detail
          ? (detail as { language: string }).language
          : localStorage.getItem(LANG_KEY);
      setLang(resolveLang(raw));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) setLang(resolveLang(e.newValue));
    };
    window.addEventListener("bambeh:langchange", onLangChange as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bambeh:langchange", onLangChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return lang;
}

const COMPANY = {
  legalName: "BAMBEH SARL",
  registreDeCommerce: "CM -NSI-02-2026-B13-00179",
  niu: "M022618405804C",
  duns: "850379853",
  emails: ["support@bambeh.com", "bambetheapp@gmail.com"],
};

const SUBSCRIPTION_TIERS = [
  { tier: "Basic (Bronze)", price: "100 XAF", cycle: "Daily" },
  { tier: "Premium (Silver)", price: "500 XAF", cycle: "Weekly" },
  { tier: "Gold", price: "1,500 XAF", cycle: "Monthly" },
];

/** UI chrome strings (translated). Legal body stays in English. */
const S: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    effective: string;
    legalScroll: string;
    scrollAlert: string;
    readSuccess: string;
    checkLabel: string;
    ohadaLabel: string;
    decline: string;
    accept: string;
    helper: string;
    companyTitle: string;
    contactsTitle: string;
    tiersTitle: string;
    colTier: string;
    colPrice: string;
    colCycle: string;
  }
> = {
  en: {
    title: "Welcome to Bambeh",
    subtitle: "Marketplace Terms & Conditions",
    effective: "Effective Date: November 21, 2025",
    legalScroll: "Bambeh Terms and Conditions of Use",
    scrollAlert: "Please scroll to the bottom and review the terms before accepting.",
    readSuccess: "Thank you. You can now accept the terms below.",
    checkLabel: "I have read, understood, and agree to the Terms and Conditions and Marketplace Fees.",
    ohadaLabel: "I consent to secure data verification under applicable law.",
    decline: "Decline",
    accept: "Accept & Continue",
    helper: "You must read the terms, then confirm both checkboxes to continue.",
    companyTitle: "Business Identity",
    contactsTitle: "Contact Emails",
    tiersTitle: "Subscription Tiers",
    colTier: "Tier",
    colPrice: "Price (XAF)",
    colCycle: "Billing Cycle",
  },
  fr: {
    title: "Bienvenue sur Bambeh",
    subtitle: "Conditions du marché",
    effective: "Date d’entrée en vigueur : 21 novembre 2025",
    legalScroll: "Conditions générales d’utilisation de Bambeh",
    scrollAlert: "Veuillez faire défiler jusqu’en bas et lire les conditions avant d’accepter.",
    readSuccess: "Merci. Vous pouvez maintenant accepter les conditions ci-dessous.",
    checkLabel: "J’ai lu, compris et j’accepte les conditions générales et les frais de marché.",
    ohadaLabel: "Je consens à la vérification sécurisée des données conformément à la loi applicable.",
    decline: "Refuser",
    accept: "Accepter et continuer",
    helper: "Vous devez lire les conditions puis confirmer les deux cases pour continuer.",
    companyTitle: "Identité de l’entreprise",
    contactsTitle: "Emails de contact",
    tiersTitle: "Formules d’abonnement",
    colTier: "Formule",
    colPrice: "Prix (XAF)",
    colCycle: "Cycle de facturation",
  },
  pidgin: {
    title: "Welcome to Bambeh",
    subtitle: "Marketplace Terms",
    effective: "Effective Date: November 21, 2025",
    legalScroll: "Bambeh Conditions for Use",
    scrollAlert: "Abeg scroll reach bottom and read am before you accept.",
    readSuccess: "Thanks. You fit accept the terms now.",
    checkLabel: "I don read, understand and I agree with the terms and marketplace fees.",
    ohadaLabel: "I consent to secure data verification under the law.",
    decline: "Decline",
    accept: "Accept & Continue",
    helper: "Read the terms first, then tick both boxes to continue.",
    companyTitle: "Business Identity",
    contactsTitle: "Contact Emails",
    tiersTitle: "Subscription Tiers",
    colTier: "Tier",
    colPrice: "Price (XAF)",
    colCycle: "Billing Cycle",
  },
  ar: {
    title: "مرحباً بكم في بامبيه",
    subtitle: "شروط وأحكام السوق",
    effective: "تاريخ السريان: 21 نوفمبر 2025",
    legalScroll: "شروط وأحكام استخدام بامبيه",
    scrollAlert: "يرجى التمرير إلى الأسفل ومراجعة الشروط قبل القبول.",
    readSuccess: "شكراً لك. يمكنك الآن قبول الشروط أدناه.",
    checkLabel: "لقد قرأت وفهمت وأوافق على الشروط والأحكام ورسوم السوق.",
    ohadaLabel: "أوافق على التحقق الآمن من البيانات وفقاً للقانون المعمول به.",
    decline: "رفض",
    accept: "قبول ومتابعة",
    helper: "يجب قراءة الشروط ثم تأكيد المربعين للمتابعة.",
    companyTitle: "هوية الشركة",
    contactsTitle: "البريد الإلكتروني للتواصل",
    tiersTitle: "باقات الاشتراك",
    colTier: "الباقة",
    colPrice: "السعر (XAF)",
    colCycle: "دورة الفوترة",
  },
  ff: {
    title: "Njabbama ko Bambeh",
    subtitle: "Sarɗiiji Lumo",
    effective: "Ñalnde Fuɗɗorde: 21 November 2025",
    legalScroll: "Sarɗiiji gollitorde Bambeh",
    scrollAlert: "Abeg ɓuttu to les e janngu ko ɗiɗi ɓen a jaɓa.",
    readSuccess: "A jarama. Aɗa waawi jaɓde sarɗiiji ɗi jooni.",
    checkLabel: "Mi janngii, mi faami, mi jaɓi sarɗiiji e njoɓdi lumo.",
    ohadaLabel: "Mi jaɓi ƴeewtere keɓe binndol e sariya jooni.",
    decline: "Waawaa",
    accept: "Jaɓugo e Yahu",
    helper: "Janngu sarɗiiji ɗi fuɗɗi, ɗaɓɓit ɗiɗi checkboxes ɗi, puɗɗo.",
    companyTitle: "Business Identity",
    contactsTitle: "Contact Emails",
    tiersTitle: "Subscription Tiers",
    colTier: "Tier",
    colPrice: "Price (XAF)",
    colCycle: "Billing Cycle",
  },
};

export default function TermsAcceptance() {
  const lang = useOnboardingLang();
  const navigate = useNavigate();
  const [hasRead, setHasRead] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [ohadaConsented, setOhadaConsented] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isRtl = lang === "ar";
  const current = S[lang] || S.en;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 48;
    if (atBottom) setHasRead(true);
  }, []);

  const canContinue = hasRead && isAccepted && ohadaConsented;

  const handleAccept = () => {
    if (!canContinue) return;
    localStorage.setItem(ACCEPTED_KEY, "true");
    localStorage.setItem(ACCEPTED_DATE_KEY, new Date().toISOString());
    // Onboarding order in App.tsx guard: language -> terms -> welcome
    navigate("/welcome", { replace: true });
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto py-8">
        <header className="text-center mb-8">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Bambeh Logo"
              className="mx-auto h-24 w-auto object-contain mb-4 drop-shadow-md"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-4 shadow-xl mx-auto">
              <span className="text-4xl font-bold text-white">B</span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{current.title}</h1>
          <p className="text-lg text-gray-600 mb-1">{current.subtitle}</p>
          <p className="text-sm text-gray-500">{current.effective}</p>
        </header>

        <section className="bg-white rounded-2xl shadow-2xl overflow-hidden" aria-labelledby="terms-title">
          <div
            className={`px-6 py-3 border-b flex items-center gap-2 ${
              hasRead ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
            }`}
          >
            <ScrollText className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{hasRead ? current.readSuccess : current.scrollAlert}</p>
          </div>

          <div
            onScroll={handleScroll}
            className="h-[26rem] overflow-y-auto px-6 sm:px-8 py-6 text-gray-700 space-y-6"
            tabIndex={0}
            aria-describedby="terms-help"
          >
            <div>
              <h2 id="terms-title" className="text-xl font-bold text-teal-700 text-center">
                {current.legalScroll}
              </h2>
              <p id="terms-help" className="text-sm text-gray-500 text-center mt-2">
                {current.helper}
              </p>
            </div>

            {/* Business identity */}
            <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
              <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
                <Building2 className="w-4 h-4" />
                <span>{current.companyTitle}</span>
              </div>
              <p className="text-sm leading-7"><span className="font-semibold">Legal name:</span> {COMPANY.legalName}</p>
              <p className="text-sm leading-7"><span className="font-semibold">Registre de commerce:</span> {COMPANY.registreDeCommerce}</p>
              <p className="text-sm leading-7"><span className="font-semibold">NIU:</span> {COMPANY.niu}</p>
              <p className="text-sm leading-7"><span className="font-semibold">D-U-N-S No:</span> {COMPANY.duns}</p>
            </div>

            <p className="text-sm leading-7">
              Welcome to the Bambeh mobile application (&quot;App&quot;) and Services. Bambeh connects users for
              buying, selling, job and housing searches in a dynamic marketplace and community. By accessing or
              using the App, you agree to these Terms, a <strong>binding legal agreement</strong>.
            </p>

            {/* I. Agreement and Your Role */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">I. Agreement and Your Role</h3>
              <p className="text-sm leading-7 font-semibold text-gray-800">A. Acceptance and Governing Law</p>
              <p className="text-sm leading-7">
                These Terms shall be governed by the laws applicable to the Republic of Cameroon, including the
                mandatory provisions of OHADA Uniform Acts and Law No. 2010/012 (Cybersecurity), where applicable.
              </p>
              <p className="text-sm leading-7">
                Bambeh reserves the right to modify these Terms at any time, with modifications becoming effective
                upon posting. Continued use constitutes acceptance of the revised Terms.
              </p>
              <p className="text-sm leading-7 font-semibold text-gray-800 mt-3">B. Eligibility and Account Security</p>
              <p className="text-sm leading-7">You must be 18 or older to use the Services.</p>
              <p className="text-sm leading-7">
                You are responsible for maintaining the security of your account credentials and for all activity
                under your account.
              </p>
            </div>

            {/* II. Pricing and Payment */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">II. Pricing and Payment Provisions</h3>
              <p className="text-sm leading-7 font-semibold text-gray-800">A. {current.tiersTitle}</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-left">
                      <th className="py-2 px-2">{current.colTier}</th>
                      <th className="py-2 px-2">{current.colPrice}</th>
                      <th className="py-2 px-2">{current.colCycle}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBSCRIPTION_TIERS.map((row) => (
                      <tr key={row.tier} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-2 font-semibold">{row.tier}</td>
                        <td className="py-2 px-2">{row.price}</td>
                        <td className="py-2 px-2">{row.cycle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm leading-7 font-semibold text-gray-800 mt-2">B. Payment Processing and Wallet Services</p>
              <p className="text-sm leading-7">
                Payments processed via MTN Mobile Money, Orange Money, or other authorized gateways are subject to
                the payment provider&apos;s processing rules and applicable law.
              </p>
              <p className="text-sm leading-7">
                The App includes a digital wallet (&quot;Wallet&quot;) for holding in-app funds, represented by Zerm
                Coins (1 Zerm = 100 XAF). Wallet balances are only usable within the Bambeh platform unless otherwise
                stated.
              </p>
              <p className="text-sm leading-7 font-semibold text-gray-800 mt-2">C. Refund Policy</p>
              <p className="text-sm leading-7">
                Refund requests must be submitted within 7 calendar days via the approved support emails listed in
                this document.
              </p>
            </div>

            {/* III. User Responsibilities */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">III. User Responsibilities</h3>
              <p className="text-sm leading-7">
                Use the App only lawfully and consistent with its intended marketplace functions. Prohibited actions
                include fraud, financial crime, money laundering, cybercrime, data scraping, impersonation, and
                harassment.
              </p>
              <p className="text-sm leading-7">
                By uploading any content, you grant Bambeh a license to use that content in connection with the
                Services, subject to applicable law.
              </p>
            </div>

            {/* IV. Intellectual Property */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">IV. Intellectual Property</h3>
              <p className="text-sm leading-7">
                Bambeh IP is protected by law, the OAPI Bangui Agreement, and international copyright principles.
                Unauthorized use, copying, or reverse engineering is prohibited.
              </p>
            </div>

            {/* V. Protection of User Data */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">V. Protection of User Data and Security</h3>
              <p className="text-sm leading-7">
                Bambeh processes personal data in compliance with applicable law and may cooperate with lawful
                requests from authorities where required.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3 text-sm leading-7">
                <strong>Security Notice:</strong> Bambeh uses reasonable security measures, but no online service can
                guarantee absolute security.
              </div>
            </div>

            {/* VI. Disclaimers */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">VI. Disclaimers and Liability Limitations</h3>
              <p className="text-sm leading-7">
                The Services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without
                warranties to the extent permitted by law.
              </p>
            </div>

            {/* VII. Termination */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-teal-700 mb-2">VII. Termination and Dispute Resolution</h3>
              <p className="text-sm leading-7">Bambeh may suspend or terminate accounts for material breaches.</p>
              <p className="text-sm leading-7">
                Disputes are governed by applicable Cameroonian law and resolved in the competent courts of Yaoundé,
                where permitted.
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
              <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
                <Mail className="w-4 h-4" />
                <span>{current.contactsTitle}</span>
              </div>
              {COMPANY.emails.map((email) => (
                <p key={email} className="text-sm leading-7">{email}</p>
              ))}
            </div>

            {/* End marker — reaching this enables acceptance */}
            <div className="border-t-2 pt-6 bg-teal-50 p-6 rounded-2xl text-center">
              <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="font-bold text-teal-800">End of Terms and Conditions</p>
              <p className="text-sm text-gray-600 mt-1">
                You have reached the end of the document. Please confirm your acceptance below.
              </p>
            </div>
          </div>

          {/* Acceptance controls */}
          <div className="bg-gray-50 border-t p-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAccepted}
                disabled={!hasRead}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 accent-teal-600 disabled:opacity-40"
              />
              <span className={`text-sm font-medium ${hasRead ? "text-gray-700" : "text-gray-400"}`}>
                {current.checkLabel}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ohadaConsented}
                disabled={!hasRead}
                onChange={(e) => setOhadaConsented(e.target.checked)}
                className="mt-1 w-5 h-5 accent-teal-600 disabled:opacity-40"
              />
              <span className={`text-sm font-medium ${hasRead ? "text-gray-700" : "text-gray-400"}`}>
                {current.ohadaLabel}
              </span>
            </label>

            {!hasRead && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2">{current.scrollAlert}</p>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                {current.decline}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={!canContinue}
                className={`flex-1 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors ${
                  canContinue ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <span>{current.accept}</span>
                <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
