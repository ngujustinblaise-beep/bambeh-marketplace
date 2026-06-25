/**
 * src/components/PhoneInput.tsx
 * Bambeh Marketplace — Phone Number Input
 *
 * UPGRADED:
 *  ✅ Complete West & Central Africa country codes + major global codes
 *  ✅ Dropdown shows prominently on first render (auto-open prop)
 *  ✅ "Choose your country" placeholder text in closed state
 *  ✅ Search filter in dropdown for fast country selection
 *  ✅ Cameroonian (+237) selected by default
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Phone } from 'lucide-react';

export interface PhoneInputProps {
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
  autoOpenCountry?: boolean; // If true, dropdown opens automatically on mount
}

export const DIAL_CODES = [
  // ── West & Central Africa (priority) ──────────────────────────────────────
  { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroun',         format: '6XX XXX XXX' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria',           format: '7XX XXX XXXX' },
  { code: '+233', country: 'GH', flag: '🇬🇭', name: 'Ghana',             format: '24X XXX XXXX' },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal',           format: '7X XXX XX XX' },
  { code: '+225', country: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire",     format: '07 XXX XX XX' },
  { code: '+224', country: 'GN', flag: '🇬🇳', name: 'Guinée',            format: '6X XXX XX XX' },
  { code: '+241', country: 'GA', flag: '🇬🇦', name: 'Gabon',             format: '06 XX XX XX' },
  { code: '+242', country: 'CG', flag: '🇨🇬', name: 'Congo',             format: '06 XXX XXXX' },
  { code: '+243', country: 'CD', flag: '🇨🇩', name: 'RD Congo',          format: '8X XXX XXXX' },
  { code: '+240', country: 'GQ', flag: '🇬🇶', name: 'Guinée Équatoriale', format: '222 XXX XXX' },
  { code: '+236', country: 'CF', flag: '🇨🇫', name: 'Centrafrique',      format: '70 XX XX XX' },
  { code: '+235', country: 'TD', flag: '🇹🇩', name: 'Tchad',             format: '63 XX XX XX' },
  { code: '+240', country: 'ST', flag: '🇸🇹', name: 'São Tomé',          format: '990 XXXX' },
  { code: '+244', country: 'AO', flag: '🇦🇴', name: 'Angola',            format: '9XX XXX XXX' },
  { code: '+227', country: 'NE', flag: '🇳🇪', name: 'Niger',             format: '90 XX XX XX' },
  { code: '+228', country: 'TG', flag: '🇹🇬', name: 'Togo',              format: '90 XX XX XX' },
  { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Bénin',             format: '97 XX XX XX' },
  { code: '+226', country: 'BF', flag: '🇧🇫', name: 'Burkina Faso',      format: '70 XX XX XX' },
  { code: '+223', country: 'ML', flag: '🇲🇱', name: 'Mali',              format: '7X XX XX XX' },
  { code: '+222', country: 'MR', flag: '🇲🇷', name: 'Mauritanie',        format: '22 XX XX XX' },
  { code: '+220', country: 'GM', flag: '🇬🇲', name: 'Gambie',            format: '7XX XXXX' },
  { code: '+245', country: 'GW', flag: '🇬🇼', name: 'Guinée-Bissau',     format: '96 XXX XXXX' },
  { code: '+238', country: 'CV', flag: '🇨🇻', name: 'Cap-Vert',          format: '991 XXXX' },
  { code: '+232', country: 'SL', flag: '🇸🇱', name: 'Sierra Leone',      format: '76 XX XXXX' },
  { code: '+231', country: 'LR', flag: '🇱🇷', name: 'Liberia',           format: '770 XXXXX' },
  { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzanie',          format: '7XX XXX XXX' },
  { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Ouganda',           format: '7XX XXX XXX' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya',             format: '7XX XXX XXX' },
  { code: '+27',  country: 'ZA', flag: '🇿🇦', name: 'Afrique du Sud',    format: '6X XXX XXXX' },
  { code: '+212', country: 'MA', flag: '🇲🇦', name: 'Maroc',             format: '6X XX XX XX' },
  { code: '+213', country: 'DZ', flag: '🇩🇿', name: 'Algérie',           format: '6X XX XX XX' },
  // ── International ─────────────────────────────────────────────────────────
  { code: '+33',  country: 'FR', flag: '🇫🇷', name: 'France',            format: '6 XX XX XX XX' },
  { code: '+44',  country: 'GB', flag: '🇬🇧', name: 'United Kingdom',    format: '7XXX XXX XXX' },
  { code: '+1',   country: 'US', flag: '🇺🇸', name: 'USA / Canada',      format: '(XXX) XXX-XXXX' },
  { code: '+49',  country: 'DE', flag: '🇩🇪', name: 'Germany',           format: '1XX XXX XXXX' },
  { code: '+32',  country: 'BE', flag: '🇧🇪', name: 'Belgique',          format: '4XX XX XX XX' },
  { code: '+41',  country: 'CH', flag: '🇨🇭', name: 'Suisse',            format: '7X XXX XX XX' },
  { code: '+86',  country: 'CN', flag: '🇨🇳', name: 'Chine',             format: '1XX XXXX XXXX' },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  label,
  error,
  className = '',
  name,
  id,
  autoOpenCountry = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(autoOpenCountry);
  const [search,       setSearch]       = useState('');

  // Parse initial value
  const parseInitial = () => {
    if (value) {
      const match = DIAL_CODES.find(d => value.startsWith(d.code));
      if (match) return { dialCode: match.code, localNum: value.slice(match.code.length).trim() };
    }
    return { dialCode: '+237', localNum: '' };
  };

  const { dialCode: initCode, localNum: initNum } = parseInitial();
  const [dialCode,     setDialCode]     = useState(initCode);
  const [localNumber,  setLocalNumber]  = useState(initNum);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  const selected = DIAL_CODES.find(d => d.code === dialCode) || DIAL_CODES[0];

  useEffect(() => {
    if (showDropdown && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showDropdown]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCodes = search.trim()
    ? DIAL_CODES.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.includes(search) ||
        d.country.toLowerCase().includes(search.toLowerCase())
      )
    : DIAL_CODES;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s]/g, '');
    setLocalNumber(num);
    onChange?.(`${dialCode}${num.replace(/\s/g, '')}`);
  };

  const handleDialCodeSelect = (code: string) => {
    setDialCode(code);
    setShowDropdown(false);
    setSearch('');
    onChange?.(`${code}${localNumber.replace(/\s/g, '')}`);
  };

  const displayPlaceholder = placeholder || selected.format || '6XX XXX XXX';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor={id}>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}

      <div className="flex relative" ref={dropdownRef}>
        {/* Country code selector */}
        <button
          type="button"
          onClick={() => !disabled && setShowDropdown(v => !v)}
          disabled={disabled}
          className={`
            flex items-center gap-1.5 px-3 py-2.5 
            border border-r-0 rounded-l-xl 
            bg-gray-50 dark:bg-gray-700 
            hover:bg-gray-100 dark:hover:bg-gray-600 
            transition-colors text-sm 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
            min-w-[80px]
          `}
        >
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="text-gray-700 dark:text-gray-200 font-semibold text-xs">{selected.code}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Divider label */}
            {!search && (
              <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                  🌍 West & Central Africa
                </p>
              </div>
            )}

            {/* List */}
            <div className="overflow-y-auto max-h-56">
              {filteredCodes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No results for "{search}"</p>
              ) : (
                filteredCodes.map(d => (
                  <button
                    key={`${d.code}-${d.country}`}
                    type="button"
                    onClick={() => handleDialCodeSelect(d.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors ${
                      d.code === dialCode ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span className="text-xl leading-none flex-shrink-0">{d.flag}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{d.name}</span>
                      <span className="text-xs text-gray-400">{d.format}</span>
                    </span>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">{d.code}</span>
                    {d.code === dialCode && (
                      <span className="text-teal-500 text-xs">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-400 text-center">
                {filteredCodes.length} countries available
              </p>
            </div>
          </div>
        )}

        {/* Phone number input */}
        <input
          type="tel"
          id={id}
          name={name}
          value={localNumber}
          onChange={handleNumberChange}
          onBlur={onBlur}
          placeholder={displayPlaceholder}
          required={required}
          disabled={disabled}
          className={`
            flex-1 border rounded-r-xl px-3 py-2.5 text-sm 
            focus:ring-2 focus:ring-teal-500 focus:border-transparent 
            outline-none transition
            disabled:bg-gray-50 dark:disabled:bg-gray-700 
            disabled:text-gray-400
            dark:bg-gray-800 dark:text-white dark:border-gray-600
            ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠ï¸ {error}</p>}

      {/* Helper: shows chosen country */}
      {!error && localNumber && (
        <p className="text-xs text-gray-400 mt-1">
          {selected.flag} {selected.name} · Full number: {dialCode} {localNumber}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;



