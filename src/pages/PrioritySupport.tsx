/**
 * src/pages/vendor/PrioritySupport.tsx
 * Bambeh Marketplace � Priority Support Page
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { Headphones, ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "payment" | "account" | "listing" | "order" | "technical" | "other";

const PrioritySupport: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<TicketCategory>("other");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (!subject.trim() || !message.trim()) { setError("Veuillez remplir tous les champs"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { error: dbErr } = await supabase.from("support_tickets").insert({
        user_id: userId,
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
        type: "vendor_priority",
        created_at: new Date().toISOString(),
      });
      if (dbErr) { setError(dbErr.message); return; }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'envoi");
    } finally {
      setSubmitting(false);
    }
  }, [category, priority, subject, message]);

  if (submitted) return (
    <div className="max-w-lg mx-auto p-4 text-center py-16">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket envoy�!</h2>
      <p className="text-sm text-gray-500 mb-6">Notre �quipe Premium vous r�pondra dans les 2 heures ouvrables.</p>
      <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium">Retour</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Headphones className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">Support Prioritaire</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ icon: Clock, label: "R�ponse < 2h", color: "text-blue-600 bg-blue-50" },
          { icon: Headphones, label: "Agent d�di�", color: "text-teal-600 bg-teal-50" },
          { icon: CheckCircle, label: "R�solution garantie", color: "text-green-600 bg-green-50" }
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-3 text-center ${item.color.split(" ")[1]}`}>
            <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color.split(" ")[0]}`} />
            <p className={`text-xs font-medium ${item.color.split(" ")[0]}`}>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cat�gorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 bg-white">
            <option value="payment">Paiement & Revenus</option>
            <option value="account">Compte & V�rification</option>
            <option value="listing">Annonces</option>
            <option value="order">Commandes</option>
            <option value="technical">Probl�me technique</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priorit�</label>
          <div className="grid grid-cols-4 gap-2">
            {(["low", "medium", "high", "urgent"] as TicketPriority[]).map((p) => (
              <button key={p} type="button" onClick={() => setPriority(p)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  priority === p
                    ? p === "urgent" ? "bg-red-500 border-red-500 text-white" :
                      p === "high" ? "bg-orange-500 border-orange-500 text-white" :
                      p === "medium" ? "bg-yellow-500 border-yellow-500 text-white" :
                      "bg-gray-500 border-gray-500 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}>
                {p === "low" ? "Faible" : p === "medium" ? "Moyen" : p === "high" ? "�lev�" : "Urgent"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="D�crivez bri�vement votre probl�me" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500" maxLength={100} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message d�taill� *</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="D�crivez votre probl�me en d�tail. Incluez les IDs de commande ou d'annonce si pertinent." className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-none" maxLength={2000} />
          <p className="text-xs text-gray-400 text-right mt-0.5">{message.length}/2000</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button type="button" onClick={submit} disabled={submitting}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? "Envoi..." : "Envoyer au support prioritaire"}
        </button>
      </div>
    </div>
  );
};

export default PrioritySupport;





