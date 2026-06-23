/**
 * UserSettings.tsx â€” Bambeh Marketplace
 * FILE LOCATION: src/pages/settings/UserSettings.tsx
 *
 * i18n: all visible settings strings live in the local S table below, keyed by
 * the live language (EN / FR / Pidgin / Arabic / Fulfulde). The page reads the
 * active language AND setLanguage from the ONE real provider â€” the inline
 * LanguageProvider exported from "@/App" â€” so the language selector reflects
 * the active language and the whole page re-renders instantly on change.
 *
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera, Heart, Package, List, LogOut, ChevronRight,
  Globe, Shield, Bell, User, Lock, AlertCircle, CheckCircle, Loader
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from '@/App';

type Tab = "general" | "notifications" | "privacy" | "security";
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "FranÃ§ais" },
  { code: "pidgin", name: "Pidgin" },
  { code: "ar", name: "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©" },
  { code: "ff", name: "Fulfulde" },
];

const NOTIF_KEYS = ["orderUpdates","newMessages","promotions","priceAlerts","systemAlerts","communityPosts","newJobs"] as const;
const PRIVACY_KEYS = ["showProfile","allowListings","showOnline","allowDM"] as const;

// i18n strings (local; keyed by live language)
const S: Record<Lang, {
  tab: { general: string; notifications: string; privacy: string; security: string };
  profilePhoto: string; uploading: string; changePhoto: string; photoHint: string;
  errImageType: string; errImageSize: string; photoSuccess: string; photoFail: string;
  langHint: string; account: string; editProfile: string; subscriptionPlans: string;
  session: string; signingOut: string; logoutHint: string; notifPrefs: string;
  notif: { orderUpdates: string; newMessages: string; promotions: string; priceAlerts: string; systemAlerts: string; communityPosts: string; newJobs: string };
  privacyControls: string;
  privacy: { showProfile: string; allowListings: string; showOnline: string; allowDM: string };
  privacyPolicy: string; termsOfService: string; security: string;
  changePassword: string; changePasswordHint: string; accountRecovery: string; accountRecoveryHint: string;
  dangerZone: string; dangerHint: string; deactivate: string;
  pageTitle: string; languageLabel: string; logout: string;
  myListings: string; favorites: string; orders: string;
}> = {
  en: {
    "tab": { "general": "General", "notifications": "Notifications", "privacy": "Privacy", "security": "Security" },
    "profilePhoto": "Profile Photo",
    "uploading": "Uploading...",
    "changePhoto": "Change Photo",
    "photoHint": "JPG, PNG up to 5MB",
    "errImageType": "Please select an image file (JPG, PNG, etc.)",
    "errImageSize": "Image must be smaller than 5MB",
    "photoSuccess": "Profile photo updated successfully!",
    "photoFail": "Photo upload failed. Please try again.",
    "langHint": "This changes the language of the entire app immediately.",
    "account": "Account",
    "editProfile": "Edit Profile",
    "subscriptionPlans": "Subscription Plans",
    "session": "Session",
    "signingOut": "Signing out...",
    "logoutHint": "You can log back in with your username, phone, or email.",
    "notifPrefs": "Notification Preferences",
    "notif": { "orderUpdates": "Order Updates", "newMessages": "New Messages", "promotions": "Promotions", "priceAlerts": "Price Alerts", "systemAlerts": "System Alerts", "communityPosts": "Community Posts", "newJobs": "New Jobs" },
    "privacyControls": "Privacy Controls",
    "privacy": { "showProfile": "Show my profile to other users", "allowListings": "Allow others to see my listings", "showOnline": "Show my online status", "allowDM": "Allow direct messages from strangers" },
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service",
    "security": "Security",
    "changePassword": "Change Password",
    "changePasswordHint": "Update your account password",
    "accountRecovery": "Account Recovery",
    "accountRecoveryHint": "Recover username or reset password",
    "dangerZone": "Danger Zone",
    "dangerHint": "These actions cannot be undone.",
    "deactivate": "Deactivate Account",
    "pageTitle": "Settings",
    "languageLabel": "Language",
    "logout": "Logout",
    "myListings": "My Listings",
    "favorites": "Favorites",
    "orders": "Orders",
  },
  fr: {
    "tab": { "general": "GÃ©nÃ©ral", "notifications": "Notifications", "privacy": "ConfidentialitÃ©", "security": "SÃ©curitÃ©" },
    "profilePhoto": "Photo de profil",
    "uploading": "TÃ©lÃ©versement...",
    "changePhoto": "Changer la photo",
    "photoHint": "JPG, PNG jusqu'Ã  5 Mo",
    "errImageType": "Veuillez choisir un fichier image (JPG, PNG, etc.)",
    "errImageSize": "L'image doit faire moins de 5 Mo",
    "photoSuccess": "Photo de profil mise Ã  jour !",
    "photoFail": "Ã‰chec du tÃ©lÃ©versement. Veuillez rÃ©essayer.",
    "langHint": "Ceci change la langue de toute l'application immÃ©diatement.",
    "account": "Compte",
    "editProfile": "Modifier le profil",
    "subscriptionPlans": "Forfaits d'abonnement",
    "session": "Session",
    "signingOut": "DÃ©connexion...",
    "logoutHint": "Vous pouvez vous reconnecter avec votre nom d'utilisateur, tÃ©lÃ©phone ou e-mail.",
    "notifPrefs": "PrÃ©fÃ©rences de notification",
    "notif": { "orderUpdates": "Suivi des commandes", "newMessages": "Nouveaux messages", "promotions": "Promotions", "priceAlerts": "Alertes de prix", "systemAlerts": "Alertes systÃ¨me", "communityPosts": "Publications de la communautÃ©", "newJobs": "Nouveaux emplois" },
    "privacyControls": "ContrÃ´les de confidentialitÃ©",
    "privacy": { "showProfile": "Montrer mon profil aux autres utilisateurs", "allowListings": "Autoriser les autres Ã  voir mes annonces", "showOnline": "Afficher mon statut en ligne", "allowDM": "Autoriser les messages directs d'inconnus" },
    "privacyPolicy": "Politique de confidentialitÃ©",
    "termsOfService": "Conditions d'utilisation",
    "security": "SÃ©curitÃ©",
    "changePassword": "Changer le mot de passe",
    "changePasswordHint": "Mettre Ã  jour le mot de passe du compte",
    "accountRecovery": "RÃ©cupÃ©ration du compte",
    "accountRecoveryHint": "RÃ©cupÃ©rer le nom d'utilisateur ou rÃ©initialiser le mot de passe",
    "dangerZone": "Zone de danger",
    "dangerHint": "Ces actions sont irrÃ©versibles.",
    "deactivate": "DÃ©sactiver le compte",
    "pageTitle": "ParamÃ¨tres",
    "languageLabel": "Langue",
    "logout": "DÃ©connexion",
    "myListings": "Mes annonces",
    "favorites": "Favoris",
    "orders": "Commandes",
  },
  pidgin: {
    "tab": { "general": "General", "notifications": "Notifications", "privacy": "Privacy", "security": "Security" },
    "profilePhoto": "Profile Photo",
    "uploading": "Dey upload...",
    "changePhoto": "Change Photo",
    "photoHint": "JPG, PNG up to 5MB",
    "errImageType": "Abeg choose image file (JPG, PNG, etc.)",
    "errImageSize": "Image must be small pass 5MB",
    "photoSuccess": "Profile photo don update!",
    "photoFail": "Photo no fit upload. Try again.",
    "langHint": "Dis one go change di language for di whole app sharp sharp.",
    "account": "Account",
    "editProfile": "Edit Profile",
    "subscriptionPlans": "Subscription Plans",
    "session": "Session",
    "signingOut": "Dey commot...",
    "logoutHint": "You fit login back with your username, phone, or email.",
    "notifPrefs": "Notification Settings",
    "notif": { "orderUpdates": "Order Updates", "newMessages": "New Messages", "promotions": "Promotions", "priceAlerts": "Price Alerts", "systemAlerts": "System Alerts", "communityPosts": "Community Posts", "newJobs": "New Jobs" },
    "privacyControls": "Privacy Settings",
    "privacy": { "showProfile": "Make other people fit see my profile", "allowListings": "Make people fit see my listings", "showOnline": "Show say I dey online", "allowDM": "Allow message from people wey I no know" },
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service",
    "security": "Security",
    "changePassword": "Change Password",
    "changePasswordHint": "Change your account password",
    "accountRecovery": "Account Recovery",
    "accountRecoveryHint": "Recover username or reset password",
    "dangerZone": "Danger Zone",
    "dangerHint": "Dis actions no fit undo.",
    "deactivate": "Deactivate Account",
    "pageTitle": "Settings",
    "languageLabel": "Language",
    "logout": "Comot",
    "myListings": "My Listings",
    "favorites": "Favorites",
    "orders": "Orders",
  },
  ar: {
    "tab": { "general": "Ø¹Ø§Ù…", "notifications": "Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª", "privacy": "Ø§Ù„Ø®ØµÙˆØµÙŠØ©", "security": "Ø§Ù„Ø£Ù…Ø§Ù†" },
    "profilePhoto": "ØµÙˆØ±Ø© Ø§Ù„Ù…Ù„Ã™Â Ø§Ù„Ø´Ø®ØµÙŠ",
    "uploading": "Ø¬Ø§Ø±Ã™Â Ø§Ù„Ø±Ã™ÂØ¹...",
    "changePhoto": "ØªØºÙŠÙŠØ± Ø§Ù„ØµÙˆØ±Ø©",
    "photoHint": "JPGØŒ PNG Ø­ØªÙ‰ 5 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª",
    "errImageType": "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ù„Ã™Â ØµÙˆØ±Ø© (JPGØŒ PNGØŒ Ø¥Ù„Ø®).",
    "errImageSize": "ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø§Ù„ØµÙˆØ±Ø© Ø£ØµØºØ± Ù…Ù† 5 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª",
    "photoSuccess": "ØªÙ… ØªØ­Ø¯ÙŠØ« ØµÙˆØ±Ø© Ø§Ù„Ù…Ù„Ã™Â Ø§Ù„Ø´Ø®ØµÙŠ Ø¨Ù†Ø¬Ø§Ø­!",
    "photoFail": "Ã™ÂØ´Ù„ Ø±Ã™ÂØ¹ Ø§Ù„ØµÙˆØ±Ø©. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.",
    "langHint": "Ù‡Ø°Ø§ ÙŠØºÙŠÙ‘Ø± Ù„ØºØ© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ã™ÂÙˆØ±Ù‹Ø§.",
    "account": "Ø§Ù„Ø­Ø³Ø§Ø¨",
    "editProfile": "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù„Ã™Â Ø§Ù„Ø´Ø®ØµÙŠ",
    "subscriptionPlans": "Ø®Ø·Ø· Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ",
    "session": "Ø§Ù„Ø¬Ù„Ø³Ø©",
    "signingOut": "Ø¬Ø§Ø±Ã™Â ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬...",
    "logoutHint": "ÙŠÙ…ÙƒÙ†Ùƒ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ù‹Ø§ Ø¨Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø§Ù„Ù‡Ø§ØªÃ™Â Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.",
    "notifPrefs": "ØªÃ™ÂØ¶ÙŠÙ„Ø§Øª Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª",
    "notif": { "orderUpdates": "ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ø·Ù„Ø¨Ø§Øª", "newMessages": "Ø±Ø³Ø§Ø¦Ù„ Ø¬Ø¯ÙŠØ¯Ø©", "promotions": "Ø§Ù„Ø¹Ø±ÙˆØ¶", "priceAlerts": "ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø£Ø³Ø¹Ø§Ø±", "systemAlerts": "ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…", "communityPosts": "Ù…Ù†Ø´ÙˆØ±Ø§Øª Ø§Ù„Ù…Ø¬ØªÙ…Ø¹", "newJobs": "ÙˆØ¸Ø§Ø¦Ã™Â Ø¬Ø¯ÙŠØ¯Ø©" },
    "privacyControls": "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
    "privacy": { "showProfile": "Ø¥Ø¸Ù‡Ø§Ø± Ù…Ù„Ã™ÂÙŠ Ø§Ù„Ø´Ø®ØµÙŠ Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø¢Ø®Ø±ÙŠÙ†", "allowListings": "Ø§Ù„Ø³Ù…Ø§Ø­ Ù„Ù„Ø¢Ø®Ø±ÙŠÙ† Ø¨Ø±Ø¤ÙŠØ© Ø¥Ø¹Ù„Ø§Ù†Ø§ØªÙŠ", "showOnline": "Ø¥Ø¸Ù‡Ø§Ø± Ø­Ø§Ù„Ø© Ø§ØªØµØ§Ù„ÙŠ", "allowDM": "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ù† Ø§Ù„ØºØ±Ø¨Ø§Ø¡" },
    "privacyPolicy": "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
    "termsOfService": "Ø´Ø±ÙˆØ· Ø§Ù„Ø®Ø¯Ù…Ø©",
    "security": "Ø§Ù„Ø£Ù…Ø§Ù†",
    "changePassword": "ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±",
    "changePasswordHint": "ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø­Ø³Ø§Ø¨Ùƒ",
    "accountRecovery": "Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø­Ø³Ø§Ø¨",
    "accountRecoveryHint": "Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±",
    "dangerZone": "Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø®Ø·Ø±",
    "dangerHint": "Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ù‡ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª.",
    "deactivate": "ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨",
    "pageTitle": "Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª",
    "languageLabel": "Ø§Ù„Ù„ØºØ©",
    "logout": "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬",
    "myListings": "Ø¥Ø¹Ù„Ø§Ù†Ø§ØªÙŠ",
    "favorites": "Ø§Ù„Ù…Ã™ÂØ¶Ù„Ø©",
    "orders": "Ø§Ù„Ø·Ù„Ø¨Ø§Øª",
  },
  ff: {
    "tab": { "general": "Huunde fof", "notifications": "Tintinooje", "privacy": "Sirru", "security": "Kisal" },
    "profilePhoto": "Natal profil",
    "uploading": "ÆŠon É“amtee...",
    "changePhoto": "Waylu natal",
    "photoHint": "JPG, PNG haa 5MB",
    "errImageType": "TiiÉ—no suÉ“o fiijo natal (JPG, PNG, ekn.).",
    "errImageSize": "Natal foti É“urde famÉ—ude 5MB",
    "photoSuccess": "Natal profil hesÉ—itinaama!",
    "photoFail": "Æamtugol natal hawri. TiiÉ—no eto kadi.",
    "langHint": "ÆŠum waylat É—emngal aplikeysiÅ‹ ndee fof jaka.",
    "account": "Konto",
    "editProfile": "TaÆ´to profil",
    "subscriptionPlans": "Peeje jokkondiral",
    "session": "SesoÅ‹",
    "signingOut": "ÆŠon yalta...",
    "logoutHint": "A waawi kadi naatde e innde maa, telefoÅ‹, walla iimeel.",
    "notifPrefs": "Teelte tintinooje",
    "notif": { "orderUpdates": "KesÉ—itineeji umrooje", "newMessages": "Nulalji kesi", "promotions": "NjeÃ±tudi", "priceAlerts": "Tintinooje coggu", "systemAlerts": "Tintinooje sistem", "communityPosts": "Bindi renndo", "newJobs": "Golle kese" },
    "privacyControls": "Teelte sirru",
    "privacy": { "showProfile": "Hollu profil am yimÉ“e woÉ—É“e", "allowListings": "Yamiru woÉ“É“e yiyde njeeyaaji am", "showOnline": "Hollu miÉ—o e laawol", "allowDM": "Yamiru nulalji to yimÉ“e É“e anndaÉ—aa" },
    "privacyPolicy": "Sariya sirru",
    "termsOfService": "SarÉ—iiji huutoragol",
    "security": "Kisal",
    "changePassword": "Waylu finnde",
    "changePasswordHint": "HesÉ—itin finnde konto maa",
    "accountRecovery": "Artirgol konto",
    "accountRecoveryHint": "Artir innde walla firtu finnde",
    "dangerZone": "Nokku bonki",
    "dangerHint": "ÆŠii golle mbaawaa firteede.",
    "deactivate": "ÆŠaÉ—É—u konto",
    "pageTitle": "Teelte",
    "languageLabel": "ÆŠemngal",
    "logout": "Yaltude",
    "myListings": "Ko njeeyetee am",
    "favorites": "FaaÉ“aaÉ“e",
    "orders": "Sarwiiji",
  },
};

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language, setLanguage } = useLanguage();  // single real provider (from @/App)

  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [activeTab,    setActiveTab]    = useState<Tab>("general");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError,   setPhotoError]   = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const [logoutLoading,setLogoutLoading]= useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: Tab[] = ["general", "notifications", "privacy", "security"];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError(s.errImageType);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(s.errImageSize);
      return;
    }

    setPhotoLoading(true);
    setPhotoError("");
    setPhotoSuccess("");

    try {
      const userId   = currentUser?.id || "unknown";
      const ext      = file.name.split(".").pop();
      const filePath = userId + "/avatar_" + Date.now() + "." + ext;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (profileError) throw new Error(profileError.message);

      setPhotoSuccess(s.photoSuccess);
    } catch (err: any) {
      setPhotoError(err.message || s.photoFail);
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      if (logout) await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="max-w-2xl mx-auto py-6 px-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {s.pageTitle}
      </h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              "flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
              (activeTab === tab
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700")
            }
          >
            {s.tab[tab]}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-4">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> {s.profilePhoto}
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-teal-600 text-2xl font-bold">
                    {(currentUser?.displayName || currentUser?.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {photoLoading
                    ? <><Loader className="w-4 h-4 animate-spin" /> {s.uploading}</>
                    : <><Camera className="w-4 h-4" /> {s.changePhoto}</>
                  }
                </button>
                <p className="text-xs text-gray-400 mt-1">{s.photoHint}</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {photoError && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {photoError}
              </div>
            )}
            {photoSuccess && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg p-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" /> {photoSuccess}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> {s.languageLabel}
            </h3>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {AVAILABLE_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              {s.langHint}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> {s.account}
            </h3>

            <div className="space-y-1">
              <Link
                to="/profile"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{s.editProfile}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/my-listings"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-700">{s.myListings}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/favorites"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-700">{s.favorites}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/orders"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">{s.orders}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/subscription"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{s.subscriptionPlans}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">{s.session}</h3>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {logoutLoading
                ? <><Loader className="w-4 h-4 animate-spin" /> {s.signingOut}</>
                : <><LogOut className="w-4 h-4" /> {s.logout}</>
              }
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              {s.logoutHint}
            </p>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4" /> {s.notifPrefs}
          </h3>
          {NOTIF_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer"
            >
              <span className="text-sm text-gray-700">{s.notif[key]}</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-teal-600"
              />
            </label>
          ))}
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> {s.privacyControls}
          </h3>
          {PRIVACY_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-teal-600"
              />
              <span className="text-sm text-gray-700">{s.privacy[key]}</span>
            </label>
          ))}
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <Link to="/privacy-policy" className="block text-sm text-teal-600 hover:underline py-1">
              {s.privacyPolicy}
            </Link>
            <Link to="/terms-of-service" className="block text-sm text-teal-600 hover:underline py-1">
              {s.termsOfService}
            </Link>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> {s.security}
            </h3>
            <Link
              to="/forgot-password"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{s.changePassword}</p>
                <p className="text-xs text-gray-400">{s.changePasswordHint}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/forgot-credentials"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{s.accountRecovery}</p>
                <p className="text-xs text-gray-400">{s.accountRecoveryHint}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-100 p-6">
            <h3 className="font-semibold text-red-700 mb-2">{s.dangerZone}</h3>
            <p className="text-xs text-red-500 mb-4">{s.dangerHint}</p>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
              {s.deactivate}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;




