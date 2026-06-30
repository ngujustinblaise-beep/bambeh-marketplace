/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TERMS ACCEPTANCE — BAMBEH MARKETPLACE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LEGAL COMPLIANCE:
 * ✅ OHADA e-consent checkbox — Cameroonian data protection law
 *    (Law No. 2024/017 of 23 December 2024, Sections 13-16)
 * ✅ Standard Terms & Conditions acceptance checkbox
 * ✅ Scroll-to-bottom enforcement before acceptance is enabled
 * ✅ Explicit opt-in (not pre-checked) — required by Law 2024/017
 * ✅ Timestamps stored on acceptance
 * ✅ Returning users correctly bypass re-acceptance
 *
 * FILE: src/pages/TermsAcceptance.tsx
 * © 2026 BAMBEH SARL. Registre de Commerce: CM-NSI-02-2026-B13-00179 · NIU: M022618405804C · D-U-N-S No: 850379853
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  ScrollText,
  Check,
  Shield,
} from "lucide-react";

const translations = {
  en: {
    headerTitle: "Welcome to",
    headerSubtitle: "Your online marketplace",
    headerPrompt: "Please read our terms and conditions and accept them",
    scrollPrompt: "Please scroll down and read the entire document",
    scrollComplete: "✅ Thank you for reading! You may now accept the terms below.",
    title: "BAMBEH TERMS AND CONDITIONS",
    effectiveDate: "Effective Date: January 1, 2026",
    intro:
      'Welcome to Bambeh ("the App"), a marketplace platform operated by BAMBEH SARL (Registre de Commerce: CM-NSI-02-2026-B13-00179), connecting buyers and sellers digitally across Cameroon and beyond.',
    section1: "1. DEFINITIONS AND INTERPRETATION",
    section2: "2. ACCOUNT REGISTRATION",
    eligibility: "2.1 Eligibility",
    security: "2.2 Account Security",
    rules: "3. MARKETPLACE RULES",
    zerm: "4. ZERM COINS",
    data: "5. DATA PROTECTION",
    liability: "6. LIMITATION OF LIABILITY",
    dispute: "7. DISPUTE RESOLUTION",
    ip: "8. INTELLECTUAL PROPERTY",
    modifications: "9. MODIFICATIONS",
    law: "10. GOVERNING LAW",
    ackTitle: "✅ ACKNOWLEDGMENT",
    ackLead: 'By checking the boxes below and clicking "Accept and Continue," you acknowledge:',
    ack1: "You have read and understood these Terms and Conditions",
    ack2: "You agree to be bound by all provisions herein",
    ack3: "You are at least 18 years of age",
    ack4: "You have the legal capacity to enter into this agreement",
    ack5: "You consent to data processing as described under Law No. 2024/017",
    lastUpdated: "Last Updated: January 1, 2026",
    contact: "Contact:",
    warningTitle: "Please read the entire document",
    warningBody: "Scroll down to the bottom to enable the acceptance checkboxes",
    termsText: "I have read, understood, and agree to be bound by the Bambeh Terms and Conditions.",
    termsSubText: "I acknowledge that I am at least 18 years of age and have the legal capacity to enter into this agreement.",
    termsAccepted: "Terms Accepted ✓",
    termsClick: "Click here to accept Terms and Conditions",
    consentTitle: "Data Protection Consent — Law No. 2024/017 (Cameroon)",
    consentBody:
      "I consent to BAMBEH SARL collecting and processing my personal data (name, email, phone number, location, device identifiers) solely to operate my Bambeh account, process transactions, and improve the platform — in accordance with Cameroon's Law No. 2024/017 of 23 December 2024 on Personal Data Protection and applicable OHADA Uniform Acts.",
    consentNote:
      "Your data is never sold to third parties. You may withdraw this consent and request deletion of your data at any time by emailing support@bambeh.com. See our full Privacy Policy at bambeh.com/privacy-policy.",
    consentConfirmed: "Data processing consent confirmed ✓",
    consentClick: "Required — click to give data processing consent",
    progressRead: "Read",
    progressTerms: "Terms",
    progressData: "Data",
    decline: "Decline",
    close: "Close",
    accept: "Accept and Continue",
    compliance: "Compliant with Cameroon Law No. 2024/017 · OHADA Uniform Acts · Google Play Developer Policy",
    footerFee: "Only 1% Transaction Fee",
    footerEnd: "Lowest you will find online!",
    footerTagline: "BAMBEH MARKETPLACE - THE PULSE OF AFRICAN COMMERCE",
  },
  fr: {
    headerTitle: "Bienvenue sur",
    headerSubtitle: "Votre marché en ligne",
    headerPrompt: "Veuillez lire nos conditions générales et les accepter",
    scrollPrompt: "Veuillez faire défiler vers le bas et lire l'intégralité du document",
    scrollComplete: "✅ Merci d'avoir lu ! Vous pouvez maintenant accepter les conditions ci-dessous.",
    title: "CONDITIONS GÉNÉRALES DE BAMBEH",
    effectiveDate: "Date d'entrée en vigueur : 1 janvier 2026",
    intro:
      'Bienvenue sur Bambeh ("l’Application"), une plateforme de marché exploitée par BAMBEH SARL (Registre de Commerce: CM-NSI-02-2026-B13-00179), reliant acheteurs et vendeurs numériquement au Cameroun et au-delà.',
    section1: "1. DÉFINITIONS ET INTERPRÉTATION",
    section2: "2. INSCRIPTION DU COMPTE",
    eligibility: "2.1 Admissibilité",
    security: "2.2 Sécurité du compte",
    rules: "3. RÈGLES DU MARCHÉ",
    zerm: "4. ZERM COINS",
    data: "5. PROTECTION DES DONNÉES",
    liability: "6. LIMITATION DE RESPONSABILITÉ",
    dispute: "7. RÈGLEMENT DES LITIGES",
    ip: "8. PROPRIÉTÉ INTELLECTUELLE",
    modifications: "9. MODIFICATIONS",
    law: "10. DROIT APPLICABLE",
    ackTitle: "✅ RECONNAISSANCE",
    ackLead: 'En cochant les cases ci-dessous et en cliquant "Accepter et continuer", vous reconnaissez :',
    ack1: "Vous avez lu et compris ces conditions générales",
    ack2: "Vous acceptez d'être lié par toutes les dispositions ci-dessous",
    ack3: "Vous avez au moins 18 ans",
    ack4: "Vous avez la capacité juridique de conclure cet accord",
    ack5: "Vous consentez au traitement des données tel que décrit par la Loi n° 2024/017",
    lastUpdated: "Dernière mise à jour : 1 janvier 2026",
    contact: "Contact :",
    warningTitle: "Veuillez lire l'intégralité du document",
    warningBody: "Faites défiler jusqu'en bas pour activer les cases d'acceptation",
    termsText: "J'ai lu, compris et j'accepte d'être lié par les conditions générales de Bambeh.",
    termsSubText: "Je reconnais avoir au moins 18 ans et avoir la capacité juridique de conclure cet accord.",
    termsAccepted: "Conditions acceptées ✓",
    termsClick: "Cliquez ici pour accepter les conditions générales",
    consentTitle: "Consentement à la protection des données — Loi n° 2024/017 (Cameroun)",
    consentBody:
      "Je consens à ce que BAMBEH SARL collecte et traite mes données personnelles (nom, email, numéro de téléphone, localisation, identifiants d'appareil) uniquement pour gérer mon compte Bambeh, traiter les transactions et améliorer la plateforme — conformément à la loi camerounaise n° 2024/017 du 23 décembre 2024 relative à la protection des données personnelles et aux Actes Uniformes OHADA applicables.",
    consentNote:
      "Vos données ne sont jamais vendues à des tiers. Vous pouvez retirer ce consentement et demander la suppression de vos données à tout moment en écrivant à support@bambeh.com. Consultez notre Politique de confidentialité complète sur bambeh.com/privacy-policy.",
    consentConfirmed: "Consentement au traitement des données confirmé ✓",
    consentClick: "Obligatoire — cliquez pour donner votre consentement au traitement des données",
    progressRead: "Lu",
    progressTerms: "Conditions",
    progressData: "Données",
    decline: "Refuser",
    close: "Fermer",
    accept: "Accepter et continuer",
    compliance: "Conforme à la loi camerounaise n° 2024/017 · Actes Uniformes OHADA · Politique Développeur Google Play",
    footerFee: "Seulement 1 % de frais de transaction",
    footerEnd: "Le plus bas que vous trouverez en ligne !",
    footerTagline: "BAMBEH MARKETPLACE - LE POULS DU COMMERCE AFRICAIN",
  },
  ar: {
    headerTitle: "مرحبًا بك في",
    headerSubtitle: "سوقك الإلكتروني",
    headerPrompt: "يرجى قراءة الشروط والأحكام والموافقة عليها",
    scrollPrompt: "يرجى التمرير إلى الأسفل وقراءة المستند بالكامل",
    scrollComplete: "✅ شكرًا لقراءتك! يمكنك الآن قبول الشروط أدناه.",
    title: "شروط وأحكام BAMBEH",
    effectiveDate: "تاريخ السريان: 1 يناير 2026",
    intro:
      'مرحبًا بك في Bambeh ("التطبيق")، وهي منصة سوق تديرها BAMBEH SARL (Registre de Commerce: CM-NSI-02-2026-B13-00179)، وتربط بين المشترين والبائعين رقميًا داخل الكاميرون وخارجها.',
    section1: "1. التعاريف والتفسير",
    section2: "2. تسجيل الحساب",
    eligibility: "2.1 الأهلية",
    security: "2.2 أمان الحساب",
    rules: "3. قواعد المنصة",
    zerm: "4. ZERM COINS",
    data: "5. حماية البيانات",
    liability: "6. تحديد المسؤولية",
    dispute: "7. تسوية النزاعات",
    ip: "8. الملكية الفكرية",
    modifications: "9. التعديلات",
    law: "10. القانون الحاكم",
    ackTitle: "✅ إقرار",
    ackLead: 'من خلال تحديد المربعات أدناه والنقر على "قبول ومتابعة"، فإنك تقر بما يلي:',
    ack1: "لقد قرأت وفهمت هذه الشروط والأحكام",
    ack2: "أنت توافق على الالتزام بجميع الأحكام الواردة هنا",
    ack3: "عمرك لا يقل عن 18 عامًا",
    ack4: "لديك الأهلية القانونية لإبرام هذا الاتفاق",
    ack5: "أنت توافق على معالجة البيانات كما هو موضح بموجب القانون رقم 2024/017",
    lastUpdated: "آخر تحديث: 1 يناير 2026",
    contact: "اتصل:",
    warningTitle: "يرجى قراءة المستند بالكامل",
    warningBody: "مرّر إلى الأسفل لتفعيل مربعات القبول",
    termsText: "لقد قرأت وفهمت وأوافق على الالتزام بشروط وأحكام Bambeh.",
    termsSubText: "أقر بأن عمري لا يقل عن 18 عامًا وأن لدي الأهلية القانونية لإبرام هذا الاتفاق.",
    termsAccepted: "تم قبول الشروط ✓",
    termsClick: "انقر هنا لقبول الشروط والأحكام",
    consentTitle: "موافقة حماية البيانات — القانون رقم 2024/017 (الكاميرون)",
    consentBody:
      "أوافق على أن تقوم BAMBEH SARL بجمع ومعالجة بياناتي الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف، الموقع، معرّفات الجهاز) فقط لتشغيل حساب Bambeh الخاص بي، ومعالجة المعاملات، وتحسين المنصة — وفقًا لقانون الكاميرون رقم 2024/017 الصادر في 23 ديسمبر 2024 بشأن حماية البيانات الشخصية والأعمال الموحدة لـ OHADA المطبقة.",
    consentNote:
      "لن تُباع بياناتك أبدًا إلى أطراف ثالثة. يمكنك سحب هذه الموافقة وطلب حذف بياناتك في أي وقت عن طريق مراسلتنا على support@bambeh.com. راجع سياسة الخصوصية الكاملة على bambeh.com/privacy-policy.",
    consentConfirmed: "تم تأكيد موافقة معالجة البيانات ✓",
    consentClick: "مطلوب — انقر لمنح موافقتك على معالجة البيانات",
    progressRead: "قراءة",
    progressTerms: "الشروط",
    progressData: "البيانات",
    decline: "رفض",
    close: "إغلاق",
    accept: "قبول ومتابعة",
    compliance: "متوافق مع قانون الكاميرون رقم 2024/017 · الأعمال الموحدة لـ OHADA · سياسة مطوّر Google Play",
    footerFee: "رسوم معاملة بنسبة 1% فقط",
    footerEnd: "الأقل الذي ستجده عبر الإنترنت!",
    footerTagline: "BAMBEH MARKETPLACE - نبض التجارة الأفريقية",
  },
  fuf: {
    headerTitle: "A jaraama",
    headerSubtitle: "Saare suuqe en ligne",
    headerPrompt: "Njaɓɓi e naatnoy kelol e ɗum",
    scrollPrompt: "Njaɓɓi to wayaa e jiiɗo kala waɗiima",
    scrollComplete: "✅ A jaaraama e jiiɗude! Jooni a waawi naatnude kelol ɗi fii dow.",
    title: "KELƊE E JOGE BAMBEH",
    effectiveDate: "Ñalngu mawɗo: 1 Janawari 2026",
    intro:
      'A jaraama e Bambeh ("App"), platform suuqe ngol BAMBEH SARL (Registre de Commerce: CM-NSI-02-2026-B13-00179), jogii ɗi saɓɓe e ɓeynguɗi ndee Cameroon e dow ɗum.',
    section1: "1. FONDEEJI E FASSARDE",
    section2: "2. NDEƊƊITEE KONTO",
    eligibility: "2.1 Wonnda",
    security: "2.2 Ñaawo Konto",
    rules: "3. JOGE SUUQE",
    zerm: "4. ZERM COINS",
    data: "5. NDIYAM DATA",
    liability: "6. HODAARE RESPONSABILITE",
    dispute: "7. NDEENDE DISPUTE",
    ip: "8. HAKKILO HAAƁE",
    modifications: "9. MODIFICATIONS",
    law: "10. LAAWOL NGOL NJIYATA",
    ackTitle: "✅ NDAARI",
    ackLead: 'To a njaɗɗa doosii ɗi ɗoo e a naati "Accept and Continue," a naatni:',
    ack1: "A jiiɗi e a anndi kelol e ndiyam ɗi",
    ack2: "A yaafi wonde nde bindii ɗi kala",
    ack3: "A marii 18 yawre",
    ack4: "A mari laawol ɗum e naatnude e agreement ɗum",
    ack5: "A njaɗɗi processing data e nde loi 2024/017 ɗum njiyata",
    lastUpdated: "Ñalngu njaɓɓorgo: 1 Janawari 2026",
    contact: "Konna:",
    warningTitle: "Njaɓɓi kala document ɗum",
    warningBody: "Waɗa to dow ngol ngam oonnda doosii ɗi",
    termsText: "Mi jiiɗi, mi anndi, mi yaafi wonde Bambeh Terms and Conditions.",
    termsSubText: "Mi naatni ko mi marii 18 yawre e mi mari laawol ɗum e naatnude e agreement ɗum.",
    termsAccepted: "Kelol njaɓɓi ✓",
    termsClick: "Naatno ɗoo ngam njaɓɓude kelol e joge ɗi",
    consentTitle: "Naatnude Data Protection — Law No. 2024/017 (Cameroon)",
    consentBody:
      "Mi njaɗɗi BAMBEH SARL ngam ɓeydude e processing data am (innde, email, number phone, location, device identifiers) tan ngam jooɗa konto Bambeh am, processing transaction, e ɓeydude platform ngol — e dow laawol Cameroon Law No. 2024/017 23 Desembar 2024 e OHADA Uniform Acts.",
    consentNote:
      "Data maa num walaa selli to tewwi ɓernde. A waawi waɗude withdrawal consent ngol e ɗaɓɓude harii data maa kala waɓɓude e email support@bambeh.com. Njiyii Privacy Policy maa ngol bambeh.com/privacy-policy.",
    consentConfirmed: "Consent processing data ɗum toŋngii ✓",
    consentClick: "Haatu — naatno ngam hokkude consent processing data",
    progressRead: "Jiiɗi",
    progressTerms: "Kelol",
    progressData: "Data",
    decline: "Refuser",
    close: "Sappo",
    accept: "Naatno e waani",
    compliance: "Ko e laawol Cameroon Law No. 2024/017 · OHADA Uniform Acts · Google Play Developer Policy",
    footerFee: "1% fee transaction tan",
    footerEnd: "Ko feere ɗum ɓuri low!",
    footerTagline: "BAMBEH MARKETPLACE - NDUUWA COMMERCE AFRICAIN",
  },
};

