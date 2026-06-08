/**
 * src/hooks/useAppLang.ts — Bambeh Marketplace
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * App-wide language hook. Reads the active language from LanguageContext
 * and re-exports `t()` from the master translation dictionary.
 *
 * REPLACES and SUPERSEDES:
 *   @/hooks/useFarmFreshLang  ← still works (re-exports from here)
 *
 * USAGE (any page or component):
 *   import { useLang, t } from "@/hooks/useAppLang";
 *
 *   const lang = useLang();
 *   <p>{t("save", lang)}</p>
 *   <p>{(t("confirmPay", lang) as (n: number) => string)(totalXAF)}</p>
 *
 * RTL helper:
 *   const isRtl = lang === "ar";
 *   <div dir={isRtl ? "rtl" : "ltr"}>…</div>
 */

import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import { t as translateFn, AppLang } from "@/i18n/appTranslations";

export type { AppLang };

/**
 * Returns the currently selected app language code.
 * Falls back to "en" if LanguageContext is not mounted.
 */
export function useLang(): AppLang {
  const ctx = useContext(LanguageContext);
  // LanguageContext stores the language string; cast + validate it.
  const raw: string = (ctx as any)?.language ?? "en";
  const valid: AppLang[] = ["en", "fr", "pcm", "ar", "ff"];
  return valid.includes(raw as AppLang) ? (raw as AppLang) : "en";
}

/**
 * Translate a key into the given language.
 * Re-exports the `t` function from appTranslations for convenience.
 *
 * Example:
 *   t("cancel", lang)              → "Annuler"  (fr)
 *   t("confirmPay", lang)(5000)    → "Payer 5 000 XAF"
 */
export { translateFn as t };
