/**
 * src/components/profile/PrivacySettings.tsx
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface PrivacySetting { id: string; label: string; description: string; enabled: boolean; dangerous?: boolean; }

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [settings, setSettings] = useState<PrivacySetting[]>([
    { id: "show_phone",       label: "Afficher mon téléphone",        description: "Les acheteurs peuvent voir votre numéro dans les annonces", enabled: false },
    { id: "show_profile",     label: "Profil public",                  description: "Votre profil est visible par tous les utilisateurs",         enabled: true },
    { id: "show_location",    label: "Afficher ma ville",              description: "Votre ville apparaît sur vos annonces",                     enabled: true },
    { id: "allow_messages",   label: "Recevoir des messages",          description: "Les autres utilisateurs peuvent vous envoyer des messages",  enabled: true },
    { id: "data_analytics",   label: "Analytiques & personnalisation", description: "Permettre l'amélioration de l'expérience avec vos données", enabled: false },
    { id: "two_factor",       label: "Double authentification",        description: "Renforcer la sécurité de votre compte avec un OTP",          enabled: false },
  ]);

  const toggle = (id: string) => setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const map = Object.fromEntries(settings.map((s) => [s.id, s.enabled]));
      await supabase.from("user_preferences").upsert({ user_id: user.id, privacy_settings: map, updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Confidentialité & Sécurité</h2>
        <p className="text-sm text-gray-500 mt-1">Contrôlez qui peut voir vos informations</p>
      </div>

      <div className="space-y-3">
        {settings.map((s) => (
          <div key={s.id} className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
            </div>
            <button
              onClick={() => toggle(s.id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${s.enabled ? "bg-teal-600" : "bg-gray-300"}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${s.enabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Data export */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm font-semibold text-blue-900">Télécharger mes données</p>
        <p className="text-xs text-blue-700 mt-1">Exportez toutes vos données personnelles conformément au RGPD.</p>
        <button className="mt-2 text-xs text-blue-600 underline">Demander l'export</button>
      </div>

      {/* Delete account */}
      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
        <p className="text-sm font-semibold text-red-900">Supprimer mon compte</p>
        <p className="text-xs text-red-700 mt-1">Cette action est irréversible. Toutes vos données seront supprimées.</p>
        <button onClick={() => setShowDeleteConfirm(true)} className="mt-2 text-xs text-red-600 underline">Supprimer mon compte</button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-gray-900">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mt-2">Cette action supprimera définitivement votre compte. Êtes-vous sûr ?</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium">Annuler</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? "bg-green-500 text-white" : "bg-teal-600 text-white hover:bg-teal-700"} disabled:opacity-60`}>
          {saving ? "Sauvegarde..." : saved ? "✓ Sauvegardé" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;


