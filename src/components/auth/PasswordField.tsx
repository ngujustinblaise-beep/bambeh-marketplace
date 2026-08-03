// BAMBEH_DEPLOY_TOKEN__PASSWORDFIELD_FIX276_CLEAN
// FILE LOCATION: src/components/auth/PasswordField.tsx
//
// FIX276 - Three tester requests in one component:
//   1. An eye button to reveal what you typed
//   2. A battery that fills red -> orange -> amber -> green -> blue as the
//      password gets stronger, with a line telling you how to improve it
//   3. A green tick the moment the confirm field matches
//
// Deliberately kept dependency-free apart from lucide icons, so it can drop
// into Register, Login, ResetPassword and ChangePassword unchanged.

import { useMemo, useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

/* ---------------- language (display only) ---------------- */

type LangCode = "en" | "fr" | "pcm" | "ar" | "ff";

function currentLang(): LangCode {
  let raw = "";
  try {
    raw = String(localStorage.getItem("Bambeh_language") || "").toLowerCase();
  } catch {
    raw = "";
  }
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("ff") || raw.startsWith("ful")) return "ff";
  if (raw.startsWith("pcm") || raw.startsWith("pid")) return "pcm";
  return "en";
}

const T: Record<LangCode, {
  levels: string[];
  addLength: string;
  addNumber: string;
  addUpper: string;
  addSymbol: string;
  match: string;
  noMatch: string;
  show: string;
  hide: string;
}> = {
  en: {
    levels: ["Very weak", "Weak", "Fair", "Strong", "Very strong"],
    addLength: "Use at least 8 characters",
    addNumber: "Add a number",
    addUpper: "Add a capital letter",
    addSymbol: "Add a symbol like ! or #",
    match: "Passwords match",
    noMatch: "Passwords do not match",
    show: "Show password",
    hide: "Hide password",
  },
  fr: {
    levels: ["Tr\u00E8s faible", "Faible", "Moyen", "Fort", "Tr\u00E8s fort"],
    addLength: "Utilisez au moins 8 caract\u00E8res",
    addNumber: "Ajoutez un chiffre",
    addUpper: "Ajoutez une majuscule",
    addSymbol: "Ajoutez un symbole comme ! ou #",
    match: "Les mots de passe correspondent",
    noMatch: "Les mots de passe ne correspondent pas",
    show: "Afficher le mot de passe",
    hide: "Masquer le mot de passe",
  },
  pcm: {
    levels: ["Weak well well", "Weak", "Fair", "Strong", "Strong well well"],
    addLength: "Make e reach 8 characters",
    addNumber: "Put number inside",
    addUpper: "Put capital letter",
    addSymbol: "Put symbol like ! or #",
    match: "The passwords match",
    noMatch: "The passwords no match",
    show: "Show password",
    hide: "Hide password",
  },
  ar: {
    levels: [
      "\u0636\u0639\u064A\u0641\u0629 \u062C\u062F\u0627\u064B",
      "\u0636\u0639\u064A\u0641\u0629",
      "\u0645\u062A\u0648\u0633\u0637\u0629",
      "\u0642\u0648\u064A\u0629",
      "\u0642\u0648\u064A\u0629 \u062C\u062F\u0627\u064B",
    ],
    addLength: "\u0627\u0633\u062A\u062E\u062F\u0645 8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    addNumber: "\u0623\u0636\u0641 \u0631\u0642\u0645\u0627\u064B",
    addUpper: "\u0623\u0636\u0641 \u062D\u0631\u0641\u0627\u064B \u0643\u0628\u064A\u0631\u0627\u064B",
    addSymbol: "\u0623\u0636\u0641 \u0631\u0645\u0632\u0627\u064B \u0645\u062B\u0644 ! \u0623\u0648 #",
    match: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u0627\u0646",
    noMatch: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646",
    show: "\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    hide: "\u0625\u062E\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
  },
  ff: {
    levels: ["Lo\u0253\u0257i sanne", "Lo\u0253\u0257i", "Hakkunde", "Sembi\u0257i", "Sembi\u0257i sanne"],
    addLength: "Waɗ e alkulal 8 walla \u0253urde",
    addNumber: "\u0181eydu limngal",
    addUpper: "\u0181eydu alkulal mawngal",
    addSymbol: "\u0181eydu maande wano ! walla #",
    match: "Mo\u0263\u0263e \u0257ee ina ndoo\u0257i",
    noMatch: "Mo\u0263\u0263e \u0257ee ndoo\u0257aani",
    show: "Hollu mo\u0263\u0263ere",
    hide: "Suu\u0257 mo\u0263\u0263ere",
  },
};

/* ---------------- strength scoring ---------------- */

export function passwordScore(pw: string): number {
  if (!pw) return -1;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  // a short password can never read as strong however varied it is
  if (pw.length < 8) s = Math.min(s, 1);
  return Math.min(s, 4);
}

const BAR = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-400",
  "bg-green-500",
  "bg-blue-600",
];

const TEXT = [
  "text-red-600",
  "text-orange-600",
  "text-amber-600",
  "text-green-600",
  "text-blue-700",
];

/* ---------------- the component ---------------- */

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  /** show the strength battery and the advice line */
  showStrength?: boolean;
  /** compare against this value and show a tick or a cross */
  matchWith?: string;
  placeholder?: string;
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  showStrength = false,
  matchWith,
  placeholder,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const lang = currentLang();
  const t = T[lang];

  const score = useMemo(() => passwordScore(value), [value]);

  const advice = useMemo(() => {
    if (!value) return "";
    if (value.length < 8) return t.addLength;
    if (!/[0-9]/.test(value)) return t.addNumber;
    if (!(/[a-z]/.test(value) && /[A-Z]/.test(value))) return t.addUpper;
    if (!/[^A-Za-z0-9]/.test(value)) return t.addSymbol;
    return "";
  }, [value, t]);

  const showMatch = typeof matchWith === "string" && value.length > 0 && matchWith.length > 0;
  const matches = showMatch && value === matchWith;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t.hide : t.show}
          title={visible ? t.hide : t.show}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-gray-700"
          style={{ minHeight: "44px" }}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* the battery */}
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={
                  "h-1.5 flex-1 rounded-full transition-colors " +
                  (i <= score ? BAR[score] : "bg-gray-200")
                }
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className={"text-xs font-semibold " + TEXT[score]}>
              {t.levels[score]}
            </span>
            {advice && <span className="text-xs text-gray-500">{advice}</span>}
          </div>
        </div>
      )}

      {/* the tick */}
      {showMatch && (
        <p
          className={
            "mt-1.5 flex items-center gap-1 text-xs font-medium " +
            (matches ? "text-green-600" : "text-red-600")
          }
        >
          {matches ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {matches ? t.match : t.noMatch}
        </p>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__PASSWORDFIELD_FIX276__COMPLETE
