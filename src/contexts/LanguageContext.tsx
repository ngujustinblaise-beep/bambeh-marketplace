/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE CONTEXT - MULTI-LANGUAGE TRANSLATION SYSTEM
 * FILE LOCATION: src/contexts/LanguageContext.tsx
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'en' | 'fr' | 'pcm' | 'ff' | 'ha' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

interface LanguageContextType {
  language: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: LanguageInfo[];
  isRTL: boolean;
}

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en',  name: 'English',        nativeName: 'English',    flag: '🇬🇧', rtl: false },
  { code: 'fr',  name: 'French',         nativeName: 'Français',   flag: '🇫🇷', rtl: false },
  { code: 'pcm', name: 'Pidgin English', nativeName: 'Pidgin',     flag: '🇨🇲', rtl: false },
  { code: 'ff',  name: 'Fulfulde',       nativeName: 'Fulfulde',   flag: '🇨🇲', rtl: false },
  { code: 'ha',  name: 'Hausa',          nativeName: 'Hausa',      flag: '🇳🇬', rtl: false },
  { code: 'ar',  name: 'Arabic',         nativeName: 'العربية',    flag: '🇸🇦', rtl: true  },
];

const translations: Record<LanguageCode, Record<string, any>> = {
  en: {
    common: {
      welcome: 'Welcome', home: 'Home', search: 'Search', login: 'Login',
      logout: 'Logout', register: 'Register', profile: 'Profile', settings: 'Settings',
      help: 'Help', about: 'About', contact: 'Contact', save: 'Save', cancel: 'Cancel',
      delete: 'Delete', edit: 'Edit', submit: 'Submit', loading: 'Loading...',
      error: 'Error', success: 'Success', back: 'Back', next: 'Next',
      continue: 'Continue', close: 'Close', yes: 'Yes', no: 'No', ok: 'OK',
      confirm: 'Confirm', viewAll: 'View All', seeMore: 'See More', filter: 'Filter',
      sort: 'Sort', share: 'Share', report: 'Report', viewDetails: 'View Details',
      itemNotUploaded: 'Item not uploaded yet but coming soon! Please check back later.',
    },
    nav: {
      jobs: 'Jobs', marketplace: 'Marketplace', services: 'Services', rentals: 'Rentals',
      vehicles: 'Vehicles', exchange: 'Exchange', cart: 'Cart', favorites: 'Favorites',
      notifications: 'Notifications',
    },
    auth: {
      signIn: 'Sign In', signUp: 'Sign Up', signOut: 'Sign Out',
      forgotPassword: 'Forgot Password?', rememberMe: 'Remember Me',
      createAccount: 'Create Account', alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?", username: 'Username',
      password: 'Password', confirmPassword: 'Confirm Password', email: 'Email',
      phone: 'Phone Number', enterUsername: 'Enter your username',
      enterPassword: 'Enter your password', loginSuccess: 'Login successful!',
      loginFailed: 'Login failed. Please try again.',
    },
    vendor: {
      vendorPortal: 'Vendor Portal', forEnterprises: 'For Enterprises',
      becomeVendor: 'Become a Vendor', vendorDashboard: 'Vendor Dashboard',
      manageListings: 'Manage Listings', viewAnalytics: 'View Analytics',
      secureDashboard: 'Secure Dashboard', premiumTools: 'Premium Tools',
      registerAsVendor: 'Register as Vendor', signInVendor: 'Sign In to Vendor Account',
      vendorRegistration: 'Vendor Registration', registrationFee: 'Registration Fee',
    },
    tracking: {
      trackOrders: 'Track Orders', trackGoods: 'Track Goods', orderStatus: 'Order Status',
      estimatedDelivery: 'Estimated Delivery', delivered: 'Delivered', inTransit: 'In Transit',
      processing: 'Processing', shipped: 'Shipped', outForDelivery: 'Out for Delivery',
      reportIssue: 'Report Issue', contactSeller: 'Contact Seller', viewOnMap: 'View on Map',
    },
    admin: {
      adminPortal: 'Admin Portal', dashboard: 'Dashboard', users: 'Users',
      transactions: 'Transactions', disputes: 'Disputes', analytics: 'Analytics',
      settings: 'Settings', inbox: 'Inbox', liveChat: 'Live Chat',
      createAdmin: 'Create Admin', manageUsers: 'Manage Users', blockUser: 'Block User',
      suspendUser: 'Suspend User', deleteUser: 'Delete User', resolveDispute: 'Resolve Dispute',
    },
    messages: {
      inbox: 'Inbox', sent: 'Sent', compose: 'Compose', newMessage: 'New Message',
      to: 'To', subject: 'Subject', message: 'Message', send: 'Send', reply: 'Reply',
      forward: 'Forward', markAsRead: 'Mark as Read', reportMessage: 'Report Message',
    },
    report: {
      reportIssue: 'Report Issue', issueType: 'Issue Type', description: 'Description',
      selectIssueType: 'Select Issue Type', scam: 'Scam / Fraud', fakeProduct: 'Fake Product',
      notAsDescribed: 'Not as Described', poorQuality: 'Poor Quality',
      notDelivered: 'Not Delivered', damagedItem: 'Damaged Item',
      sellerNotResponding: 'Seller Not Responding', inappropriateContent: 'Inappropriate Content',
      harassment: 'Harassment', other: 'Other', attachEvidence: 'Attach Evidence',
      submitReport: 'Submit Report', reportSubmitted: 'Report submitted successfully!',
    },
    voice: {
      voiceAssistant: 'Voice Assistant', listening: 'Listening...', speak: 'Speak now',
      tapToSpeak: 'Tap to speak', commandRecognized: 'Command recognized', tryAgain: 'Please try again',
    },
  }, // FIX: missing comma here — caused TS1005 on the fr block
  fr: {
    common: {
      welcome: 'Bienvenue', home: 'Accueil', search: 'Rechercher', login: 'Connexion',
      logout: 'Déconnexion', register: "S'inscrire", profile: 'Profil', settings: 'Paramètres',
      save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
      submit: 'Soumettre', loading: 'Chargement...', error: 'Erreur', success: 'Succès',
      back: 'Retour', next: 'Suivant', continue: 'Continuer', close: 'Fermer',
      yes: 'Oui', no: 'Non', ok: 'OK', confirm: 'Confirmer', viewAll: 'Voir tout',
      filter: 'Filtrer', sort: 'Trier', share: 'Partager', report: 'Signaler',
      viewDetails: 'Voir les détails',
    },
    nav: {
      jobs: 'Emplois', marketplace: 'Marché', services: 'Services', rentals: 'Locations',
      vehicles: 'Véhicules', exchange: 'Échange', cart: 'Panier', favorites: 'Favoris',
    },
    auth: {
      signIn: 'Se connecter', signUp: "S'inscrire", signOut: 'Se déconnecter',
      forgotPassword: 'Mot de passe oublié?', createAccount: 'Créer un compte',
      alreadyHaveAccount: 'Vous avez déjà un compte?', username: "Nom d'utilisateur",
      password: 'Mot de passe', email: 'Email', loginSuccess: 'Connexion réussie!',
    },
    vendor: { vendorPortal: 'Portail Vendeur', becomeVendor: 'Devenir Vendeur', signInVendor: 'Connexion Vendeur' },
    voice: { listening: 'Écoute en cours...', speak: 'Parlez maintenant' },
  },
  pcm: {
    common: {
      welcome: 'Welcome', home: 'Home', search: 'Find am', login: 'Enter', logout: 'Comot',
      save: 'Keep am', cancel: 'No do am', loading: 'E dey load...', error: 'Problem don happen',
    },
    nav: { jobs: 'Work', marketplace: 'Market', services: 'Work wey dem dey do' },
    auth: { signIn: 'Enter', signUp: 'Join', password: 'Password' },
    vendor: { vendorPortal: 'Seller Place' },
    voice: { listening: 'I dey hear...' },
  },
  ff: {
    common: { welcome: 'Jaaraama', home: 'Suudu', search: 'Yiyde', loading: 'Doose...' },
    nav: { jobs: 'Gollorɗe', marketplace: 'Luumo' },
    auth: { signIn: 'Naatirde', password: 'Dingiral' },
    vendor: { vendorPortal: 'Portal Jeyanɗo' },
    voice: { listening: 'Mi heɗiima...' },
  },
  ha: {
    common: { welcome: 'Barka da zuwa', home: 'Gida', search: 'Nema', loading: 'Ana lodawa...' },
    nav: { jobs: 'Ayyuka', marketplace: 'Kasuwa' },
    auth: { signIn: 'Shiga', password: 'Kalmar sirri' },
    vendor: { vendorPortal: 'Tashar Dillali' },
    voice: { listening: 'Ina sauraro...' },
  },
  ar: {
    common: { welcome: 'مرحباً', home: 'الرئيسية', search: 'بحث', loading: 'جاري التحميل...' },
    nav: { jobs: 'وظائف', marketplace: 'السوق' },
    auth: { signIn: 'تسجيل الدخول', password: 'كلمة المرور' },
    vendor: { vendorPortal: 'بوابة البائع' },
    voice: { listening: 'أستمع...' },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('Bambeh_language') as LanguageCode | null;
    if (saved && AVAILABLE_LANGUAGES.some(l => l.code === saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('Bambeh_language', lang);
    const info = AVAILABLE_LANGUAGES.find(l => l.code === lang);
    document.documentElement.dir = info?.rtl ? 'rtl' : 'ltr';
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys   = key.split('.');
    const langTr = translations[language] || translations.en;
    let value: any = langTr;
    for (const k of keys) { value = value?.[k]; if (value === undefined) break; }
    if (value === undefined) {
      let fallback: any = translations.en;
      for (const k of keys) { fallback = fallback?.[k]; }
      value = fallback ?? key;
    }
    if (typeof value !== 'string') return key;
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => String(params[k] ?? `{{${k}}}`));
    }
    return value;
  };

  const languageInfo = AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      language, languageInfo, setLanguage, t,
      availableLanguages: AVAILABLE_LANGUAGES,
      isRTL: languageInfo.rtl,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

export default LanguageContext;
