/**
 * EmailPreferences.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/EmailPreferences.tsx
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

interface PrefItem { id: string; label: string; description: string; enabled: boolean; }
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string;
  subtitle: string;
  save: string;
  saving: string;
  saved: string;
  items: Record<string, { label: string; desc: string }>;
}> = {
  en: {
    title: "Email Preferences",
    subtitle: "Manage the emails you receive from Bambeh",
    save: "Save Preferences",
    saving: "Saving...",
    saved: "✓ Saved Successfully",
    items: {
      new_message: { label: "New Messages", desc: "Receive an email when you get a new chat message" },
      order_update: { label: "Order Updates", desc: "Status updates regarding your orders and deliveries" },
      promotions: { label: "Promotions & Offers", desc: "Special promo deals and exclusive discounts from Bambeh" },
      new_listing: { label: "New Listings", desc: "Alerts for new matching items posted in your searched criteria" },
      vendor_update: { label: "Vendor Updates", desc: "Get notifications about news from your favorite saved vendors" },
      security: { label: "Security Alerts", desc: "Immediate notifications for suspicious login attempts" },
      weekly_digest: { label: "Weekly Digest", desc: "A summary of the best deals and hot picks of the past week" }
    }
  },
  fr: {
    title: "Préférences email",
    subtitle: "Gérez les emails que vous recevez de Bambeh",
    save: "Sauvegarder",
    saving: "Sauvegarde...",
    saved: "✓ Sauvegardé",
    items: {
      new_message: { label: "Nouveaux messages", desc: "Recevez un email quand vous avez un nouveau message" },
      order_update: { label: "Mises à jour des commandes", desc: "Statut de vos commandes et livraisons" },
      promotions: { label: "Promotions & offres", desc: "Offres spéciales et réductions Bambeh" },
      new_listing: { label: "Nouvelles annonces", desc: "Annonces qui correspondent à vos recherches" },
      vendor_update: { label: "Actualités vendeurs", desc: "Nouveautés de vos vendeurs favoris" },
      security: { label: "Alertes de sécurité", desc: "Connexions et activités suspectes" },
      weekly_digest: { label: "Résumé hebdomadaire", desc: "Les meilleures offres de la semaine" }
    }
  },
  pidgin: {
    title: "Email Settings",
    subtitle: "Choose how you want make Bambeh send you message for email",
    save: "Save Settings",
    saving: "E dey lock am...",
    saved: "✓ E don save fine",
    items: {
      new_message: { label: "New Chat Message", desc: "Get email sharp sharp when person text you" },
      order_update: { label: "Market & Delivery Updates", desc: "Hear how your market and delivery dey waka" },
      promotions: { label: "Bambeh Beta Afeere / Promos", desc: "Get low-price news and direct discount chop money" },
      new_listing: { label: "New Market Postings", desc: "Alerts when things wey you dey find drop for street" },
      vendor_update: { label: "Your Favorite Sellers", desc: "Hear new things wey your regular traders bring come" },
      security: { label: "Security & Hack Alerts", desc: "Quick information when strange person try enter your account" },
      weekly_digest: { label: "Weekly Chops Summary", desc: "Better weekly collections of finest items on soft budget" }
    }
  },
  ar: {
    title: "تفضيلات البريد الإلكتروني",
    subtitle: "إدارة الرسائل البريدية التي تتلقاها من منصة بامبه",
    save: "حفظ التفضيلات",
    saving: "جاري الحفظ...",
    saved: "✓ تم الحفظ بنجاح",
    items: {
      new_message: { label: "الرسائل الجديدة", desc: "تلقي بريد إلكتروني عند وصول رسائل دردشة جديدة" },
      order_update: { label: "تحديثات الطلبات", desc: "إشعارات حول حالة طلباتك وعمليات التوصيل" },
      promotions: { label: "العروض والخصومات", desc: "العروض الخاصة والتخفيضات الحصرية من بامبه" },
      new_listing: { label: "الإعلانات الجديدة", desc: "تنبيهات للإعلانات الجديدة التي تطابق اهتماماتك" },
      vendor_update: { label: "تحديثات البائعين", desc: "متابعة المنتجات الجديدة من البائعين المفضلين لديك" },
      security: { label: "التنبيهات الأمنية", desc: "إشعارات فورية عند وجود محاولات تسجيل دخول مشبوهة" },
      weekly_digest: { label: "الملخص الأسبوعي", desc: "أفضل العروض والمنتجات الشائعة خلال الأسبوع الماضي" }
    }
  },
  ff: {
    title: "Suftango Email",
    subtitle: "Resu no njiɗ-ɗaa Bambeh nelda maa winndannde haa email maa",
    save: "Resu Suftango",
    saving: "Ɗon resata...",
    saved: "✓ Resama ko woodi",
    items: {
      new_message: { label: "Nelde Keese", desc: "Heɓu email saa'i fof nde neɗɗo neli maa winndannde" },
      order_update: { label: "Hesɗitinki Kuuje Sodaaɗe", desc: "Anditu no kuuje maa e jottinki mum ɗon waka" },
      promotions: { label: "Ustagol Limoore / Promos", desc: "Heɓu kabaaru ustagol limoore e s व्यवस्था diga Bambeh" },
      new_listing: { label: "Kuuje Keese njaaraaɗe", desc: "Andital kuuje keese pottuɗe e ko njiɗ-ɗaa sodgo" },
      vendor_update: { label: "Kabaaru Yeeyooɓe Yiɗaaɓe", desc: "Heɓu kabaaru kuuje keese diga yeeyooɓe maa ɓe njiɗ-ɗaa" },
      security: { label: "Hoolaare Kisal", desc: "Nelde ko yaawi to neɗɗo gundo ɗon eta mabbingol andital maa" },
      weekly_digest: { label: "Kabaaru Lewru fof", desc: "Limoore kuuje ɓurde pottugo e ustagol sirlu nder yontere nden" }
    }
  }
};

const EmailPreferences: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [prefs, setPrefs] = useState<PrefItem[]>([
    { id: "new_message",   label: s.items.new_message.label,   description: s.items.new_message.desc,   enabled: true },
    { id: "order_update",  label: s.items.order_update.label,  description: s.items.order_update.desc,  enabled: true },
    { id: "promotions",    label: s.items.promotions.label,    description: s.items.promotions.desc,    enabled: false },
    { id: "new_listing",   label: s.items.new_listing.label,   description: s.items.new_listing.desc,   enabled: false },
    { id: "vendor_update", label: s.items.vendor_update.label, description: s.items.vendor_update.desc, enabled: true },
    { id: "security",      label: s.items.security.label,      description: s.items.security.desc,      enabled: true },
    { id: "weekly_digest", label: s.items.weekly_digest.label, description: s.items.weekly_digest.desc, enabled: false },
  ]);

  const toggle = (id: string) => setPrefs((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const prefsMap = Object.fromEntries(prefs.map((p) => [p.id, p.enabled]));
      await supabase.from("user_preferences").upsert({ user_id: user.id, email_prefs: prefsMap, updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error setting email preferences:", err);
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
        {prefs.map((pref) => (
          <div key={pref.id} className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-all">
            <div className={`flex-1 min-w-0 ${isRtl ? "pl-4 pr-0 text-right" : "pr-4 pl-0 text-left"}`}>
              <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">{pref.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(pref.id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pref.enabled ? "bg-teal-600" : "bg-gray-200"}`}
            >
              <span 
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  pref.enabled 
                    ? (isRtl ? "-translate-x-5" : "translate-x-5") 
                    : "translate-x-0"
                }`} 
              />
            </button>
          </div>
        ))}
      </div>

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

export default EmailPreferences;