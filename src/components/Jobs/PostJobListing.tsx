/**
 * src/components/Jobs/PostJobListing.tsx
 * Bambeh Marketplace — Post Job Listing Form
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { Briefcase, MapPin, DollarSign, Calendar, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createJob } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";

interface PostJobListingProps {
  userId: string;
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const JOB_CATEGORIES = [
  "Technologie & IT", "Commerce & Vente", "Éducation & Formation",
  "Santé & Médical", "Construction & BTP", "Transport & Logistique",
  "Agriculture", "Finance & Comptabilité", "Marketing & Communication",
  "Juridique", "Hôtellerie & Restauration", "Autre",
];

const _CITIES = [
  "Yaoundé", "Douala", "Garoua", "Bamenda", "Maroua",
  "Bafoussam", "Ngaoundéré", "Kumba", "Bertoua", "Limbe",
];

const PostJobListing: React.FC<PostJobListingProps> = ({
  userId, onSuccess, onCancel, className = "",
}) => {
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    benefits: "",
    category: "",
    jobType: "full_time" as JobListing["jobType"],
    experienceLevel: "entry" as JobListing["experienceLevel"],
    salaryMinXAF: "",
    salaryMaxXAF: "",
    isSalaryNegotiable: false,
    city: "",
    region: "",
    isRemote: false,
    applicationDeadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
      },
    []
  );

  const toggle = useCallback(
    (field: string) => () =>
      setForm((prev) => ({ ...prev, [field]: !(prev as Record<string, unknown>)[field] })),
    []
  );

  const validate = (): string | null => {
    if (!form.title.trim()) return "Le titre du poste est obligatoire";
    if (form.title.trim().length < 5) return "Le titre doit contenir au moins 5 caractères";
    if (!form.category) return "Veuillez sélectionner une catégorie";
    if (!form.description.trim()) return "La description est obligatoire";
    if (form.description.trim().length < 30) return "Description trop courte (min 30 caractères)";
    if (!form.city) return "Veuillez sélectionner une ville";
    return null;
  };

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    try {
      const { success: ok, id, error: apiErr } = await createJob(userId, {
        title: form.title.trim(),
        company: form.company.trim() || undefined,
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        benefits: form.benefits.trim() || undefined,
        category: form.category,
        jobType: form.jobType,
        experienceLevel: form.experienceLevel,
        salaryMinXAF: form.salaryMinXAF ? Number(form.salaryMinXAF) : undefined,
        salaryMaxXAF: form.salaryMaxXAF ? Number(form.salaryMaxXAF) : undefined,
        isSalaryNegotiable: form.isSalaryNegotiable,
        location: {
          city: form.city,
          region: form.region || form.city,
          country: "",
        },
        isRemote: form.isRemote,
        applicationDeadline: form.applicationDeadline || undefined,
        status: "active",
      });

      if (!ok || apiErr) { setError(apiErr ?? "Erreur lors de la publication"); return; }
      setSuccess(true);
      if (id) onSuccess?.(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }, [form, userId, onSuccess]);

  if (success) {
    return (
      <div className={`text-center py-10 ${className}`}>
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Offre publiée!</h2>
        <p className="text-sm text-gray-500">Votre offre d'emploi est maintenant visible sur Bambeh.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">Publier une offre d'emploi</h2>
        <p className="text-sm text-gray-500">Trouvez les meilleurs talents au Cameroun</p>
      </div>

      {/* Title & Company */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste *</label>
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300"><Briefcase className="w-4 h-4 text-gray-400" /></div>
            <input type="text" value={form.title} onChange={set("title")} placeholder="ex: Développeur Web Senior" className="flex-1 px-3 py-2.5 text-sm outline-none" maxLength={100} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300"><Users className="w-4 h-4 text-gray-400" /></div>
            <input type="text" value={form.company} onChange={set("company")} placeholder="Nom de l'entreprise" className="flex-1 px-3 py-2.5 text-sm outline-none" />
          </div>
        </div>
      </div>

      {/* Category & Job Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
          <select value={form.category} onChange={set("category")} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 bg-white">
            <option value="">Choisir...</option>
            {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
          <select value={form.jobType} onChange={set("jobType")} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 bg-white">
            <option value="full_time">Temps plein</option>
            <option value="part_time">Temps partiel</option>
            <option value="contract">Contrat</option>
            <option value="internship">Stage</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      {/* Experience & Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expérience</label>
          <select value={form.experienceLevel} onChange={set("experienceLevel")} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 bg-white">
            <option value="no_experience">Sans expérience</option>
            <option value="entry">Débutant (0-2 ans)</option>
            <option value="mid">Intermédiaire (2-5 ans)</option>
            <option value="senior">Senior (5+ ans)</option>
            <option value="executive">Cadre dirigeant</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300"><MapPin className="w-4 h-4 text-gray-400" /></div>
            <select value={form.city} onChange={set("city")} className="flex-1 px-2 py-2.5 text-sm outline-none bg-white">
              <option value="">Ville...</option>
              {_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (FCFA/mois)</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300"><DollarSign className="w-4 h-4 text-gray-400" /></div>
            <input type="number" value={form.salaryMinXAF} onChange={set("salaryMinXAF")} placeholder="Min" className="flex-1 px-3 py-2.5 text-sm outline-none" min="0" />
          </div>
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300"><DollarSign className="w-4 h-4 text-gray-400" /></div>
            <input type="number" value={form.salaryMaxXAF} onChange={set("salaryMaxXAF")} placeholder="Max" className="flex-1 px-3 py-2.5 text-sm outline-none" min="0" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="salary-neg" checked={form.isSalaryNegotiable} onChange={toggle("isSalaryNegotiable")} className="w-4 h-4 text-teal-600 rounded" />
          <label htmlFor="salary-neg" className="text-sm text-gray-600">Salaire négociable</label>
        </div>
      </div>

      {/* Remote & Deadline */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="remote" checked={form.isRemote} onChange={toggle("isRemote")} className="w-4 h-4 text-teal-600 rounded" />
          <label htmlFor="remote" className="text-sm text-gray-700">Télétravail possible</label>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input type="date" value={form.applicationDeadline} onChange={set("applicationDeadline")} className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500" min={new Date().toISOString().split("T")[0]} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description du poste *</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..." rows={4} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-none" maxLength={2000} />
        <p className="text-xs text-gray-400 text-right mt-0.5">{form.description.length}/2000</p>
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Exigences & Compétences</label>
        <textarea value={form.requirements} onChange={set("requirements")} placeholder="Diplômes requis, compétences techniques, langues..." rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-none" maxLength={1000} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Annuler
          </button>
        )}
        <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Publication..." : "Publier l'offre"}
        </button>
      </div>
    </div>
  );
};

export default PostJobListing;



