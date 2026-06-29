/**
 * src/context/LanguageContext.tsx
 * BAMBEH SARL - Unified Language Bridge
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The single source of truth for language is the LanguageProvider declared
 * INSIDE App.tsx (exported there as `useLanguage`). Historically some pages
 * imported `useLanguage` from THIS file, which used to be a SEPARATE provider
 * that App never mounted -> those pages never changed language.
 *
 * This file is now a thin BRIDGE: it re-exports the real `useLanguage` from
 * @/App so every page shares ONE language state. The language selector and
 * every in-app switcher now drive the entire app instantly.
 *
 * Extra: a small booking dictionary (book.* / common.*) is layered on top so
 * existing booking modals keep their translations. Any other key falls through
 * to the global App translation table.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useLanguage as useAppLanguage } from "@/App";

export type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

// Local booking translations (5 in-app languages). Non-ASCII as \u escapes
// so this file can never mojibake on any editor or terminal.
const BOOKING: Record<string, Record<LangCode, string>> = {
  "book.visit.badge": { en: "Book a visit", fr: "R\u00e9server une visite", pidgin: "Book visit", ar: "\u062d\u062c\u0632 \u0632\u064a\u0627\u0631\u0629", ff: "Hbu jaw" },
  "book.visit.title": { en: "Schedule a visit", fr: "Planifier une visite", pidgin: "Set visit time", ar: "\u062c\u062f\u0648\u0644\u0629 \u0632\u064a\u0627\u0631\u0629", ff: "Feccu jaw" },
  "book.visit.submit": { en: "Book visit", fr: "R\u00e9server la visite", pidgin: "Book visit", ar: "\u062d\u062c\u0632 \u0627\u0644\u0632\u064a\u0627\u0631\u0629", ff: "Hbu jaw" },
  "book.service.badge": { en: "Book service", fr: "R\u00e9server un service", pidgin: "Book service", ar: "\u062d\u062c\u0632 \u062e\u062f\u0645\u0629", ff: "Hbu golle" },
  "book.service.title": { en: "Schedule service", fr: "Planifier un service", pidgin: "Set service time", ar: "\u062c\u062f\u0648\u0644\u0629 \u062e\u062f\u0645\u0629", ff: "Feccu golle" },
  "book.service.submit": { en: "Book service", fr: "R\u00e9server le service", pidgin: "Book service", ar: "\u062d\u062c\u0632 \u0627\u0644\u062e\u062f\u0645\u0629", ff: "Hbu golle" },
  "book.testDrive.badge": { en: "Book test drive", fr: "R\u00e9server un essai", pidgin: "Book test drive", ar: "\u062d\u062c\u0632 \u062a\u062c\u0631\u0628\u0629 \u0642\u064a\u0627\u062f\u0629", ff: "Hbu ndaarndi" },
  "book.testDrive.title": { en: "Schedule a test drive", fr: "Planifier un essai", pidgin: "Set test drive time", ar: "\u062c\u062f\u0648\u0644\u0629 \u062a\u062c\u0631\u0628\u0629 \u0642\u064a\u0627\u062f\u0629", ff: "Feccu ndaarndi" },
  "book.testDrive.submit": { en: "Book test drive", fr: "R\u00e9server l'essai", pidgin: "Book test drive", ar: "\u062d\u062c\u0632 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0642\u064a\u0627\u062f\u0629", ff: "Hbu ndaarndi" },
  "book.date": { en: "Date", fr: "Date", pidgin: "Date", ar: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e", ff: "\u00d1alawma" },
  "book.time": { en: "Time", fr: "Heure", pidgin: "Time", ar: "\u0627\u0644\u0648\u0642\u062a", ff: "Waktu" },
  "book.phone": { en: "Phone number", fr: "Num\u00e9ro de t\u00e9l\u00e9phone", pidgin: "Phone number", ar: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641", ff: "Limndo telefon" },
  "book.phonePlaceholder": { en: "Enter phone number", fr: "Entrez le num\u00e9ro de t\u00e9l\u00e9phone", pidgin: "Enter phone number", ar: "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641", ff: "Naatnu limndo telefon" },
  "book.note": { en: "Note", fr: "Note", pidgin: "Note", ar: "\u0645\u0644\u0627\u062d\u0638\u0629", ff: "Tinndinol" },
  "book.notePlaceholder": { en: "Add a short note", fr: "Ajouter une courte note", pidgin: "Add small note", ar: "\u0623\u0636\u0641 \u0645\u0644\u0627\u062d\u0638\u0629 \u0642\u0635\u064a\u0631\u0629", ff: "\u00d1eptu tinndinol rab\u0257u" },
  "common.cancel": { en: "Cancel", fr: "Annuler", pidgin: "Cancel", ar: "\u0625\u0644\u063a\u0627\u0621", ff: "Haaytu" },
  "common.sending": { en: "Sending...", fr: "Envoi...", pidgin: "Sending...", ar: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...", ff: "Ena neldee..." },
};

export interface UnifiedLanguage {
  language: LangCode;
  setLanguage: (lang: string) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

/**
 * useLanguage - the ONLY hook pages should call.
 * Delegates language/setLanguage/isRtl to the global App provider, and resolves
 * t(key) by checking the booking dictionary first, then the global table.
 */
export function useLanguage(): UnifiedLanguage {
  const app = useAppLanguage();
  const language = (app?.language as LangCode) ?? "en";

  const t = (key: string): string => {
    const local = BOOKING[key];
    if (local) return local[language] ?? local.en ?? key;
    // Fall through to the global App translation table
    return app?.t ? app.t(key) : key;
  };

  return {
    language,
    setLanguage: app?.setLanguage ?? (() => {}),
    isRtl: app?.isRtl ?? (language === "ar"),
    t,
  };
}

export default useLanguage;

