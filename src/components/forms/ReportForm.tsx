/**
 * src/components/forms/ReportForm.tsx
 * Bambeh Marketplace — Report / Signalement Form
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  itemDetails?: {
    itemId?: string;
    itemType?: string;
    itemTitle?: string;
  };
}

const REPORT_REASONS = [
  "Produit frauduleux ou faux",
  "Contenu inapproprié ou offensant",
  "Spam ou publicité mensongère",
  "Prix abusif",
  "Vendeur malhonnête",
  "Article interdit",
  "Informations incorrectes",
  "Autre",
];

const ReportForm: React.FC<ReportFormProps> = ({ isOpen, onClose, itemDetails }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { setError("Veuillez sélectionner un motif."); return; }
    if (!user) { setError("Vous devez être connecté pour signaler."); return; }
    setLoading(true);
    setError("");
    try {
      await supabase.from("reports").insert({
        reporter_id: user.id,
        item_id: itemDetails?.itemId ?? null,
        item_type: itemDetails?.itemType ?? null,
        item_title: itemDetails?.itemTitle ?? null,
        reason,
        description,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason(""); setDescription(""); setSubmitted(false); setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Signaler</h2>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Signalement envoyé</h3>
              <p className="text-sm text-gray-500 mb-6">Merci. Notre équipe examinera votre signalement dans les plus brefs délais.</p>
              <button onClick={handleClose} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {itemDetails?.itemTitle && (
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-500">Article signalé</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{itemDetails.itemTitle}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif du signalement <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${reason === r ? "border-red-400 bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}>
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="text-red-600" />
                      <span className="text-sm text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le problème en détail..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={handleClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors text-sm disabled:opacity-60">
                  {loading ? "Envoi..." : "Signaler"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
