/**
 * src/components/profile/PrivacySettings.tsx
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * i18n: labels/descriptions are pulled from the local S table by the live
 * language (useLang from @/hooks/useAppLang). State holds only id -> on/off,
 * so toggles re-translate instantly when the language changes. Persisted shape
 * (user_preferences.privacy_settings = { id: boolean }) is unchanged.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const SETTING_IDS = [
  "show_phone", "show_profile", "show_location",
  "allow_messages", "data_analytics", "two_factor",
] as const;
type SettingId = typeof SETTING_IDS[number];

const DEFAULT_ON: Record<SettingId, boolean> = {
  show_phone: false, show_profile: true, show_location: true,
  allow_messages: true, data_analytics: false, two_factor: false,
};

const S: Record<Lang, {
  title: string; subtitle: string; save: string; saving: string; saved: string;
  items: Record<SettingId, { label: string; description: string }>;
  exportTitle: string; exportDesc: string; exportBtn: string;
  deleteTitle: string; deleteDesc: string; deleteBtn: string;
  confirmTitle: string; confirmDesc: string; cancel: string; confirmDelete: string;
}> = {
  en: {
    title: "Privacy & Security",
    subtitle: "Control who can see your information",
    save: "Save", saving: "Saving...", saved: "✓ Saved",
    items: {
      show_phone:     { label: "Show my phone number",        description: "Buyers can see your number in listings" },
      show_profile:   { label: "Public profile",              description: "Your profile is visible to all users" },
      show_location:  { label: "Show my city",                description: "Your city appears on your listings" },
      allow_messages: { label: "Receive messages",            description: "Other users can send you messages" },
      data_analytics: { label: "Analytics & personalization", description: "Allow us to improve your experience with your data" },
      two_factor:     { label: "Two-factor authentication",   description: "Strengthen your account security with an OTP" },
    },
    exportTitle: "Download my data",
    exportDesc: "Export all your personal data in line with GDPR.",
    exportBtn: "Request export",
    deleteTitle: "Delete my account",
    deleteDesc: "This action is irreversible. All your data will be deleted.",
    deleteBtn: "Delete my account",
    confirmTitle: "Confirm deletion",
    confirmDesc: "This will permanently delete your account. Are you sure?",
    cancel: "Cancel", confirmDelete: "Delete",
  },
  fr: {
    title: "Confidentialité & Sécurité",
    subtitle: "Contrôlez qui peut voir vos informations",
    save: "Sauvegarder", saving: "Sauvegarde...", saved: "✓ Sauvegardé",
    items: {
      show_phone:     { label: "Afficher mon téléphone",        description: "Les acheteurs peuvent voir votre numéro dans les annonces" },
      show_profile:   { label: "Profil public",                  description: "Votre profil est visible par tous les utilisateurs" },
      show_location:  { label: "Afficher ma ville",              description: "Votre ville apparaît sur vos annonces" },
      allow_messages: { label: "Recevoir des messages",          description: "Les autres utilisateurs peuvent vous envoyer des messages" },
      data_analytics: { label: "Analytiques & personnalisation", description: "Permettre l'amélioration de l'expérience avec vos données" },
      two_factor:     { label: "Double authentification",        description: "Renforcer la sécurité de votre compte avec un OTP" },
    },
    exportTitle: "Télécharger mes données",
    exportDesc: "Exportez toutes vos données personnelles conformément au RGPD.",
    exportBtn: "Demander l'export",
    deleteTitle: "Supprimer mon compte",
    deleteDesc: "Cette action est irréversible. Toutes vos données seront supprimées.",
    deleteBtn: "Supprimer mon compte",
    confirmTitle: "Confirmer la suppression",
    confirmDesc: "Cette action supprimera définitivement votre compte. Êtes-vous sûr ?",
    cancel: "Annuler", confirmDelete: "Supprimer",
  },
  pidgin: {
    title: "Privacy & Security",
    subtitle: "Control who fit see your info",
    save: "Save", saving: "E dey save...", saved: "✓ Don save",
    items: {
      show_phone:     { label: "Show my phone number",        description: "Buyers fit see your number for listings" },
      show_profile:   { label: "Public profile",              description: "Everybody fit see your profile" },
      show_location:  { label: "Show my city",                description: "Your city go show for your listings" },
      allow_messages: { label: "Receive messages",            description: "Other people fit send you message" },
      data_analytics: { label: "Analytics & personalization", description: "Allow us use your data make app better" },
      two_factor:     { label: "Two-factor authentication",   description: "Make your account strong with OTP" },
    },
    exportTitle: "Download my data",
    exportDesc: "Export all your personal data follow GDPR.",
    exportBtn: "Request export",
    deleteTitle: "Delete my account",
    deleteDesc: "Dis action no fit undo. All your data go delete.",
    deleteBtn: "Delete my account",
    confirmTitle: "Confirm delete",
    confirmDesc: "Dis go permanently delete your account. You sure?",
    cancel: "Cancel", confirmDelete: "Delete",
  },
  ar: {
    title: "الخصوصية والأمان",
    subtitle: "تحكّم بمن يمكنه رؤية معلوماتك",
    save: "حفظ", saving: "جارٍ الحفظ...", saved: "✓ تم الحفظ",
    items: {
      show_phone:     { label: "إظهار رقم هاتفي",        description: "يمكن للمشترين رؤية رقمك في الإعلانات" },
      show_profile:   { label: "ملف عام",                description: "ملفك الشخصي مرئي لجميع المستخدمين" },
      show_location:  { label: "إظهار مدينتي",           description: "تظهر مدينتك في إعلاناتك" },
      allow_messages: { label: "استقبال الرسائل",        description: "يمكن للمستخدمين الآخرين مراسلتك" },
      data_analytics: { label: "التحليلات والتخصيص",     description: "السماح بتحسين تجربتك باستخدام بياناتك" },
      two_factor:     { label: "المصادقة الثنائية",       description: "عزّز أمان حسابك برمز تحقق OTP" },
    },
    exportTitle: "تنزيل بياناتي",
    exportDesc: "صدّر جميع بياناتك الشخصية وفقًا للائحة GDPR.",
    exportBtn: "طلب التصدير",
    deleteTitle: "حذف حسابي",
    deleteDesc: "هذا الإجراء لا رجعة فيه. ستُحذف جميع بياناتك.",
    deleteBtn: "حذف حسابي",
    confirmTitle: "تأكيد الحذف",
    confirmDesc: "سيؤدي هذا إلى حذف حسابك نهائيًا. هل أنت متأكد؟",
    cancel: "إلغاء", confirmDelete: "حذف",
  },
  ff: {
    title: "Sirru e Kisal",
    subtitle: "Ñeeñu mo waawi yiyde kabaruuji maa",
    save: "Dannu", saving: "Ɗon danee...", saved: "✓ Dannaama",
    items: {
      show_phone:     { label: "Hollu limndo telefoŋ am", description: "Soodooɓe mbaawi yiyde limndo maa e njeeyaaji" },
      show_profile:   { label: "Profil laaɓɗo",           description: "Profil maa ina yiyee e huɓɓooɓe fof" },
      show_location:  { label: "Hollu wuro am",           description: "Wuro maa ina feeña e njeeyaaji maa" },
      allow_messages: { label: "Jaɓ nulalji",             description: "Huɓɓooɓe woɓɓe mbaawi neldude ma nulalji" },
      data_analytics: { label: "Ñaawooje e heertingol",   description: "Yamiru ɓeydude ngonka maa e keɓe maa" },
      two_factor:     { label: "Goongɗingol laabi ɗiɗi",  description: "Sembin kisal konto maa e kod OTP" },
    },
    exportTitle: "Aawto keɓe am",
    exportDesc: "Yaltin keɓe maa keeriiɗe fof no GDPR wi'iri.",
    exportBtn: "Ɗaɓɓo yaltingol",
    deleteTitle: "Momtu konto am",
    deleteDesc: "Ngal golle firtotaako. Keɓe maa fof momtoyte.",
    deleteBtn: "Momtu konto am",
    confirmTitle: "Teeŋtin momtugol",
    confirmDesc: "Ɗum momtay konto maa haa abada. A tabitii?",
    cancel: "Haaytu", confirmDelete: "Momtu",
  },
};

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const lang = useLang();
  const l: Lang = (lang in S ? lang : "en") as Lang;
  const s = S[l];
  const isRtl = l === "ar";

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enabled, setEnabled] = useState<Record<SettingId, boolean>>(DEFAULT_ON);

  const toggle = (id: SettingId) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("user_preferences").upsert({ user_id: user.id, privacy_settings: enabled, updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="max-w-lg mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{s.subtitle}</p>
      </div>

      <div className="space-y-3">
        {SETTING_IDS.map((id) => (
          <div key={id} className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-gray-900">{s.items[id].label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.items[id].description}</p>
            </div>
            <button
              onClick={() => toggle(id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled[id] ? "bg-teal-600" : "bg-gray-300"}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled[id] ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Data export */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm font-semibold text-blue-900">{s.exportTitle}</p>
        <p className="text-xs text-blue-700 mt-1">{s.exportDesc}</p>
        <button className="mt-2 text-xs text-blue-600 underline">{s.exportBtn}</button>
      </div>

      {/* Delete account */}
      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
        <p className="text-sm font-semibold text-red-900">{s.deleteTitle}</p>
        <p className="text-xs text-red-700 mt-1">{s.deleteDesc}</p>
        <button onClick={() => setShowDeleteConfirm(true)} className="mt-2 text-xs text-red-600 underline">{s.deleteBtn}</button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-gray-900">{s.confirmTitle}</h3>
            <p className="text-sm text-gray-500 mt-2">{s.confirmDesc}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium">{s.cancel}</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">{s.confirmDelete}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? "bg-green-500 text-white" : "bg-teal-600 text-white hover:bg-teal-700"} disabled:opacity-60`}>
          {saving ? s.saving : saved ? s.saved : s.save}
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;

