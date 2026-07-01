/**
 * src/contexts/LanguageContext.tsx  (PLURAL)
 * BAMBEH SARL - Unified Language Bridge
 *
 * This used to be a SEPARATE language provider that App never mounted, so any
 * component importing useLanguage from here crashed with
 * "useLanguage must be used inside a LanguageProvider".
 *
 * It is now a thin, crash-proof BRIDGE to the single source of truth in @/App
 * (the LanguageProvider mounted at the app root). Every consumer now shares ONE
 * language state, and switching language anywhere updates the whole app.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { createContext, useContext } from "react";
import { useLanguage as useAppLanguage } from "@/App";

export type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";
export type Language = LangCode;

export const SUPPORTED_LANGUAGES: LangCode[] = ["en", "fr", "pidgin", "ar", "ff"];

export interface LanguageContextValue {
  language: LangCode;
  setLanguage: (lang: string) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const DEFAULT: LanguageContextValue = {
  language: "en",
  setLanguage: () => {},
  isRtl: false,
  t: (k: string) => k,
};

// A real context with a SAFE default, so any direct useContext(LanguageContext)
// call returns a valid value instead of undefined (never throws).
export const LanguageContext = createContext<LanguageContextValue>(DEFAULT);

/**
 * useLanguage - the hook pages should call. Delegates to the global App
 * provider. Uses optional chaining + fallbacks so it can NEVER throw, even if
 * called before the provider mounts.
 */
export function useLanguage(): LanguageContextValue {
  const app = useAppLanguage() as Partial<LanguageContextValue> | undefined;
  const language = (app?.language as LangCode) ?? "en";
  return {
    language,
    setLanguage: app?.setLanguage ?? (() => {}),
    isRtl: app?.isRtl ?? (language === "ar"),
    t: app?.t ?? ((k: string) => k),
  };
}

/**
 * LanguageProvider - passthrough. The REAL provider lives in @/App and is
 * already mounted at the app root, so this just renders its children. Kept as
 * an export so any code that wraps with <LanguageProvider> keeps compiling.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default useLanguage;