export default function TermsAcceptance() {
  const navigate = useNavigate();
  const [hasRead, setHasRead] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [lang] = useState<keyof typeof translations>("en");

  const t = translations[lang];

  const [ohadaConsented, setOhadaConsented] = useState(false);

  useEffect(() => {
    const termsAccepted = localStorage.getItem("Bambeh_terms_accepted");
    if (termsAccepted === "true") {
      setIsReturningUser(true);
      setHasRead(true);
      setHasScrolledToBottom(true);
      setIsAccepted(true);
      setOhadaConsented(true);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const reachedBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    if (reachedBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setHasRead(true);
    }
  };

  const handleAccept = () => {
    if (!hasRead) {
      alert("Please read the entire document before accepting.");
      return;
    }
    if (!isAccepted) {
      alert("Please check the acceptance box to continue.");
      return;
    }
    if (!ohadaConsented) {
      alert("Please confirm your consent to data processing under Cameroonian law (Law No. 2024/017) to continue.");
      return;
    }

    localStorage.setItem("Bambeh_terms_accepted", "true");
    localStorage.setItem("Bambeh_terms_accepted_date", new Date().toISOString());
    localStorage.setItem("Bambeh_ohada_consent_date", new Date().toISOString());

    navigate("/welcome", { replace: true });
  };

  const handleDecline = () => {
    if (
      confirm(
        "You must accept the Terms and Conditions to use Bambeh. Are you sure you want to decline?"
      )
    ) {
      localStorage.clear();
      alert("You have declined the Terms and Conditions. The app will now close.");
      window.close();
    }
  };

  const canAccept = hasRead && isAccepted && ohadaConsented;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-4 shadow-xl">
            <span className="text-4xl font-bold text-white">B</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t.headerTitle} <span className="text-teal-600">Bambeh</span>
          </h1>
          <p className="text-lg text-gray-600 mb-1">{t.headerSubtitle}</p>
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <FileText className="w-5 h-5" />
            <p className="text-sm font-medium">{t.headerPrompt}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {!hasScrolledToBottom && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
              <div className="flex items-center gap-2 text-amber-800">
                <ScrollText className="w-5 h-5" />
                <p className="text-sm font-medium">{t.scrollPrompt}</p>
              </div>
            </div>
          )}
          {hasScrolledToBottom && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{t.scrollComplete}</p>
              </div>
            </div>
          )}

          <div
            onScroll={handleScroll}
            className="h-96 overflow-y-auto px-8 py-6 prose prose-sm max-w-none"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="text-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-teal-700">{t.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{t.effectiveDate}</p>
              </div>

              <p className="mb-4 font-semibold">{t.intro}</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.section1}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"BAMBEH SARL"</strong> refers to the legal entity operating Bambeh, registered in Yaoundé, Cameroon (Registre de Commerce: CM-NSI-02-2026-B13-00179; NIU: M022618405804C; D-U-N-S No: 850379853).</li>
                <li><strong>"User"</strong> means any individual who creates an account and uses the App for buying, selling, or browsing.</li>
                <li><strong>"Vendor"</strong> means a User who offers goods or services for sale on the platform.</li>
                <li><strong>"Zerm Coins"</strong> are a proprietary in-app virtual currency with no real-world cash value outside the platform.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.section2}</h3>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">{t.eligibility}</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use Bambeh.</li>
                <li>By registering, you affirm that all information provided is accurate and complete.</li>
              </ul>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">{t.security}</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your credentials.</li>
                <li>Notify us immediately of any unauthorized access at [support@bambeh.com](mailto:support@bambeh.com).</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.rules}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>All listings must be accurate and lawful under Cameroonian law.</li>
                <li>No counterfeit, stolen, or prohibited items are permitted.</li>
                <li>Bambeh reserves the right to remove listings at its discretion.</li>
                <li>A 1% transaction fee applies to all completed sales — the lowest you will find online.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.zerm}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Zerm Coins have no monetary value outside the platform.</li>
                <li>They cannot be exchanged for cash.</li>
                <li>BAMBEH SARL reserves the right to modify Zerm Coin policies with 30 days' notice.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.data}</h3>
              <p>
                The collection and processing of your personal data is governed by
                Cameroon's Law No. 2024/017 of 23 December 2024 on Personal Data Protection.
                You have the right to access, rectify, and request deletion of your data at
                any time by contacting [support@bambeh.com](mailto:support@bambeh.com). Full details are in our{" "}
                <strong>Privacy Policy</strong> available at bambeh.com/privacy-policy.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.liability}</h3>
              <p>Bambeh is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.dispute}</h3>
              <p>All disputes shall be resolved through binding arbitration in Yaoundé, Cameroon, under the laws of the Republic of Cameroon and applicable OHADA Uniform Acts.</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.ip}</h3>
              <p>All content, trademarks, and technology are owned by BAMBEH SARL. You may not copy, modify, or distribute any part without written permission.</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.modifications}</h3>
              <p>Bambeh may modify these Terms at any time. Continued use constitutes acceptance. Material changes will be notified via in-app notice.</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">{t.law}</h3>
              <p>These Terms are governed by the laws of the Republic of Cameroon, including applicable OHADA Uniform Acts.</p>

              <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mt-8">
                <h3 className="font-bold text-teal-900 mb-2">{t.ackTitle}</h3>
                <p className="text-sm">{t.ackLead}</p>
                <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                  <li>{t.ack1}</li>
                  <li>{t.ack2}</li>
                  <li>{t.ack3}</li>
                  <li>{t.ack4}</li>
                  <li>{t.ack5}</li>
                </ul>
              </div>

              <p className="text-center text-sm text-gray-600 mt-8 pb-8">
                <strong>{t.lastUpdated}</strong>
                <br />
                <strong>{t.contact}</strong> [support@bambeh.com](mailto:support@bambeh.com) · [bambetheapp@gmail.com](mailto:bambetheapp@gmail.com)
                <br />© 2026 BAMBEH SARL. Registre de Commerce: CM-NSI-02-2026-B13-00179 · NIU: M022618405804C · D-U-N-S No: 850379853
              </p>
            </div>
          </div>

          <div className="border-t-4 border-teal-500 bg-gradient-to-b from-gray-50 to-gray-100 px-8 py-8">
            {!hasRead && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">{t.warningTitle}</p>
                    <p className="text-xs text-amber-700 mt-1">{t.warningBody}</p>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => hasRead && setIsAccepted(!isAccepted)}
              className={`
                cursor-pointer rounded-2xl border-4 p-6 mb-4 transition-all duration-300 transform
                ${!hasRead ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300" : ""}
                ${hasRead && !isAccepted ? "bg-white border-gray-300 hover:border-teal-400 hover:shadow-lg hover:scale-[1.01]" : ""}
                ${isAccepted ? "bg-teal-50 border-teal-500 shadow-xl scale-[1.01]" : ""}
              `}
            >
              <div className="flex items-start gap-5">
                <div
                  className={`
                    flex-shrink-0 w-14 h-14 rounded-xl border-4 flex items-center justify-center transition-all duration-300
                    ${!hasRead ? "border-gray-300 bg-gray-200" : ""}
                    ${hasRead && !isAccepted ? "border-gray-400 bg-white hover:border-teal-500" : ""}
                    ${isAccepted ? "border-teal-600 bg-teal-600" : ""}
                  `}
                  style={{ minWidth: "56px", minHeight: "56px" }}
                >
                  {isAccepted ? (
                    <Check className="w-10 h-10 text-white" strokeWidth={4} />
                  ) : (
                    <div className="w-8 h-8 border-2 border-dashed border-gray-400 rounded-lg" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-base font-semibold ${hasRead ? "text-gray-900" : "text-gray-500"}`}>{t.termsText}</p>
                  <p className={`text-sm mt-2 ${hasRead ? "text-gray-600" : "text-gray-400"}`}>{t.termsSubText}</p>
                  {isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-teal-600 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      <span>{t.termsAccepted}</span>
                    </div>
                  )}
                  {hasRead && !isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
                      <span className="animate-bounce">👆</span>
                      <span>{t.termsClick}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {hasRead && (
              <label
                className={`flex items-start gap-4 cursor-pointer rounded-2xl border-4 p-5 mb-6 transition-all duration-300
                  ${ohadaConsented
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg border-4 flex items-center justify-center transition-all duration-300 mt-0.5
                    ${ohadaConsented
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-400 bg-white hover:border-blue-500"
                    }`}
                  style={{ minWidth: "48px", minHeight: "48px" }}
                >
                  <input
                    type="checkbox"
                    checked={ohadaConsented}
                    onChange={(e) => setOhadaConsented(e.target.checked)}
                    className="sr-only"
                    aria-label="OHADA data protection consent — Law No. 2024/017"
                  />
                  {ohadaConsented ? (
                    <Check className="w-7 h-7 text-white" strokeWidth={4} />
                  ) : (
                    <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <p className="text-sm font-bold text-gray-900">{t.consentTitle}</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{t.consentBody}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{t.consentNote}</p>
                  {ohadaConsented && (
                    <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>{t.consentConfirmed}</span>
                    </div>
                  )}
                  {!ohadaConsented && (
                    <div className="mt-2 flex items-center gap-2 text-gray-500 text-xs">
                      <span className="animate-bounce">👆</span>
                      <span>{t.consentClick}</span>
                    </div>
                  )}
                </div>
              </label>
            )}

            {hasRead && (
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${hasRead ? "text-teal-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${hasRead ? "bg-teal-500" : "bg-gray-300"}`}>1</div>
                  {t.progressRead}
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded">
                  <div className={`h-full rounded transition-all duration-500 bg-teal-500 ${isAccepted ? "w-full" : "w-0"}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${isAccepted ? "text-teal-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${isAccepted ? "bg-teal-500" : "bg-gray-300"}`}>2</div>
                  {t.progressTerms}
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded">
                  <div className={`h-full rounded transition-all duration-500 bg-blue-500 ${ohadaConsented ? "w-full" : "w-0"}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${ohadaConsented ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${ohadaConsented ? "bg-blue-500" : "bg-gray-300"}`}>3</div>
                  {t.progressData}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                {isReturningUser ? t.close : t.decline}
              </button>
              <button
                onClick={handleAccept}
                disabled={!canAccept}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  canAccept
                    ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-xl hover:shadow-2xl hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>{isReturningUser ? t.close : t.accept}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">{t.compliance}</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            🎉{" "}
            <span className="font-bold text-green-600">{t.footerFee}</span>{" "}
            — {t.footerEnd} 💚
          </p>
          <p className="text-xs text-gray-500 mt-2">{t.footerTagline}</p>
        </div>
      </div>
    </div>
  );
}