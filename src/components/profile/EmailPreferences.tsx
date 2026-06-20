/**
 * src/components/profile/EmailPreferences.tsx
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface PrefItem { id: string; label: string; description: string; enabled: boolean; }

const EmailPreferences: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<PrefItem[]>([
    { id: "new_message",     label: "Nouveaux messages",        description: "Recevez un email quand vous avez un nouveau message", enabled: true },
    { id: "order_update",    label: "Mises Ã  jour des commandes", description: "Statut de vos commandes et livraisons",            enabled: true },
    { id: "promotions",      label: "Promotions & offres",       description: "Offres spÃ©ciales et rÃ©ductions Bambeh",             enabled: false },
    { id: "new_listing",     label: "Nouvelles annonces",        description: "Annonces qui correspondent Ã  vos recherches",       enabled: false },
    { id: "vendor_update",   label: "ActualitÃ©s vendeurs",       description: "NouveautÃ©s de vos vendeurs favoris",                enabled: true },
    { id: "security",        label: "Alertes de sÃ©curitÃ©",       description: "Connexions et activitÃ©s suspectes",                 enabled: true },
    { id: "weekly_digest",   label: "RÃ©sumÃ© hebdomadaire",       description: "Les meilleures offres de la semaine",               enabled: false },
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">PrÃ©fÃ©rences email</h2>
        <p className="text-sm text-gray-500 mt-1">GÃ©rez les emails que vous recevez de Bambeh</p>
      </div>

      <div className="space-y-3">
        {prefs.map((pref) => (
          <div key={pref.id} className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
            </div>
            <button
              onClick={() => toggle(pref.id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${pref.enabled ? "bg-teal-600" : "bg-gray-300"}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pref.enabled ? "translate-x-5" : "translate-x-0"}`} />
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
          {saving ? "Sauvegarde..." : saved ? "âœ“ SauvegardÃ©" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
};

export default EmailPreferences;


