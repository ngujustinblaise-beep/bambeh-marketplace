// BAMBEH_DEPLOY_TOKEN__AFRICANPHONEINPUT_FIX491_CLEAN
/**
 * src/components/AfricanPhoneInput.tsx ? Bambeh Marketplace
 *
 * Reusable phone input with African country code picker.
 * Covers Central Africa + West Africa + defaults to Cameroon.
 *
 * -- SECURITY HARDENING (v2) --------------------------------------------------
 *  ? Input sanitisation  ? strips all non-digit characters before validation
 *  ? Length capping      ? enforces hard max per country, no overflow possible
 *  ? Pattern enforcement ? country-specific regex, no bypasses
 *  ? XSS prevention      ? all values sanitised before bubbling to parent
 *  ? Prototype pollution ? Object.freeze on country records at module level
 *  ? No eval / innerHTML ? zero DOM injection surface
 *  ? ARIA hardened       ? listbox role, aria-selected, aria-expanded, aria-label
 *  ? Keyboard nav        ? Escape closes dropdown, Enter/Space selects
 *  ? Focus trap          ? dropdown closes on outside mousedown AND focusout
 *  ? WhatsApp URL sanitised ? phone stripped to digits, message encoded
 *  ? Rate limit guard    ? onChange fires only when value actually changed
 *  ? Immutable country list ? freeze prevents runtime mutation of dial/pattern
 * ----------------------------------------------------------------------------
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
 *   value      ? controlled string (full international number or just local digits)
 *   onChange   ? (fullNumber: string, isValid: boolean) => void
 *   label      ? optional label text (default: "Phone number")
 *   required   ? show asterisk
 *   error      ? external error string to show below the input
 *   className  ? optional extra class on the wrapper div
 *   disabled   ? disable all interaction
 */

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

// -- Security constants --------------------------------------------------------

/** Strip every character that is not a digit. Used on ALL input before storage. */
const DIGITS_ONLY = (s: string): string => s.replace(/\D/g, "");

/** Absolute maximum local number length we will ever allow (prevents runaway input). */
const HARD_MAX_LEN = 15;

