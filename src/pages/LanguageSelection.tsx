/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE SELECTOR — ONBOARDING LANDING (SCROLL-FIXED)
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
    promo: "Only 1% Transaction Fee! — The lowest you will see online.",
  },
  fr: {
    title: "Choisir la langue",
    subtitle: "Choisissez la langue de l’application.",
    btn: "Continuer",
    promo: "Frais de transaction de 1% seulement ! — Le plus bas que vous verrez en ligne.",
  },
  pidgin: {
    title: "Select Language",
    subtitle: "Choose the language wey you wan use.",
    btn: "Continue",
    promo: "Only 1% Transaction Fee! — Di lowest text wey you go see online.",
  },
  ar: {
    title: "اختر اللغة",
    subtitle: "اختر لغة التطبيق المفضلة لديك.",
    btn: "متابعة",
    promo: "رسوم معاملة 1٪ فقط! — أدنى مستوى ستراه على الإنترنت.",
  },
  ff: {
    title: "Suɓo Ɗemngal",
    subtitle: "Suɓo ɗemngal gollitorde nde njiɗ-ɗaa.",
    btn: "Yeeso",
    promo: "Njoɓdi gollal ko 1% tan! — Ko ɓuri les e internet.",
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
      className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex flex-col relative"
      dir={isRtl ? "rtl" : "ltr"}
      aria-labelledby="language-selector-title"
    >
      {/* Scrollable Upper Section */}
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 w-full max-w-md mx-auto space-y-6">
        
        {/* Logo and Typography Branding Header */}
        <div className="text-center">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Bambeh Logo"
              className="mx-auto h-20 w-auto object-contain mb-3 drop-shadow-md"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-3 shadow-xl mx-auto">
              <span className="text-3xl font-bold text-white">B</span>
            </div>
          )}

          <h1 id="language-selector-title" className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {current.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{current.subtitle}</p>
        </div>

        {/* Dynamic Selection Grid */}
        <div className="grid grid-cols-1 gap-2.5" role="list" aria-label="Language choices">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                aria-pressed={isSelected}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                  isSelected
                    ? "bg-teal-50 border-teal-600 shadow-md font-semibold"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                style={{ textAlign: isRtl ? "right" : "left" }}
              >
                <div>
                  <span className="text-gray-900 block text-base">{lang.label}</span>
                  <span className="text-gray-400 text-xs">{lang.native}</span>
                </div>
                {isSelected && <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Permanently Anchored Bottom Action Control Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/60 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-50">
        <div className="max-w-md w-full mx-auto space-y-3">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-200"
          >
            <span>{current.btn}</span>
            <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
          </button>

          <footer className="text-center">
            <p className="text-xs text-gray-700 font-semibold tracking-wide">
              🎉 <span className="text-green-600">{current.promo}</span> 💚
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}