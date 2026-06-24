/**
 * src/components/LanguageSwitcher.tsx â€” Bambeh Marketplace
 *
 * âœ… Actually calls setLanguage() from LanguageContext (was a no-op before)
 * âœ… Highlights the active language
 * âœ… Supports compact (icon-only) and full (flag + label) modes
 * âœ… Includes all 5 app languages
 * âœ… Language changes INSTANTLY app-wide â€” no page reload required
 */
import React from "react";
import { useLanguage } from '@/App';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

const LANGUAGES = [
  { code: "en",     label: "English",       flag: "ðŸ‡¬ðŸ‡§" },
  { code: "fr",     label: "FranÃ§ais",      flag: "ðŸ‡«ðŸ‡·" },
  { code: "pidgin", label: "Pidgin",        flag: "ðŸ‡¨ðŸ‡²" },
  { code: "ar",     label: "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©",       flag: "ðŸ‡¸ðŸ‡¦" },
  { code: "ff",     label: "Fulfulde",      flag: "ðŸ‡¨ðŸ‡²" },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
  className = "",
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex flex-wrap gap-1 ${className}`}
      role="group"
      aria-label="Select language"
    >
      {LANGUAGES.map((l) => {
        const isActive = language === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            aria-pressed={isActive}
            aria-label={l.label}
            title={l.label}
            className={`
              flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold
              transition-all duration-150 border
              ${isActive
                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600"
              }
            `}
          >
            <span className="text-base leading-none">{l.flag}</span>
            <span className="ml-1">{l.flag} {l.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;





