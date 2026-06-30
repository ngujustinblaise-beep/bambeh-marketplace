/**
 * src/i18n/chatI18n.ts
 * Bambeh Marketplace - Chat localization (5 languages, fully self-contained).
 *
 * Follows the Bambeh convention: a local dictionary + its own reactive hook,
 * NO react-i18next, NO dependency on app-wide providers. It listens to the same
 * "bambeh:langchange" event and Bambeh_language key the rest of the app uses,
 * so the chat re-renders live when the user changes language.
 *
 * Languages: en, fr, pidgin (Cameroonian Pidgin), ff (Fulfulde), ar (Arabic, RTL).
 *
 * NOTE: the Fulfulde (ff) and Pidgin strings are functional best-effort and
 * should be reviewed by a native speaker before final release.
 *
 * Human-typed messages are NEVER translated. Only SYSTEM messages localize,
 * by storing a key (e.g. "welcome") + params in the database and rendering
 * the text here in the user's current language.
 */

import { useCallback, useEffect, useState } from "react";

export type Lang = "en" | "fr" | "pidgin" | "ff" | "ar";

const LANG_KEY = "Bambeh_language";

/** Map any stored value to one of the 5 supported codes. */
export function resolveLang(raw: string | null | undefined): Lang {
  const v = (raw || "").toLowerCase().trim();
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("ar")) return "ar";
  if (v.startsWith("ff") || v.startsWith("ful")) return "ff";
  if (v.startsWith("pid") || v === "pcm" || v.startsWith("pg")) return "pidgin";
  return "en";
}

