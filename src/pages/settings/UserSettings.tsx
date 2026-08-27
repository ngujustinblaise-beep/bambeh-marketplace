// BAMBEH_DEPLOY_TOKEN__USERSETTINGS_FIX134_PHOTO_CLEAN
/**
 * UserSettings.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/settings/UserSettings.tsx
 * 
 * i18n: All settings strings are localized inline via the local S table,
 * bound directly to the mounted context provider inside App.tsx. 
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera, Heart, Package, List, LogOut, ChevronRight,
  Globe, Shield, Bell, User, Lock, AlertCircle, CheckCircle, Loader
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/App";

type Tab = "general" | "notifications" | "privacy" | "security";
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "pidgin", name: "Pidgin" },
  { code: "ar", name: "العربية" },
  { code: "ff", name: "Fulfulde" },
];

const NOTIF_KEYS = ["orderUpdates","newMessages","promotions","priceAlerts","systemAlerts","communityPosts","newJobs"] as const;
const PRIVACY_KEYS = ["showProfile","allowListings","showOnline","allowDM"] as const;

const S: Record<Lang, {
  tab: { general: string; notifications: string; privacy: string; security: string };
  profilePhoto: string; uploading: string; changePhoto: string; photoHint: string;
  errImageType: string; errImageSize: string; photoSuccess: string; photoFail: string; errNetwork: string;
  langHint: string; account: string; editProfile: string; subscriptionPlans: string;
  session: string; signingOut: string; logoutHint: string; notifPrefs: string;
  notif: Record<typeof NOTIF_KEYS[number], string>;
  privacyControls: string;
  privacy: Record<typeof PRIVACY_KEYS[number], string>;
  privacyPolicy: string; termsOfService: string; security: string;
  changePassword: string; changePasswordHint: string; accountRecovery: string; accountRecoveryHint: string;
  dangerZone: string; dangerHint: string; deactivate: string;
  deleteAccount: string; deleteHint: string; dlgTitle: string; dlgBody: string;
  dlgType: string; dlgCancel: string; dlgConfirm: string; dlgWorking: string;
  dlgDone: string; dlgFail: string;
  pageTitle: string; languageLabel: string; logout: string;
  myListings: string; favorites: string; orders: string;
}> = {
  en: {
    tab: { general: "General", notifications: "Notifications", privacy: "Privacy", security: "Security" },
    profilePhoto: "Profile Photo",
    uploading: "Uploading...",
    changePhoto: "Change Photo",
    photoHint: "JPG, PNG up to 5MB",
    errImageType: "Please select an image file (JPG, PNG, etc.)",
    errImageSize: "Image must be smaller than 5MB",
    photoSuccess: "Profile photo updated successfully!",
    photoFail: "Photo upload failed. Please try again.",
    errNetwork: "Connection problem — the upload could not reach the server. Please try again.",
    langHint: "This changes the language of the entire app immediately.",
    account: "Account",
    editProfile: "Edit Profile",
    subscriptionPlans: "Subscription Plans",
    session: "Session",
    signingOut: "Signing out...",
    logoutHint: "You can log back in with your username, phone, or email.",
    notifPrefs: "Notification Preferences",
    notif: { orderUpdates: "Order Updates", newMessages: "New Messages", promotions: "Promotions", priceAlerts: "Price Alerts", systemAlerts: "System Alerts", communityPosts: "Community Posts", newJobs: "New Jobs" },
    privacyControls: "Privacy Controls",
    privacy: { showProfile: "Show my profile to other users", allowListings: "Allow others to see my listings", showOnline: "Show my online status", allowDM: "Allow direct messages from strangers" },
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    security: "Security",
    changePassword: "Change Password",
    changePasswordHint: "Update your account password",
    accountRecovery: "Account Recovery",
    accountRecoveryHint: "Recover username or reset password",
    dangerZone: "Danger Zone",
    dangerHint: "These actions cannot be undone.",
    deactivate: "Deactivate Account",
    deleteAccount: "Delete My Account",
    deleteHint: "This permanently removes your account. It cannot be undone.",
    dlgTitle: "Delete your account?",
    dlgBody: "Your listings, messages and profile will be removed. Records of completed payments are kept because the law requires it. This cannot be undone.",
    dlgType: "Type DELETE to confirm",
    dlgCancel: "Cancel",
    dlgConfirm: "Delete forever",
    dlgWorking: "Deleting...",
    dlgDone: "Your account has been deleted.",
    dlgFail: "Could not delete your account. Please try again or contact support.",
    pageTitle: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    myListings: "My Listings",
    favorites: "Favorites",
    orders: "Orders",
  },
  fr: {
    tab: { general: "Général", notifications: "Notifications", privacy: "Confidentialité", security: "Sécurité" },
    profilePhoto: "Photo de profil",
    uploading: "Téléversement...",
    changePhoto: "Changer la photo",
    photoHint: "JPG, PNG jusqu'à 5 Mo",
    errImageType: "Veuillez choisir un fichier image (JPG, PNG, etc.)",
    errImageSize: "L'image doit faire moins de 5 Mo",
    photoSuccess: "Photo de profil mise à jour !",
    photoFail: "Échec du téléversement. Veuillez réessayer.",
    errNetwork: "Problème de connexion — le téléversement n’a pas abouti. Veuillez réessayer.",
    langHint: "Ceci change la langue de toute l'application immédiatement.",
    account: "Compte",
    editProfile: "Modifier le profil",
    subscriptionPlans: "Forfaits d'abonnement",
    session: "Session",
    signingOut: "Déconnexion...",
    logoutHint: "Vous pouvez vous reconnecter avec votre nom d'utilisateur, téléphone ou e-mail.",
    notifPrefs: "Préférences de notification",
    notif: { orderUpdates: "Suivi des commandes", newMessages: "Nouveaux messages", promotions: "Promotions", priceAlerts: "Alertes de prix", systemAlerts: "Alertes système", communityPosts: "Publications de la communauté", newJobs: "Nouveaux emplois" },
    privacyControls: "Contrôles de confidentialité",
    privacy: { showProfile: "Montrer mon profil aux autres utilisateurs", allowListings: "Autoriser les autres à voir mes annonces", showOnline: "Afficher mon statut en ligne", allowDM: "Autoriser les messages directs d'inconnus" },
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d'utilisation",
    security: "Sécurité",
    changePassword: "Changer le mot de passe",
    changePasswordHint: "Mettre à jour le mot de passe du compte",
    accountRecovery: "Récupération du compte",
    accountRecoveryHint: "Récupérer le nom d'utilisateur ou réinitialiser le mot de passe",
    dangerZone: "Zone de danger",
    dangerHint: "Ces actions sont irréversibles.",
    deactivate: "Désactiver le compte",
    deleteAccount: "Supprimer mon compte",
    deleteHint: "Ceci supprime votre compte d\u00e9finitivement. C'est irr\u00e9versible.",
    dlgTitle: "Supprimer votre compte ?",
    dlgBody: "Vos annonces, messages et profil seront supprim\u00e9s. Les enregistrements des paiements effectu\u00e9s sont conserv\u00e9s car la loi l'exige. C'est irr\u00e9versible.",
    dlgType: "Tapez DELETE pour confirmer",
    dlgCancel: "Annuler",
    dlgConfirm: "Supprimer d\u00e9finitivement",
    dlgWorking: "Suppression...",
    dlgDone: "Votre compte a \u00e9t\u00e9 supprim\u00e9.",
    dlgFail: "Impossible de supprimer votre compte. R\u00e9essayez ou contactez le support.",
    pageTitle: "Paramètres",
    languageLabel: "Langue",
    logout: "Déconnexion",
    myListings: "Mes annonces",
    favorites: "Favoris",
    orders: "Commandes",
  },
  pidgin: {
    tab: { general: "General", notifications: "Notifications", privacy: "Privacy", security: "Security" },
    profilePhoto: "Profile Photo",
    uploading: "Dey upload...",
    changePhoto: "Change Photo",
    photoHint: "JPG, PNG up to 5MB",
    errImageType: "Abeg choose image file (JPG, PNG, etc.)",
    errImageSize: "Image must be small pass 5MB",
    photoSuccess: "Profile photo don update!",
    photoFail: "Photo no fit upload. Try again.",
    errNetwork: "Network no gree — photo no reach server. Try again.",
    langHint: "Dis one go change di language for di whole app sharp sharp.",
    account: "Account",
    editProfile: "Edit Profile",
    subscriptionPlans: "Subscription Plans",
    session: "Session",
    signingOut: "Dey commot...",
    logoutHint: "You fit login back with your username, phone, or email.",
    notifPrefs: "Notification Settings",
    notif: { orderUpdates: "Order Updates", newMessages: "New Messages", promotions: "Promotions", priceAlerts: "Price Alerts", systemAlerts: "System Alerts", communityPosts: "Community Posts", newJobs: "New Jobs" },
    privacyControls: "Privacy Settings",
    privacy: { showProfile: "Make other people fit see my profile", allowListings: "Make people fit see my listings", showOnline: "Show say I dey online", allowDM: "Allow message from people wey I no know" },
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    security: "Security",
    changePassword: "Change Password",
    changePasswordHint: "Change your account password",
    accountRecovery: "Account Recovery",
    accountRecoveryHint: "Recover username or reset password",
    dangerZone: "Danger Zone",
    dangerHint: "Dis actions no fit undo.",
    deactivate: "Deactivate Account",
    deleteAccount: "Delete My Account",
    deleteHint: "This one go remove your account for ever. You no fit bring am back.",
    dlgTitle: "You wan delete your account?",
    dlgBody: "Your things weh you put, your message and your profile go comot. Record of payment weh don finish go stay because law talk say make e stay. You no fit undo am.",
    dlgType: "Type DELETE make e confirm",
    dlgCancel: "Leave am",
    dlgConfirm: "Delete am for ever",
    dlgWorking: "E dey delete...",
    dlgDone: "Dem don delete your account.",
    dlgFail: "We no fit delete am. Try again or call support.",
    pageTitle: "Settings",
    languageLabel: "Language",
    logout: "Comot",
    myListings: "My Listings",
    favorites: "Favorites",
    orders: "Orders",
  },
  ar: {
    tab: { general: "عام", notifications: "الإشعارات", privacy: "الخصوصية", security: "الأمان" },
    profilePhoto: "صورة الملف الشخصي",
    uploading: "جارٍ الرفع...",
    changePhoto: "تغيير الصورة",
    photoHint: "JPG، PNG حتى 5 ميغابايت",
    errImageType: "يرجى اختيار ملف صورة (JPG، PNG، إلخ).",
    errImageSize: "يجب أن تكون الصورة أصغر من 5 ميغابايت",
    photoSuccess: "تم تحديث صورة الملف الشخصي بنجاح!",
    photoFail: "فشل رفع الصورة. يرجى المحاولة مرة أخرى.",
    errNetwork: "مشكلة في الاتصال — لم يصل التحميل إلى الخادم. حاول مرة أخرى.",
    langHint: "هذا يغيّر لغة التطبيق بالكامل فورًا.",
    account: "الحساب",
    editProfile: "تعديل الملف الشخصي",
    subscriptionPlans: "خطط الاشتراك",
    session: "الجلسة",
    signingOut: "جارٍ تسجيل الخروج...",
    logoutHint: "يمكنك تسجيل الدخول مجددًا باسم المستخدم أو الهاتف أو البريد الإلكتروني.",
    notifPrefs: "تفضيلات الإشعارات",
    notif: { orderUpdates: "تحديثات الطلبات", newMessages: "رسائل جديدة", promotions: "العروض", priceAlerts: "تنبيهات الأسعار", systemAlerts: "تنبيهات النظام", communityPosts: "منشورات المجتمع", newJobs: "وظائف جديدة" },
    privacyControls: "إعدادات الخصوصية",
    privacy: { showProfile: "إظهار ملفي الشخصي للمستخدمين الآخرين", allowListings: "السماح للآخرين برؤية إعلاناتي", showOnline: "إظهار حالة اتصالي", allowDM: "السماح بالرسائل المباشرة من الغرباء" },
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    security: "الأمان",
    changePassword: "تغيير كلمة المرور",
    changePasswordHint: "تحديث كلمة مرور حسابك",
    accountRecovery: "استعادة الحساب",
    accountRecoveryHint: "استعادة اسم المستخدم أو إعادة تعيين كلمة المرور",
    dangerZone: "منطقة الخطر",
    dangerHint: "لا يمكن التراجع عن هذه الإجراءات.",
    deactivate: "تعطيل الحساب",
    deleteAccount: "\u062d\u0630\u0641 \u062d\u0633\u0627\u0628\u064a",
    deleteHint: "\u0647\u0630\u0627 \u064a\u062d\u0630\u0641 \u062d\u0633\u0627\u0628\u0643 \u0646\u0647\u0627\u0626\u064a\u0627. \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639.",
    dlgTitle: "\u062d\u0630\u0641 \u062d\u0633\u0627\u0628\u0643\u061f",
    dlgBody: "\u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u0625\u0639\u0644\u0627\u0646\u0627\u062a\u0643 \u0648\u0631\u0633\u0627\u0626\u0644\u0643 \u0648\u0645\u0644\u0641\u0643 \u0627\u0644\u0634\u062e\u0635\u064a. \u062a\u064f\u062d\u0641\u0638 \u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0627\u0644\u0645\u0643\u062a\u0645\u0644\u0629 \u0644\u0623\u0646 \u0627\u0644\u0642\u0627\u0646\u0648\u0646 \u064a\u0648\u062c\u0628 \u0630\u0644\u0643. \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627.",
    dlgType: "\u0627\u0643\u062a\u0628 DELETE \u0644\u0644\u062a\u0623\u0643\u064a\u062f",
    dlgCancel: "\u0625\u0644\u063a\u0627\u0621",
    dlgConfirm: "\u0627\u062d\u0630\u0641 \u0646\u0647\u0627\u0626\u064a\u0627",
    dlgWorking: "\u062c\u0627\u0631\u064a \u0627\u0644\u062d\u0630\u0641...",
    dlgDone: "\u062a\u0645 \u062d\u0630\u0641 \u062d\u0633\u0627\u0628\u0643.",
    dlgFail: "\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u062d\u0633\u0627\u0628\u0643. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0623\u0648 \u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645.",
    pageTitle: "الإعدادات",
    languageLabel: "اللغة",
    logout: "تسجيل الخروج",
    myListings: "إعلاناتي",
    favorites: "المفضلة",
    orders: "الطلبات",
  },
  ff: {
    tab: { general: "Huunde fof", notifications: "Tintinooje", privacy: "Sirru", security: "Kisal" },
    profilePhoto: "Natal profil",
    uploading: "Ɗon ɓamtee...",
    changePhoto: "Waylu natal",
    photoHint: "JPG, PNG haa 5MB",
    errImageType: "Tiiɗno suɓo fiijo natal (JPG, PNG, ekn.).",
    errImageSize: "Natal foti ɓurde famɗude 5MB",
    photoSuccess: "Natal profil hesɗitinaama!",
    photoFail: "Ɓamtugol natal hawri. Tiiɗno eto kadi.",
    errNetwork: "Caɗeele laylol — natal yottaaki server. Tiiɗno eto kadi.",
    langHint: "Ɗum waylat ɗemngal aplikeysiŋ ndee fof jaka.",
    account: "Konto",
    editProfile: "Taƴto profil",
    subscriptionPlans: "Peeje jokkondiral",
    session: "Sesoŋ",
    signingOut: "Ɗon yalta...",
    logoutHint: "A waawi kadi naatde e innde maa, telefoŋ, walla iimeel.",
    notifPrefs: "Teelte tintinooje",
    notif: { orderUpdates: "Kesɗitineeji umrooje", newMessages: "Nulalji kesi", promotions: "Njeñtudi", priceAlerts: "Tintinooje coggu", systemAlerts: "Tintinooje sistem", communityPosts: "Bindi renndo", newJobs: "Golle kese" },
    privacyControls: "Teelte sirru",
    privacy: { showProfile: "Hollu profil am yimɓe woɗɓe", allowListings: "Yamiru woɓɓe yiyde njeeyaaji am", showOnline: "Hollu miɗo e laawol", allowDM: "Yamiru nulalji to yimɓe ɓe anndaɗaa" },
    privacyPolicy: "Sariya sirru",
    termsOfService: "Sarɗiiji huutoragol",
    security: "Kisal",
    changePassword: "Waylu finnde",
    changePasswordHint: "Hesɗitin finnde konto maa",
    accountRecovery: "Artirgol konto",
    accountRecoveryHint: "Artir innde walla firtu finnde",
    dangerZone: "Nokku bonki",
    dangerHint: "Ɗii golle mbaawaa firteede.",
    deactivate: "Ɗaɗɗu konto",
    deleteAccount: "Momtu konto am",
    deleteHint: "\u018aum ina momta konto maa haa abada. A waawaa ruttude.",
    dlgTitle: "Ada yi\u0257i momtude konto maa?",
    dlgBody: "Bayyinaali maa, bataake maa e humpito maa fof momtete. Winndannde njo\u0253di gas\u0257e ina heddoo sabu laawol ina naamnoo \u0257um. A waawaa ruttude.",
    dlgType: "Winndu DELETE ngam tee\u014btinde",
    dlgCancel: "Accu",
    dlgConfirm: "Momtu haa abada",
    dlgWorking: "Ina momtee...",
    dlgDone: "Konto maa momtaama.",
    dlgFail: "Min mbaawaa momtude konto maa. Eto kadi walla noddu ballal.",
    pageTitle: "Teelte",
    languageLabel: "Ɗemngal",
    logout: "Yaltude",
    myListings: "Ko njeeyetee am",
    favorites: "Faaɓaaɓe",
    orders: "Sarwiiji",
  },
};

// FIX134: shrink photos to <=512px JPEG (~50-100 KB) so uploads succeed on slow connections
async function compressImage(file: File): Promise<Blob> {
  try {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    });
    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode failed"));
      i.src = dataUrl;
    });
    const MAX = 512;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // any failure -> upload the original
  }
}

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  // FIX420 - account deletion state
  const [delOpen, setDelOpen]   = useState(false);
  const [delText, setDelText]   = useState("");
  const [delBusy, setDelBusy]   = useState(false);
  const [delError, setDelError] = useState("");
  const { currentUser, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // FIX134
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    orderUpdates: true, newMessages: true, promotions: false,
    priceAlerts: true, systemAlerts: true, communityPosts: false, newJobs: false
  });
  const [privacy, setPrivacy] = useState<Record<string, boolean>>({
    showProfile: true, allowListings: true, showOnline: true, allowDM: false
  });

  // FIX134: load the saved avatar from profiles (photoURL was never refreshed after upload)
  useEffect(() => {
    (async () => {
      const uid = currentUser?.id;
      if (!uid) return;
      try {
        const { data } = await supabase.from("profiles").select("avatar_url").eq("id", uid).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      } catch { /* keep letter avatar */ }
    })();
  }, [currentUser?.id]);

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
    const userId = currentUser?.id; // FIX134: never upload to an "unknown" folder
    if (!userId) {
      setPhotoError(s.photoFail);
      return;
    }
    setPhotoLoading(true);
    setPhotoError("");
    setPhotoSuccess("");
    try {
      // FIX134: compress before upload -- critical on slow connections
      const blob = await compressImage(file);
      const filePath = `${userId}/avatar_${Date.now()}.jpg`;

      // FIX134: up to 3 attempts with a pause between (slow-network resilience)
      let uploadError: Error | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });
        if (!error) { uploadError = null; break; }
        uploadError = new Error(error.message);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);

      if (profileError) throw new Error(profileError.message);
      setAvatarUrl(urlData.publicUrl); // FIX134: show the new photo immediately
      setPhotoSuccess(s.photoSuccess);
    } catch (err: any) {
      const msg = String(err?.message || "");
      setPhotoError(/failed to fetch|network|load failed|timeout/i.test(msg) ? s.errNetwork : (msg || s.photoFail));
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

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="max-w-2xl mx-auto py-6 px-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{s.pageTitle}</h1>
      
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {(["general", "notifications", "privacy", "security"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s.tab[tab]}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {activeTab === "general" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> {s.profilePhoto}
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {(avatarUrl || currentUser?.photoURL) ? (
                  <img src={avatarUrl || currentUser?.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-teal-600 text-2xl font-bold">
                    {(currentUser?.displayName || currentUser?.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {photoLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {photoLoading ? s.uploading : s.changePhoto}
                </button>
                <p className="text-xs text-gray-400 mt-1">{s.photoHint}</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            {photoError && <div className="mt-3 text-red-600 text-sm bg-red-50 rounded-lg p-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{photoError}</div>}
            {photoSuccess && <div className="mt-3 text-green-600 text-sm bg-green-50 rounded-lg p-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{photoSuccess}</div>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> {s.languageLabel}
            </h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              {AVAILABLE_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-2">{s.langHint}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> {s.account}</h3>
            <div className="space-y-1">
              <Link to="/profile" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><span>{s.editProfile}</span><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
              <Link to="/my-listings" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><div className="flex items-center gap-2"><List className="w-4 h-4 text-teal-600" /><span>{s.myListings}</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
              <Link to="/favorites" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><div className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /><span>{s.favorites}</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
              <Link to="/orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /><span>{s.orders}</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
              <Link to="/subscription" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><span>{s.subscriptionPlans}</span><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">{s.session}</h3>
            <button onClick={handleLogout} disabled={logoutLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
              {logoutLoading ? <Loader className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {logoutLoading ? s.signingOut : s.logout}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">{s.logoutHint}</p>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Bell className="w-4 h-4" /> {s.notifPrefs}</h3>
          {NOTIF_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{s.notif[key]}</span>
              <input type="checkbox" checked={notifs[key]} onChange={(e) => setNotifs({...notifs, [key]: e.target.checked})} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── PRIVACY TAB ── */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> {s.privacyControls}</h3>
            {PRIVACY_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{s.privacy[key]}</span>
                <input type="checkbox" checked={privacy[key]} onChange={(e) => setPrivacy({...privacy, [key]: e.target.checked})} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
            <Link to="/privacy-policy" className="text-sm text-teal-600 hover:underline flex justify-between items-center"><span>{s.privacyPolicy}</span><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
            <Link to="/terms" className="text-sm text-teal-600 hover:underline flex justify-between items-center"><span>{s.termsOfService}</span><ChevronRight className="w-4 h-4 text-gray-400" /></Link>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> {s.security}</h3>
            <Link to="/change-password" className="block p-3 border border-gray-150 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-700">{s.changePassword}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.changePasswordHint}</div>
            </Link>
            <Link to="/account-recovery" className="block p-3 border border-gray-150 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-700">{s.accountRecovery}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.accountRecoveryHint}</div>
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
            <h3 className="font-semibold text-red-600 mb-1 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {s.dangerZone}</h3>
            <p className="text-xs text-gray-400 mb-4">{s.dangerHint}</p>
            <button className="w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold text-sm transition-colors">
              {s.deactivate}
            </button>

            {/* FIX420 - real deletion, required by Google Play and Apple 5.1.1(v) */}
            <button
              onClick={() => { setDelText(""); setDelError(""); setDelOpen(true); }}
              className="w-full mt-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {s.deleteAccount}
            </button>
            <p className="text-xs text-gray-400 mt-2">{s.deleteHint}</p>

            {delOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-5">
                  <h4 className="font-bold text-red-600 text-lg">{s.dlgTitle}</h4>
                  <p className="mt-2 text-sm text-gray-600">{s.dlgBody}</p>
                  <label className="mt-4 block text-xs font-semibold text-gray-500">{s.dlgType}</label>
                  <input
                    value={delText}
                    onChange={(ev) => setDelText(ev.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="DELETE"
                    autoComplete="off"
                  />
                  {delError && <p className="mt-2 text-xs text-red-600">{delError}</p>}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setDelOpen(false)}
                      disabled={delBusy}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
                    >
                      {s.dlgCancel}
                    </button>
                    <button
                      disabled={delBusy || delText.toUpperCase() !== "DELETE"}
                      onClick={async () => {
                        setDelBusy(true); setDelError("");
                        try {
                          const { data, error } = await supabase.rpc("delete_my_account", { confirm_text: delText });
                          if (error) { setDelError(s.dlgFail); setDelBusy(false); return; }
                          const res = data as { ok?: boolean } | null;
                          if (!res || res.ok !== true) { setDelError(s.dlgFail); setDelBusy(false); return; }
                          await supabase.auth.signOut();
                          window.alert(s.dlgDone);
                          navigate("/");
                        } catch {
                          setDelError(s.dlgFail); setDelBusy(false);
                        }
                      }}
                      className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {delBusy ? s.dlgWorking : s.dlgConfirm}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
// BAMBEH_END_TOKEN__USERSETTINGS__COMPLETE
