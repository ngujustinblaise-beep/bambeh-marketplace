/**
 * src/components/LanguageSelection.tsx
 * Bambeh Marketplace — Language Selection Screen
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { useBambehStore } from "@/utils/BambehStore";

interface LanguageSelectionProps {
  onLanguageSelected?: (lang: string) => void;
}

const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷", native: "Français" },
  { code: "en", name: "English", flag: "🇬🇧", native: "English" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", native: "Deutsch" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", native: "العربية" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", native: "中文" },
  { code: "es", name: "Español", flag: "🇪🇸", native: "Español" },
  { code: "pt", name: "Português", flag: "🇧🇷", native: "Português" },
  { code: "ha", name: "Hausa", flag: "🌍", native: "Hausa" },
];

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelected }) => {
  const setLanguage = useBambehStore((s) => s.setLanguage);
  const currentLang = useBambehStore((s) => s.language);
  const [selected, setSelected] = useState(currentLang || "fr");

  const handleSelect = (code: string) => {
    setSelected(code);
    setLanguage(code);
    onLanguageSelected?.(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-teal-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-black text-3xl">B</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Bambeh</h1>
          <p className="text-gray-500 text-sm mt-1">Choisissez votre langue</p>
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                selected === lang.code
                  ? "border-teal-500 bg-teal-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left min-w-0">
                <p className={`text-sm font-semibold truncate ${selected === lang.code ? "text-teal-700" : "text-gray-900"}`}>
                  {lang.native}
                </p>
                <p className="text-xs text-gray-400 truncate">{lang.name}</p>
              </div>
              {selected === lang.code && (
                <svg className="w-4 h-4 text-teal-600 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={() => handleSelect(selected)}
          className="w-full mt-6 py-3.5 bg-teal-600 text-white rounded-2xl font-bold text-base hover:bg-teal-700 active:bg-teal-800 transition-colors shadow-md"
        >
          Continuer →
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Vous pourrez changer la langue plus tard dans les paramètres.
        </p>
      </div>
    </div>
  );
};

export default LanguageSelection;
