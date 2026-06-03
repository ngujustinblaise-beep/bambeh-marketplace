/**
 * src/components/AfricanPhoneInput.tsx — Bambeh Marketplace
 *
 * Reusable phone input with African country code picker.
 * Covers Central Africa + West Africa + defaults to Cameroon.
 *
 * Usage:
 *   import AfricanPhoneInput from "@/components/AfricanPhoneInput";
 *
 *   <AfricanPhoneInput
 *     value={phone}
 *     onChange={(fullNumber, isValid) => {
 *       setPhone(fullNumber);       // e.g. "+237671234567"
 *       setPhoneValid(isValid);
 *     }}
 *   />
 *
 * Props:
 *   value      — controlled string (full international number or just local digits)
 *   onChange   — (fullNumber: string, isValid: boolean) => void
 *   label      — optional label text (default: "Phone number")
 *   required   — show asterisk
 *   error      — external error string to show below the input
 *   className  — optional extra class on the wrapper div
 */

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

// ── Country data ──────────────────────────────────────────────────────────────

export interface Country {
  flag: string;
  name: string;
  dial: string;   // e.g. "+237"
  code: string;   // ISO 3166-1 alpha-2
  len: number;    // expected local number length (digits only)
  pattern: RegExp;
}

export const CENTRAL_AFRICA: Country[] = [
  { flag: "🇨🇲", name: "Cameroon",      dial: "+237", code: "CM", len: 9, pattern: /^6[2-9]\d{7}$/ },
  { flag: "🇨🇩", name: "DR Congo",      dial: "+243", code: "CD", len: 9, pattern: /^8\d{8}$/ },
  { flag: "🇨🇬", name: "Congo (Rep.)",  dial: "+242", code: "CG", len: 9, pattern: /^[056]\d{8}$/ },
  { flag: "🇬🇦", name: "Gabon",         dial: "+241", code: "GA", len: 8, pattern: /^[067]\d{7}$/ },
  { flag: "🇹🇩", name: "Chad",          dial: "+235", code: "TD", len: 8, pattern: /^6\d{7}$/ },
  { flag: "🇨🇫", name: "CAR",           dial: "+236", code: "CF", len: 8, pattern: /^7\d{7}$/ },
  { flag: "🇬🇶", name: "Eq. Guinea",    dial: "+240", code: "GQ", len: 9, pattern: /^[23]\d{8}$/ },
  { flag: "🇸🇹", name: "São Tomé",      dial: "+239", code: "ST", len: 7, pattern: /^\d{7}$/ },
  { flag: "🇧🇮", name: "Burundi",       dial: "+257", code: "BI", len: 8, pattern: /^[67]\d{7}$/ },
  { flag: "🇷🇼", name: "Rwanda",        dial: "+250", code: "RW", len: 9, pattern: /^7\d{8}$/ },
];

export const WEST_AFRICA: Country[] = [
  { flag: "🇳🇬", name: "Nigeria",       dial: "+234", code: "NG", len: 10, pattern: /^[789]\d{9}$/ },
  { flag: "🇬🇭", name: "Ghana",         dial: "+233", code: "GH", len:  9, pattern: /^[235]\d{8}$/ },
  { flag: "🇸🇳", name: "Senegal",       dial: "+221", code: "SN", len:  9, pattern: /^[37]\d{8}$/ },
  { flag: "🇨🇮", name: "Côte d'Ivoire", dial: "+225", code: "CI", len: 10, pattern: /^0[57]\d{8}$/ },
  { flag: "🇧🇫", name: "Burkina Faso",  dial: "+226", code: "BF", len:  8, pattern: /^[67]\d{7}$/ },
  { flag: "🇲🇱", name: "Mali",          dial: "+223", code: "ML", len:  8, pattern: /^[567]\d{7}$/ },
  { flag: "🇬🇳", name: "Guinea",        dial: "+224", code: "GN", len:  9, pattern: /^[67]\d{8}$/ },
  { flag: "🇧🇯", name: "Benin",         dial: "+229", code: "BJ", len:  8, pattern: /^[679]\d{7}$/ },
  { flag: "🇹🇬", name: "Togo",          dial: "+228", code: "TG", len:  8, pattern: /^[79]\d{7}$/ },
  { flag: "🇸🇱", name: "Sierra Leone",  dial: "+232", code: "SL", len:  8, pattern: /^[37]\d{7}$/ },
  { flag: "🇱🇷", name: "Liberia",       dial: "+231", code: "LR", len:  8, pattern: /^\d{8}$/ },
  { flag: "🇬🇲", name: "Gambia",        dial: "+220", code: "GM", len:  7, pattern: /^[23679]\d{6}$/ },
  { flag: "🇬🇼", name: "Guinea-Bissau", dial: "+245", code: "GW", len:  7, pattern: /^[56]\d{6}$/ },
  { flag: "🇨🇻", name: "Cape Verde",    dial: "+238", code: "CV", len:  7, pattern: /^9\d{6}$/ },
  { flag: "🇳🇪", name: "Niger",         dial: "+227", code: "NE", len:  8, pattern: /^[89]\d{7}$/ },
  { flag: "🇲🇷", name: "Mauritania",    dial: "+222", code: "MR", len:  8, pattern: /^[23]\d{7}$/ },
];

// Suggested defaults shown first (no region filter)
const SUGGESTED: Country[] = [
  CENTRAL_AFRICA[0], // Cameroon — always first
  WEST_AFRICA[0],    // Nigeria
  WEST_AFRICA[1],    // Ghana
  WEST_AFRICA[2],    // Senegal
  CENTRAL_AFRICA[1], // DR Congo
];

