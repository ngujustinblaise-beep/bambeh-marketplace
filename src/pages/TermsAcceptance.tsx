/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TERMS ACCEPTANCE — BAMBEH MARKETPLACE
 * FILE: src/pages/TermsAcceptance.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScrollText, Mail, BadgeInfo, Building2 } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const STORAGE_KEY = "Bambeh_terms_accepted";

const COMPANY = {
  legalName: "BAMBEH SARL",
  registreDeCommerce: "CM -NSI-02-2026-B13-00179",
  niu: "M022618405804C",
  duns: "850379853",
  emails: ["support@bambeh.com", "bambetheapp@gmail.com"],
};

const S: Record<
  Lang,
  {
    title: string;
    subtitle: string;
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
  }
> = {
  en: {
    title: "Welcome to Bambeh",
    subtitle: "Marketplace Terms & Conditions",
    legalScroll: "Bambeh Terms and Conditions of Use",
    scrollAlert: "Please scroll to the bottom and review the terms before accepting.",
    readSuccess: "Thank you. You can now accept the terms below.",
    checkLabel: "I agree to the Terms and Conditions and Marketplace Fees.",
    ohadaLabel: "I consent to secure data verification under applicable law.",
    decline: "Decline",
    accept: "Accept & Continue",
    helper: "You must read the terms, then confirm both checkboxes to continue.",
    companyTitle: "Business Identity",
    contactsTitle: "Contact Emails",
  },
  fr: {
    title: "Bienvenue sur Bambeh",
    subtitle: "Conditions du marché",
    legalScroll: "Conditions générales d’utilisation de Bambeh",
    scrollAlert: "Veuillez faire défiler jusqu’en bas et lire les conditions avant d’accepter.",
    readSuccess: "Merci. Vous pouvez maintenant accepter les conditions ci-dessous.",
    checkLabel: "J’accepte les conditions générales et les frais de marché.",
    ohadaLabel: "Je consens à la vérification sécurisée des données conformément à la loi applicable.",
    decline: "Refuser",
    accept: "Accepter et continuer",
    helper: "Vous devez lire les conditions puis confirmer les deux cases pour continuer.",
    companyTitle: "Identité de l’entreprise",
    contactsTitle: "Emails de contact",
  },
  pidgin: {
    title: "Welcome to Bambeh",
    subtitle: "Marketplace Terms",
    legalScroll: "Bambeh Conditions for Use",
    scrollAlert: "Abeg scroll reach bottom and read am before you accept.",
    readSuccess: "Thanks. You fit accept the terms now.",
    checkLabel: "I agree with the terms and marketplace fees.",
    ohadaLabel: "I consent to secure data verification under the law.",
    decline: "Decline",
    accept: "Accept & Continue",
    helper: "Read the terms first, then tick both boxes to continue.",
    companyTitle: "Business Identity",
    contactsTitle: "Contact Emails",
  },
  ar: {
    title: "مرحباً بكم في بامبيه",
    subtitle: "شروط وأحكام السوق",
    legalScroll: "شروط وأحكام استخدام بامبيه",
    scrollAlert: "يرجى التمرير إلى الأسفل ومراجعة الشروط قبل القبول.",
    readSuccess: "شكراً لك. يمكنك الآن قبول الشروط أدناه.",
    checkLabel: "أوافق على الشروط والأحكام ورسوم السوق.",
    ohadaLabel: "أوافق على التحقق الآمن من البيانات وفقاً للقانون المعمول به.",
    decline: "رفض",
    accept: "قبول ومتابعة",
    helper: "يجب قراءة الشروط ثم تأكيد المربعين للمتابعة.",
    companyTitle: "هوية الشركة",
    contactsTitle: "البريد الإلكتروني للتواصل",
  },
  ff: {
    title: "Njabbama ko Bambeh",
    subtitle: "Sarɗiiji Lumo",
    legalScroll: "Sarɗiiji gollitorde Bambeh",
    scrollAlert: "Abeg ɓuttu to les e janngu ko ɗiɗi ɓen a jaɓa.",
    readSuccess: "A jarama. Aɗa waawi jaɓde sarɗiiji ɗi jooni.",
    checkLabel: "Mi jaɓi sarɗiiji e njoɓdi lumo.",
    ohadaLabel: "Mi jaɓi ƴeewtere keɓe binndol e sariya jooni.",
    decline: "Waawaa",
    accept: "Jaɓugo e Yahu",
    helper: "Janngu sarɗiiji ɗi fuɗɗi, ɗaɓɓit ɗiɗi checkboxes ɗi, puɗɗo.",
    companyTitle: "Business Identity",
    contactsTitle: "Contact Emails",
  },
};

export default function TermsAcceptance() {
  const lang = useLang() as Lang;
  const navigate = useNavigate();
  const [hasRead, setHasRead] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [ohadaConsented, setOhadaConsented] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isRtl = lang === "ar";
  const current = S[lang] || S.en;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    if (atBottom) setHasRead(true);
  }, []);

  const handleAccept = () => {
    if (!hasRead || !isAccepted || !ohadaConsented) return;
    localStorage.setItem(STORAGE_KEY, "true");
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-4" dir={isRtl ? "rtl" : "ltr"}>
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
        </header>

        <section className="bg-white rounded-2xl shadow-2xl overflow-hidden" aria-labelledby="terms-title">
          <div className={`px-6 py-3 border-b flex items-center gap-2 ${hasRead ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
            <ScrollText className="w-5 h-5" />
            <p className="text-sm font-medium">{hasRead ? current.readSuccess : current.scrollAlert}</p>
          </div>

          <div
            onScroll={handleScroll}
            className="h-80 overflow-y-auto px-8 py-6 text-gray-700 space-y-6"
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

            <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
              <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
                <Mail className="w-4 h-4" />
                <span>{current.contactsTitle}</span>
              </div>
              {COMPANY.emails.map((email) => (
                <p key={email} className="text-sm leading-7">{email}</p>
              ))}
            </div>

            <p className="text-sm leading-7">
              1. Users must follow marketplace rules, respect other users, and comply with applicable law.
            </p>
            <p className="text-sm leading-7">
              2. Fees, payment processing, and transaction handling may change with notice, and all payments are subject to verification.
            </p>
            <p className="text-sm leading-7">
              3. Fraud, chargeback abuse, impersonation, and prohibited listings may lead to account restriction or removal.
            </p>
            <p className="text-sm leading-7">
              4. By continuing, you confirm that you understand these terms and agree to the platform’s policies.
            </p>
          </div>

          <div className="bg-gray-50 border-t p-6 space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-teal-600"
              />
              <span className="text-sm text-gray-700 font-medium">{current.checkLabel}</span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={ohadaConsented}
                onChange={(e) => setOhadaConsented(e.target.checked)}
                className="mt-1 w-5 h-5 text-teal-600"
              />
              <span className="text-sm text-gray-700 font-medium">{current.ohadaLabel}</span>
            </label>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
              >
                {current.decline}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={!hasRead || !isAccepted || !ohadaConsented}
                className={`flex-1 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
                  hasRead && isAccepted && ohadaConsented ? "bg-teal-600" : "bg-gray-300 cursor-not-allowed"
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

