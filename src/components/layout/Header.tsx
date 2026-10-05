// BAMBEH_DEPLOY_TOKEN__HEADER_FIX630_CLEAN
/**
 * 3-LEVEL HEADER - BAMBEH MARKETPLACE
 * FILE LOCATION: src/components/layout/Header.tsx
 *
 * CHANGES FROM ORIGINAL:
 * - Removed local LANGUAGES array and local currentLanguage state
 * - Now uses useLanguage() from LanguageContext so language change
 *   actually re-renders the whole app in the chosen language
 * - Share button now has a visible label
 * - Search bar navigates to /search?q=...
 * - NotificationBell added to desktop header (right icons + utility bar)
 *
 * FIX630 - nothing in the header may be a dead button (Play's "broken
 * functionality" rejection):
 * - The MIC is drawn only where speech recognition can work: never inside the
 *   Google Play app (its web view has no speech engine), never in a browser
 *   without one (Firefox), and it hides itself after an engine failure (Brave,
 *   Opera). Every tap answers in the user's language: listening, what it heard,
 *   microphone blocked, or not available here.
 * - SHARE says something true ("Africa's #1 Marketplace" was a misleading claim),
 *   shares the real address (inside the Play app the page lives at
 *   https://localhost), and always tells the user what happened.
 * - Inside the Play app the cut sections (Community, Farm Fresh, delivery,
 *   agents, coins, referral) and every Subscribe button are gone (FIX620/621).
 * - The last English-only words here now follow the app language.
 *
 * (c) 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogOut, LogIn, Search, Mic, MicOff, Crown, ArrowLeftRight, Globe, Settings, Package, ChevronRight, Share2, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';
import { useLang } from "@/hooks/useAppLang";
import { IS_STORE_APP, storeAllows, publicShareUrl } from "@/config/storeMode"; // FIX630

type LanguageCode = "en" | "fr" | "pcm" | "ff" | "ar";
const AVAILABLE_LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: "en",  name: "English",       flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "fr",  name: "Fran\u00E7ais", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "pcm", name: "Pidgin",        flag: "\uD83C\uDDE8\uD83C\uDDF2" },
  { code: "ff",  name: "Fulfulde",      flag: "\uD83C\uDDE8\uD83C\uDDF2" },
  { code: "ar",  name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
];

/* FIX630 - header words that were English-only or new, in all five languages. */
const HDR: Record<string, Record<string, string>> = {
  en: {
    voiceStart: "Search by voice",
    voiceStop: "Stop listening",
    voiceTap: "Search by voice",
    voiceOn: "Listening... tap to stop",
    voiceListening: "Listening... say a section (\"jobs\", \"rentals\") or what you are looking for.",
    voiceHeard: "Heard:",
    voiceNoSpeech: "I did not hear anything. Tap the microphone and speak.",
    voiceBlocked: "The microphone is blocked for Bambeh. Allow it in your browser settings to search by voice, or type your search.",
    voiceNoMic: "No microphone was found on this device. Type your search instead.",
    voiceUnsupported: "Voice search does not work in this browser. Type your search instead - Chrome and Edge support it.",
    voiceTryAgain: "Voice search could not start. Please try again.",
    shareText: "Bambeh - buy, sell, find work, services and places to rent in Cameroon.",
    shareCopied: "Link copied. Paste it in WhatsApp or anywhere you like.",
    shareManual: "Copy this link to share:",
    shareAria: "Share this page",
    subscribe: "Subscribe",
    subscribeFrom: "Subscribe - from 100 XAF a day",
    zerm: "Zerm coins",
    referral: "Referral programme",
    categories: "Categories",
    quick: "Quick actions",
    session: "Session",
    menuAria: "Open or close the menu",
    langAria: "Change language",
  },
  fr: {
    voiceStart: "Recherche vocale",
    voiceStop: "Arr\u00eater l'\u00e9coute",
    voiceTap: "Recherche vocale",
    voiceOn: "J'\u00e9coute... touchez pour arr\u00eater",
    voiceListening: "J'\u00e9coute... dites une rubrique (\u00ab emplois \u00bb, \u00ab locations \u00bb) ou ce que vous cherchez.",
    voiceHeard: "Compris :",
    voiceNoSpeech: "Je n'ai rien entendu. Touchez le micro et parlez.",
    voiceBlocked: "Le micro est bloqu\u00e9 pour Bambeh. Autorisez-le dans les r\u00e9glages du navigateur pour la recherche vocale, ou tapez votre recherche.",
    voiceNoMic: "Aucun micro n'a \u00e9t\u00e9 trouv\u00e9 sur cet appareil. Tapez plut\u00f4t votre recherche.",
    voiceUnsupported: "La recherche vocale ne fonctionne pas dans ce navigateur. Tapez votre recherche - Chrome et Edge la prennent en charge.",
    voiceTryAgain: "La recherche vocale n'a pas pu d\u00e9marrer. R\u00e9essayez.",
    shareText: "Bambeh - achetez, vendez, trouvez du travail, des services et un logement au Cameroun.",
    shareCopied: "Lien copi\u00e9. Collez-le dans WhatsApp ou ailleurs.",
    shareManual: "Copiez ce lien pour partager :",
    shareAria: "Partager cette page",
    subscribe: "S'abonner",
    subscribeFrom: "S'abonner - d\u00e8s 100 XAF par jour",
    zerm: "Pi\u00e8ces Zerm",
    referral: "Parrainage",
    categories: "Cat\u00e9gories",
    quick: "Actions rapides",
    session: "Session",
    menuAria: "Ouvrir ou fermer le menu",
    langAria: "Changer de langue",
  },
  pidgin: {
    voiceStart: "Search with voice",
    voiceStop: "Stop to listen",
    voiceTap: "Search with voice",
    voiceOn: "I dey listen... touch to stop",
    voiceListening: "I dey listen... talk one section (\"jobs\", \"rentals\") or wetin you dey find.",
    voiceHeard: "I hear:",
    voiceNoSpeech: "I no hear anything. Touch the mic and talk.",
    voiceBlocked: "Mic don block for Bambeh. Allow am for your browser settings make you search with voice, or type wetin you dey find.",
    voiceNoMic: "We no see mic for this device. Type wetin you dey find.",
    voiceUnsupported: "Voice search no dey work for this browser. Type wetin you dey find - Chrome and Edge fit do am.",
    voiceTryAgain: "Voice search no fit start. Try again.",
    shareText: "Bambeh - buy, sell, find work, services and house for rent for Cameroon.",
    shareCopied: "Link don copy. Paste am for WhatsApp or anywhere.",
    shareManual: "Copy this link to share:",
    shareAria: "Share this page",
    subscribe: "Subscribe",
    subscribeFrom: "Subscribe - from 100 XAF each day",
    zerm: "Zerm coins",
    referral: "Bring your people",
    categories: "Categories",
    quick: "Quick actions",
    session: "Session",
    menuAria: "Open or close menu",
    langAria: "Change language",
  },
  ar: {
    voiceStart: "\u0627\u0644\u0628\u062d\u062b \u0628\u0627\u0644\u0635\u0648\u062a",
    voiceStop: "\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0627\u0633\u062a\u0645\u0627\u0639",
    voiceTap: "\u0627\u0644\u0628\u062d\u062b \u0628\u0627\u0644\u0635\u0648\u062a",
    voiceOn: "\u0623\u0633\u062a\u0645\u0639... \u0627\u0636\u063a\u0637 \u0644\u0644\u0625\u064a\u0642\u0627\u0641",
    voiceListening: "\u0623\u0633\u062a\u0645\u0639... \u0642\u0644 \u0627\u0633\u0645 \u0642\u0633\u0645 (\u00ab \u0648\u0638\u0627\u0626\u0641 \u00bb\u060c \u00ab \u0625\u064a\u062c\u0627\u0631 \u00bb) \u0623\u0648 \u0645\u0627 \u062a\u0628\u062d\u062b \u0639\u0646\u0647.",
    voiceHeard: "\u0633\u0645\u0639\u062a:",
    voiceNoSpeech: "\u0644\u0645 \u0623\u0633\u0645\u0639 \u0634\u064a\u0626\u064b\u0627. \u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u0648\u062a\u062d\u062f\u062b.",
    voiceBlocked: "\u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u0645\u062d\u0638\u0648\u0631 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u0627\u0633\u0645\u062d \u0628\u0647 \u0645\u0646 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0644\u0644\u0628\u062d\u062b \u0628\u0627\u0644\u0635\u0648\u062a\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0645\u0627 \u062a\u0628\u062d\u062b \u0639\u0646\u0647.",
    voiceNoMic: "\u0644\u0645 \u064a\u064f\u0639\u062b\u0631 \u0639\u0644\u0649 \u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632. \u0627\u0643\u062a\u0628 \u0645\u0627 \u062a\u0628\u062d\u062b \u0639\u0646\u0647 \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643.",
    voiceUnsupported: "\u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0635\u0648\u062a\u064a \u0644\u0627 \u064a\u0639\u0645\u0644 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0645\u062a\u0635\u0641\u062d. \u0627\u0643\u062a\u0628 \u0645\u0627 \u062a\u0628\u062d\u062b \u0639\u0646\u0647 - \u064a\u062f\u0639\u0645\u0647 Chrome \u0648Edge.",
    voiceTryAgain: "\u062a\u0639\u0630\u0651\u0631 \u0628\u062f\u0621 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0635\u0648\u062a\u064a. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    shareText: "\u0628\u0627\u0645\u0628\u064a\u0647 - \u0628\u064a\u0639 \u0648\u0634\u0631\u0627\u0621\u060c \u0648\u0639\u0645\u0644 \u0648\u062e\u062f\u0645\u0627\u062a \u0648\u0633\u0643\u0646 \u0644\u0644\u0625\u064a\u062c\u0627\u0631 \u0641\u064a \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646.",
    shareCopied: "\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637. \u0627\u0644\u0635\u0642\u0647 \u0641\u064a \u0648\u0627\u062a\u0633\u0627\u0628 \u0623\u0648 \u0623\u064a \u0645\u0643\u0627\u0646 \u062a\u0631\u064a\u062f\u0647.",
    shareManual: "\u0627\u0646\u0633\u062e \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629:",
    shareAria: "\u0645\u0634\u0627\u0631\u0643\u0629 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629",
    subscribe: "\u0627\u0634\u062a\u0631\u0643",
    subscribeFrom: "\u0627\u0634\u062a\u0631\u0643 - \u0627\u0628\u062a\u062f\u0627\u0621\u064b \u0645\u0646 100 \u0641\u0631\u0646\u0643 \u064a\u0648\u0645\u064a\u064b\u0627",
    zerm: "\u0646\u0642\u0627\u0637 \u0632\u064a\u0631\u0645",
    referral: "\u0628\u0631\u0646\u0627\u0645\u062c \u0627\u0644\u0625\u062d\u0627\u0644\u0629",
    categories: "\u0627\u0644\u0623\u0642\u0633\u0627\u0645",
    quick: "\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0633\u0631\u064a\u0639\u0629",
    session: "\u0627\u0644\u062c\u0644\u0633\u0629",
    menuAria: "\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0623\u0648 \u0625\u063a\u0644\u0627\u0642\u0647\u0627",
    langAria: "\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0644\u063a\u0629",
  },
  ff: {
    voiceStart: "Yiylo e daande",
    voiceStop: "Darnu he\u0257aagol",
    voiceTap: "Yiylo e daande",
    voiceOn: "Mido he\u0257oo... \u00f1o\u01b4\u01b4u ngam darnude",
    voiceListening: "Mido he\u0257oo... wiy hello (\"golle\", \"galle luwe\") walla ko yiylataa.",
    voiceHeard: "Mi nani:",
    voiceNoSpeech: "Mi nanaani hay huunde. \u00d1o\u01b4\u01b4u mikoro oo, haalu.",
    voiceBlocked: "Mikoro oo uddaama wonande Bambeh. Yamir \u0257um e teelte banngal maa ngam yiylude e daande, walla winndu ko yiylataa.",
    voiceNoMic: "Mikoro alaa e masi\u014b oo. Winndu ko yiylataa.",
    voiceUnsupported: "Yiylo e daande gollataa e banngal ngal. Winndu ko yiylataa - Chrome e Edge ina mbaawi.",
    voiceTryAgain: "Yiylo e daande waawaa fu\u0257\u0257aade. Etto kadi.",
    shareText: "Bambeh - soodu, yeeyu, yiytu golle, sarwisaaji e galle luwe e Kamerun.",
    shareCopied: "Jokkol ngol nattaama. \u0181a\u014bnu \u0257um e WhatsApp walla nokku goo.",
    shareManual: "Natto jokkol ngol ngam lollinde:",
    shareAria: "Lollin hello ngo",
    subscribe: "Naatu premium",
    subscribeFrom: "Naatu premium - gila 100 XAF \u00f1alawma",
    zerm: "Zerm coins",
    referral: "Naatnu yi\u0253\u0253e maa",
    categories: "Fannuuji",
    quick: "Golle yaaw\u0257e",
    session: "Naatgol",
    menuAria: "Uddit walla uddu dosol",
    langAria: "Waylu \u0257emngal",
  },
};

