/**
 * src/components/forms/AddMarketplaceItemForm.tsx
 * Bambeh Marketplace — Add Marketplace Item Form
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import LocationSelector from "@/components/location/LocationSelector";

interface AddMarketplaceItemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = ["Électronique","Vêtements & Mode","Maison & Jardin","Sport & Loisirs","Véhicules","Immobilier","Livres & Éducation","Santé & Beauté","Alimentation","Autres"] as const;
const CONDITIONS = ["Neuf","Comme neuf","Bon état","État correct","Pour pièces"] as const;

const AddMarketplaceItemForm: React.FC<AddMarketplaceItemFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title:"", description:"", category:"", condition:"", priceXAF:"", isNegotiable:false });
  const [location, setLocation] = useState({ city:"", region:"", country:"Cameroun", address:"" });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  const set = (k: keyof typeof form, v: string|boolean) => setForm(f=>({...f,[k]:v}));

  const addImage = () => {
    if (imageInput.trim() && imageUrls.length < 5) { setImageUrls(p=>[...p, imageInput.trim()]); setImageInput(""); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Connectez-vous d'abord."); return; }
    if (!form.title||!form.category||!form.condition||!form.priceXAF) { setError("Remplissez tous les champs obligatoires."); return; }
    setLoading(true); setError("");
    try {
      const { error: dbErr } = await supabase.from("marketplace_items").insert({
        seller_id: user.id, title: form.title, description: form.description,
        category: form.category, condition: form.condition,
        price_xaf: parseInt(form.priceXAF), is_negotiable: form.isNegotiable,
        images: imageUrls.map((url,i)=>({id:`img-${i}`,url,order:i,is_main:i===0})),
        city: location.city, region: location.region, country: location.country||"Cameroun",
        status:"active", view_count:0, favorite_count:0,
        expires_at: new Date(Date.now()+30*86400000).toISOString(),
        created_at: new Date().toISOString(),
      });
      if (dbErr) throw dbErr;
      onSuccess?.();
    } catch(e) { setError(e instanceof Error?e.message:"Erreur"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><h2 className="text-xl font-bold text-gray-900">Publier une annonce</h2></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ex: iPhone 13 Pro Max 256GB" required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={e=>set("category",e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white outline-none">
              <option value="">-- Choisir --</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État <span className="text-red-500">*</span></label>
            <select value={form.condition} onChange={e=>set("condition",e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white outline-none">
              <option value="">-- Choisir --</option>
              {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4} placeholder="Décrivez votre article..." className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none resize-none" />
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) <span className="text-red-500">*</span></label>
            <input type="number" value={form.priceXAF} onChange={e=>set("priceXAF",e.target.value)} placeholder="Ex: 150000" required min="0" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none" />
          </div>
          <label className="flex items-center gap-2 pb-2.5 cursor-pointer">
            <input type="checkbox" checked={form.isNegotiable} onChange={e=>set("isNegotiable",e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
            <span className="text-sm text-gray-700">Négociable</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos (URLs, max 5)</label>
          <div className="flex gap-2">
            <input type="url" value={imageInput} onChange={e=>setImageInput(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none" />
            <button type="button" onClick={addImage} disabled={imageUrls.length>=5} className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-40">Ajouter</button>
          </div>
          {imageUrls.length>0 && <div className="flex gap-2 mt-2 flex-wrap">{imageUrls.map((url,i)=><div key={i} className="relative"><img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border"/><button type="button" onClick={()=>setImageUrls(p=>p.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button></div>)}</div>}
        </div>
        <LocationSelector value={location} onChange={setLocation} label="Localisation" />
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-2">
          {onCancel && <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">Annuler</button>}
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-60">{loading?"Publication...":"Publier"}</button>
        </div>
      </form>
    </div>
  );
};

export default AddMarketplaceItemForm;