const ALL_COUNTRIES: Country[] = [
  ...new Map(
    [...CENTRAL_AFRICA, ...WEST_AFRICA].map(c => [c.code, c])
  ).values(),
].sort((a, b) => a.name.localeCompare(b.name));

type Region = "suggested" | "central" | "west" | "all";

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  value?: string;
  onChange: (fullNumber: string, isValid: boolean) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function AfricanPhoneInput({
  value,
  onChange,
  label = "Phone number",
  required,
  error,
  className = "",
}: Props) {
  const [country,  setCountry]  = useState<Country>(CENTRAL_AFRICA[0]);
  const [local,    setLocal]    = useState("");
  const [open,     setOpen]     = useState(false);
  const [region,   setRegion]   = useState<Region>("suggested");
  const [search,   setSearch]   = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync incoming value (for controlled usage)
  useEffect(() => {
    if (!value) return;
    const digits = value.replace(/\D/g, "");
    // Try to detect dial code from value
    const matched = ALL_COUNTRIES.find(c => value.startsWith(c.dial));
    if (matched) {
      setCountry(matched);
      setLocal(digits.slice(matched.dial.replace("+", "").length));
    } else {
      setLocal(digits.slice(0, 13));
    }
  }, []); // only on mount

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Validate + bubble up
  function fireChange(localVal: string, c: Country = country) {
    const digits = localVal.replace(/\D/g, "");
    const full   = `${c.dial}${digits}`;
    const valid  = digits.length === c.len && c.pattern.test(digits);
    onChange(full, valid);
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.replace(/[^\d\s]/g, "");
    setLocal(cleaned);
    fireChange(cleaned);
  }

  function selectCountry(c: Country) {
    setCountry(c);
    setOpen(false);
    setSearch("");
    fireChange(local, c);
  }

  // Which list to show
  const listSource: Country[] =
    region === "suggested" ? SUGGESTED :
    region === "central"   ? CENTRAL_AFRICA :
    region === "west"      ? WEST_AFRICA :
    ALL_COUNTRIES;

  const q = search.toLowerCase();
  const filtered = q
    ? listSource.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q))
    : listSource;

  const digits  = local.replace(/\D/g, "");
  const isValid = digits.length === country.len && country.pattern.test(digits);
  const isTooShort = digits.length > 0 && digits.length < country.len;
  const isWrong    = digits.length === country.len && !isValid;

  const REGION_TABS: { id: Region; label: string }[] = [
    { id: "suggested", label: "Default" },
    { id: "central",   label: "Central Africa" },
    { id: "west",      label: "West Africa" },
    { id: "all",       label: "All" },
  ];

  return (
    <div ref={wrapRef} className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input row */}
      <div className="flex">
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(""); }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:border-green-500">
          <span className="text-base leading-none">{country.flag}</span>
          <span className="font-mono text-xs">{country.dial}</span>
          {open
            ? <ChevronUp className="w-3 h-3 text-gray-400" />
            : <ChevronDown className="w-3 h-3 text-gray-400" />
          }
        </button>

        {/* Local number input */}
        <input
          type="tel"
          inputMode="numeric"
          value={local}
          onChange={handleLocalChange}
          maxLength={country.len + 2}
          placeholder={country.code === "CM" ? "6XX XXX XXX" : `${country.len} digits`}
          className={`flex-1 border-2 rounded-r-xl px-4 py-2.5 text-sm font-mono outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white
            ${error || isWrong
              ? "border-red-400 focus:border-red-500"
              : isValid
              ? "border-green-500 focus:border-green-600"
              : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`}
        />
      </div>

      {/* Hint / validation */}
      {!error && (
        <p className={`text-xs mt-0.5 ${
          isValid    ? "text-green-600"
          : isWrong  ? "text-red-500"
          : isTooShort ? "text-orange-500"
          : "text-gray-400"
        }`}>
          {isValid
            ? `Valid — ${country.dial} ${digits}`
            : isWrong
            ? `Not a valid ${country.name} number`
            : isTooShort
            ? `Need ${country.len} digits (${digits.length} so far)`
            : `Enter ${country.len}-digit ${country.name} number`}
        </p>
      )}
      {error && <p className="text-xs text-red-500 mt-0.5">⚠ {error}</p>}

      {/* Dropdown picker */}
      {open && (
        <div className="border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-lg z-50 relative">

          {/* Region tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {REGION_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setRegion(tab.id); setSearch(""); }}
                className={`flex-1 py-2 text-xs font-semibold transition border-b-2
                  ${region === tab.id
                    ? "text-green-600 border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search (only on All tab) */}
          {region === "all" && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country…"
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-green-500"
                />
              </div>
            </div>
          )}

          {/* Section header */}
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {region === "suggested" ? "Suggested"
               : region === "central" ? "Central Africa"
               : region === "west"    ? "West Africa"
               : "All countries"}
            </p>
          </div>

          {/* Country list */}
          <div className="max-h-52 overflow-y-auto" role="listbox">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No countries found</p>
            ) : filtered.map(c => (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={c.code === country.code}
                onClick={() => selectCountry(c)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition border-b border-gray-50 dark:border-gray-800 last:border-0
                  ${c.code === country.code
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="flex-1 text-gray-900 dark:text-white font-medium">{c.name}</span>
                <span className="font-mono text-xs text-gray-400">{c.dial}</span>
                {c.code === country.code && (
                  <span className="text-green-600 text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
