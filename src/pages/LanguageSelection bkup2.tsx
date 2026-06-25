/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE SELECTOR — ONBOARDING LANDING
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: src/pages/LanguageSelector.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";

type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

interface LangOption {
  code: LangCode;
  label: string;
  native: string;
}

const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "pidgin", label: "Pidgin", native: "Pidgin English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ff", label: "Fulfulde", native: "Pulaar" },
];

export default function LanguageSelector() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LangCode>("en");

  const handleContinue = () => {
    localStorage.setItem("bambeh_user_lang", selected);
    window.dispatchEvent(new Event("bambeh:langchange"));
    // Route into authentication sequence or main dashboard context
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex flex-col justify-between p-6">
      <div className="max-w-md w-full mx-auto my-auto space-y-8">
        
        {/* ── App Logo Integration ───────────────────────────────────────── */}
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Bambeh Logo" 
            className="mx-auto h-24 w-auto object-contain mb-4 drop-shadow-md"
            onError={(e) => {
              // Fallback safe rendering if image resource path differs
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector(".logo-fallback");
                if (fallback) fallback.classList.remove("hidden");
              }
            }}
          />
          <div className="logo-fallback hidden inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-4 shadow-xl mx-auto">
            <span className="text-4xl font-bold text-white">B</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Select Language
          </h1>
          <p className="text-sm text-gray-500 mt-2">Choose your preferred application dialect</p>
        </div>

        {/* ── Language Grid Options ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "bg-teal-50 border-teal-600 shadow-md font-semibold"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div>
                  <span className="text-gray-900 block">{lang.label}</span>
                  <span className="text-gray-400 text-xs">{lang.native}</span>
                </div>
                {isSelected && <div className="w-3 h-3 bg-teal-600 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* ── Action Navigation Button ──────────────────────────────────── */}
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Fixed Promo Sticky Footer ────────────────────────────────────── */}
      <div className="text-center pt-6 border-t border-gray-200 max-w-md w-full mx-auto">
        <p className="text-sm text-gray-700">
          🎉{" "}
          <span className="font-bold text-green-600">Only 1% Transaction Fee!</span>{" "}
          — The lowest you will see online. 💚
        </p>
      </div>
    </div>
  );
}