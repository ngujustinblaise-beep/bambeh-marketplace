import React, { createContext, useContext, useState } from "react";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

type LanguageContextType = {
  language: LangCode;
  setLanguage: React.Dispatch<React.SetStateAction<LangCode>>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LangCode>("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
