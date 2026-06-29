/**
 * LANGUAGE SELECTION - ONBOARDING STEP 1
 * © 2026 Bambeh SARL. All rights reserved.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, CheckCircle, ArrowRight } from "lucide-react";
import i18n from "../../i18n"; 

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", description: "Continue in English" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", description: "Continuer en français" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", description: "استمر بالعربية", rtl: true },
  { code: "ha", name: "Hausa", nativeName: "Hausa", flag: "🇳🇬", description: "Ci gaba da Hausa" },
  { code: "ful", name: "Fulfulde", nativeName: "Pulaar", flag: "🇨🇲", description: "Jokkondiro e Fulfulde" },
  { code: "pcm", name: "Pidgin English", nativeName: "Pidgin (Creole)", flag: "🇨🇲", description: "Continue for Pidgin" }
];

export default function LanguageSelector() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const existingLanguage = localStorage.getItem("bambe_language");
    if (existingLanguage) {
      setSelectedLanguage(existingLanguage);
    }
  }, []);

  const commitLanguageChange = (code: string) => {
    localStorage.setItem("bambe_language", code);
    localStorage.setItem("Bambeh_onboarding_step1_completed", "true");
    
    // Core Global Switch Engine
    i18n.changeLanguage(code);
    
    const selectedLang = LANGUAGES.find((lang) => lang.code === code);
    document.documentElement.dir = selectedLang?.rtl ? "rtl" : "ltr";
    document.documentElement.lang = code;

    // Advanced smoothly to step 2 terms layout
    navigate("/terms-acceptance", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-2xl mb-4 shadow-xl">
            <span className="text-4xl font-extrabold text-white">B</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome to Bambeh</h1>
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <Globe className="w-4 h-4" />
            <p className="text-sm font-medium">Select your preferred language / Choisissez votre langue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => setSelectedLanguage(language.code)}
              className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedLanguage === language.code ? "border-teal-500 bg-teal-50/40 shadow-md" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {selectedLanguage === language.code && (
                <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-teal-600" /></div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-4xl">{language.flag}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{language.nativeName}</h3>
                  <p className="text-xs text-gray-500">{language.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => selectedLanguage && commitLanguageChange(selectedLanguage)}
            disabled={!selectedLanguage}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-12 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
              selectedLanguage ? "bg-teal-600 text-white shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

