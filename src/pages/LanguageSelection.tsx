/**
 * LANGUAGE SELECTION - ONBOARDING STEP 2
 * © 2025 Bambeh. All rights reserved.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, CheckCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/App";   

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    description: "Continue in English",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    description: "Continuer en français",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    description: "استمر بالعربية",
    rtl: true,
  },
  {
    code: "ha",
    name: "Hausa",
    nativeName: "Hausa",
    flag: "🇳🇬",
    description: "Ci gaba da Hausa",
  },
  {
    code: "ff",
    name: "Fulfulde",
    nativeName: "Pulaar",
    flag: "🇨🇲",
    description: "Jokkondiro e Fulfulde",
  },
  {
    code: "pcm",
    name: "Pidgin English",
    nativeName: "Pidgin (Creole)",
    flag: "🇨🇲",
    description: "Continue for Pidgin",
  },
];

interface LanguageSelectionProps {
  onLanguageSelected?: (language: string) => void;
}

export default function LanguageSelection({
  onLanguageSelected,
}: LanguageSelectionProps) {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { setLanguage } = useLanguage();                  

  useEffect(() => {
    const termsAccepted = localStorage.getItem("Bambeh_terms_accepted");
    if (termsAccepted !== "true") {
      navigate("/terms-acceptance", { replace: true });
      return;
    }

    const existingLanguage = localStorage.getItem("Bambeh_language");
    if (existingLanguage) {
      setSelectedLanguage(existingLanguage);
    }
  }, [navigate]);

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleContinue = () => {
    if (!selectedLanguage) {
      alert("Please select a language to continue");
      return;
    }

    localStorage.setItem("Bambeh_language", selectedLanguage);
    localStorage.setItem(
      "Bambeh_language_selected_date",
      new Date().toISOString(),
    );

    const selectedLang = LANGUAGES.find(
      (lang) => lang.code === selectedLanguage,
    );
    document.documentElement.dir = selectedLang?.rtl ? "rtl" : "ltr";
    document.documentElement.lang = selectedLanguage;

    if (onLanguageSelected) {
      onLanguageSelected(selectedLanguage);
    }

    setIsAnimating(true);
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
  };

  const handleSkip = () => {
    localStorage.setItem("Bambeh_language", "en");
    localStorage.setItem(
      "Bambeh_language_selected_date",
      new Date().toISOString(),
    );
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div
        className={`max-w-5xl w-full transition-all duration-500 ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-6 shadow-2xl">
            <span className="text-5xl font-bold text-white">B</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-teal-600">Bambeh</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">Choose Your Language</p>
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <Globe className="w-5 h-5" />
            <p className="text-sm font-medium">
              Select your preferred language to get started
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedLanguage === language.code
                  ? "border-teal-500 bg-teal-50 shadow-xl scale-105"
                  : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-lg"
              }`}
            >
              {selectedLanguage === language.code && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`flex items-center gap-4 ${language.rtl ? "flex-row-reverse" : ""}`}
              >
                <div className="text-6xl">{language.flag}</div>

                <div
                  className={`flex-1 ${language.rtl ? "text-right" : "text-left"}`}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {language.nativeName}
                  </h3>
                  <p className="text-gray-600 text-sm">{language.name}</p>
                  <p
                    className={`text-sm mt-2 font-medium ${
                      selectedLanguage === language.code
                        ? "text-teal-600"
                        : "text-gray-500"
                    }`}
                  >
                    {language.description}
                  </p>
                </div>
              </div>
            </button>
          ))}

          <div className="p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                More languages
                <br />
                coming soon!
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Ewondo, Duala, Ngemba...
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              selectedLanguage
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-xl hover:shadow-2xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>Continue to Bambeh</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 hover:text-teal-600 underline font-medium"
            >
              Skip (Use English)
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            You can change your language anytime in settings
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-2">
            🎉{" "}
            <span className="font-bold text-green-600">
              Only 1% Transaction Fee
            </span>{" "}
            - Lowest in ! 💚
          </p>
          <p className="text-sm text-gray-500">
            Online Marketplace
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2025 Bambeh. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}