/* FIX630 - the speech engine, as far as this file needs it. */
type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechCtor = new () => SpeechRec;
function speechCtor(): SpeechCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}
const VOICE_OFF_KEY = 'bambeh_voice_off';
function voiceMarkedOff(): boolean {
  try { return window.sessionStorage.getItem(VOICE_OFF_KEY) === '1'; } catch { return false; }
}
function markVoiceOff(): void {
  try { window.sessionStorage.setItem(VOICE_OFF_KEY, '1'); } catch { /* private mode: state still hides it */ }
}
/** True only where a tap on the mic can actually do something. */
function voiceAvailable(): boolean {
  return !IS_STORE_APP && !!speechCtor() && !voiceMarkedOff();
}

export default function Header() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate  = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const hk = String(lang) === 'pcm' ? 'pidgin' : String(lang) === 'ful' ? 'ff' : String(lang);
  const H = (k: string): string => (HDR[hk] && HDR[hk][k]) || HDR.en[k] || k;

  const [isMenuOpen, setIsMenuOpen]               = useState(false);
  const [isVoiceActive, setIsVoiceActive]         = useState(false);
  const [searchQuery, setSearchQuery]             = useState('');
  const [showLanguageMenu, setShowLanguageMenu]   = useState(false);
  const [showMobileLanguages, setShowMobileLanguages] = useState(false);

  // FIX582 - the two utility-bar labels, in five languages.
  // Root cause: t() from LanguageContext returns the KEY itself when a
  // string is missing, and a key is a truthy string, so the old
  //     t('nav.deliverForUs') || 'Deliver for Bambeh'
  // fallback could never fire and the screen printed nav.deliverForUs.
  // Icons and Arabic are pure \uXXXX escapes so no encoding can break them.
  // FIX601 - a customer-facing way into delivery. 'Deliver for us' recruits
  // riders; this is for the person who wants something carried. Two very
  // different people, so two links rather than one clever one.
  const NAV_ICON = { deliver: '\uD83D\uDEF5', agent: '\uD83D\uDCE3', send: '\uD83D\uDCE6' };
  const NAV_L: Record<string, { deliver: string; agent: string; send: string }> = {
    en:  { deliver: 'Deliver for us',    agent: 'Marketing agent',  send: 'Send a parcel' },
    fr:  { deliver: 'Livrer pour nous',  agent: 'Agent commercial', send: 'Envoyer un colis' },
    pcm: { deliver: 'Carry load for us', agent: 'Marketing agent',  send: 'Send something' },
    ff:  { deliver: 'Roondo e amen',     agent: 'Ajan marketing',   send: 'Neldu huunde' },
    ar:  { deliver: '\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0645\u0639\u0646\u0627',
           agent:   '\u0648\u0643\u064A\u0644 \u062A\u0633\u0648\u064A\u0642',
           send:    '\u0627\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644\u0629' },
  };
  const NAV_ALIAS: Record<string, string> = { pidgin: 'pcm', pid: 'pcm', ful: 'ff' };
  const navKey = NAV_ALIAS[String(language)] || String(language);
  const navL = NAV_L[navKey] || NAV_L.en;

  const getCurrentLanguage = () =>
    AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // -- Voice control (FIX630) ---------------------------------------------------
  // FIX534 made the mic fail QUIETLY where the browser has no speech engine, so
  // a tap did nothing at all - the dead button Big circled. Now the mic is only
  // drawn where it can work, and every tap gets an answer in the user's language.
  const [voiceOk, setVoiceOk] = useState<boolean>(() => voiceAvailable());
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);
  const recRef = useRef<SpeechRec | null>(null);

  const say = (msg: string, ms = 4500) => {
    setToast(msg);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), ms);
  };

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    try { recRef.current?.abort(); } catch { /* already stopped */ }
  }, []);

  // This browser shows the button but has no working engine (Brave, Opera...):
  // hide the mic for the rest of the visit and say why, once.
  const giveUpOnVoice = () => {
    markVoiceOff();
    setVoiceOk(false);
    setIsVoiceActive(false);
    say(H('voiceUnsupported'), 7000);
  };

  const toggleVoiceControl = () => {
    if (isVoiceActive) {
      try { recRef.current?.stop(); } catch { /* already stopped */ }
      setIsVoiceActive(false);
      return;
    }
    startVoiceRecognition();
  };

  const startVoiceRecognition = () => {
    const Ctor = IS_STORE_APP ? null : speechCtor();
    if (!Ctor) { giveUpOnVoice(); return; }
    let recognition: SpeechRec;
    try { recognition = new Ctor(); } catch { giveUpOnVoice(); return; }
    recRef.current = recognition;
    const langMap: Record<LanguageCode, string> = {
      // FIX127: 'ff' is not a valid speech tag (start() throws for Fulfulde
      // users) -> fr-FR engine; Fulfulde KEYWORDS below still route correctly.
      en: 'en-US', fr: 'fr-FR', pcm: 'en-NG', ff: 'fr-FR', ar: 'ar-SA'
    };
    recognition.lang = langMap[language as LanguageCode] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      setIsVoiceActive(false);
      const said = String(event?.results?.[0]?.[0]?.transcript || '').trim();
      if (!said) { say(H('voiceNoSpeech')); return; }
      say(H('voiceHeard') + ' "' + said + '"', 2500);
      handleVoiceCommand(said.toLowerCase());
    };
    recognition.onerror = (event) => {
      const code = String(event?.error || '');
      setIsVoiceActive(false);
      if (code === 'aborted') return;
      if (code === 'not-allowed') { say(H('voiceBlocked'), 8000); return; }
      if (code === 'no-speech') { say(H('voiceNoSpeech')); return; }
      if (code === 'audio-capture') { say(H('voiceNoMic'), 6000); return; }
      giveUpOnVoice(); // 'network', 'service-not-allowed', 'language-not-supported'
    };
    recognition.onend = () => setIsVoiceActive(false);
    try {
      recognition.start();
      setIsVoiceActive(true);
      say(H('voiceListening'), 8000);
    } catch {
      setIsVoiceActive(false);
      say(H('voiceTryAgain'));
    }
  };

  // FIX630: the section names people actually say ("rentals", "jobs", "voitures")
  // now route straight to the section; before, only "rent"/"job" did.
  // FIX127: 5-language voice commands (EN/FR/Pidgin/Arabic/Fulfulde) across ALL
  // sections. Anything unmatched falls through to the REAL universal /search
  // page (FIX126), so every utterance does something useful.
  const VOICE_ROUTES: Array<{ to: string; words: string[] }> = [
    { to: '/rentals',     words: ['rentals', 'rental', 'houses', 'location', 'locations', 'logement', 'logements', 'house', 'rent', 'maison', 'louer', 'appartement', 'haus', '\u0645\u0646\u0632\u0644', '\u0625\u064A\u062C\u0627\u0631', 'luwe', 'galle'] },
    { to: '/jobs',        words: ['jobs', 'emplois', 'employment', 'job', 'work', 'emploi', 'travail', 'wok', '\u0648\u0638\u064A\u0641\u0629', '\u0639\u0645\u0644', 'golle'] },
    { to: '/marketplace', words: ['marketplace', 'market place', 'markets', 'shopping', 'market', 'buy', 'shop', 'march\u00E9', 'acheter', 'boutique', '\u0633\u0648\u0642', '\u0634\u0631\u0627\u0621', 'luumo', 'sood'] },
    { to: '/vehicles',    words: ['vehicles', 'cars', 'voitures', 'vehicules', 'motos', 'car rental', 'car', 'vehicle', 'moto', 'voiture', 'v\u00E9hicule', 'motto', '\u0633\u064A\u0627\u0631\u0629', 'oto'] },
    { to: '/services',    words: ['services', 'service', '\u062E\u062F\u0645\u0629', 'sarwis'] },
    { to: '/farm-fresh',  words: ['farm', 'food', 'tomato', 'vegetable', 'ferme', 'l\u00E9gume', 'chop', '\u0645\u0632\u0631\u0639\u0629', '\u0637\u0639\u0627\u0645', 'ndema', '\u00F1amdu', 'remuru'] },
    { to: '/exchange',    words: ['exchanges', 'echanges', 'swaps', 'exchange', 'swap', 'trade', '\u00E9change', 'troc', '\u0645\u0642\u0627\u064A\u0636\u0629', 'waylugol', 'waylu'] },
    { to: '/community',   words: ['community', 'group', 'communaut\u00E9', 'groupe', '\u0645\u062C\u062A\u0645\u0639', 'renndo', 'goomu'] },
    { to: '/request-delivery', words: ['send', 'parcel', 'package', 'colis', 'envoyer', 'delivery'] },
    { to: '/become-courier', words: ['deliver', 'courier', 'rider', 'livrer', 'livreur'] },
    { to: '/agent',          words: ['agent', 'marketing', 'marketeur'] },
    { to: '/coins',       words: ['coin', 'zerm', 'pi\u00E8ce', '\u0639\u0645\u0644\u0629'] },
    { to: '/corporate',   words: ['corporate', 'business', 'company', 'entreprise', 'soci\u00E9t\u00E9', '\u0634\u0631\u0643\u0629', 'sosiyete'] },
    { to: '/cart',        words: ['cart', 'basket', 'panier', '\u0633\u0644\u0629'] },
    { to: '/my-listings', words: ['my listing', 'my ads', 'mes annonces', '\u0625\u0639\u0644\u0627\u0646\u0627\u062A\u064A', 'jaay\u0257e am'] },
    { to: '/profile',     words: ['profile', 'account', 'profil', 'compte', '\u062D\u0633\u0627\u0628\u064A', 'profil am'] },
    { to: '/post-ad',     words: ['post', 'sell', 'publier', 'vendre', 'sell am', '\u0628\u064A\u0639', '\u0646\u0634\u0631', 'yeey'] },
    { to: '/',            words: ['home', 'accueil', 'go home', '\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629', 'fu\u0257\u0257orde'] },
  ];

  // FIX534 - whole-word matching. The old line was
  //     r.words.some(w => command.includes(w))
  // which fires a keyword inside ANY word containing it: "carte" hit "car",
  // "scared" hit "car", "postal" hit "post", "coincidence" hit "coin",
  // "workshop" and "homework" both hit "work". Eight of nine tested phrases
  // went to the wrong page.
  const foldVoice = (s: string) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\u0600-\u06FF ]+/g, ' ').replace(/\s+/g, ' ').trim();

  const hasWholeWord = (haystack: string, needle: string) => {
    if (!needle) return false;
    let from = 0;
    for (;;) {
      const i = haystack.indexOf(needle, from);
      if (i < 0) return false;
      const before = i === 0 ? ' ' : haystack[i - 1];
      const after  = i + needle.length >= haystack.length ? ' ' : haystack[i + needle.length];
      if (before === ' ' && after === ' ') return true;
      from = i + 1;
    }
  };

  const handleVoiceCommand = (command: string) => {
    const said = foldVoice(command);
    // longest keyword wins, so "farm fresh" is never swallowed by "farm"
    let best: { to: string; len: number } | null = null;
    for (const r of VOICE_ROUTES) {
      for (const w of r.words) {
        const k = foldVoice(w);
        if (hasWholeWord(said, k) && (!best || k.length > best.len)) {
          best = { to: r.to, len: k.length };
        }
      }
    }
    if (best) { navigate(best.to); return; }
    // No section keyword matched -> universal real search (FIX126).
    navigate(`/search?q=${encodeURIComponent(command)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as LanguageCode);
    setShowLanguageMenu(false);
    setShowMobileLanguages(false);
  };

  // FIX630 - honest words, the real address even inside the Android app, and an
  // answer on every path (the old version could fail without a word).
  const handleShare = async () => {
    const url = publicShareUrl();
    const text = H('shareText');
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: 'Bambeh', text, url });
        return;
      }
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') return; // the user closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(url);
      say(H('shareCopied'));
    } catch {
      say(H('shareManual') + ' ' + url, 12000);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto">

        {/* -- LEVEL 1 ------------------------------------------------------------------------------- */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-teal-700">

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-teal-700 rounded-lg transition-colors"
            style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent', minWidth: '48px', minHeight: '48px' }}
            aria-label={H('menuAria')}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="relative">
              <img
                src="/bambeh-logo.png"
                alt="Bambeh Logo"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.nextElementSibling;
                  if (fb) (fb as HTMLElement).classList.remove('hidden');
                }}
              />
              <div className="hidden w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-teal-600 font-bold text-2xl">B</span>
              </div>
            </div>
            <span className="text-2xl font-bold tracking-wide hidden sm:inline">Bambeh</span>
          </Link>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full flex">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + '...'}
                className="w-full pl-12 pr-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                type="submit"
                className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-3 rounded-r-lg font-semibold transition-colors"
              >
                {t('common.search')}
              </button>
            </div>
          </form>

          {/* -- Right icons (desktop) --------------------------------------------------------------- */}
          <div className="flex items-center gap-2">

            {/* Share button */}
            <button
              onClick={handleShare}
              aria-label={H('shareAria')}
              className="hidden md:flex items-center gap-1 px-3 py-2 hover:bg-teal-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('common.share')}</span>
            </button>

            {/* Voice button - FIX630: only where it can work */}
            {voiceOk ? (
              <button
                type="button"
                onClick={toggleVoiceControl}
                aria-label={isVoiceActive ? H('voiceStop') : H('voiceStart')}
                title={isVoiceActive ? H('voiceStop') : H('voiceStart')}
                aria-pressed={isVoiceActive}
                className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isVoiceActive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'hover:bg-teal-700'
                }`}
              >
                {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            ) : null}

            {/* -- NOTIFICATION BELL - desktop header -----------------------------------------------
                Shows on desktop only (md:flex). On mobile the bottom
                nav already has a bell icon that navigates to /notifications.
            --------------------------------------------------------------------------------------- */}
                        {/* FIX186 - messages + notifications, all screen sizes */}
            {currentUser && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  aria-label={t('nav.messages') || 'Messages'}
                  title={t('nav.messages') || 'Messages'}
                  className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-teal-700"
                  style={{ touchAction: 'auto', minHeight: '44px', minWidth: '44px' }}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <NotificationBell />
              </div>
            )}

            {/* Login / Logout */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-semibold shadow-md active:scale-95"
                style={{ touchAction: 'auto', minHeight: '44px' }}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded-lg transition-colors font-semibold shadow-md active:scale-95"
                style={{ touchAction: 'auto', minHeight: '44px' }}
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.login')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* -- LEVEL 2 - Desktop nav --------------------------------------------------------------- */}
        <nav className="hidden md:flex items-center justify-center gap-1 h-14 px-4 border-b border-teal-700">
          {[
            { to: '/marketplace', label: `\uD83D\uDCE6 ${t('nav.marketplace')}` },
            { to: '/jobs',        label: `\uD83D\uDCBC ${t('nav.jobs')}`        },
            { to: '/services',    label: `\uD83D\uDD27 ${t('nav.services')}`    },
            { to: '/rentals',     label: `\uD83C\uDFE0 ${t('nav.rentals')}`     },
            { to: '/vehicles',    label: `\uD83D\uDE97 ${t('nav.vehicles')}`    },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 hover:bg-teal-700 rounded-lg transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/exchange"
            className="px-4 py-2 hover:bg-teal-700 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {t('nav.exchange')}
          </Link>
        </nav>

        {/* -- LEVEL 3 - Desktop utility bar ------------------------------------------------------- */}
        <div className="hidden md:flex items-center justify-between h-10 px-4 text-sm bg-teal-700/30">
          <div className="flex items-center gap-4">
            {/* FIX630 - inside the Play app the cut sections are not offered */}
            {[
              { to: '/community',        label: '\uD83D\uDC65 ' + t('nav.community') },
              { to: '/farm-fresh',       label: '\uD83C\uDF3F Farm Fresh' },
              { to: '/request-delivery', label: NAV_ICON.send + ' ' + navL.send },
              { to: '/become-courier',   label: NAV_ICON.deliver + ' ' + navL.deliver },
              { to: '/agent',            label: NAV_ICON.agent + ' ' + navL.agent },
            ].filter((item) => storeAllows(item.to)).map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-teal-200 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Language picker - DESKTOP */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 hover:bg-teal-700 px-3 py-1 rounded-lg transition-colors"
                aria-label={H('langAria')}
              >
                <Globe className="w-4 h-4" />
                <span>{getCurrentLanguage().flag} {getCurrentLanguage().name}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showLanguageMenu ? 'rotate-90' : ''}`} />
              </button>

              {showLanguageMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 w-44">
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors flex items-center gap-3 text-sm font-medium ${
                        language === lang.code ? 'bg-teal-50 text-teal-700' : ''
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-teal-500">{'\u2713'}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {storeAllows('/subscription') ? (
              <Link
                to="/subscription"
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors font-semibold shadow-md"
              >
                <Crown className="w-4 h-4" />
                <span className="text-sm">{H('subscribe')}</span>
              </Link>
            ) : null}

            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-teal-700 rounded-lg transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">{t('common.profile')}</span>
            </Link>
          </div>
        </div>

        {/* -- MOBILE MENU --------------------------------------------------------------------------- */}
        {isMenuOpen && (
          <div
            className="md:hidden bg-gradient-to-b from-teal-600 to-blue-700 border-t border-teal-700"
            style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="p-4 border-b border-teal-700">
              <div className="relative flex">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search') + '...'}
                  className="w-full pl-10 pr-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button type="submit" className="bg-teal-800 text-white px-4 rounded-r-lg font-semibold">
                  {'\uD83D\uDD0D'}
                </button>
              </div>
            </form>

            <nav className="flex flex-col space-y-1 pb-6">
              {/* Account */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                {'\uD83D\uDC64'} {t('common.profile')}
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-teal-700/50 hover:bg-teal-700 active:bg-teal-800 px-4 py-4 mx-2 rounded-lg transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '56px' }}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold">{t('settings.editProfile')}</span>
                  <span className="text-xs text-teal-200">
                    {currentUser ? t('common.profile') : t('common.login')}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-teal-300" />
              </Link>

              {[
                { to: '/orders',      icon: <Package className="w-5 h-5" />,  label: t('nav.orders')      },
                { to: '/settings',    icon: <Settings className="w-5 h-5" />, label: t('common.settings') },
                { to: '/my-listings', icon: <Package className="w-5 h-5" />, label: t('nav.myListings')  },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-teal-700 my-2"/>

              {/* Language picker - MOBILE */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                {'\uD83C\uDF0D'} {t('settings.language')}
              </div>
              <button
                onClick={() => setShowMobileLanguages(!showMobileLanguages)}
                className="flex items-center gap-3 bg-teal-700/30 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <span className="text-lg">{getCurrentLanguage().flag}</span>
                <span className="flex-1 text-left">{getCurrentLanguage().name}</span>
                <ChevronRight className={`w-5 h-5 transition-transform ${showMobileLanguages ? 'rotate-90' : ''}`} />
              </button>
              {showMobileLanguages && (
                <div className="mx-2 bg-teal-800/30 rounded-lg overflow-hidden">
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setShowMobileLanguages(false);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left hover:bg-teal-700 active:bg-teal-800 px-4 py-3 transition-colors flex items-center gap-3 font-medium ${
                        language === lang.code ? 'bg-teal-700' : ''
                      }`}
                      style={{ touchAction: 'auto', minHeight: '48px' }}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-teal-300 font-bold">{'\u2713'}</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-teal-700 my-2"/>

              {/* Categories */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                {'\uD83D\uDCC2'} {H('categories')}
              </div>
              {[
                { to: '/marketplace', label: `\uD83D\uDCE6 ${t('nav.marketplace')}` },
                { to: '/jobs',        label: `\uD83D\uDCBC ${t('nav.jobs')}`        },
                { to: '/services',    label: `\uD83D\uDD27 ${t('nav.services')}`    },
                { to: '/rentals',     label: `\uD83C\uDFE0 ${t('nav.rentals')}`     },
                { to: '/vehicles',    label: `\uD83D\uDE97 ${t('nav.vehicles')}`    },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/exchange"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {t('nav.exchange')}
              </Link>

              <div className="border-t border-teal-700 my-2"/>

              {/* Quick actions */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                {'\u26A1'} {H('quick')}
              </div>
              {voiceOk ? (
                <button
                  type="button"
                  onClick={() => { toggleVoiceControl(); setIsMenuOpen(false); }}
                  className={`text-left hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium ${isVoiceActive ? 'bg-red-500' : ''}`}
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {isVoiceActive ? '\uD83C\uDFA4 ' + H('voiceOn') : '\uD83C\uDF99\uFE0F ' + H('voiceTap')}
                </button>
              ) : null}
              <button
                onClick={() => { handleShare(); setIsMenuOpen(false); }}
                className="text-left flex items-center gap-2 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <Share2 className="w-4 h-4" />
                {t('common.share')}
              </button>
              {[
                { to: '/coins',     label: '\u26A1 ' + H('zerm')                  },
                { to: '/cart',      label: `\uD83D\uDED2 ${t('nav.cart')}`      },
                { to: '/request-delivery', label: NAV_ICON.send    + ' ' + navL.send    },
                { to: '/become-courier', label: NAV_ICON.deliver + ' ' + navL.deliver },
                { to: '/agent',          label: NAV_ICON.agent   + ' ' + navL.agent   },
                { to: '/favorites', label: `\u2764\uFE0F ${t('nav.favorites')}` },
                { to: '/referral',  label: '\uD83C\uDF81 ' + H('referral')    },
              ].filter((item) => storeAllows(item.to)).map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {item.label}
                </Link>
              ))}
              {storeAllows('/subscription') ? (
                <Link
                  to="/subscription"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-4 py-3 mx-2 rounded-lg transition-colors font-semibold text-white"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  <Crown className="w-5 h-5" />
                  <span className="flex-1">{H('subscribeFrom')}</span>
                </Link>
              ) : null}

              <div className="border-t border-teal-700 my-2"/>

              {/* Session */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                {'\uD83D\uDD10'} {H('session')}
              </div>
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-left flex items-center gap-3 bg-red-500/80 hover:bg-red-500 active:bg-red-600 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('common.logout')}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('common.login')} / {t('common.register')}</span>
                </Link>
              )}
              <div className="h-8"/>
            </nav>
          </div>
        )}
      </div>

      {/* FIX630 - one place where the mic and share buttons answer the user */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={() => setToast('')}
          className="fixed left-1/2 top-24 z-[60] w-[92%] max-w-md -translate-x-1/2 rounded-xl bg-gray-900/95 px-4 py-3 text-center text-sm text-white shadow-2xl"
          style={{ userSelect: 'text', wordBreak: 'break-word' }}
        >
          {toast}
        </div>
      ) : null}
    </header>
  );
}
// BAMBEH_END_TOKEN__HEADER_FIX630__COMPLETE
