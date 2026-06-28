import React, { createContext, useContext, useMemo, useState } from "react";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";
type TranslationMap = Record<string, string>;

const translations: Record<LangCode, TranslationMap> = {
  en: {
    "book.visit.badge": "Book a visit",
    "book.visit.title": "Schedule a visit",
    "book.visit.submit": "Book visit",
    "book.service.badge": "Book service",
    "book.service.title": "Schedule service",
    "book.service.submit": "Book service",
    "book.testDrive.badge": "Book test drive",
    "book.testDrive.title": "Schedule a test drive",
    "book.testDrive.submit": "Book test drive",
    "book.date": "Date",
    "book.time": "Time",
    "book.phone": "Phone number",
    "book.phonePlaceholder": "Enter phone number",
    "book.note": "Note",
    "book.notePlaceholder": "Add a short note",
    "common.cancel": "Cancel",
    "common.sending": "Sending...",
  },
  fr: {
    "book.visit.badge": "Réserver une visite",
    "book.visit.title": "Planifier une visite",
    "book.visit.submit": "Réserver la visite",
    "book.service.badge": "Réserver un service",
    "book.service.title": "Planifier un service",
    "book.service.submit": "Réserver le service",
    "book.testDrive.badge": "Réserver un essai",
    "book.testDrive.title": "Planifier un essai",
    "book.testDrive.submit": "Réserver l'essai",
    "book.date": "Date",
    "book.time": "Heure",
    "book.phone": "Numéro de téléphone",
    "book.phonePlaceholder": "Entrez le numéro de téléphone",
    "book.note": "Note",
    "book.notePlaceholder": "Ajouter une courte note",
    "common.cancel": "Annuler",
    "common.sending": "Envoi...",
  },
  pcm: {
    "book.visit.badge": "Book visit",
    "book.visit.title": "Set visit time",
    "book.visit.submit": "Book visit",
    "book.service.badge": "Book service",
    "book.service.title": "Set service time",
    "book.service.submit": "Book service",
    "book.testDrive.badge": "Book test drive",
    "book.testDrive.title": "Set test drive time",
    "book.testDrive.submit": "Book test drive",
    "book.date": "Date",
    "book.time": "Time",
    "book.phone": "Phone number",
    "book.phonePlaceholder": "Enter phone number",
    "book.note": "Note",
    "book.notePlaceholder": "Add small note",
    "common.cancel": "Cancel",
    "common.sending": "Sending...",
  },
  ar: {
    "book.visit.badge": "حجز زيارة",
    "book.visit.title": "جدولة زيارة",
    "book.visit.submit": "حجز الزيارة",
    "book.service.badge": "حجز خدمة",
    "book.service.title": "جدولة خدمة",
    "book.service.submit": "حجز الخدمة",
    "book.testDrive.badge": "حجز تجربة قيادة",
    "book.testDrive.title": "جدولة تجربة قيادة",
    "book.testDrive.submit": "حجز تجربة القيادة",
    "book.date": "التاريخ",
    "book.time": "الوقت",
    "book.phone": "رقم الهاتف",
    "book.phonePlaceholder": "أدخل رقم الهاتف",
    "book.note": "ملاحظة",
    "book.notePlaceholder": "أضف ملاحظة قصيرة",
    "common.cancel": "إلغاء",
    "common.sending": "جارٍ الإرسال...",
  },
  ful: {
    "book.visit.badge": "Jamu ko",
    "book.visit.title": "Sa’a jamu",
    "book.visit.submit": "Jamu",
    "book.service.badge": "Jamu sarvis",
    "book.service.title": "Sa’a sarvis",
    "book.service.submit": "Jamu sarvis",
    "book.testDrive.badge": "Jamu test drive",
    "book.testDrive.title": "Sa’a test drive",
    "book.testDrive.submit": "Jamu test drive",
    "book.date": "Leɗɗi",
    "book.time": "Waktu",
    "book.phone": "Namba telefon",
    "book.phonePlaceholder": "Naatnu namba telefon",
    "book.note": "Humpito",
    "book.notePlaceholder": "Ɓeydu humpito ɓuri ndiyam",
    "common.cancel": "Haɓɓe",
    "common.sending": "Nana yaltina...",
  },
  ha: {
    "book.visit.badge": "Littafin ziyara",
    "book.visit.title": "Tsara ziyara",
    "book.visit.submit": "Yi booking ɗin ziyara",
    "book.service.badge": "Littafin sabis",
    "book.service.title": "Tsara sabis",
    "book.service.submit": "Yi booking ɗin sabis",
    "book.testDrive.badge": "Littafin gwajin tuƙi",
    "book.testDrive.title": "Tsara gwajin tuƙi",
    "book.testDrive.submit": "Yi booking ɗin gwajin tuƙi",
    "book.date": "Rana",
    "book.time": "Lokaci",
    "book.phone": "Lambar waya",
    "book.phonePlaceholder": "Shigar da lambar waya",
    "book.note": "Bayani",
    "book.notePlaceholder": "Ƙara ɗan bayani",
    "common.cancel": "Soke",
    "common.sending": "Ana aikawa...",
  },
};

type LanguageContextType = {
  language: LangCode;
  setLanguage: React.Dispatch<React.SetStateAction<LangCode>>;
  t: (key: string) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LangCode>("en");

  const value = useMemo(() => {
    const isRtl = language === "ar";
    const t = (key: string) =>
      translations[language]?.[key] ??
      translations.en[key] ??
      key;

    return { language, setLanguage, t, isRtl };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

