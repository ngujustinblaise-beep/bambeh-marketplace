/**
 * src/components/PhoneInput.tsx  AND  src/components/forms/PhoneInput.tsx
 * Bambeh Marketplace — Phone Number Input with Cameroon dial code
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * DEPLOY TO BOTH:
 *   C:\Dev\bambe-android\src\components\PhoneInput.tsx
 *   C:\Dev\bambe-android\src\components\forms\PhoneInput.tsx
 */
import React, { useState } from "react";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
  name?: string;
  id?: string;
}

const DIAL_CODES = [
  { code: "+237", country: "CM", flag: "🇨🇲", name: "Cameroun" },
  { code: "+225", country: "CI", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "+221", country: "SN", flag: "🇸🇳", name: "Sénégal" },
  { code: "+243", country: "CD", flag: "🇨🇩", name: "RD Congo" },
  { code: "+242", country: "CG", flag: "🇨🇬", name: "Congo" },
  { code: "+241", country: "GA", flag: "🇬🇦", name: "Gabon" },
  { code: "+240", country: "GQ", flag: "🇬🇶", name: "Guinée Éq." },
  { code: "+236", country: "CF", flag: "🇨🇫", name: "Centrafrique" },
  { code: "+235", country: "TD", flag: "🇹🇩", name: "Tchad" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+33",  country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+1",   country: "US", flag: "🇺🇸", name: "USA" },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChange,
  onBlur,
  placeholder = "6XX XXX XXX",
  required = false,
  disabled = false,
  label,
  error,
  className = "",
  name,
  id,
}) => {
  const [dialCode, setDialCode] = useState("+237");
  const [showDropdown, setShowDropdown] = useState(false);
  const [localNumber, setLocalNumber] = useState(() => {
    if (value) {
      const code = DIAL_CODES.find((d) => value.startsWith(d.code));
      return code ? value.slice(code.code.length).trim() : value;
    }
    return "";
  });

  const selectedFlag = DIAL_CODES.find((d) => d.code === dialCode)?.flag ?? "🇨🇲";

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s]/g, "");
    setLocalNumber(num);
    onChange?.(`${dialCode}${num.replace(/\s/g, "")}`);
  };

  const handleDialCodeSelect = (code: string) => {
    setDialCode(code);
    setShowDropdown(false);
    onChange?.(`${code}${localNumber.replace(/\s/g, "")}`);
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex gap-0 relative">
        {/* Dial code selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowDropdown(!showDropdown)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{selectedFlag}</span>
            <span className="text-gray-700 font-medium">{dialCode}</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-52 overflow-y-auto">
                {DIAL_CODES.map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => handleDialCodeSelect(d.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-sm ${d.code === dialCode ? "bg-teal-50 text-teal-700" : "text-gray-700"}`}
                  >
                    <span>{d.flag}</span>
                    <span className="font-medium">{d.code}</span>
                    <span className="text-gray-400 truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Number input */}
        <input
          type="tel"
          id={id}
          name={name}
          value={localNumber}
          onChange={handleNumberChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`flex-1 border border-gray-300 rounded-r-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400 ${error ? "border-red-400 focus:ring-red-500" : ""}`}
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default PhoneInput;
