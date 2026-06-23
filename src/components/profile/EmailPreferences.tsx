/**
 * src/components/profile/EmailPreferences.tsx
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * i18n: labels/descriptions are pulled from the local S table by the live
 * language (useLang from @/hooks/useAppLang). State holds only id -> on/off,
 * so toggles re-translate instantly when the language changes. Persisted shape
 * (user_preferences.email_prefs = { id: boolean }) is unchanged.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const PREF_IDS = [
  "new_message", "order_update", "promotions", "new_listing",
  "vendor_update", "security", "weekly_digest",
] as const;
type PrefId = typeof PREF_IDS[number];

const DEFAULT_ON: Record<PrefId, boolean> = {
  new_message: true, order_update: true, promotions: false, new_listing: false,
  vendor_update: true, security: true, weekly_digest: false,
};

const S: Record<Lang, {
  title: string; subtitle: string; save: string; saving: string; saved: string;
  items: Record<PrefId, { label: string; description: string }>;
}> = {
  en: {
    title: "Email Preferences",
    subtitle: "Manage the emails you receive from Bambeh",
    save: "Save", saving: "Saving...", saved: "âœ“ Saved",
    items: {
      new_message:   { label: "New messages",        description: "Get an email when you receive a new message" },
      order_update:  { label: "Order updates",       description: "Status of your orders and deliveries" },
      promotions:    { label: "Promotions & offers", description: "Special deals and Bambeh discounts" },
      new_listing:   { label: "New listings",        description: "Listings that match your searches" },
      vendor_update: { label: "Vendor news",         description: "Updates from your favorite vendors" },
      security:      { label: "Security alerts",      description: "Logins and suspicious activity" },
      weekly_digest: { label: "Weekly digest",       description: "The best deals of the week" },
    },
  },
  fr: {
    title: "PrÃ©fÃ©rences email",
    subtitle: "GÃ©rez les emails que vous recevez de Bambeh",
    save: "Sauvegarder", saving: "Sauvegarde...", saved: "âœ“ SauvegardÃ©",
    items: {
      new_message:   { label: "Nouveaux messages",         description: "Recevez un email quand vous avez un nouveau message" },
      order_update:  { label: "Mises Ã  jour des commandes", description: "Statut de vos commandes et livraisons" },
      promotions:    { label: "Promotions & offres",       description: "Offres spÃ©ciales et rÃ©ductions Bambeh" },
      new_listing:   { label: "Nouvelles annonces",        description: "Annonces qui correspondent Ã  vos recherches" },
      vendor_update: { label: "ActualitÃ©s vendeurs",       description: "NouveautÃ©s de vos vendeurs favoris" },
      security:      { label: "Alertes de sÃ©curitÃ©",       description: "Connexions et activitÃ©s suspectes" },
      weekly_digest: { label: "RÃ©sumÃ© hebdomadaire",       description: "Les meilleures offres de la semaine" },
    },
  },
  pidgin: {
    title: "Email Settings",
    subtitle: "Manage di emails wey you dey receive from Bambeh",
    save: "Save", saving: "E dey save...", saved: "âœ“ Don save",
    items: {
      new_message:   { label: "New messages",        description: "We go email you when new message land" },
      order_update:  { label: "Order updates",       description: "How your orders and delivery dey go" },
      promotions:    { label: "Promotions & offers", description: "Special deals and Bambeh discount" },
      new_listing:   { label: "New listings",        description: "Listings wey match wetin you dey find" },
      vendor_update: { label: "Vendor news",         description: "Latest from vendors wey you like" },
      security:      { label: "Security alerts",      description: "Login and any suspicious activity" },
      weekly_digest: { label: "Weekly digest",       description: "Di best deals for di week" },
    },
  },
  ar: {
    title: "ØªÙØ¶ÙŠÙ„Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ",
    subtitle: "ØªØ­ÙƒÙ‘Ù… ÙÙŠ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ØªÙŠ ØªØµÙ„Ùƒ Ù…Ù† Ø¨Ø§Ù…Ø¨ÙŠÙ‡",
    save: "Ø­ÙØ¸", saving: "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸...", saved: "âœ“ ØªÙ… Ø§Ù„Ø­ÙØ¸",
    items: {
      new_message:   { label: "Ø±Ø³Ø§Ø¦Ù„ Ø¬Ø¯ÙŠØ¯Ø©",        description: "Ø§Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø¹Ù†Ø¯ ÙˆØµÙˆÙ„ Ø±Ø³Ø§Ù„Ø© Ø¬Ø¯ÙŠØ¯Ø©" },
      order_update:  { label: "ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ø·Ù„Ø¨Ø§Øª",     description: "Ø­Ø§Ù„Ø© Ø·Ù„Ø¨Ø§ØªÙƒ ÙˆØ¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ØªØ³Ù„ÙŠÙ…" },
      promotions:    { label: "Ø§Ù„Ø¹Ø±ÙˆØ¶ ÙˆØ§Ù„ØªØ®ÙÙŠØ¶Ø§Øª",   description: "Ø¹Ø±ÙˆØ¶ Ø®Ø§ØµØ© ÙˆØ®ØµÙˆÙ…Ø§Øª Ø¨Ø§Ù…Ø¨ÙŠÙ‡" },
      new_listing:   { label: "Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¬Ø¯ÙŠØ¯Ø©",       description: "Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØªØ·Ø§Ø¨Ù‚ Ø¹Ù…Ù„ÙŠØ§Øª Ø¨Ø­Ø«Ùƒ" },
      vendor_update: { label: "Ø£Ø®Ø¨Ø§Ø± Ø§Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ†",      description: "Ø¬Ø¯ÙŠØ¯ Ø§Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ† Ø§Ù„Ù…ÙØ¶Ù„ÙŠÙ† Ù„Ø¯ÙŠÙƒ" },
      security:      { label: "ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø£Ù…Ø§Ù†",      description: "ØªØ³Ø¬ÙŠÙ„Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙˆØ§Ù„Ø£Ù†Ø´Ø·Ø© Ø§Ù„Ù…Ø´Ø¨ÙˆÙ‡Ø©" },
      weekly_digest: { label: "Ø§Ù„Ù…Ù„Ø®Ù‘Øµ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ",    description: "Ø£ÙØ¶Ù„ Ø§Ù„Ø¹Ø±ÙˆØ¶ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹" },
    },
  },
  ff: {
    title: "Teelte iimeel",
    subtitle: "Toppito iimeelji É—i keÉ“ataa to Bambeh",
    save: "Dannu", saving: "ÆŠon danee...", saved: "âœ“ Dannaama",
    items: {
      new_message:   { label: "Nulalji kesi",        description: "KeÉ“ iimeel si nulal keso arii" },
      order_update:  { label: "KesÉ—itineeji umrooje", description: "Ngonka umrooje maa e jonnugol" },
      promotions:    { label: "NjeÃ±tudi e tewtooje",  description: "Tewtooje keeriiÉ—e e ustingol Bambeh" },
      new_listing:   { label: "Njeeyaaji kesi",       description: "Njeeyaaji nanndi e É—aÉ“É“e maa" },
      vendor_update: { label: "Kabaruuji njeeyooÉ“e",  description: "Keso njeeyooÉ“e É“e njiÉ—É—aa" },
      security:      { label: "Tintinooje kisal",     description: "NaatirÉ—e e golle sikkitiniiÉ—e" },
      weekly_digest: { label: "CosÉ—annde yontere",    description: "Tewtooje É“urÉ—e yontere oo" },
    },
  },
};

const EmailPreferences: React.FC = () => {
  const { user } = useAuth();
  const lang = useLang();
  const l: Lang = (lang in S ? lang : "en") as Lang;
  const s = S[l];
  const isRtl = l === "ar";

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState<Record<PrefId, boolean>>(DEFAULT_ON);

  const toggle = (id: PrefId) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("user_preferences").upsert({ user_id: user.id, email_prefs: enabled, updated_at: new Date().toISOString() });
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
        {PREF_IDS.map((id) => (
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

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? "bg-green-500 text-white" : "bg-teal-600 text-white hover:bg-teal-700"} disabled:opacity-60`}
        >
          {saving ? s.saving : saved ? s.saved : s.save}
        </button>
      </div>
    </div>
  );
};

export default EmailPreferences;




