/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TERMS ACCEPTANCE — BAMBEH MARKETPLACE  (5-language, auto-translating)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LANGUAGES: en / fr / pidgin / ar (RTL) / ff
 *   - Reads the language chosen on the first selector (localStorage
 *     "Bambeh_language") at mount, and live-updates the instant the language
 *     changes anywhere via the "bambeh:langchange" event — NO refresh needed.
 *   - Self-contained: no external hooks/imports beyond react/router/lucide, so
 *     it can never crash on a missing provider during onboarding.
 *   - Icons (lucide), the logo, emojis, emails and registration numbers are
 *     intentionally NOT translated.
 *
 * LEGAL COMPLIANCE:
 * ✅ OHADA e-consent checkbox — Cameroon Law No. 2024/017 (23 Dec 2024) §13-16
 * ✅ Scroll-to-bottom enforcement before acceptance is enabled
 * ✅ Explicit opt-in (never pre-checked) + acceptance timestamps
 * ✅ English version prevails in case of discrepancy (stated in-document)
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

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANG_KEY = "Bambeh_language";

function resolveLang(raw: string | null | undefined): Lang {
  const valid: Lang[] = ["en", "fr", "pidgin", "ar", "ff"];
  if (!raw) return "en";
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde") return "ff";
  if (raw === "ha" || raw === "hausa") return "en"; // legacy value -> safe default
  return valid.includes(raw as Lang) ? (raw as Lang) : "en";
}

/** useTermsLang — current language, reactive to "bambeh:langchange" + storage. */
function useTermsLang(): Lang {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return resolveLang(localStorage.getItem(LANG_KEY));
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    const onLang = (e: Event) => {
      const d = (e as CustomEvent).detail;
      const raw =
        typeof d === "string" ? d : (() => {
          try {
            return localStorage.getItem(LANG_KEY);
          } catch {
            return null;
          }
        })();
      setLang(resolveLang(raw));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) setLang(resolveLang(e.newValue));
    };
    window.addEventListener("bambeh:langchange", onLang as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bambeh:langchange", onLang as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return lang;
}

// ── Body blocks (rendered uniformly for every language) ─────────────────────
type Block =
  | { k: "h3"; t: string }
  | { k: "h4"; t: string }
  | { k: "p"; t: string }
  | { k: "ul"; items: string[] };

interface TermsDoc {
  headerWelcome: string;
  headerSub: string;
  headerHint: string;
  docTitle: string;
  effective: string;
  intro: string;
  body: Block[];
  prevail: string;
  ackTitle: string;
  ackIntro: string;
  ackItems: string[];
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  contactLabel: string;
  bannerScroll: string;
  bannerDone: string;
  warnTitle: string;
  warnSub: string;
  cb1Label: string;
  cb1Sub: string;
  cb1Accepted: string;
  cb1Click: string;
  ohadaTitle: string;
  ohadaMain: string;
  ohadaSub: string;
  ohadaConfirmed: string;
  ohadaRequired: string;
  progRead: string;
  progTerms: string;
  progData: string;
  btnDecline: string;
  btnClose: string;
  btnAccept: string;
  compliance: string;
  promoStrong: string;
  promoRest: string;
  alertRead: string;
  alertAccept: string;
  alertOhada: string;
  declineConfirm: string;
  declineAlert: string;
}

// Constant across all languages (brand / legal identifiers / contacts).
const CONTACT_VALUE = "support@bambeh.com · bambetheapp@gmail.com";
const COPYRIGHT =
  "© 2026 BAMBEH SARL. Registre de Commerce: CM-NSI-02-2026-B13-00179 · NIU: M022618405804C · D-U-N-S No: 850379853";
const PULSE = "BAMBEH MARKETPLACE - THE PULSE OF AFRICAN COMMERCE";

