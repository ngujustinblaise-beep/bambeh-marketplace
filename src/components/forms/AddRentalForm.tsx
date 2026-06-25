/**
 * src/components/forms/AddRentalForm.tsx
 * Bambeh Marketplace — Add Rental Listing Form
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import LocationSelector from "@/components/location/LocationSelector";

interface AddRentalFormProps { onSuccess?: () => void; onCancel?: () => void; }

const RENTAL_TYPES = ["Appartement","Maison","Studio","Chambre","Bureau","Entrepôt","Terrain","Autre"] as const;

const AddRentalForm: React.FC<AddRentalFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title:"", description:"", rentalType:"", priceXAF:"", pricePeriod:"month", bedrooms:"", bathrooms:"", area:"" });
  const [location, setLocation] = useState({ city:"", region:"", country:"Cameroun", address:"" });
  const set = (k: keyof typeof form, v: string) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Connectez-vous d'abord."); return; }
    if (!form.title||!form.rentalType||!form.priceXAF) { setError("Remplissez les champs obligatoires."); return; }
    setLoading(true); setError("");
    try {
      const { error: dbErr } = await supabase.from("rental_listings").insert({
        owner_id: user.id, title: form.title, description: form.description,
        rental_type: form.rentalType, price_xaf: parseInt(form.priceXAF),
        price_period: form.pricePeriod, bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        area_sqm: form.area ? parseFloat(form.area) : null,
        city: location.city, region: location.region, country: location.country||"Cameroun",
        address: location.address, status:"active", created_at: new Date().toISOString(),
      });
      if (dbErr) throw dbErr;
      onSuccess?.();
    } catch(e) { setError(e instanceof Error?e.message:"Erreur"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><h2 className="text-xl font-bold text-gray-900">Mettre en location</h2></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ex: Appartement 3 pièces Bastos" required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
            <select value={form.rentalType} onChange={e=>set("rentalType",e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white outline-none">
              <option value="">-- Choisir --</option>{RENTAL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) <span className="text-red-500">*</span></label>
            <div className="flex gap-1">
              <input type="number" value={form.priceXAF} onChange={e=>set("priceXAF",e.target.value)} placeholder="Ex: 80000" required min="0" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none" />
              <select value={form.pricePeriod} onChange={e=>set("pricePeriod",e.target.value)} className="border border-gray-300 rounded-xl px-2 py-2.5 text-xs bg-white"><option value="day">/jour</option><option value="month">/mois</option><option value="year">/an</option></select>
            </div></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Chambres</label><input type="number" value={form.bedrooms} onChange={e=>set("bedrooms",e.target.value)} min="0" placeholder="0" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">SDB</label><input type="number" value={form.bathrooms} onChange={e=>set("bathrooms",e.target.value)} min="0" placeholder="0" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Surface (m²)</label><input type="number" value={form.area} onChange={e=>set("area",e.target.value)} min="0" placeholder="0" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4} placeholder="Décrivez votre bien..." className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none resize-none" /></div>
        <LocationSelector value={location} onChange={(loc) => setLocation((prev) => ({ ...prev, ...loc }))} required />
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-2">
          {onCancel && <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">Annuler</button>}
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-60">{loading?"Publication...":"Publier"}</button>
        </div>
      </form>
    </div>
  );
};

export default AddRentalForm;