/** Text direction for a language (Arabic is right-to-left). */
export function dirFor(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

// ---------------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------------
export interface ChatUI {
  messages: string;
  search: string;
  noConversations: string;
  noConversationsHint: string;
  typeMessage: string;
  send: string;
  online: string;
  officialName: string;
  loading: string;
  sayHello: string;
  today: string;
  yesterday: string;
  startConversation: string;
}

export const CHAT_UI: Record<Lang, ChatUI> = {
  en: {
    messages: "Messages",
    search: "Search a conversation...",
    noConversations: "No messages yet",
    noConversationsHint: "Start chatting by contacting a seller",
    typeMessage: "Write a message...",
    send: "Send",
    online: "Online",
    officialName: "Bambeh Official",
    loading: "Loading...",
    sayHello: "Say hello",
    today: "Today",
    yesterday: "Yesterday",
    startConversation: "Start the conversation...",
  },
  fr: {
    messages: "Messages",
    search: "Rechercher une conversation...",
    noConversations: "Aucun message pour le moment",
    noConversationsHint: "Commencez à discuter en contactant un vendeur",
    typeMessage: "Écrire un message...",
    send: "Envoyer",
    online: "En ligne",
    officialName: "Bambeh Officiel",
    loading: "Chargement...",
    sayHello: "Dites bonjour",
    today: "Aujourd'hui",
    yesterday: "Hier",
    startConversation: "Démarrer la conversation...",
  },
  pidgin: {
    messages: "Messages",
    search: "Find one conversation...",
    noConversations: "No message dey yet",
    noConversationsHint: "Start to talk by contacting one seller",
    typeMessage: "Write your message...",
    send: "Send",
    online: "Dey online",
    officialName: "Bambeh Official",
    loading: "E dey load...",
    sayHello: "Tok hello",
    today: "Today",
    yesterday: "Yesterday",
    startConversation: "Start the conversation...",
  },
  ff: {
    messages: "Bataaje",
    search: "Yiilo yeewtere...",
    noConversations: "Bataaje alaa tawo",
    noConversationsHint: "Fuɗɗo yeewtude e jokkondirde e yeeyoowo",
    typeMessage: "Winndu bataake...",
    send: "Neldu",
    online: "E ley",
    officialName: "Bambeh Official",
    loading: "Ina loowa...",
    sayHello: "Salmino",
    today: "Hannde",
    yesterday: "Hanki",
    startConversation: "Fuɗɗo yeewtere...",
  },
  ar: {
    messages: "الرسائل",
    search: "ابحث عن محادثة...",
    noConversations: "لا توجد رسائل بعد",
    noConversationsHint: "ابدأ الدردشة بالتواصل مع بائع",
    typeMessage: "اكتب رسالة...",
    send: "إرسال",
    online: "متصل",
    officialName: "بامبيه الرسمي",
    loading: "جارٍ التحميل...",
    sayHello: "قل مرحبا",
    today: "اليوم",
    yesterday: "أمس",
    startConversation: "ابدأ المحادثة...",
  },
};

// ---------------------------------------------------------------------------
// System messages (welcome / recovery / warning / ad-expiring / policy)
// Rendered from a key + params, so they switch language live.
// ---------------------------------------------------------------------------
export type SystemParams = Record<string, string | number | undefined>;
type SystemRenderer = (p: SystemParams) => string;

const SYSTEM: Record<Lang, Record<string, SystemRenderer>> = {
  en: {
    welcome: (p) =>
      `Welcome to Bambeh${p.name ? ", " + p.name : ""}! We're glad you're here. Browse, buy, sell and connect safely.`,
    account_recovered: () =>
      "Your account has been recovered successfully. Welcome back to Bambeh!",
    account_warning: (p) =>
      `Notice: your account may not meet our community rules${p.reason ? " (" + p.reason + ")" : ""}. Please review our terms to avoid restrictions.`,
    ad_expiring: (p) =>
      `Your advert "${p.title ?? "your listing"}" will expire in ${p.days ?? "a few"} day(s). Renew it to keep it visible.`,
    policy_update: () =>
      "We've updated our policies. Please review the latest terms in the app.",
  },
  fr: {
    welcome: (p) =>
      `Bienvenue sur Bambeh${p.name ? ", " + p.name : ""} ! Nous sommes ravis de vous compter parmi nous. Parcourez, achetez, vendez et échangez en toute sécurité.`,
    account_recovered: () =>
      "Votre compte a été récupéré avec succès. Bon retour sur Bambeh !",
    account_warning: (p) =>
      `Avis : votre compte pourrait ne pas respecter nos règles${p.reason ? " (" + p.reason + ")" : ""}. Veuillez consulter nos conditions pour éviter toute restriction.`,
    ad_expiring: (p) =>
      `Votre annonce « ${p.title ?? "votre article"} » expirera dans ${p.days ?? "quelques"} jour(s). Renouvelez-la pour qu'elle reste visible.`,
    policy_update: () =>
      "Nous avons mis à jour nos politiques. Veuillez consulter les dernières conditions dans l'application.",
  },
  pidgin: {
    welcome: (p) =>
      `Welcome to Bambeh${p.name ? ", " + p.name : ""}! We glad say you don come. Look around, buy, sell and connect safe-safe.`,
    account_recovered: () =>
      "We don recover your account well well. Welcome back to Bambeh!",
    account_warning: (p) =>
      `Notice: your account fit no follow our rules${p.reason ? " (" + p.reason + ")" : ""}. Abeg check our terms make dem no block you.`,
    ad_expiring: (p) =>
      `Your advert "${p.title ?? "your thing"}" go expire for ${p.days ?? "small"} day(s). Renew am make e still dey show.`,
    policy_update: () =>
      "We don change some for our policy. Abeg check the new terms for inside app.",
  },
  ff: {
    welcome: (p) =>
      `Jaɓɓorma e Bambeh${p.name ? ", " + p.name : ""}! Min weltii e arol maa. Yiilo, soodu, yeeyu e haɓɓondiral e hoolaare.`,
    account_recovered: () =>
      "Konte maa heɓtinaama no moƴƴi. Jaɓɓorma garti e Bambeh!",
    account_warning: (p) =>
      `Tintinol: konte maa waawi wonde ronkii rewde laabi amen${p.reason ? " (" + p.reason + ")" : ""}. Tiiɗno ƴeewto sharɗiiji amen.`,
    ad_expiring: (p) =>
      `Bandarool maa "${p.title ?? "bandarool maa"}" timminte e nder balɗe ${p.days ?? "seeɗa"}. Heyɗin ngam o jokka feeñde.`,
    policy_update: () =>
      "Min hesɗitinii laabi amen. Tiiɗno ƴeewto sharɗiiji kesi e nder app.",
  },
  ar: {
    welcome: (p) =>
      `مرحبا بك في بامبيه${p.name ? "، " + p.name : ""}! يسعدنا وجودك معنا. تصفّح واشترِ وبِع وتواصل بأمان.`,
    account_recovered: () =>
      "تم استرداد حسابك بنجاح. مرحبا بعودتك إلى بامبيه!",
    account_warning: (p) =>
      `تنبيه: قد لا يتوافق حسابك مع قواعد مجتمعنا${p.reason ? " (" + p.reason + ")" : ""}. يرجى مراجعة شروطنا لتجنّب القيود.`,
    ad_expiring: (p) =>
      `سينتهي إعلانك "${p.title ?? "إعلانك"}" خلال ${p.days ?? "بضعة"} يوم. جدِّده ليبقى ظاهرا.`,
    policy_update: () =>
      "لقد قمنا بتحديث سياساتنا. يرجى مراجعة أحدث الشروط في التطبيق.",
  },
};

/** Render a system message (by key + params) in the given language. */
export function renderSystem(key: string, params: SystemParams, lang: Lang): string {
  const table = SYSTEM[lang] || SYSTEM.en;
  const fn = table[key] || SYSTEM.en[key];
  if (!fn) return key;
  try {
    return fn(params || {});
  } catch {
    return key;
  }
}

// ---------------------------------------------------------------------------
// Reactive hook
// ---------------------------------------------------------------------------
export function useChatLang() {
  const [lang, setLang] = useState<Lang>(() =>
    resolveLang(typeof window !== "undefined" ? window.localStorage.getItem(LANG_KEY) : "en")
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLang(
        resolveLang(typeof detail === "string" ? detail : window.localStorage.getItem(LANG_KEY))
      );
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) setLang(resolveLang(e.newValue));
    };

    window.addEventListener("bambeh:langchange", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bambeh:langchange", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const t = useCallback((key: keyof ChatUI) => (CHAT_UI[lang] || CHAT_UI.en)[key], [lang]);
  const tSystem = useCallback(
    (key: string, params: SystemParams = {}) => renderSystem(key, params, lang),
    [lang]
  );

  return { lang, dir: dirFor(lang), t, tSystem };
}