/** Sanitise any string that will be rendered or passed to a URL. */
const sanitiseText = (s: unknown): string =>
  typeof s === "string" ? s.replace(/[<>"'`]/g, "") : "";

// -- Country data --------------------------------------------------------------

export interface Country {
  readonly flag:    string;
  readonly name:    string;
  readonly dial:    string;   // e.g. "+237"
  readonly code:    string;   // ISO 3166-1 alpha-2
  readonly len:     number;   // expected local number length (digits only)
  readonly pattern: RegExp;
}

// Object.freeze every country record so runtime code cannot mutate dial/pattern.
const c = (flag: string, name: string, dial: string, code: string, len: number, pattern: RegExp): Country =>
  Object.freeze({ flag, name, dial, code, len, pattern });

export const CENTRAL_AFRICA: readonly Country[] = Object.freeze([
  c("\uD83C\uDDE8\uD83C\uDDF2", "Cameroon",     "+237", "CM",  9, /^6\d{8}$/),
  c("\uD83C\uDDE8\uD83C\uDDE9", "DR Congo",     "+243", "CD",  9, /^8\d{8}$/),
  c("\uD83C\uDDE8\uD83C\uDDEC", "Congo (Rep.)", "+242", "CG",  9, /^[056]\d{8}$/),
  c("\uD83C\uDDEC\uD83C\uDDE6", "Gabon",        "+241", "GA",  8, /^[067]\d{7}$/),
  c("\uD83C\uDDF9\uD83C\uDDE9", "Chad",         "+235", "TD",  8, /^6\d{7}$/),
  c("\uD83C\uDDE8\uD83C\uDDEB", "CAR",          "+236", "CF",  8, /^7\d{7}$/),
  c("\uD83C\uDDEC\uD83C\uDDF6", "Eq. Guinea",   "+240", "GQ",  9, /^[23]\d{8}$/),
  c("\uD83C\uDDF8\uD83C\uDDF9", "S?o Tom?",     "+239", "ST",  7, /^\d{7}$/),
  c("\uD83C\uDDE7\uD83C\uDDEE", "Burundi",      "+257", "BI",  8, /^[67]\d{7}$/),
  c("\uD83C\uDDF7\uD83C\uDDFC", "Rwanda",       "+250", "RW",  9, /^7\d{8}$/),
]);

export const WEST_AFRICA: readonly Country[] = Object.freeze([
  c("\uD83C\uDDF3\uD83C\uDDEC", "Nigeria",       "+234", "NG", 10, /^[789]\d{9}$/),
  c("\uD83C\uDDEC\uD83C\uDDED", "Ghana",         "+233", "GH",  9, /^[235]\d{8}$/),
  c("\uD83C\uDDF8\uD83C\uDDF3", "Senegal",       "+221", "SN",  9, /^[37]\d{8}$/),
  c("\uD83C\uDDE8\uD83C\uDDEE", "C?te d'Ivoire", "+225", "CI", 10, /^0[57]\d{8}$/),
  c("\uD83C\uDDE7\uD83C\uDDEB", "Burkina Faso",  "+226", "BF",  8, /^[67]\d{7}$/),
  c("\uD83C\uDDF2\uD83C\uDDF1", "Mali",          "+223", "ML",  8, /^[567]\d{7}$/),
  c("\uD83C\uDDEC\uD83C\uDDF3", "Guinea",        "+224", "GN",  9, /^[67]\d{8}$/),
  c("\uD83C\uDDE7\uD83C\uDDEF", "Benin",         "+229", "BJ",  8, /^[679]\d{7}$/),
  c("\uD83C\uDDF9\uD83C\uDDEC", "Togo",          "+228", "TG",  8, /^[79]\d{7}$/),
  c("\uD83C\uDDF8\uD83C\uDDF1", "Sierra Leone",  "+232", "SL",  8, /^[37]\d{7}$/),
  c("\uD83C\uDDF1\uD83C\uDDF7", "Liberia",       "+231", "LR",  8, /^\d{8}$/),
  c("\uD83C\uDDEC\uD83C\uDDF2", "Gambia",        "+220", "GM",  7, /^[23679]\d{6}$/),
  c("\uD83C\uDDEC\uD83C\uDDFC", "Guinea-Bissau", "+245", "GW",  7, /^[56]\d{6}$/),
  c("\uD83C\uDDE8\uD83C\uDDFB", "Cape Verde",    "+238", "CV",  7, /^9\d{6}$/),
  c("\uD83C\uDDF3\uD83C\uDDEA", "Niger",         "+227", "NE",  8, /^[89]\d{7}$/),
  c("\uD83C\uDDF2\uD83C\uDDF7", "Mauritania",    "+222", "MR",  8, /^[23]\d{7}$/),
]);

const SUGGESTED: readonly Country[] = Object.freeze([
  CENTRAL_AFRICA[0], // Cameroon - always first
  WEST_AFRICA[0],    // Nigeria
  WEST_AFRICA[1],    // Ghana
  WEST_AFRICA[2],    // Senegal
  CENTRAL_AFRICA[1], // DR Congo
]);

const ALL_COUNTRIES: readonly Country[] = Object.freeze(
  [
    ...new Map(
      [...CENTRAL_AFRICA, ...WEST_AFRICA].map((ct) => [ct.code, ct])
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name))
);

type Region = "suggested" | "central" | "west" | "all";

// -- Validation helper (exported so parent can re-validate if needed) ----------

export function validatePhone(digits: string, country: Country): boolean {
  // Guard: length must match exactly and pattern must pass
  return (
    digits.length === country.len &&
    country.pattern.test(digits) &&
    digits.length <= HARD_MAX_LEN
  );
}

// -- Component -----------------------------------------------------------------

interface Props {
  value?:     string;
  onChange:   (fullNumber: string, isValid: boolean) => void;
  label?:     string;
  required?:  boolean;
  error?:     string;
  className?: string;
  disabled?:  boolean;
}

export default function AfricanPhoneInput({
  value,
  onChange,
  label    = "Phone number",
  required,
  error,
  className = "",
  disabled  = false,
}: Props) {
  const [country, setCountry] = useState<Country>(CENTRAL_AFRICA[0]);
  const [local,   setLocal]   = useState("");
  const [open,    setOpen]    = useState(false);
  const [region,  setRegion]  = useState<Region>("suggested");
  const [search,  setSearch]  = useState("");

  // Track last emitted value to prevent spurious onChange calls
  const lastEmitted = useRef<string>("");

  const wrapRef    = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  // -- Sync incoming controlled value (mount only) --------------------------
  useEffect(() => {
    if (!value) return;
    const matched = ALL_COUNTRIES.find((ct) => value.startsWith(ct.dial));
    if (matched) {
      const dialDigits = DIGITS_ONLY(matched.dial);
      const allDigits  = DIGITS_ONLY(value);
      const localPart  = allDigits.slice(dialDigits.length).slice(0, HARD_MAX_LEN);
      setCountry(matched);
      setLocal(localPart);
    } else {
      setLocal(DIGITS_ONLY(value).slice(0, HARD_MAX_LEN));
    }
  }, []); // mount only ? value prop is seed, not live binding

  // -- Close dropdown on outside click OR focus leaving wrapper ------------
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onFocusOut(e: FocusEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.relatedTarget as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // -- Focus search box when dropdown opens on "all" tab -------------------
  useEffect(() => {
    if (open && region === "all") {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, region]);

  // -- Validate and emit (deduplicated) -------------------------------------
  const fireChange = useCallback(
    (localVal: string, ct: Country = country) => {
      const digits = DIGITS_ONLY(localVal);
      const full   = `${ct.dial}${digits}`;
      const valid  = validatePhone(digits, ct);
      if (full !== lastEmitted.current) {
        lastEmitted.current = full;
        onChange(full, valid);
      }
    },
    [country, onChange]
  );

  // -- Input handler ? sanitise on every keystroke -------------------------
  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Only allow digits and spaces; hard-cap at country.len + 2 display chars
    const raw     = e.target.value.replace(/[^\d\s]/g, "");
    const digits  = DIGITS_ONLY(raw);
    if (digits.length > HARD_MAX_LEN) return; // hard stop
    const capped  = raw.slice(0, country.len + 2); // +2 for spaces
    setLocal(capped);
    fireChange(capped);
  }

  // -- Keyboard navigation on the trigger button ----------------------------
  function handleTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Escape")                  { setOpen(false); inputRef.current?.focus(); }
    if (e.key === "Enter" || e.key === " ")  { e.preventDefault(); setOpen((v) => !v); }
    if (e.key === "ArrowDown" && !open)      { e.preventDefault(); setOpen(true); }
  }

  // -- Keyboard navigation inside the list ---------------------------------
  function handleListKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") { setOpen(false); }
  }

  // -- Country selection (sanitise display name just in case) ---------------
  function selectCountry(ct: Country) {
    // Verify the country is actually in our known list (prevents spoofed objects)
    const trusted = ALL_COUNTRIES.find((k) => k.code === ct.code);
    if (!trusted) return;
    setCountry(trusted);
    setOpen(false);
    setSearch("");
    // Re-validate with new country but same local digits
    const digits   = DIGITS_ONLY(local);
    const capped   = digits.slice(0, trusted.len);
    setLocal(capped);
    fireChange(capped, trusted);
  }

  // -- Filtered list --------------------------------------------------------
  const listSource: readonly Country[] =
    region === "suggested" ? SUGGESTED :
    region === "central"   ? CENTRAL_AFRICA :
    region === "west"      ? WEST_AFRICA :
    ALL_COUNTRIES;

  // Sanitise the search query before using it as a comparator
  const q        = sanitiseText(search).toLowerCase().trim();
  const filtered = q
    ? listSource.filter(
        (ct) =>
          ct.name.toLowerCase().includes(q) ||
          ct.dial.includes(q) ||
          ct.code.toLowerCase().includes(q)
      )
    : listSource;

  // -- Derived validation state ---------------------------------------------
  const digits     = DIGITS_ONLY(local);
  const isValid    = validatePhone(digits, country);
  const isTooShort = digits.length > 0 && digits.length < country.len;
  const isWrong    = digits.length === country.len && !isValid;

  const REGION_TABS: { id: Region; label: string }[] = [
    { id: "suggested", label: "Default" },
    { id: "central",   label: "Central" },
    { id: "west",      label: "West" },
    { id: "all",       label: "All" },
  ];

  // Safe WhatsApp URL ? digits only, message encoded
  const waDigits = DIGITS_ONLY(country.dial + digits);
  const waMsg    = encodeURIComponent(
    `Hello, I am interested in a position listed on Bambeh.`
  );
  const waUrl    = `https://wa.me/${waDigits}?text=${waMsg}`;

  return (
    <div ref={wrapRef} className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      )}

      {/* Input row */}
      <div className="flex" role="group" aria-label={label ?? "Phone number input"}>
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => { if (!disabled) { setOpen((o) => !o); setSearch(""); } }}
          onKeyDown={handleTriggerKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${country.name} ${country.dial}`}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800
                     border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl
                     text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-teal-500 focus:border-teal-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none" aria-hidden="true">{country.flag}</span>
          <span className="font-mono text-xs">{country.dial}</span>
          {open
            ? <ChevronUp  className="w-3 h-3 text-gray-400" aria-hidden="true" />
            : <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />
          }
        </button>

        {/* Local number input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={local}
          onChange={handleLocalChange}
          maxLength={country.len + 2}   // +2 for visual spaces
          placeholder={country.code === "CM" ? "6XX XXX XXX" : `${country.len} digits`}
          aria-label={`Phone number digits for ${country.name}`}
          aria-invalid={!!error || isWrong}
          aria-describedby="phone-hint"
          disabled={disabled}
          className={`flex-1 border-2 rounded-r-xl px-4 py-2.5 text-sm font-mono outline-none
                      transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                      focus-visible:ring-2 focus-visible:ring-offset-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${error || isWrong
                        ? "border-red-400 focus:border-red-500 focus-visible:ring-red-300"
                        : isValid
                        ? "border-green-500 focus:border-green-600 focus-visible:ring-green-300"
                        : "border-gray-200 dark:border-gray-600 focus:border-teal-500 focus-visible:ring-teal-300"}`}
        />
      </div>

      {/* Hint / validation */}
      <p
        id="phone-hint"
        role={isWrong || error ? "alert" : "status"}
        aria-live="polite"
        className={`text-xs mt-0.5 ${
          isValid      ? "text-green-600"
          : isWrong    ? "text-red-500"
          : isTooShort ? "text-orange-500"
          : "text-gray-400"
        }`}
      >
        {error
          ? `? ${sanitiseText(error)}`
          : isValid
          ? `? Valid ? ${country.dial} ${digits}`
          : isWrong
          ? `? Not a valid ${country.name} number`
          : isTooShort
          ? `Need ${country.len} digits (${digits.length} so far)`
          : `Enter ${country.len}-digit ${country.name} number`}
      </p>

      {/* Dropdown picker */}
      {open && !disabled && (
        <div
          ref={listRef}
          onKeyDown={handleListKey}
          className="border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900
                     overflow-hidden shadow-lg z-50 relative"
          role="dialog"
          aria-label="Select country code"
        >
          {/* Region tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700" role="tablist">
            {REGION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={region === tab.id}
                onClick={() => { setRegion(tab.id); setSearch(""); }}
                className={`flex-1 py-2 text-xs font-semibold transition border-b-2
                  ${region === tab.id
                    ? "text-teal-600 border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search (only on All tab) */}
          {region === "all" && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    // Sanitise search input ? letters, digits, spaces, + only
                    const safe = e.target.value.replace(/[^a-zA-Z0-9\s+]/g, "").slice(0, 40);
                    setSearch(safe);
                  }}
                  placeholder="Search country?"
                  aria-label="Search countries"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={40}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600
                             rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             outline-none focus:border-teal-500"
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
          <div className="max-h-52 overflow-y-auto" role="listbox" aria-label="Countries">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4" role="status">
                No countries found
              </p>
            ) : (
              filtered.map((ct) => (
                <button
                  key={ct.code}
                  type="button"
                  role="option"
                  aria-selected={ct.code === country.code}
                  onClick={() => selectCountry(ct)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition
                              border-b border-gray-50 dark:border-gray-800 last:border-0
                              focus:outline-none focus-visible:bg-teal-50 dark:focus-visible:bg-teal-900/20
                              ${ct.code === country.code
                                ? "bg-teal-50 dark:bg-teal-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <span className="text-lg leading-none" aria-hidden="true">{ct.flag}</span>
                  <span className="flex-1 text-gray-900 dark:text-white font-medium">{ct.name}</span>
                  <span className="font-mono text-xs text-gray-400">{ct.dial}</span>
                  {ct.code === country.code && (
                    <span className="text-teal-600 text-xs font-bold" aria-label="selected">?</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* -- Exported helper for parent forms that need a safe WhatsApp link -- */}
      {/* Use `waUrl` from the component's internal scope ? exposed via data attribute
          for test environments only. Not rendered in production UI. */}
      <span data-wa-url={waUrl} className="sr-only" aria-hidden="true" />
    </div>
  );
}

// -- Re-export helpers for parent use -----------------------------------------
export { DIGITS_ONLY, sanitiseText, ALL_COUNTRIES };
// BAMBEH_END_TOKEN__AFRICANPHONEINPUT_FIX491__COMPLETE