const TERMS: Record<Lang, TermsDoc> = {
  en: {
    headerWelcome: "Welcome to",
    headerSub: "Online Marketplace",
    headerHint: "Please read and accept our Terms and Conditions",
    docTitle: "BAMBEH TERMS AND CONDITIONS",
    effective: "Effective Date: January 1, 2026",
    intro:
      `Welcome to Bambeh ("the App"), a marketplace platform operated by BAMBEH SARL (Registre de Commerce: CM-NSI-02-2026-B13-00179), connecting buyers and sellers digitally across Cameroon and beyond.`,
    body: [
      { k: "h3", t: "1. DEFINITIONS AND INTERPRETATION" },
      { k: "ul", items: [
        `"BAMBEH SARL" refers to the legal entity operating Bambeh, registered in Yaoundé, Cameroon (Registre de Commerce: CM-NSI-02-2026-B13-00179; NIU: M022618405804C; D-U-N-S No: 850379853).`,
        `"User" means any individual who creates an account and uses the App for buying, selling, or browsing.`,
        `"Vendor" means a User who offers goods or services for sale on the platform.`,
        `"Zerm Coins" are a proprietary in-app virtual currency with no real-world cash value outside the platform.`,
      ] },
      { k: "h3", t: "2. ACCOUNT REGISTRATION" },
      { k: "h4", t: "2.1 Eligibility" },
      { k: "ul", items: [
        "You must be at least 18 years old to use Bambeh.",
        "By registering, you affirm that all information provided is accurate and complete.",
      ] },
      { k: "h4", t: "2.2 Account Security" },
      { k: "ul", items: [
        "You are responsible for maintaining the confidentiality of your credentials.",
        "Notify us immediately of any unauthorized access at support@bambeh.com.",
      ] },
      { k: "h3", t: "3. MARKETPLACE RULES" },
      { k: "ul", items: [
        "All listings must be accurate and lawful under Cameroonian law.",
        "No counterfeit, stolen, or prohibited items are permitted.",
        "Bambeh reserves the right to remove listings at its discretion.",
        "A 1% transaction fee applies to all completed sales — the lowest in Cameroon.",
      ] },
      { k: "h3", t: "4. ZERM COINS" },
      { k: "ul", items: [
        "Zerm Coins have no monetary value outside the platform.",
        "They cannot be exchanged for cash.",
        "BAMBEH SARL reserves the right to modify Zerm Coin policies with 30 days' notice.",
      ] },
      { k: "h3", t: "5. DATA PROTECTION" },
      { k: "p", t: `The collection and processing of your personal data is governed by Cameroon's Law No. 2024/017 of 23 December 2024 on Personal Data Protection. You have the right to access, rectify, and request deletion of your data at any time by contacting support@bambeh.com. Full details are in our Privacy Policy available at bambeh.com/privacy-policy.` },
      { k: "h3", t: "6. LIMITATION OF LIABILITY" },
      { k: "p", t: "Bambeh is not liable for any indirect, incidental, or consequential damages arising from your use of the platform." },
      { k: "h3", t: "7. DISPUTE RESOLUTION" },
      { k: "p", t: "All disputes shall be resolved through binding arbitration in Yaoundé, Cameroon, under the laws of the Republic of Cameroon and applicable OHADA Uniform Acts." },
      { k: "h3", t: "8. INTELLECTUAL PROPERTY" },
      { k: "p", t: "All content, trademarks, and technology are owned by BAMBEH SARL. You may not copy, modify, or distribute any part without written permission." },
      { k: "h3", t: "9. MODIFICATIONS" },
      { k: "p", t: "Bambeh may modify these Terms at any time. Continued use constitutes acceptance. Material changes will be notified via in-app notice." },
      { k: "h3", t: "10. GOVERNING LAW" },
      { k: "p", t: "These Terms are governed by the laws of the Republic of Cameroon, including applicable OHADA Uniform Acts." },
    ],
    prevail:
      "These Terms are provided in several languages for your convenience. In case of any discrepancy between versions, the English version prevails.",
    ackTitle: "ACKNOWLEDGMENT",
    ackIntro: `By checking the boxes below and clicking "Accept and Continue," you acknowledge:`,
    ackItems: [
      "You have read and understood these Terms and Conditions",
      "You agree to be bound by all provisions herein",
      "You are at least 18 years of age",
      "You have the legal capacity to enter into this agreement",
      "You consent to data processing as described under Law No. 2024/017",
    ],
    lastUpdatedLabel: "Last Updated:",
    lastUpdatedDate: "January 1, 2026",
    contactLabel: "Contact:",
    bannerScroll: "Please scroll down and read the entire document",
    bannerDone: "Thank you for reading! You may now accept the terms below.",
    warnTitle: "Please read the entire document",
    warnSub: "Scroll down to the bottom to enable the acceptance checkboxes",
    cb1Label:
      "I have read, understood, and agree to be bound by the Bambeh Terms and Conditions.",
    cb1Sub:
      "I acknowledge that I am at least 18 years of age and have the legal capacity to enter into this agreement.",
    cb1Accepted: "Terms Accepted",
    cb1Click: "Click here to accept Terms and Conditions",
    ohadaTitle: "Data Protection Consent — Law No. 2024/017 (Cameroon)",
    ohadaMain:
      "I consent to BAMBEH SARL collecting and processing my personal data (name, email, phone number, location, device identifiers) solely to operate my Bambeh account, process transactions, and improve the platform — in accordance with Cameroon's Law No. 2024/017 of 23 December 2024 on Personal Data Protection and applicable OHADA Uniform Acts.",
    ohadaSub:
      "Your data is never sold to third parties. You may withdraw this consent and request deletion of your data at any time by emailing support@bambeh.com. See our full Privacy Policy at bambeh.com/privacy-policy.",
    ohadaConfirmed: "Data processing consent confirmed",
    ohadaRequired: "Required — click to give data processing consent",
    progRead: "Read",
    progTerms: "Terms",
    progData: "Data",
    btnDecline: "Decline",
    btnClose: "Close",
    btnAccept: "Accept and Continue",
    compliance:
      "Compliant with Cameroon Law No. 2024/017 · OHADA Uniform Acts · Google Play Developer Policy",
    promoStrong: "Only 1% Transaction Fee",
    promoRest: " — Lowest you will find online! ",
    alertRead: "Please read the entire Terms and Conditions before accepting.",
    alertAccept: "Please check the acceptance box to continue.",
    alertOhada:
      "Please confirm your consent to data processing under Cameroonian law (Law No. 2024/017) to continue.",
    declineConfirm:
      "You must accept the Terms and Conditions to use Bambeh. Are you sure you want to decline?",
    declineAlert:
      "You have declined the Terms and Conditions. The app will now close.",
  },

  fr: {
    headerWelcome: "Bienvenue sur",
    headerSub: "Place de marché en ligne",
    headerHint: "Veuillez lire et accepter nos Conditions générales",
    docTitle: "CONDITIONS GÉNÉRALES DE BAMBEH",
    effective: "Date d'entrée en vigueur : 1 janvier 2026",
    intro:
      `Bienvenue sur Bambeh (« l'Application »), une plateforme de place de marché exploitée par BAMBEH SARL (Registre de Commerce : CM-NSI-02-2026-B13-00179), qui met en relation acheteurs et vendeurs de façon numérique au Cameroun et au-delà.`,
    body: [
      { k: "h3", t: "1. DÉFINITIONS ET INTERPRÉTATION" },
      { k: "ul", items: [
        `« BAMBEH SARL » désigne l'entité juridique exploitant Bambeh, immatriculée à Yaoundé, Cameroun (Registre de Commerce : CM-NSI-02-2026-B13-00179 ; NIU : M022618405804C ; N° D-U-N-S : 850379853).`,
        `« Utilisateur » désigne toute personne qui crée un compte et utilise l'Application pour acheter, vendre ou parcourir les annonces.`,
        `« Vendeur » désigne un Utilisateur qui propose des biens ou des services à la vente sur la plateforme.`,
        `« Pièces Zerm » sont une monnaie virtuelle interne propriétaire, sans valeur monétaire réelle en dehors de la plateforme.`,
      ] },
      { k: "h3", t: "2. INSCRIPTION DU COMPTE" },
      { k: "h4", t: "2.1 Admissibilité" },
      { k: "ul", items: [
        "Vous devez avoir au moins 18 ans pour utiliser Bambeh.",
        "En vous inscrivant, vous affirmez que toutes les informations fournies sont exactes et complètes.",
      ] },
      { k: "h4", t: "2.2 Sécurité du compte" },
      { k: "ul", items: [
        "Vous êtes responsable de la confidentialité de vos identifiants.",
        "Signalez-nous immédiatement tout accès non autorisé à support@bambeh.com.",
      ] },
      { k: "h3", t: "3. RÈGLES DE LA PLACE DE MARCHÉ" },
      { k: "ul", items: [
        "Toutes les annonces doivent être exactes et licites au regard du droit camerounais.",
        "Aucun article contrefait, volé ou interdit n'est autorisé.",
        "Bambeh se réserve le droit de retirer des annonces à sa discrétion.",
        "Des frais de transaction de 1 % s'appliquent à toutes les ventes conclues — les plus bas du Cameroun.",
      ] },
      { k: "h3", t: "4. PIÈCES ZERM" },
      { k: "ul", items: [
        "Les Pièces Zerm n'ont aucune valeur monétaire en dehors de la plateforme.",
        "Elles ne peuvent pas être échangées contre des espèces.",
        "BAMBEH SARL se réserve le droit de modifier la politique des Pièces Zerm moyennant un préavis de 30 jours.",
      ] },
      { k: "h3", t: "5. PROTECTION DES DONNÉES" },
      { k: "p", t: `La collecte et le traitement de vos données personnelles sont régis par la loi camerounaise n° 2024/017 du 23 décembre 2024 relative à la protection des données personnelles. Vous avez le droit d'accéder à vos données, de les rectifier et d'en demander la suppression à tout moment en écrivant à support@bambeh.com. Tous les détails figurent dans notre Politique de confidentialité disponible sur bambeh.com/privacy-policy.` },
      { k: "h3", t: "6. LIMITATION DE RESPONSABILITÉ" },
      { k: "p", t: "Bambeh n'est responsable d'aucun dommage indirect, accessoire ou consécutif résultant de votre utilisation de la plateforme." },
      { k: "h3", t: "7. RÈGLEMENT DES LITIGES" },
      { k: "p", t: "Tout litige sera résolu par arbitrage contraignant à Yaoundé, Cameroun, conformément aux lois de la République du Cameroun et aux Actes uniformes OHADA applicables." },
      { k: "h3", t: "8. PROPRIÉTÉ INTELLECTUELLE" },
      { k: "p", t: "L'ensemble du contenu, des marques et de la technologie appartient à BAMBEH SARL. Vous ne pouvez copier, modifier ou distribuer aucune partie sans autorisation écrite." },
      { k: "h3", t: "9. MODIFICATIONS" },
      { k: "p", t: "Bambeh peut modifier les présentes Conditions à tout moment. La poursuite de l'utilisation vaut acceptation. Les changements importants seront notifiés par un avis dans l'application." },
      { k: "h3", t: "10. DROIT APPLICABLE" },
      { k: "p", t: "Les présentes Conditions sont régies par les lois de la République du Cameroun, y compris les Actes uniformes OHADA applicables." },
    ],
    prevail:
      "Les présentes Conditions sont fournies en plusieurs langues pour votre commodité. En cas de divergence entre les versions, la version anglaise prévaut.",
    ackTitle: "RECONNAISSANCE",
    ackIntro: `En cochant les cases ci-dessous et en cliquant sur « Accepter et continuer », vous reconnaissez :`,
    ackItems: [
      "Avoir lu et compris les présentes Conditions générales",
      "Accepter d'être lié par toutes les dispositions qui y figurent",
      "Être âgé d'au moins 18 ans",
      "Avoir la capacité juridique de conclure le présent accord",
      "Consentir au traitement des données tel que décrit par la loi n° 2024/017",
    ],
    lastUpdatedLabel: "Dernière mise à jour :",
    lastUpdatedDate: "1 janvier 2026",
    contactLabel: "Contact :",
    bannerScroll: "Veuillez faire défiler et lire l'intégralité du document",
    bannerDone:
      "Merci de votre lecture ! Vous pouvez maintenant accepter les conditions ci-dessous.",
    warnTitle: "Veuillez lire l'intégralité du document",
    warnSub:
      "Faites défiler jusqu'en bas pour activer les cases d'acceptation",
    cb1Label:
      "J'ai lu, compris et j'accepte d'être lié par les Conditions générales de Bambeh.",
    cb1Sub:
      "Je reconnais avoir au moins 18 ans et disposer de la capacité juridique pour conclure cet accord.",
    cb1Accepted: "Conditions acceptées",
    cb1Click: "Cliquez ici pour accepter les Conditions générales",
    ohadaTitle:
      "Consentement à la protection des données — Loi n° 2024/017 (Cameroun)",
    ohadaMain:
      "Je consens à ce que BAMBEH SARL collecte et traite mes données personnelles (nom, e-mail, numéro de téléphone, localisation, identifiants d'appareil) uniquement pour gérer mon compte Bambeh, traiter les transactions et améliorer la plateforme — conformément à la loi camerounaise n° 2024/017 du 23 décembre 2024 sur la protection des données personnelles et aux Actes uniformes OHADA applicables.",
    ohadaSub:
      "Vos données ne sont jamais vendues à des tiers. Vous pouvez retirer ce consentement et demander la suppression de vos données à tout moment en écrivant à support@bambeh.com. Consultez notre Politique de confidentialité complète sur bambeh.com/privacy-policy.",
    ohadaConfirmed: "Consentement au traitement des données confirmé",
    ohadaRequired:
      "Obligatoire — cliquez pour donner votre consentement au traitement des données",
    progRead: "Lire",
    progTerms: "Conditions",
    progData: "Données",
    btnDecline: "Refuser",
    btnClose: "Fermer",
    btnAccept: "Accepter et continuer",
    compliance:
      "Conforme à la loi camerounaise n° 2024/017 · Actes uniformes OHADA · Politique des développeurs Google Play",
    promoStrong: "1 % de frais de transaction seulement",
    promoRest: " — Les plus bas que vous trouverez en ligne ! ",
    alertRead:
      "Veuillez lire l'intégralité des Conditions générales avant d'accepter.",
    alertAccept: "Veuillez cocher la case d'acceptation pour continuer.",
    alertOhada:
      "Veuillez confirmer votre consentement au traitement des données en vertu de la loi camerounaise (loi n° 2024/017) pour continuer.",
    declineConfirm:
      "Vous devez accepter les Conditions générales pour utiliser Bambeh. Êtes-vous sûr de vouloir refuser ?",
    declineAlert:
      "Vous avez refusé les Conditions générales. L'application va maintenant se fermer.",
  },

  pidgin: {
    headerWelcome: "Welcome to",
    headerSub: "Online Marketplace",
    headerHint: "Abeg read and accept our Terms and Conditions",
    docTitle: "BAMBEH TERMS AND CONDITIONS",
    effective: "Start Date: 01/01/2026",
    intro:
      `Welcome to Bambeh ("di App"), na marketplace platform wey BAMBEH SARL dey run (Registre de Commerce: CM-NSI-02-2026-B13-00179), wey dey join buyers and sellers for online for Cameroon and beyond.`,
    body: [
      { k: "h3", t: "1. MEANING OF WORDS" },
      { k: "ul", items: [
        `"BAMBEH SARL" na di legal company wey dey run Bambeh, registered for Yaounde, Cameroon (Registre de Commerce: CM-NSI-02-2026-B13-00179; NIU: M022618405804C; D-U-N-S No: 850379853).`,
        `"User" mean any person wey open account and dey use di App to buy, sell, or look around.`,
        `"Vendor" na User wey dey offer goods or service for sale for di platform.`,
        `"Zerm Coins" na Bambeh own virtual money wey no get cash value outside di platform.`,
      ] },
      { k: "h3", t: "2. ACCOUNT REGISTRATION" },
      { k: "h4", t: "2.1 Who Fit Register" },
      { k: "ul", items: [
        "You must be 18 years or pass before you fit use Bambeh.",
        "As you dey register, you dey confirm say all di info wey you give na correct and complete.",
      ] },
      { k: "h4", t: "2.2 Account Security" },
      { k: "ul", items: [
        "Na you get di work to keep yua password and login secret.",
        "Tell us sharp-sharp if person enta yua account without permission, for support@bambeh.com.",
      ] },
      { k: "h3", t: "3. MARKETPLACE RULES" },
      { k: "ul", items: [
        "All listing must be correct and legal under Cameroon law.",
        "No fake, thief, or banned items dey allowed.",
        "Bambeh fit remove any listing as e see reason.",
        "1% transaction fee dey apply to all sales wey complete — di lowest for Cameroon.",
      ] },
      { k: "h3", t: "4. ZERM COINS" },
      { k: "ul", items: [
        "Zerm Coins no get money value outside di platform.",
        "You no fit change dem to cash.",
        "BAMBEH SARL fit change Zerm Coin policy with 30 days notice.",
      ] },
      { k: "h3", t: "5. DATA PROTECTION" },
      { k: "p", t: `Di way we dey collect and handle yua personal data dey follow Cameroon Law No. 2024/017 of 23 December 2024 on Personal Data Protection. You get right to see, correct, or ask make we delete yua data any time, for support@bambeh.com. Full details dey for our Privacy Policy for bambeh.com/privacy-policy.` },
      { k: "h3", t: "6. LIMIT OF LIABILITY" },
      { k: "p", t: "Bambeh no go carry blame for any indirect or follow-come damage wey come from how you use di platform." },
      { k: "h3", t: "7. HOW TO SETTLE PALAVA" },
      { k: "p", t: "All palava go settle through binding arbitration for Yaounde, Cameroon, under Cameroon law and di OHADA Uniform Acts wey dey apply." },
      { k: "h3", t: "8. INTELLECTUAL PROPERTY" },
      { k: "p", t: "All content, trademark, and technology na BAMBEH SARL own am. You no fit copy, change, or share any part without written permission." },
      { k: "h3", t: "9. CHANGES" },
      { k: "p", t: "Bambeh fit change dis Terms any time. If you continue to use am, e mean say you gree. We go tell you about big changes through notice inside di app." },
      { k: "h3", t: "10. LAW WEY DEY GUIDE" },
      { k: "p", t: "Dis Terms dey follow di law of di Republic of Cameroon, including di OHADA Uniform Acts wey dey apply." },
    ],
    prevail:
      "We put dis Terms for plenty languages to helep you. If any difference dey between dem, na di English version go stand.",
    ackTitle: "ACKNOWLEDGMENT",
    ackIntro: `As you check di boxes below and press "Accept and Continue," you dey confirm say:`,
    ackItems: [
      "You don read and understand dis Terms and Conditions",
      "You gree to follow all di rules inside",
      "You don reach 18 years",
      "You get di legal right to enter dis agreement",
      "You gree make we process yua data as Law No. 2024/017 talk",
    ],
    lastUpdatedLabel: "Last Updated:",
    lastUpdatedDate: "01/01/2026",
    contactLabel: "Contact:",
    bannerScroll: "Abeg scroll down read di whole document",
    bannerDone: "Thank you for reading! You fit accept di terms below now.",
    warnTitle: "Abeg read di whole document",
    warnSub: "Scroll go di bottom make di accept boxes open",
    cb1Label:
      "I don read, understand, and I gree to follow di Bambeh Terms and Conditions.",
    cb1Sub:
      "I confirm say I don reach 18 years and I get di legal right to enter dis agreement.",
    cb1Accepted: "Terms Accepted",
    cb1Click: "Press here to accept Terms and Conditions",
    ohadaTitle: "Data Protection Consent — Law No. 2024/017 (Cameroon)",
    ohadaMain:
      "I gree make BAMBEH SARL collect and process my personal data (name, email, phone number, location, device IDs) only to run my Bambeh account, do transactions, and improve di platform — as Cameroon Law No. 2024/017 of 23 December 2024 on Personal Data Protection and di OHADA Uniform Acts talk.",
    ohadaSub:
      "We no dey sell yua data to anybody. You fit withdraw dis consent and ask make we delete yua data any time, email support@bambeh.com. See our full Privacy Policy for bambeh.com/privacy-policy.",
    ohadaConfirmed: "Data processing consent confirmed",
    ohadaRequired: "Dem need am — press to give data processing consent",
    progRead: "Read",
    progTerms: "Terms",
    progData: "Data",
    btnDecline: "Decline",
    btnClose: "Close",
    btnAccept: "Accept and Continue",
    compliance:
      "E follow Cameroon Law No. 2024/017 · OHADA Uniform Acts · Google Play Developer Policy",
    promoStrong: "Only 1% Transaction Fee",
    promoRest: " — Lowest wey you go find online! ",
    alertRead: "Abeg read di whole Terms and Conditions before you accept.",
    alertAccept: "Abeg check di accept box make you fit continue.",
    alertOhada:
      "Abeg confirm yua consent for data processing under Cameroon law (Law No. 2024/017) make you fit continue.",
    declineConfirm:
      "You must accept di Terms and Conditions before you fit use Bambeh. You sure say you wan decline?",
    declineAlert: "You don decline di Terms and Conditions. Di app go close now.",
  },

  ar: {
    headerWelcome: "مرحباً بك في",
    headerSub: "سوق إلكتروني",
    headerHint: "يرجى قراءة شروطنا وأحكامنا وقبولها",
    docTitle: "شروط وأحكام بامبيه",
    effective: "تاريخ السريان: 1 يناير 2026",
    intro:
      "مرحباً بك في بامبيه (« التطبيق »)، وهي منصة سوق تُشغّلها شركة BAMBEH SARL (السجل التجاري: CM-NSI-02-2026-B13-00179)، تربط المشترين والبائعين رقمياً في الكاميرون وخارجها.",
    body: [
      { k: "h3", t: "1. التعريفات والتفسير" },
      { k: "ul", items: [
        "« BAMBEH SARL » تشير إلى الكيان القانوني الذي يُشغّل بامبيه، المسجّل في ياوندي، الكاميرون (السجل التجاري: CM-NSI-02-2026-B13-00179؛ NIU: M022618405804C؛ رقم D-U-N-S: 850379853).",
        "« المستخدم » يعني أي فرد يُنشئ حساباً ويستخدم التطبيق للشراء أو البيع أو التصفح.",
        "« البائع » يعني مستخدماً يعرض سلعاً أو خدمات للبيع على المنصة.",
        "« عملات زيرم » هي عملة افتراضية خاصة داخل التطبيق وليست لها قيمة نقدية حقيقية خارج المنصة.",
      ] },
      { k: "h3", t: "2. تسجيل الحساب" },
      { k: "h4", t: "2.1 الأهلية" },
      { k: "ul", items: [
        "يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام بامبيه.",
        "بالتسجيل، تؤكد أن جميع المعلومات المقدَّمة دقيقة وكاملة.",
      ] },
      { k: "h4", t: "2.2 أمن الحساب" },
      { k: "ul", items: [
        "أنت مسؤول عن الحفاظ على سرية بيانات اعتمادك.",
        "أبلغنا فوراً بأي وصول غير مصرّح به على support@bambeh.com.",
      ] },
      { k: "h3", t: "3. قواعد السوق" },
      { k: "ul", items: [
        "يجب أن تكون جميع الإعلانات دقيقة وقانونية بموجب القانون الكاميروني.",
        "لا يُسمح بأي سلع مزيّفة أو مسروقة أو محظورة.",
        "يحتفظ بامبيه بالحق في إزالة الإعلانات وفق تقديره.",
        "تُطبَّق رسوم معاملات بنسبة 1% على جميع المبيعات المكتملة — وهي الأدنى في الكاميرون.",
      ] },
      { k: "h3", t: "4. عملات زيرم" },
      { k: "ul", items: [
        "عملات زيرم ليست لها قيمة نقدية خارج المنصة.",
        "لا يمكن استبدالها بنقود.",
        "تحتفظ BAMBEH SARL بالحق في تعديل سياسة عملات زيرم بإشعار مدته 30 يوماً.",
      ] },
      { k: "h3", t: "5. حماية البيانات" },
      { k: "p", t: "يخضع جمع بياناتك الشخصية ومعالجتها للقانون الكاميروني رقم 2024/017 الصادر في 23 ديسمبر 2024 بشأن حماية البيانات الشخصية. يحق لك الوصول إلى بياناتك وتصحيحها وطلب حذفها في أي وقت بمراسلة support@bambeh.com. التفاصيل الكاملة في سياسة الخصوصية على bambeh.com/privacy-policy." },
      { k: "h3", t: "6. تحديد المسؤولية" },
      { k: "p", t: "لا يتحمّل بامبيه المسؤولية عن أي أضرار غير مباشرة أو عرضية أو تبعية تنشأ عن استخدامك للمنصة." },
      { k: "h3", t: "7. حل النزاعات" },
      { k: "p", t: "تُحَل جميع النزاعات عن طريق التحكيم المُلزِم في ياوندي، الكاميرون، بموجب قوانين جمهورية الكاميرون وقوانين أوهادا الموحدة المعمول بها." },
      { k: "h3", t: "8. الملكية الفكرية" },
      { k: "p", t: "جميع المحتويات والعلامات التجارية والتقنيات مملوكة لشركة BAMBEH SARL. لا يجوز لك نسخ أي جزء أو تعديله أو توزيعه دون إذن كتابي." },
      { k: "h3", t: "9. التعديلات" },
      { k: "p", t: "يجوز لبامبيه تعديل هذه الشروط في أي وقت. ويُعد استمرار الاستخدام قبولاً لها. وسيتم الإخطار بالتغييرات الجوهرية عبر إشعار داخل التطبيق." },
      { k: "h3", t: "10. القانون الحاكم" },
      { k: "p", t: "تخضع هذه الشروط لقوانين جمهورية الكاميرون، بما في ذلك قوانين أوهادا الموحدة المعمول بها." },
    ],
    prevail:
      "تُقدَّم هذه الشروط بعدة لغات لتيسيرها عليك. وفي حال وجود أي تعارض بين النسخ، تكون النسخة الإنجليزية هي المعتمدة.",
    ackTitle: "إقرار",
    ackIntro: "بتحديد المربعات أدناه والنقر على « قبول ومتابعة »، فإنك تُقِر بما يلي:",
    ackItems: [
      "أنك قرأت هذه الشروط والأحكام وفهمتها",
      "أنك توافق على الالتزام بجميع الأحكام الواردة فيها",
      "أن عمرك 18 عاماً على الأقل",
      "أن لديك الأهلية القانونية لإبرام هذه الاتفاقية",
      "أنك توافق على معالجة البيانات كما هو موضّح بموجب القانون رقم 2024/017",
    ],
    lastUpdatedLabel: "آخر تحديث:",
    lastUpdatedDate: "1 يناير 2026",
    contactLabel: "للتواصل:",
    bannerScroll: "يرجى التمرير لأسفل وقراءة المستند بالكامل",
    bannerDone: "شكراً لقراءتك! يمكنك الآن قبول الشروط أدناه.",
    warnTitle: "يرجى قراءة المستند بالكامل",
    warnSub: "مرّر إلى الأسفل لتفعيل مربعات القبول",
    cb1Label: "لقد قرأت شروط وأحكام بامبيه وفهمتها وأوافق على الالتزام بها.",
    cb1Sub:
      "أُقِر بأن عمري 18 عاماً على الأقل وأن لديّ الأهلية القانونية لإبرام هذه الاتفاقية.",
    cb1Accepted: "تم قبول الشروط",
    cb1Click: "انقر هنا لقبول الشروط والأحكام",
    ohadaTitle: "الموافقة على حماية البيانات — القانون رقم 2024/017 (الكاميرون)",
    ohadaMain:
      "أوافق على قيام شركة BAMBEH SARL بجمع بياناتي الشخصية ومعالجتها (الاسم، البريد الإلكتروني، رقم الهاتف، الموقع، معرّفات الجهاز) فقط لتشغيل حسابي في بامبيه ومعالجة المعاملات وتحسين المنصة — وفقاً للقانون الكاميروني رقم 2024/017 الصادر في 23 ديسمبر 2024 بشأن حماية البيانات الشخصية وقوانين أوهادا الموحدة المعمول بها.",
    ohadaSub:
      "لا تُباع بياناتك أبداً لأطراف ثالثة. يمكنك سحب هذه الموافقة وطلب حذف بياناتك في أي وقت بمراسلة support@bambeh.com. اطّلع على سياسة الخصوصية الكاملة على bambeh.com/privacy-policy.",
    ohadaConfirmed: "تم تأكيد الموافقة على معالجة البيانات",
    ohadaRequired: "مطلوب — انقر لمنح الموافقة على معالجة البيانات",
    progRead: "قراءة",
    progTerms: "الشروط",
    progData: "البيانات",
    btnDecline: "رفض",
    btnClose: "إغلاق",
    btnAccept: "قبول ومتابعة",
    compliance:
      "متوافق مع القانون الكاميروني رقم 2024/017 · قوانين أوهادا الموحدة · سياسة مطوّري Google Play",
    promoStrong: "رسوم معاملات 1% فقط",
    promoRest: " — الأدنى الذي ستجده على الإنترنت! ",
    alertRead: "يرجى قراءة كامل الشروط والأحكام قبل القبول.",
    alertAccept: "يرجى تحديد مربع القبول للمتابعة.",
    alertOhada:
      "يرجى تأكيد موافقتك على معالجة البيانات بموجب القانون الكاميروني (القانون رقم 2024/017) للمتابعة.",
    declineConfirm:
      "يجب قبول الشروط والأحكام لاستخدام بامبيه. هل أنت متأكد أنك تريد الرفض؟",
    declineAlert: "لقد رفضت الشروط والأحكام. سيُغلق التطبيق الآن.",
  },

  ff: {
    headerWelcome: "Njabbama e",
    headerSub: "Luumo Elektoroonik",
    headerHint: "Tiiɗno janngu jaɓaa Sarɗiiji amen",
    docTitle: "SARƊIIJI E KUUGAL BAMBEH",
    effective: "Ñalnde Naatgol: 01/01/2026",
    intro:
      `Njabbama e Bambeh ("App"), na luumo elektoroonik ngu BAMBEH SARL ardii (Registre de Commerce: CM-NSI-02-2026-B13-00179), ngu hawrata soodooɓe e yeeyooɓe e Kamaru e caggal mum.`,
    body: [
      { k: "h3", t: "1. MAANAAJI E FIRO" },
      { k: "ul", items: [
        `"BAMBEH SARL" ko firtannde laawɗo ardiiɗo Bambeh, winnditaaɗo Yaounde, Kamaru (Registre de Commerce: CM-NSI-02-2026-B13-00179; NIU: M022618405804C; D-U-N-S No: 850379853).`,
        `"Huutorɗo" ko neɗɗo kala mahoowo konte huutoroowo App ngam soodugol, yeeyugol, walla ndaarugol.`,
        `"Yeeyoowo" ko Huutorɗo bannginoowo kaake walla golleeji ngam yeeyeede e nokku oo.`,
        `"Zerm Coins" ko kaalisaaji ɗiɗɗingal Bambeh, ɗi ngalaa nafoore kaalis caggal nokku oo.`,
      ] },
      { k: "h3", t: "2. WINNDITAGOL KONTE" },
      { k: "h4", t: "2.1 Hattaŋ" },
      { k: "ul", items: [
        "Maa won duuɓi 18 walla ɓuri ngam huutoraade Bambeh.",
        "So a winnditii, a tabitinii wonde keɓe fof ɗe a hokki ko goonga e timmuɗe.",
      ] },
      { k: "h4", t: "2.2 Kisal Konte" },
      { k: "ul", items: [
        "Aan woni jom-hakke reenugol gunndoo sirdaaji konte maa.",
        "Habru min law so neɗɗo naatii konte maa ko aldaa e yamiroore, e support@bambeh.com.",
      ] },
      { k: "h3", t: "3. SARƊIIJI LUUMO" },
      { k: "ul", items: [
        "Bayanaaji fof ina foti wonde goonga e dagiiɗi e ley sariya Kamaru.",
        "Kaake fewjaaɗe, wujjaaɗe, walla haɗaaɗe njaɓaaka.",
        "Bambeh ina jogii hakke ittugol bayanaaji so o yiɗi.",
        "Yoɓdi golle 1% ina liɓee e coggu fof timmuɗo — ɓurɗo famɗude e Kamaru.",
      ] },
      { k: "h3", t: "4. ZERM COINS" },
      { k: "ul", items: [
        "Zerm Coins ngalaa nafoore kaalis caggal nokku oo.",
        "Ɗi mbaawaa wayliteede e kaalis.",
        "BAMBEH SARL ina jogii hakke waylugol sariya Zerm Coins e tintinol balɗe 30.",
      ] },
      { k: "h3", t: "5. REENUGOL KEƁE" },
      { k: "p", t: `Mooɓtugol e yuɓɓingol keɓe maa jaati ina ɗowee e Sariya Kamaru No. 2024/017 mo 23 desambar 2024 fawaade e reenugol keɓe jaati. A jogii hakke yiyde, feewnude, e ɗaɓɓude momtugol keɓe maa saanga kala e support@bambeh.com. Fiɣndeeji fof ina nder Politik Suturo amen e bambeh.com/privacy-policy.` },
      { k: "h3", t: "6. KEEROL FAWAADE" },
      { k: "p", t: "Bambeh ronndotaako bone woo mo wonaa peeñɗo walla aroowo caggal ngam huutoragol maa nokku oo." },
      { k: "h3", t: "7. ÑAAWUGOL LUURAL" },
      { k: "p", t: "Luural fof ina ñaawee e arbitraas fawii e Yaounde, Kamaru, e ley sariyaaji Renndo Kamaru e Sarɗiyeeji OHADA huutorteeɗi." },
      { k: "h3", t: "8. JEYAL MIIJO" },
      { k: "p", t: "Content fof, maakaaji yeeyu, e teknooloji ko BAMBEH SARL jeyi. A waawaa natta, waylude, walla saaktude geɓal woo ko aldaa e yamiroore winndaande." },
      { k: "h3", t: "9. BAYLAGOL" },
      { k: "p", t: "Bambeh ina waawi waylude Sarɗiiji ɗii saanga kala. Jokkugol huutoraade firti jaɓugol. Baylaaji mawɗi mbaɗte habreede e tintinol nder app." },
      { k: "h3", t: "10. SARIYA ARDIIƊO" },
      { k: "p", t: "Sarɗiiji ɗii ina ɗowee e sariyaaji Renndo Kamaru, hawtude e Sarɗiyeeji OHADA huutorteeɗi." },
    ],
    prevail:
      "Sarɗiiji ɗii ina ngokkaa e ɗemɗe keewɗe ngam newnande ma. So luural woodii hakkunde nataaje, ko nataande Engele woni laaɓtunde.",
    ackTitle: "JAƁGOL",
    ackIntro: `So a marii buwaaji ɗii les njannginaa "Jaɓ e Jokku", a tabitinii wonde:`,
    ackItems: [
      "A janngii faamii Sarɗiiji ɗii",
      "A jaɓii ɗowaade e sarɗiiji fof ɗi ngoni ɗoo",
      "Aɗa woni e duuɓi 18 walla ɓuri",
      "Aɗa jogii hattaŋ sariya ngam naatugol e nanngondiral ngal",
      "A jaɓii yuɓɓingol keɓe wano siforaa e Sariya No. 2024/017",
    ],
    lastUpdatedLabel: "Battindii hesɗitinde:",
    lastUpdatedDate: "01/01/2026",
    contactLabel: "Heɓondiral:",
    bannerScroll: "Tiiɗno ɗuuɗ les janngaa winndannde nde fof",
    bannerDone: "A jaaraama janngugol! Hannde a waawi jaɓde sarɗiiji ɗii les.",
    warnTitle: "Tiiɗno janngu winndannde nde fof",
    warnSub: "Ɗuuɗ haa les ngam udditde buwaaji jaɓgol",
    cb1Label:
      "Mi janngii, mi faamii, mi jaɓii ɗowaade e Sarɗiiji e Kuugal Bambeh.",
    cb1Sub:
      "Mi tabitinii wonde miɗo e duuɓi 18 walla ɓuri e miɗo jogii hattaŋ sariya naatugol e nanngondiral ngal.",
    cb1Accepted: "Sarɗiiji jaɓaama",
    cb1Click: "Ñippu ɗoo ngam jaɓde Sarɗiiji e Kuugal",
    ohadaTitle: "Jaɓgol Reenugol Keɓe — Sariya No. 2024/017 (Kamaru)",
    ohadaMain:
      "Miɗo jaɓi BAMBEH SARL mooɓta yuɓɓina keɓe am jaati (innde, e-mail, limndo telefon, nokku, ID kaɓirɗe) tan ngam ardaade konte am Bambeh, yuɓɓingol njulaaku, e ɓeydude luumo — e ley Sariya Kamaru No. 2024/017 mo 23 desambar 2024 fawaade e reenugol keɓe jaati e Sarɗiyeeji OHADA huutorteeɗi.",
    ohadaSub:
      "Keɓe maa njeeyetaake woo e taganteeɓe. A waawi ɓooltude jaɓgol ngol e ɗaɓɓude momtugol keɓe maa saanga kala, neldu e-mail e support@bambeh.com. Yiy Politik Suturo amen timmunde e bambeh.com/privacy-policy.",
    ohadaConfirmed: "Jaɓgol yuɓɓingol keɓe tabitinaama",
    ohadaRequired: "Ina waɗɗii — ñippu ngam hokkude jaɓgol yuɓɓingol keɓe",
    progRead: "Janngu",
    progTerms: "Sarɗiiji",
    progData: "Keɓe",
    btnDecline: "Salaade",
    btnClose: "Uddu",
    btnAccept: "Jaɓ e Jokku",
    compliance:
      "Ina rewi Sariya Kamaru No. 2024/017 · Sarɗiyeeji OHADA · Politik Yuɓɓinooɓe Google Play",
    promoStrong: "Yoɓdi golle 1% tan",
    promoRest: " — Ɓurɗo famɗude mo njiyataa online! ",
    alertRead: "Tiiɗno janngu Sarɗiiji e Kuugal nde fof ado jaɓde.",
    alertAccept: "Tiiɗno mar buwal jaɓgol ngam jokkude.",
    alertOhada:
      "Tiiɗno tabitin jaɓgol maa yuɓɓingol keɓe e ley sariya Kamaru (Sariya No. 2024/017) ngam jokkude.",
    declineConfirm:
      "Maa jaɓ Sarɗiiji e Kuugal ado huutoraade Bambeh. Aɗa yananaa yiɗde salaade?",
    declineAlert: "A salii Sarɗiiji e Kuugal. App oo uddoyto jooni.",
  },
};

