// BAMBEH_DEPLOY_TOKEN__AFRICANPHONEINPUT_FIX813_CLEAN
/**
 * src/components/AfricanPhoneInput.tsx - FIX813 (replaces FIX776)
 *
 * FIX813, Big 18 Oct 2026: "can we make people in the rest of the world create accounts with their phone number".
 *  - THE WHOLE WORLD IN THE PICKER: loading this box loads the rest of the world (world.ts, FIX811). The list shows
 *    the countries open on Bambeh first, then the other African countries, then the rest of the world - with the
 *    search box on top (type a name in English, French or Arabic, or +33).
 *  - scope="open" (a new account) still offers only the countries switched on in Command Center > Countries.
 *  - A number typed with + or 00 picks its country by itself, wherever it is. Without +, an African number with its
 *    code is still read (237677123456); outside Africa the + is needed (or the country chosen in the picker).
 * FIX776 (replaces FIX492):
 *
 * The phone box with a country picker, for every form that asks for a phone number (password help today).
 * FIX776, Big 15 Oct 2026: "we are using the ecowas and cemac phone number system, with Cameroon and a few other
 * countries selected or proposed but most especially cameroon".
 *  - The countries and their number rules come from ONE list for the whole app (src/lib/africa/countries.ts,
 *    FIX768): all 54 African countries, Google's current mobile rules. The FIX492 list was out of date (Benin
 *    has 10 digits since 2024, Cote d'Ivoire since 2021, Cameroon's 2-numbers were refused...).
 *  - The countries Bambeh is open in (Command Center > Countries, FIX779) come first. scope="open" shows only
 *    those (for a NEW account); the default "any" adds the rest of Africa below, so somebody whose country was
 *    open when they joined can always reach their account.
 *  - Cameroon stays exactly as phone sign-in has always accepted it: 9 digits starting with 6 or 2.
 *  - Five languages. No WhatsApp link is built any more (no phone or WhatsApp numbers in the app).
 *  - SAME USE AS BEFORE: <AfricanPhoneInput value onChange={(full, valid) => ...} label required error className
 *    disabled />, onChange still gets "+237677123456" and true/false; Country, CENTRAL_AFRICA, WEST_AFRICA,
 *    validatePhone, DIGITS_ONLY, sanitiseText and ALL_COUNTRIES are still exported.
 *  - NEW: CountryPicker - just the flag button with its list, used by the sign-up and sign-in pages.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import {
  AFRICA, HOME, countryByCode, countryLang, countryName, countryOfDigits, flagOf, formatNational, isWorld, lengthsText, nationalNumber,
  phoneCountries, sortCountries,
} from '@/lib/africa/countries';
import '@/lib/africa/world'; // FIX813 - the rest of the world (FIX811) for this box
import type { AfricaCountry, CountryLang } from '@/lib/africa/countries';
import { useOpenCountries } from '@/lib/africa/useOpenCountries';

// ------------------------------------------------------------------ the same helpers as FIX492
/** Strip every character that is not a digit. */
const DIGITS_ONLY = (s: string): string => String(s || '').replace(/\D/g, '');
/** No phone number anywhere is longer than this. */
const HARD_MAX_LEN = 15;
/** Remove characters that have no place in a name or a search. */
const sanitiseText = (s: unknown): string => (typeof s === 'string' ? s.replace(/[<>"'`]/g, '') : '');

export interface Country {
  readonly flag: string;
  readonly name: string;
  /** "+237" */
  readonly dial: string;
  readonly code: string;
  /** the longest number there (digits only) */
  readonly len: number;
  readonly pattern: RegExp;
}

function legacy(c: AfricaCountry): Country {
  return Object.freeze({ flag: flagOf(c.code), name: c.en, dial: '+' + c.dial, code: c.code, len: Math.max(...c.lens), pattern: c.mobile });
}
function pick(codes: string[]): readonly Country[] {
  return Object.freeze(codes.map((k) => countryByCode(k)).filter((c): c is AfricaCountry => !!c).map(legacy));
}

/** The groups FIX492 offered, kept for any page that still reads them. */
export const CENTRAL_AFRICA: readonly Country[] = pick(['CM', 'CD', 'CG', 'GA', 'TD', 'CF', 'GQ', 'ST', 'BI', 'RW']);
export const WEST_AFRICA: readonly Country[] = pick(['NG', 'GH', 'SN', 'CI', 'BF', 'ML', 'GN', 'BJ', 'TG', 'SL', 'LR', 'GM', 'GW', 'CV', 'NE', 'MR']);
const ALL_COUNTRIES: readonly Country[] = Object.freeze(AFRICA.map(legacy).sort((a, b) => a.name.localeCompare(b.name)));

/** True when these digits are a mobile number of that country (a home 0 is allowed: 0802... in Nigeria). */
export function validatePhone(digits: string, country: Country): boolean {
  const d = DIGITS_ONLY(digits);
  return d.length <= HARD_MAX_LEN && nationalNumber(d, country.code) !== null;
}

// ------------------------------------------------------------------ words
type Words = {
  label: string; country: string; search: string; open: string; other: string; world: string; none: string; valid: string;
  wrong: string; short: string; hint: string; code: string; digits: string; required: string;
};
const T: Record<CountryLang, Words> = {
  en: {
    label: 'Phone number', country: 'Country', search: 'Search a country', open: 'Countries open on Bambeh', other: 'Other African countries', world: 'Rest of the world',
    none: 'No country found', valid: 'Valid number', wrong: 'Not a valid number for {country}', short: 'Needs {n} digits ({k} so far)',
    hint: '{country}: {n} digits, e.g. {example}', code: 'Country: {country} +{dial}', digits: 'Phone number in {country}', required: 'required',
  },
  fr: {
    label: 'Num\u00e9ro de t\u00e9l\u00e9phone', country: 'Pays', search: 'Chercher un pays', open: 'Pays ouverts sur Bambeh',
    other: 'Autres pays africains', world: 'Reste du monde', none: 'Aucun pays trouv\u00e9', valid: 'Num\u00e9ro valide', wrong: 'Num\u00e9ro non valable ({country})',
    short: 'Il faut {n} chiffres ({k} pour l\u2019instant)', hint: '{country} : {n} chiffres, ex. {example}', code: 'Pays : {country} +{dial}',
    digits: 'Num\u00e9ro de t\u00e9l\u00e9phone ({country})', required: 'obligatoire',
  },
  pidgin: {
    label: 'Phone number', country: 'Country', search: 'Find country', open: 'Country dem wey Bambeh dey', other: 'Other Africa country dem', world: 'The rest of the world',
    none: 'No country', valid: 'Number correct', wrong: 'This number no correct for {country}', short: 'E need {n} numbers ({k} now)',
    hint: '{country}: {n} numbers, like {example}', code: 'Country: {country} +{dial}', digits: 'Phone number for {country}', required: 'you must put am',
  },
  ar: {
    label: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641', country: '\u0627\u0644\u0628\u0644\u062f',
    search: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0628\u0644\u062f', open: '\u0627\u0644\u0628\u0644\u062f\u0627\u0646 \u0627\u0644\u0645\u062a\u0627\u062d\u0629 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
    other: '\u0628\u0644\u062f\u0627\u0646 \u0623\u0641\u0631\u064a\u0642\u064a\u0629 \u0623\u062e\u0631\u0649', world: '\u0628\u0627\u0642\u064a \u0627\u0644\u0639\u0627\u0644\u0645', none: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0628\u0644\u062f',
    valid: '\u0631\u0642\u0645 \u0635\u0627\u0644\u062d', wrong: '\u0631\u0642\u0645 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d \u0641\u064a {country}',
    short: '\u064a\u0644\u0632\u0645 {n} \u0623\u0631\u0642\u0627\u0645 (\u0627\u0644\u0622\u0646 {k})', hint: '{country}: {n} \u0623\u0631\u0642\u0627\u0645\u060c \u0645\u062b\u0644 {example}',
    code: '\u0627\u0644\u0628\u0644\u062f: {country} +{dial}', digits: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0641\u064a {country}',
    required: '\u0625\u0644\u0632\u0627\u0645\u064a',
  },
  ff: {
    label: 'Limoore telefon', country: 'Leydi', search: 'Yiylo leydi', open: 'Ley\u0257e \u0257e Bambeh woni', other: 'Ley\u0257e Afrik goo', world: 'Ley\u0257e aduna goo',
    none: 'Alaa leydi', valid: 'Limoore mo\u01b4\u01b4ii', wrong: 'Limoore nde mo\u01b4\u01b4aani ({country})', short: 'Limooje {n} ina njiddaa ({k} jooni)',
    hint: '{country}: limooje {n}, wano {example}', code: 'Leydi: {country} +{dial}', digits: 'Limoore telefon ({country})', required: 'ina wa\u0257\u0257ii',
  },
};
function fill(s: string, v: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] !== undefined ? String(v[k]) : m));
}

