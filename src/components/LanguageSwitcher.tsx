import React from "react";
import { useLanguage } from "@/App";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pidgin", label: "Pidgin", flag: "🇨🇲" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ff", label: "Fulfulde", flag: "🇨🇲" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={\
            px-3 py-1.5 rounded-lg border text-sm font-medium
            \
          \}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
