import React, { createContext, useContext, useState, useEffect } from "react";

const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home", jobs: "Jobs", marketplace: "Marketplace",
    services: "Services", rentals: "Rentals", sell: "Sell",
    buy: "Buy", search: "Search", login: "Login", register: "Register",
    logout: "Logout", settings: "Settings", favorites: "Favorites",
    orders: "Orders", community: "Community", next: "Next", submit: "Submit",
  },
  fr: {
    home: "Accueil", jobs: "Emplois", marketplace: "Marché",
    services: "Services", rentals: "Locations", sell: "Vendre",
    buy: "Acheter", search: "Rechercher", login: "Connexion",
    register: "S'inscrire", logout: "Déconnexion", settings: "Paramètres",
    favorites: "Favoris", orders: "Commandes", community: "Communauté",
    next: "Suivant", submit: "Soumettre",
  },
  // Add more languages here (pidgin, fulfulde, etc.)
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() =>
    localStorage.getItem("bambeh_language") || "en"
  );

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("bambeh_language", lang);
  };

  const t = (key: string): string =>
    translations[language]?.[key] ?? translations["en"]?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
