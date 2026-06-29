/**
 * PrivacySettings.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/PrivacySettings.tsx
 *
 * Full multi-lingual layout direction compliance (LTR / RTL mirror)
 * configured across English, French, Pidgin English, Arabic, and Fulfulde.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/App";

interface PrivacySetting { id: string; label: string; description: string; enabled: boolean; dangerous?: boolean; }
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string;
  subtitle: string;
  save: string;
  saving: string;
  saved: string;
  exportTitle: string;
  exportDesc: string;
  exportBtn: string;
  deleteTitle: string;
  deleteDesc: string;
  deleteBtn: string;
  modalTitle: string;
  modalDesc: string;
  modalCancel: string;
  modalConfirm: string;
  items: Record<string, { label: string; desc: string }>;
}> = {
  en: {
    title: "Privacy & Security",
    subtitle: "Control who can see your information",
    save: "Save Settings",
    saving: "Saving...",
    saved: "✓ Saved Successfully",
    exportTitle: "Download My Data",
    exportDesc: "Export all your personal data in compliance with privacy regulations.",
    exportBtn: "Request Export",
    deleteTitle: "Delete Account",
    deleteDesc: "This action is completely irreversible. All your personal data will be wiped out.",
    deleteBtn: "Delete My Account",
    modalTitle: "Confirm Account Deletion",
    modalDesc: "Are you completely sure? This will permanently erase your profile and active listings.",
    modalCancel: "Cancel",
    modalConfirm: "Delete permanently",
    items: {
      show_phone: { label: "Show my phone number", desc: "Buyers can see your phone number directly on your item listings" },
      show_profile: { label: "Public profile visibility", desc: "Make your trader profile visible to everyone on Bambeh" },
      show_location: { label: "Show my town/city", desc: "Display your town or region location inside your listings" },
      allow_messages: { label: "Allow instant messaging", desc: "Other users can text you directly about items via chat" },
      data_analytics: { label: "Analytics & Personalization", desc: "Allow data processing to improve your marketplace feed" },
      two_factor: { label: "Two-Factor Authentication", desc: "Boost your security by requiring an OTP during login" }
    }
  },
  fr: {
    title: "Confidentialité & Sécurité",
    subtitle: "Contrôlez qui peut voir vos informations",
    save: "Sauvegarder",
    saving: "Sauvegarde...",
    saved: "✓ Sauvegardé",
    exportTitle: "Télécharger mes données",
    exportDesc: "Exportez toutes vos données personnelles conformément au RGPD.",
    exportBtn: "Demander l'export",
    deleteTitle: "Supprimer mon compte",
    deleteDesc: "Cette action est irréversible. Toutes vos données seront supprimées définitivement.",
    deleteBtn: "Supprimer mon compte",
    modalTitle: "Confirmer la suppression",
    modalDesc: "Cette action supprimera définitivement votre compte. Êtes-vous sûr ?",
    modalCancel: "Annuler",
    modalConfirm: "Supprimer",
    items: {
      show_phone: { label: "Afficher mon téléphone", desc: "Les acheteurs peuvent voir votre numéro dans les annonces" },
      show_profile: { label: "Profil public", desc: "Votre profil est visible par tous les utilisateurs" },
      show_location: { label: "Afficher ma ville", desc: "Votre ville apparaît sur vos annonces" },
      allow_messages: { label: "Recevoir des messages", desc: "Les autres utilisateurs peuvent vous envoyer des messages" },
      data_analytics: { label: "Analytiques & personnalisation", desc: "Permettre l'amélioration de l'expérience avec vos données" },
      two_factor: { label: "Double authentification", desc: "Renforcer la sécurité de votre compte avec un OTP" }
    }
  },
  pidgin: {
    title: "Privacy & Security",
    subtitle: "Choose people wey you want make dem see your levels",
    save: "Save Settings",
    saving: "E dey lock am...",
    saved: "✓ E don save fine",
    exportTitle: "Download My Marketplace Data",
    exportDesc: "Pack all your information wey dey look your profile clear out.",
    exportBtn: "Request Data Download",
    deleteTitle: "Kpai My Account",
    deleteDesc: "This action no get reverse gear. If you press am, everything go wipe clean off.",
    deleteBtn: "Kpai My Account Completely",
    modalTitle: "You Sure Say You Want Kpai Am?",
    modalDesc: "This matter go delete your profile and your market postings completely. You dey inside?",
    modalCancel: "Abeg Cancel",
    modalConfirm: "Yes, Kpai Am",
    items: {
      show_phone: { label: "Show my phone line", desc: "Make buyers see your mobile money phone number for inside your post" },
      show_profile: { label: "Public profile level", desc: "Make every person for street look your regular trader profile" },
      show_location: { label: "Show my town/city", desc: "Make your town name look clear on top your market items" },
      allow_messages: { label: "Receive chat messages", desc: "Permit customers to drop text lines inside your chat sharp sharp" },
      data_analytics: { label: "App Analytics & Soft Setup", desc: "Allow make we look data optimize better features for your app" },
      two_factor: { label: "Double Pin Security (2FA)", desc: "Lock your account tight with extra OTP code when you want enter" }
    }
  },
  ar: {
    title: "الخصوصية والأمان",
    subtitle: "التحكم في من يمكنه رؤية معلوماتك الشخصية",
    save: "حفظ الإعدادات",
    saving: "جاري الحفظ...",
    saved: "✓ تم الحفظ بنجاح",
    exportTitle: "تحميل بياناتي الشخصية",
    exportDesc: "تصدير جميع بياناتك وملفاتك الشخصية وفقاً لقوانين حماية الخصوصية.",
    exportBtn: "طلب تصدير البيانات",
    deleteTitle: "حذف الحساب نهائياً",
    deleteDesc: "هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم مسح كافة بياناتك تماماً.",
    deleteBtn: "حذف حسابي الشخصي",
    modalTitle: "تأكيد حذف الحساب",
    modalDesc: "هل أنت متأكد تماماً؟ هذا الإجراء سيؤدي إلى حذف ملفك الشخصي وإعلاناتك بشكل دائم.",
    modalCancel: "إلغاء",
    modalConfirm: "حذف نهائي",
    items: {
      show_phone: { label: "إظهار رقم هاتفي", desc: "يمكن للمشترين رؤية رقم هاتفك مباشرة في تفاصيل الإعلانات" },
      show_profile: { label: "الملف الشخصي العام", desc: "ملفك الشخصي يكون مرئياً لجميع مستخدمي منصة بامبه" },
      show_location: { label: "إظهار مدينتي/بلدتي", desc: "عرض المدينة أو المنطقة الجغرافية التي تتواجد بها في إعلانك" },
      allow_messages: { label: "السماح بالرسائل الفورية", desc: "يمكن للمستخدمين الآخرين مراسلتك مباشرة عبر الدردشة حول السلع" },
      data_analytics: { label: "التحليلات والتخصيص", desc: "السماح بمعالجة البيانات لتحسين تجربتك وتخصيص المعروضات لك" },
      two_factor: { label: "المصادقة الثنائية (2FA)", desc: "تعزيز أمان حسابك عن طريق طلب رمز تحقق مؤقت عند تسجيل الدخول" }
    }
  },
  ff: {
    title: "Sirlu & Kisal",
    subtitle: "Suftu andu yimɓe ɓe njiɗ-ɗaa njiya kabaaru maa",
    save: "Resu Suftango",
    saving: "Ɗon resata...",
    saved: "✓ Resama ko woodi",
    exportTitle: "Heɓu Dereji Data am",
    exportDesc: "Wurtin kabaaru andital maa fof pottuɗo e sirlu kisal.",
    exportBtn: "Yamu Data am",
    deleteTitle: "Mumnu Andital am",
    deleteDesc: "Gollal ngal walaa huftinki kadi. Kabaaru maa fof ɗon meema ɗon e mumnema sam.",
    deleteBtn: "Mumnu Andital am sam",
    modalTitle: "Tabat Dow Mumnugol",
    modalDesc: "A ɗon mari tabat dow njiɗ-ɗaa mumnugo andital maa bee kuuje njaaraaɗe maa fof?",
    modalCancel: "Fasikna",
    modalConfirm: "Mumnu sam",
    items: {
      show_phone: { label: "Hollu line kabaaru am", desc: "Sodooɓe mbaaway yiygo line phone maa nder kuuje njaaraaɗe" },
      show_profile: { label: "Hollu andital am haa jama'are", desc: "Waɗu andital maa yeeyooɓe laara haa yimɓe fof nder Bambeh" },
      show_location: { label: "Hollu wuro/galle am", desc: "Hollu innde wuro maa dow kuuje sodaaɗe njaaraaɗe maa" },
      allow_messages: { label: "Jaɓu nelde winndannde", desc: "Yimɓe nlaaway nelgo maa winndannde chat dow kuuje sodaaɗe" },
      data_analytics: { label: "Andital Metrics & Custom Feed", desc: "Jaɓu gollal data ngam hesɗitinki kuuje pottuɗe e ko njiɗ-ɗaa" },
      two_factor: { label: "Kisal OTP ɗiɗal (2FA)", desc: "Ɓeydu kisal andital maa bee ɗon yama code OTP saa'i nastugo" }
    }
  }
};

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [settings, setSettings] = useState<PrivacySetting[]>([
    { id: "show_phone",     label: s.items.show_phone.label,     description: s.items.show_phone.desc,     enabled: false },
    { id: "show_profile",   label: s.items.show_profile.label,   description: s.items.show_profile.desc,   enabled: true },
    { id: "show_location",  label: s.items.show_location.label,  description: s.items.show_location.desc,  enabled: true },
    { id: "allow_messages", label: s.items.allow_messages.label, description: s.items.allow_messages.desc, enabled: true },
    { id: "data_analytics", label: s.items.data_analytics.label, description: s.items.data_analytics.desc, enabled: false },
    { id: "two_factor",     label: s.items.two_factor.label,     description: s.items.two_factor.desc,     enabled: false },
  ]);

  const toggle = (id: string) => setSettings((prev) => prev.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const map = Object.fromEntries(settings.map((item) => [item.id, item.enabled]));
      await supabase.from("user_preferences").upsert({ user_id: user.id, privacy_settings: map, updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error setting privacy preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="max-w-lg mx-auto p-4 text-start">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{s.subtitle}</p>
      </div>

      <div className="space-y-3">
        {settings.map((item) => (
          <div key={item.id} className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-all">
            <div className={`flex-1 min-w-0 ${isRtl ? "pl-4 pr-0 text-right" : "pr-4 pl-0 text-left"}`}>
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.enabled ? "bg-teal-600" : "bg-gray-200"}`}
            >
              <span 
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  item.enabled 
                    ? (isRtl ? "-translate-x-5" : "translate-x-5") 
                    : "translate-x-0"
                }`} 
              />
            </button>
          </div>
        ))}
      </div>

      {/* Data export box */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
        <p className="text-sm font-bold text-blue-900">{s.exportTitle}</p>
        <p className="text-xs text-blue-600 mt-1 leading-relaxed font-medium">{s.exportDesc}</p>
        <button type="button" className="mt-2 text-xs text-blue-600 font-bold underline focus:outline-none">{s.exportBtn}</button>
      </div>

      {/* Delete account box */}
      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 shadow-sm">
        <p className="text-sm font-bold text-red-900">{s.deleteTitle}</p>
        <p className="text-xs text-red-500 mt-1 leading-relaxed font-medium">{s.deleteDesc}</p>
        <button type="button" onClick={() => setShowDeleteConfirm(true)} className="mt-2 text-xs text-red-600 font-bold underline focus:outline-none">{s.deleteBtn}</button>
      </div>

      {/* Modal alert Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-start">
            <h3 className="font-bold text-lg text-gray-900">{s.modalTitle}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">{s.modalDesc}</p>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors">{s.modalCancel}</button>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 focus:outline-none transition-colors">{s.modalConfirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Action Footer */}
      <div className={`mt-6 flex ${isRtl ? "justify-start" : "justify-end"}`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none ${saved ? "bg-green-600 text-white shadow-sm" : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"} disabled:opacity-50`}
        >
          {saving ? s.saving : saved ? s.saved : s.save}
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;