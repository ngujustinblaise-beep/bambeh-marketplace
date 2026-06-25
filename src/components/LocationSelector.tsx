import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageOption {
  code: string;
  name: string;        // English label (subtitle)
  nativeName: string;  // shown in the user's own language
  flag: string;        // emoji flag, unicode-escaped (paste-safe)
  dir: "ltr" | "rtl";
}

// Matches the LangCode union exported by App.tsx: en | fr | pidgin | ar | ff
const LANGUAGES: LanguageOption[] = [
  { code: "en",     name: "English",  nativeName: "English",                                  flag: "\u{1F1EC}\u{1F1E7}", dir: "ltr" },
  { code: "fr",     name: "French",   nativeName: "Fran\u00e7ais",                            flag: "\u{1F1EB}\u{1F1F7}", dir: "ltr" },
  { code: "pidgin", name: "Pidgin",   nativeName: "Pidgin",                                   flag: "\u{1F1E8}\u{1F1F2}", dir: "ltr" },
  { code: "ar",     name: "Arabic",   nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}", dir: "rtl" },
  { code: "ff",     name: "Fulfulde", nativeName: "Fulfulde",                                 flag: "\u{1F1E8}\u{1F1F2}", dir: "ltr" },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  const handleSelect = (code: string) => {
    setLanguage(code); // App provider persists, sets dir/lang, and dispatches bambeh:langchange
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-500 transition-colors group"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
        <span className="text-2xl leading-none">{current.flag}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {current.nativeName}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Select Language
              </h3>
            </div>
            <div className="p-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  dir={lang.dir}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    current.code === lang.code
                      ? "bg-teal-50 border-2 border-teal-500"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span className="text-3xl leading-none">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800">{lang.nativeName}</div>
                    <div className="text-xs text-gray-500">{lang.name}</div>
                  </div>
                  {current.code === lang.code && (
                    <Check className="w-5 h-5 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;

