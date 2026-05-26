// @ts-nocheck
import React from "react";

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact }) => (
  <div className={`flex gap-2 ${compact ? "text-xs" : "text-sm"}`}>
    {LANGUAGES.map(l => (
      <button key={l.code}
        className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
        {compact ? l.code.toUpperCase() : l.label}
      </button>
    ))}
  </div>
);

export default LanguageSwitcher;
