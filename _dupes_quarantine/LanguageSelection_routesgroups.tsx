import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

interface LangOption {
  code: LangCode;
  label: string;
  native: string;
}

type Strings = {
  title: string;
  subtitle: string;
  btn: string;
  promo: string;
};

const STORAGE_KEY = "Bambeh_language";
const LANGUAGE_SELECTED_KEY = "Bambeh_language_selected";

const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Fran?ais" },
  { code: "pcm", label: "Pidgin", native: "Pidgin English" },
  { code: "ar", label: "Arabic", native: "???????" },
  { code: "ful", label: "Fulfulde", native: "Pulaar" },
  { code: "ha", label: "Hausa", native: "Hausa" },
];

const STRINGS: Record<LangCode, Strings> = {
  en: { title: "Select Language", subtitle: "Choose your preferred language", btn: "Continue", promo: "Only 1% Fee" },
  fr: { title: "Choisir la langue", subtitle: "Choisissez votre langue pr?f?r?e", btn: "Continuer", promo: "Seulement 1% de frais" },
  pcm: { title: "Chus Language", subtitle: "Pick the language weh you want", btn: "Waka Di Go", promo: "Only 1% Charge" },
  ar: { title: "????? ?????", subtitle: "???? ???? ???????", btn: "??????", promo: "???? 1% ???" },
  ful: { title: "Su?o ?emngal", subtitle: "Su?o ?emngal ngal nji?-?aa", btn: "Yeeso", promo: "Alasme 1% tan" },
  ha: { title: "Zabi Harshe", subtitle: "Zabi harshen da kake so", btn: "Ci gaba", promo: "Caji 1% kawai" },
};

export default function LanguageSelection() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LangCode>("en");
  const [saving, setSaving] = useState(false);

  const strings = useMemo(() => STRINGS[selectedLang] ?? STRINGS.en, [selectedLang]);
  const isRtl = selectedLang === "ar";

  const handleContinue = (): void => {
    if (saving) return;
    setSaving(true);

    try {
      setLanguage(selectedLang);
      localStorage.setItem(STORAGE_KEY, selectedLang);
      localStorage.setItem(LANGUAGE_SELECTED_KEY, "true");
      navigate("/terms-acceptance", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-md w-full mx-auto pt-8">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bambeh</h1>
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mt-1">Marketplace</p>
          <div className="h-px bg-gray-100 w-1/3 mx-auto my-6" />
          <h2 className="text-xl font-bold text-gray-800">{strings.title}</h2>
          <p className="text-sm text-gray-400 mt-1">{strings.subtitle}</p>
        </div>

        <div className="space-y-3">
          {LANGUAGES.map((lang) => {
            const selected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  selected ? "border-teal-600 bg-teal-50/30 ring-4 ring-teal-500/10 font-semibold" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className={isRtl ? "text-right" : "text-left"}>
                  <span className="text-gray-900 block text-base font-medium">{lang.label}</span>
                  <span className="text-gray-400 text-xs font-normal">{lang.native}</span>
                </div>
                {selected && (
                  <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-md w-full mx-auto mt-10">
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-70 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <span>{strings.btn}</span>
          <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
        </button>
        <p className="text-center text-xs text-green-600 font-bold mt-3 uppercase tracking-wider">{strings.promo}</p>
      </div>
    </div>
  );
}