let seq = 0;
function useStableId(prefix: string): string {
  const r = useRef('');
  if (!r.current) { seq += 1; r.current = prefix + '-' + seq; }
  return r.current;
}

// ------------------------------------------------------------------ the list of countries (shared by both pickers)
function CountryMenu({
  codes, others, value, lang, onPick, onClose,
}: {
  codes: readonly string[]; others: readonly string[]; value: string; lang: CountryLang;
  onPick: (code: string) => void; onClose: () => void;
}) {
  const t = T[lang];
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const many = codes.length + others.length > 8;
  useEffect(() => {
    if (many) { const id = window.setTimeout(() => searchRef.current?.focus(), 30); return () => window.clearTimeout(id); }
    return undefined;
  }, [many]);
  const want = sanitiseText(q).toLowerCase().trim();
  const hit = (c: AfricaCountry) => !want || countryName(c.code, lang).toLowerCase().indexOf(want) >= 0 || c.en.toLowerCase().indexOf(want) >= 0
    || c.fr.toLowerCase().indexOf(want) >= 0 || ('+' + c.dial).indexOf(want) >= 0 || c.code.toLowerCase() === want;
  const first = sortCountries(codes, lang).filter(hit);
  // FIX813 - the other African countries, then the rest of the world
  const rest = sortCountries(others.filter((k) => !isWorld(k)), lang).filter(hit);
  const world = sortCountries(others.filter((k) => isWorld(k)), lang).filter(hit);
  const row = (c: AfricaCountry): ReactNode => (
    <button key={c.code} type="button" role="option" aria-selected={c.code === value} data-country={c.code}
            onClick={() => onPick(c.code)}
            className={'flex w-full items-center gap-3 border-b border-gray-50 px-4 py-2.5 text-left text-sm last:border-0 '
              + (c.code === value ? 'bg-teal-50' : 'hover:bg-gray-50')}>
      <span className="text-lg leading-none" aria-hidden="true">{flagOf(c.code)}</span>
      <span className="flex-1 font-medium text-gray-900">{countryName(c.code, lang)}</span>
      <span className="font-mono text-xs text-gray-500" dir="ltr">+{c.dial}</span>
      {c.code === value && <Check className="h-4 w-4 text-teal-600" aria-hidden="true" />}
    </button>
  );
  return (
    <div role="dialog" aria-label={t.country} data-country-menu="1"
         onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Escape') onClose(); }}
         className="absolute z-50 mt-1 w-72 max-w-[85vw] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
      {many && (
        <div className="border-b border-gray-100 px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input ref={searchRef} type="text" value={q} maxLength={40} autoComplete="off" spellCheck={false} placeholder={t.search}
                   aria-label={t.search} onChange={(e) => setQ(e.target.value.slice(0, 40))} data-country-search="1"
                   className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-teal-500" />
          </div>
        </div>
      )}
      <div className="max-h-64 overflow-y-auto" role="listbox" aria-label={t.country}>
        {first.length > 0 && others.length > 0 && (
          <p className="bg-gray-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">{t.open}</p>
        )}
        {first.map(row)}
        {rest.length > 0 && <p className="bg-gray-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">{t.other}</p>}
        {rest.map(row)}
        {world.length > 0 && <p className="bg-gray-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500" data-world-head="1">{t.world}</p>}
        {world.map(row)}
        {first.length + rest.length + world.length === 0 && <p className="py-4 text-center text-sm text-gray-400" role="status">{t.none}</p>}
      </div>
    </div>
  );
}

