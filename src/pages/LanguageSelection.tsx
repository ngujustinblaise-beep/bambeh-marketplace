/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE SELECTOR — ONBOARDING LANDING
 * FILE: src/pages/LanguageSelector.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

interface LangOption {
  code: LangCode;
  label: string;
  native: string;
}

const STORAGE_KEY = "bambeh_user_lang";

const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "pidgin", label: "Pidgin", native: "Pidgin English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ff", label: "Fulfulde", native: "Pulaar" },
];

const STRINGS: Record<
  LangCode,
  { title: string; subtitle: string; btn: string; promo: string }
> = {
  en: {
    title: "Select Language",
    subtitle: "Choose your preferred app language.",
    btn: "Continue",
    promo: "Fast setup. Secure experience.",
  },
  fr: {
    title: "Choisir la langue",
    subtitle: "Choisissez la langue de l’application.",
    btn: "Continuer",
    promo: "Configuration rapide. Expérience sécurisée.",
  },
  pidgin: {
    title: "Select Language",
    subtitle: "Choose the language wey you wan use.",
    btn: "Continue",
    promo: "Fast setup. Secure experience.",
  },
  ar: {
    title: "اختر اللغة",
    subtitle: "اختر لغة التطبيق المفضلة لديك.",
    btn: "متابعة",
    promo: "إعداد سريع. تجربة آمنة.",
  },
  ff: {
    title: "Suɓo Ɗemngal",
    subtitle: "Suɓo ɗemngal gollitorde nde njiɗ-ɗaa.",
    btn: "Yeeso",
    promo: "Jaɓɓorgol ɗumɗum. Aade hisnude.",
  },
};

export default function LanguageSelector() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LangCode>("en");
  const [logoError, setLogoError] = useState(false);
  const isRtl = selected === "ar";
  const current = STRINGS[selected];

  const handleContinue = () => {
    localStorage.setItem(STORAGE_KEY, selected);
    window.dispatchEvent(
      new CustomEvent("bambeh:langchange", { detail: { language: selected } })
    );
    navigate("/terms");
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex flex-col justify-between p-6"
      dir={isRtl ? "rtl" : "ltr"}
      aria-labelledby="language-selector-title"
    >
      <section className="max-w-md w-full mx-auto my-auto space-y-8">
        <div className="text-center">
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

          <h1 id="language-selector-title" className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {current.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">{current.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-3" role="list" aria-label="Language choices">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                aria-pressed={isSelected}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                  isSelected
                    ? "bg-teal-50 border-teal-600 shadow-md font-semibold"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                style={{ textAlign: isRtl ? "right" : "left" }}
              >
                <div>
                  <span className="text-gray-900 block">{lang.label}</span>
                  <span className="text-gray-400 text-xs">{lang.native}</span>
                </div>
                {isSelected && <div className="w-3 h-3 bg-teal-600 rounded-full" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-200"
        >
          <span>{current.btn}</span>
          <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
        </button>
      </section>

      <footer className="text-center pt-6 border-t border-gray-200 max-w-md w-full mx-auto">
        <p className="text-sm text-gray-700">
          <span className="font-bold text-green-600">{current.promo}</span>
        </p>
      </footer>
    </main>
  );
}