/**
 * src/components/forms/AddServiceForm.tsx
 * Bambeh Marketplace â€” Add Service Listing Form
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import LocationSelector from "@/components/location/LocationSelector";

interface AddServiceFormProps { onSuccess?: () => void; onCancel?: () => void; }

const SERVICE_CATEGORIES = ["Informatique & Tech","Plomberie","Ã‰lectricitÃ©","Peinture & DÃ©coration","Jardinage","Nettoyage","Transport & DÃ©mÃ©nagement","Coiffure & BeautÃ©","Cours & Formation","Photographie","Design","Autres"] as const;

const AddServiceForm: React.FC<AddServiceFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title:"", description:"", category:"", priceXAF:"", priceUnit:"fixed", experience:"", isAvailable:true });
  const [location, setLocation] = useState({ city:"", region:"", country:"Cameroun", address:"" });
  const set = (k: keyof typeof form, v: string|boolean) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Connectez-vous d'abord."); return; }
    if (!form.title||!form.category||!form.priceXAF) { setError("Remplissez les champs obligatoires."); return; }
    setLoading(true); setError("");
    try {
      const { error: dbErr } = await supabase.from("service_listings").insert({
        provider_id: user.id, title: form.title, description: form.description,
        category: form.category, price_xaf: parseInt(form.priceXAF),
        price_unit: form.priceUnit, experience: form.experience,
        is_available: form.isAvailable,
        city: location.city, region: location.region, country: location.country||"Cameroun",
        status:"active", created_at: new Date().toISOString(),
      });
      if (dbErr) throw dbErr;
      onSuccess?.();
    } catch(e) { setError(e instanceof Error?e.message:"Erreur"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><h2 className="text-xl font-bold text-gray-900">Proposer un service</h2></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre du service <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ex: RÃ©paration ordinateurs & smartphones" required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">CatÃ©gorie <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={e=>set("category",e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white outline-none">
              <option value="">-- Choisir --</option>{SERVICE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tarif (FCFA) <span className="text-red-500">*</span></label>
            <div className="flex gap-1">
              <input type="number" value={form.priceXAF} onChange={e=>set("priceXAF",e.target.value)} placeholder="Ex: 5000" required min="0" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none" />
              <select value={form.priceUnit} onChange={e=>set("priceUnit",e.target.value)} className="border border-gray-300 rounded-xl px-2 py-2.5 text-xs bg-white"><option value="fixed">Fixe</option><option value="hour">/h</option><option value="day">/j</option></select>
            </div></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4} placeholder="DÃ©crivez votre service en dÃ©tail..." className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none resize-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">ExpÃ©rience</label>
          <input type="text" value={form.experience} onChange={e=>set("experience",e.target.value)} placeholder="Ex: 5 ans d'expÃ©rience en informatique" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none" /></div>
        <LocationSelector value={location} onChange={setLocation} label="Zone de service" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isAvailable} onChange={e=>set("isAvailable",e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
          <span className="text-sm text-gray-700">Disponible immÃ©diatement</span>
        </label>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-2">
          {onCancel && <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">Annuler</button>}
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-60">{loading?"Publication...":"Publier"}</button>
        </div>
      </form>
    </div>
  );
};

export default AddServiceForm;


