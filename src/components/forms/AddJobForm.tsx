/**
 * src/components/forms/AddJobForm.tsx
 * Bambeh Marketplace — Add Job Listing Form
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import LocationSelector from "@/components/location/LocationSelector";

interface AddJobFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JOB_TYPES = ["CDI", "CDD", "Temps partiel", "Stage", "Freelance", "Bénévolat"] as const;
const JOB_CATEGORIES = ["Informatique & Tech", "Commerce & Vente", "Éducation", "Santé", "Transport", "Agriculture", "BTP & Travaux", "Administration", "Hôtellerie & Restauration", "Autres"] as const;

const AddJobForm: React.FC<AddJobFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    jobType: "" as typeof JOB_TYPES[number] | "",
    category: "" as typeof JOB_CATEGORIES[number] | "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "XAF",
    isRemote: false,
    expiresAt: "",
  });
  const [location, setLocation] = useState({ city: "", region: "", country: "Cameroun", address: "" });

  const set = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Vous devez être connecté."); return; }
    if (!form.title || !form.description || !form.jobType || !form.category) { setError("Veuillez remplir tous les champs obligatoires."); return; }
    setLoading(true);
    setError("");
    try {
      const { error: dbErr } = await supabase.from("job_listings").insert({
        poster_id: user.id,
        title: form.title,
        company: form.company,
        description: form.description,
        requirements: form.requirements,
        job_type: form.jobType,
        category: form.category,
        salary_min: form.salaryMin ? parseInt(form.salaryMin) : null,
        salary_max: form.salaryMax ? parseInt(form.salaryMax) : null,
        salary_currency: form.salaryCurrency,
        is_remote: form.isRemote,
        city: location.city,
        region: location.region,
        country: location.country || "Cameroun",
        status: "active",
        expires_at: form.expiresAt || null,
        created_at: new Date().toISOString(),
      });
      if (dbErr) throw dbErr;
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Publier une offre d'emploi</h2>
        <p className="text-sm text-gray-500 mt-1">Trouvez le talent idéal pour votre entreprise</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Développeur React Senior" required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input type="text" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Nom de l'entreprise" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
        </div>

        {/* Type & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat <span className="text-red-500">*</span></label>
            <select value={form.jobType} onChange={(e) => set("jobType", e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white">
              <option value="">-- Sélectionner --</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white">
              <option value="">-- Sélectionner --</option>
              {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description du poste <span className="text-red-500">*</span></label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..." rows={5} required className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none" />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis & Qualifications</label>
          <textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder="Niveau d'études, expériences requises, compétences..." rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none" />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salaire mensuel (optionnel)</label>
          <div className="flex gap-2 items-center">
            <input type="number" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="Min" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
            <span className="text-gray-400 text-sm">—</span>
            <input type="number" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="Max" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
            <select value={form.salaryCurrency} onChange={(e) => set("salaryCurrency", e.target.value)} className="border border-gray-300 rounded-xl px-2 py-2.5 text-sm bg-white">
              <option value="XAF">FCFA</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <LocationSelector
          value={location}
          onChange={setLocation}
          label="Localisation"
        />

        {/* Remote & Expiry */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isRemote} onChange={(e) => set("isRemote", e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
            <span className="text-sm text-gray-700">Télétravail possible</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (optionnel)</label>
          <input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} min={new Date().toISOString().split("T")[0]} className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          {onCancel && <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Annuler</button>}
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-60">
            {loading ? "Publication..." : "Publier l'offre"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddJobForm;