export default function TermsAcceptance() {
  const navigate = useNavigate();
  const lang = useTermsLang();
  const tr = TERMS[lang] || TERMS.en;
  const isRtl = lang === "ar";

  const [hasRead, setHasRead] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  // OHADA / Law No. 2024/017 consent — explicit, opt-in (never pre-checked).
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
      alert(tr.alertRead);
      return;
    }
    if (!isAccepted) {
      alert(tr.alertAccept);
      return;
    }
    if (!ohadaConsented) {
      alert(tr.alertOhada);
      return;
    }

    localStorage.setItem("Bambeh_terms_accepted", "true");
    localStorage.setItem("Bambeh_terms_accepted_date", new Date().toISOString());
    localStorage.setItem("Bambeh_ohada_consent_date", new Date().toISOString());

    // Onboarding order in App.tsx guard: language -> terms -> welcome
    navigate("/welcome", { replace: true });
  };

  const handleDecline = () => {
    if (confirm(tr.declineConfirm)) {
      localStorage.clear();
      alert(tr.declineAlert);
      window.close();
    }
  };

  const canAccept = hasRead && isAccepted && ohadaConsented;
  const listPad = isRtl ? "pr-6" : "pl-6";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-4"
    >
      <div className="max-w-4xl mx-auto py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-4 shadow-xl">
            <span className="text-4xl font-bold text-white">B</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {tr.headerWelcome} <span className="text-teal-600">Bambeh</span>
          </h1>
          <p className="text-lg text-gray-600 mb-1">{tr.headerSub}</p>
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <FileText className="w-5 h-5" />
            <p className="text-sm font-medium">{tr.headerHint}</p>
          </div>
        </div>

        {/* ── Terms Container ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Scroll indicator banners */}
          {!hasScrolledToBottom && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
              <div className="flex items-center gap-2 text-amber-800">
                <ScrollText className="w-5 h-5" />
                <p className="text-sm font-medium">{tr.bannerScroll}</p>
              </div>
            </div>
          )}
          {hasScrolledToBottom && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">✅ {tr.bannerDone}</p>
              </div>
            </div>
          )}

          {/* ── Scrollable Terms Content ────────────────────────────────── */}
          <div
            onScroll={handleScroll}
            className="h-96 overflow-y-auto px-8 py-6 prose prose-sm max-w-none"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="text-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-teal-700">{tr.docTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">{tr.effective}</p>
              </div>

              <p className="mb-4 font-semibold">{tr.intro}</p>

              {tr.body.map((b, i) => {
                if (b.k === "h3")
                  return (
                    <h3 key={i} className="text-xl font-bold text-gray-900 mt-6">
                      {b.t}
                    </h3>
                  );
                if (b.k === "h4")
                  return (
                    <h4 key={i} className="text-lg font-semibold text-gray-800 mt-4">
                      {b.t}
                    </h4>
                  );
                if (b.k === "ul")
                  return (
                    <ul key={i} className={`list-disc ${listPad} space-y-2`}>
                      {b.items.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  );
                return (
                  <p key={i} className="mt-2">
                    {b.t}
                  </p>
                );
              })}

              <p className="text-xs text-gray-500 italic mt-6">{tr.prevail}</p>

              <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mt-8">
                <h3 className="font-bold text-teal-900 mb-2">✅ {tr.ackTitle}</h3>
                <p className="text-sm">{tr.ackIntro}</p>
                <ul className={`list-disc ${listPad} mt-2 text-sm space-y-1`}>
                  {tr.ackItems.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>

              <p className="text-center text-sm text-gray-600 mt-8 pb-8">
                <strong>{tr.lastUpdatedLabel}</strong> {tr.lastUpdatedDate}
                <br />
                <strong>{tr.contactLabel}</strong> {CONTACT_VALUE}
                <br />
                {COPYRIGHT}
              </p>
            </div>
          </div>

          {/* ── Acceptance Section ──────────────────────────────────────────── */}
          <div className="border-t-4 border-teal-500 bg-gradient-to-b from-gray-50 to-gray-100 px-8 py-8">

            {!hasRead && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">{tr.warnTitle}</p>
                    <p className="text-xs text-amber-700 mt-1">{tr.warnSub}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Checkbox 1: General Terms ─────────────────────────────────── */}
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
                  <p className={`text-base font-semibold ${hasRead ? "text-gray-900" : "text-gray-500"}`}>
                    {tr.cb1Label}
                  </p>
                  <p className={`text-sm mt-2 ${hasRead ? "text-gray-600" : "text-gray-400"}`}>
                    {tr.cb1Sub}
                  </p>
                  {isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-teal-600 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      <span>{tr.cb1Accepted} ✓</span>
                    </div>
                  )}
                  {hasRead && !isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
                      <span className="animate-bounce">👆</span>
                      <span>{tr.cb1Click}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Checkbox 2: OHADA / Law No. 2024/017 Data Consent ─────────── */}
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
                    aria-label="OHADA data protection consent - Law No. 2024/017"
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
                    <p className="text-sm font-bold text-gray-900">{tr.ohadaTitle}</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{tr.ohadaMain}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tr.ohadaSub}</p>
                  {ohadaConsented && (
                    <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>{tr.ohadaConfirmed} ✓</span>
                    </div>
                  )}
                  {!ohadaConsented && (
                    <div className="mt-2 flex items-center gap-2 text-gray-500 text-xs">
                      <span className="animate-bounce">👆</span>
                      <span>{tr.ohadaRequired}</span>
                    </div>
                  )}
                </div>
              </label>
            )}

            {/* ── Progress indicator ─────────────────────────────────────────── */}
            {hasRead && (
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${hasRead ? "text-teal-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${hasRead ? "bg-teal-500" : "bg-gray-300"}`}>1</div>
                  {tr.progRead}
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded">
                  <div className={`h-full rounded transition-all duration-500 bg-teal-500 ${isAccepted ? "w-full" : "w-0"}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${isAccepted ? "text-teal-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${isAccepted ? "bg-teal-500" : "bg-gray-300"}`}>2</div>
                  {tr.progTerms}
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded">
                  <div className={`h-full rounded transition-all duration-500 bg-blue-500 ${ohadaConsented ? "w-full" : "w-0"}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${ohadaConsented ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${ohadaConsented ? "bg-blue-500" : "bg-gray-300"}`}>3</div>
                  {tr.progData}
                </div>
              </div>
            )}

            {/* ── Action Buttons ─────────────────────────────────────────────── */}
            <div className="flex gap-4">
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                {isReturningUser ? tr.btnClose : tr.btnDecline}
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
                <span>{isReturningUser ? tr.btnClose : tr.btnAccept}</span>
                <ArrowRight className={`w-6 h-6 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">{tr.compliance}</p>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            🎉 <span className="font-bold text-green-600">{tr.promoStrong}</span>
            {tr.promoRest}💚
          </p>
          <p className="text-xs text-gray-500 mt-2">{PULSE}</p>
        </div>
      </div>
    </div>
  );
}