function useOutside(ref: { current: HTMLElement | null }, on: boolean, close: () => void): void {
  useEffect(() => {
    if (!on) return undefined;
    const down = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', down);
    document.addEventListener('touchstart', down);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('touchstart', down);
    };
  }, [ref, on, close]);
}

/**
 * Just the country button (flag and dial code) with its list. One country only: a plain label, nothing to open.
 * Used by the sign-up page (the open countries) and the sign-in page.
 */
export function CountryPicker({
  value, codes, others = [], onChange, lang, disabled = false, className = '',
}: {
  value: string; codes: readonly string[]; others?: readonly string[]; onChange: (code: string) => void;
  lang?: unknown; disabled?: boolean; className?: string;
}) {
  const l = countryLang(lang);
  const t = T[l];
  const c = countryByCode(value) || (countryByCode(HOME) as AfricaCountry);
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setMenu(false), []);
  useOutside(wrap, menu, close);
  const single = codes.length + others.length <= 1;
  const face = (
    <>
      <span className="text-lg leading-none" aria-hidden="true">{flagOf(c.code)}</span>
      <span className="font-mono text-sm" dir="ltr">+{c.dial}</span>
    </>
  );
  if (single) {
    return (
      <span className={'inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3 text-gray-700 ' + className}
            data-country-fixed={c.code} title={countryName(c.code, l)}>
        {face}
      </span>
    );
  }
  return (
    <div ref={wrap} className={'relative inline-flex ' + className}>
      <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={menu} data-country-button={c.code}
              aria-label={fill(t.code, { country: countryName(c.code, l), dial: c.dial })}
              onClick={() => { if (!disabled) setMenu((v) => !v); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50">
        {face}
        {menu ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />}
      </button>
      {menu && (
        <div className="absolute left-0 top-full rtl:left-auto rtl:right-0">
          <CountryMenu codes={codes} others={others} value={c.code} lang={l} onClose={close}
                       onPick={(k) => { setMenu(false); if (k !== c.code) onChange(k); }} />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ the phone box
interface Props {
  value?: string;
  onChange: (fullNumber: string, isValid: boolean) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
  /** 'open': only the countries Bambeh is open in (a new account). 'any' (default): those first, then all of Africa. */
  scope?: 'any' | 'open';
  /** the country to start with when value has none (default: Cameroon) */
  defaultCountry?: string;
}

/** "+237677123456", "00237...", "237677123456" or "677123456" -> the country and the digits after its code. */
function startOf(value: string | undefined, fallback: string): { code: string; local: string } {
  const v = String(value || '').trim();
  const home = countryByCode(fallback) ? String(fallback).toUpperCase() : HOME;
  if (v.indexOf('+') === 0 || v.indexOf('00') === 0) {
    const d = DIGITS_ONLY(v.indexOf('00') === 0 ? v.slice(2) : v);
    const c = countryOfDigits(d);
    if (c) return { code: c.code, local: d.slice(c.dial.length).slice(0, HARD_MAX_LEN) };
  }
  const d = DIGITS_ONLY(v).slice(0, HARD_MAX_LEN);
  if (d && nationalNumber(d, home) === null) {
    // written with its country code but no + (the sign-in page hands numbers over like that) - African numbers only
    const c = countryOfDigits(d);
    if (c && !isWorld(c.code) && nationalNumber(d.slice(c.dial.length), c.code) !== null) return { code: c.code, local: d.slice(c.dial.length) };
  }
  return { code: home, local: d };
}

export default function AfricanPhoneInput({
  value, onChange, label, required, error, className = '', disabled = false, scope = 'any', defaultCountry = HOME,
}: Props) {
  const lang = countryLang(useLang());
  const t = T[lang];
  const open = useOpenCountries();
  const [start] = useState(() => startOf(value, defaultCountry));
  const [code, setCode] = useState<string>(start.code);
  const [local, setLocal] = useState<string>(start.local);
  const last = useRef('');
  const hintId = useStableId('phone-hint');
  const inputId = useStableId('phone-input');

  const openCodes = open.signup;
  const allowed = scope === 'open' ? openCodes : null;
  // FIX813 - every country loaded here (Africa and the rest of the world) that is not open yet
  const others = useMemo(() => (scope === 'open' ? [] : phoneCountries().map((c) => c.code).filter((k) => openCodes.indexOf(k) < 0)), [scope, openCodes]);
  const c = countryByCode(code) || (countryByCode(HOME) as AfricaCountry);

  const emit = useCallback((raw: string, k: string) => {
    const cc = countryByCode(k) || (countryByCode(HOME) as AfricaCountry);
    const digits = DIGITS_ONLY(raw).slice(0, HARD_MAX_LEN);
    const nat = nationalNumber(digits, cc.code);
    const ok = !!nat && (!allowed || allowed.indexOf(cc.code) >= 0);
    const full = '+' + cc.dial + (nat || digits);
    const key = full + '|' + (ok ? '1' : '0');
    if (key !== last.current) {
      last.current = key;
      onChange(full, ok);
    }
  }, [allowed, onChange]);

  // a country switched off for new accounts while this page is open: back to Cameroon
  useEffect(() => {
    if (allowed && open.checked && allowed.indexOf(code) < 0) {
      setCode(HOME);
      emit(local, HOME);
    }
  }, [allowed, open.checked, code, local, emit]);

  const onType = (v: string) => {
    const raw = v.replace(/[^\d\s]/g, '');
    if (DIGITS_ONLY(raw).length > HARD_MAX_LEN) return;
    setLocal(raw);
    emit(raw, code);
  };
  const onCountry = (k: string) => {
    setCode(k);
    emit(local, k);
  };

  const digits = DIGITS_ONLY(local);
  const nat = nationalNumber(digits, c.code);
  const isValid = !!nat && (!allowed || allowed.indexOf(c.code) >= 0);
  const minLen = Math.min(...c.lens);
  const isShort = digits.length > 0 && !isValid && digits.length < minLen;
  const isWrong = digits.length > 0 && !isValid && !isShort;
  const name = countryName(c.code, lang);
  const shown = label === undefined ? t.label : label;

  return (
    <div className={'space-y-1 ' + className} dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX776">
      {shown && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {shown}
          {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> ({t.required})</span>}
        </label>
      )}
      <div className="flex gap-2" role="group" aria-label={shown || t.label} dir="ltr">
        <CountryPicker value={c.code} codes={allowed ? allowed : openCodes} others={others} onChange={onCountry} lang={lang}
                       disabled={disabled} className="py-2.5" />
        <input id={inputId} type="tel" inputMode="numeric" autoComplete="tel-national" value={local} disabled={disabled}
               onChange={(e) => onType(e.target.value)} maxLength={HARD_MAX_LEN + 4} dir="ltr"
               placeholder={c.code === HOME ? '6XX XXX XXX' : formatNational(c.example, c.code)}
               aria-label={fill(t.digits, { country: name })} aria-invalid={!!error || isWrong} aria-describedby={hintId}
               className={'min-w-0 flex-1 rounded-xl border-2 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 outline-none transition-colors '
                 + 'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white '
                 + (error || isWrong ? 'border-red-400 focus:border-red-500' : isValid ? 'border-green-500 focus:border-green-600'
                   : 'border-gray-200 focus:border-teal-500 dark:border-gray-600')} />
      </div>
      <p id={hintId} role={isWrong || error ? 'alert' : 'status'} aria-live="polite"
         className={'mt-0.5 text-xs ' + (error ? 'text-red-500' : isValid ? 'text-green-600' : isWrong ? 'text-red-500' : isShort ? 'text-orange-500' : 'text-gray-500')}>
        {error
          ? '\u26a0 ' + sanitiseText(error)
          : isValid
            ? '\u2713 ' + t.valid + ' \u00b7 +' + c.dial + ' ' + formatNational(nat as string, c.code)
            : isWrong
              ? '\u2717 ' + fill(t.wrong, { country: name })
              : isShort
                ? fill(t.short, { n: lengthsText(c.code), k: digits.length })
                : fill(t.hint, { country: name, n: lengthsText(c.code), example: c.code === HOME ? '6 77 12 34 56' : formatNational(c.example, c.code) })}
      </p>
    </div>
  );
}

export { DIGITS_ONLY, sanitiseText, ALL_COUNTRIES };
// BAMBEH_END_TOKEN__AFRICANPHONEINPUT_FIX813__COMPLETE
