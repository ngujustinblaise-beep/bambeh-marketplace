import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

interface LangOption {
  code: LangCode;
  label: string;
  native: string;
}

const STORAGE_KEY = "Bambeh_language";

const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "pcm", label: "Pidgin", native: "Pidgin English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ful", label: "Fulfulde", native: "Pulaar" },
  { code: "ha", label: "Hausa", native: "Hausa" },
];

const STRINGS: Record<LangCode, { title: string; subtitle: string; btn: string; promo: string }> = {
  en: { title: "Select Language", subtitle: "Choose your preferred language", btn: "Continue", promo: "Only 1% Fee" },
  fr: { title: "Choisir la langue", subtitle: "Choisissez votre langue préférée", btn: "Continuer", promo: "Seulement 1% de frais" },
  pcm: { title: "Chus Language", subtitle: "Pick the language weh you want", btn: "Waka Di Go", promo: "Only 1% Charge" },
  ar: { title: "اختر اللغة", subtitle: "اختر لغتك المفضلة", btn: "متابعة", promo: "رسوم 1% فقط" },
  ful: { title: "Suɓo ɗemngal", subtitle: "Suɓo ɗemngal ngal njiɗ-ɗaa", btn: "Yaa yeeso", promo: "1% tan yoɓete" },
  ha: { title: "Zaɓi Yare", subtitle: "Zaɓi yaren da kake so", btn: "Ci gaba", promo: "Kudin fito 1% kawai" },
};

export const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState<LangCode>("en");

  const current = STRINGS[selectedLang] || STRINGS.en;
  const isRtl = selectedLang === "ar";

  const handleContinue = () => {
    localStorage.setItem(STORAGE_KEY, selectedLang);
    localStorage.setItem("Bambeh_onboarding_completed", "true");
    navigate("/language", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-8 px-4 flex flex-col justify-between" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{current.title}</h1>
          <p className="text-gray-500 text-sm">{current.subtitle}</p>
        </div>

        <div className="space-y-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  isSelected ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div>
                  <span className="text-gray-900 block text-base font-medium">{lang.label}</span>
                  <span className="text-gray-400 text-xs">{lang.native}</span>
                </div>
                {isSelected && <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/60 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-50">
        <div className="max-w-md w-full mx-auto">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>{current.btn}</span>
            <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
