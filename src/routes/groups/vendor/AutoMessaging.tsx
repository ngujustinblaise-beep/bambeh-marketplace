/**
 * src/pages/vendor/AutoMessaging.tsx
 * Bambeh Marketplace ? Vendor Auto-Messaging
 * ? 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { MessageCircle, Plus, Trash2, Edit2, ArrowLeft, Save, ToggleRight, ToggleLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

interface AutoMessage {
  id: string;
  trigger: "new_inquiry" | "new_order" | "order_shipped" | "order_delivered" | "review_received";
  message: string;
  isActive: boolean;
}

const TRIGGER_LABELS: Record<AutoMessage["trigger"], string> = {
  new_inquiry: "Nouvelle demande de contact",
  new_order: "Nouvelle commande",
  order_shipped: "Commande exp?di?e",
  order_delivered: "Commande livr?e",
  review_received: "Avis re?u",
};

const DEFAULT_MESSAGES: Omit<AutoMessage, "id">[] = [
  { trigger: "new_inquiry", message: "Bonjour! Merci pour votre int?r?t. Je vous r?ponds dans les plus brefs d?lais. ? {{store_name}}", isActive: true },
  { trigger: "new_order", message: "Bonjour {{customer_name}}, votre commande #{{order_id}} a bien ?t? re?ue. Nous la pr?parons d?s maintenant!", isActive: true },
  { trigger: "order_shipped", message: "Bonne nouvelle! Votre commande #{{order_id}} a ?t? exp?di?e. Vous la recevrez bient?t.", isActive: true },
];

const AutoMessaging: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AutoMessage[]>(
    DEFAULT_MESSAGES.map((m, i) => ({ ...m, id: `auto-${i}` }))
  );
  const [editing, setEditing] = useState<AutoMessage | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleActive = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isActive: !m.isActive } : m));
  }, []);

  const saveEditing = useCallback(() => {
    if (!editing) return;
    setMessages((prev) =>
      prev.some((m) => m.id === editing.id)
        ? prev.map((m) => m.id === editing.id ? editing : m)
        : [...prev, editing]
    );
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [editing]);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addNew = useCallback(() => {
    setEditing({
      id: `auto-${Date.now()}`,
      trigger: "new_inquiry",
      message: "",
      isActive: true,
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <MessageCircle className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">Messages Automatiques</h1>
        <button type="button" onClick={addNew}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
        Utilisez <code className="bg-blue-100 px-1 rounded">{"{{customer_name}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{order_id}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{store_name}}"}</code> comme variables.
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700">Sauvegard?!</p>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`bg-white border rounded-2xl p-4 transition-all ${msg.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {TRIGGER_LABELS[msg.trigger]}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setEditing(msg)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => toggleActive(msg.id)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  {msg.isActive ? <ToggleRight className="w-4 h-4 text-teal-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                </button>
                <button type="button" onClick={() => deleteMessage(msg.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
          </div>
        ))}
      </div>

      {editing && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditing(null)} />
          <div className="fixed inset-x-4 bottom-4 bg-white rounded-2xl shadow-2xl z-50 p-5 space-y-4 max-w-lg mx-auto">
            <h3 className="font-bold text-gray-900">
              {messages.some((m) => m.id === editing.id) ? "Modifier" : "Nouveau"} message automatique
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">D?clencheur</label>
              <select
                value={editing.trigger}
                onChange={(e) => setEditing({ ...editing, trigger: e.target.value as AutoMessage["trigger"] })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={editing.message}
                onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-none"
                placeholder="Votre message automatique..."
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">Annuler</button>
              <button type="button" onClick={saveEditing} disabled={!editing.message.trim()}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AutoMessaging;





