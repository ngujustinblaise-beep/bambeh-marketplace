import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "????",
    dir: "ltr",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Fran�ais",
    flag: "????",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "???????",
    flag: "????",
    dir: "rtl",
  },
  { code: "ha", name: "Hausa", nativeName: "Hausa", flag: "????", dir: "ltr" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);

    const selectedLang = languages.find((lang) => lang.code === langCode);
    if (selectedLang) {
      // Update HTML dir attribute for RTL support
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = langCode;

      // Save preference
      localStorage.setItem("Bambeh_language", langCode);

      // Notify voice control of language change
      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: { language: langCode },
        }),
      );

    setIsOpen(false);

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = currentLanguage.dir;
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-500 transition-colors group"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
        <span className="text-2xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {currentLanguage.nativeName}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Language List */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Select Language
              </h3>
            </div>

            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentLanguage.code === lang.code
                      ? "bg-teal-50 border-2 border-teal-500"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-gray-500">{lang.name}</div>
                  </div>
                  {currentLanguage.code === lang.code && (
                    <Check className="w-5 h-5 text-teal-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 border-t border-gray-200">
              Language preference is saved and applied to voice commands
            </div>
          </div>
        </>
      )}
    </div>
  );

}
}
}
export default LanguageSelector;
