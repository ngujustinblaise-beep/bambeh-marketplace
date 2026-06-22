/**
 * src/components/Jobs/PostJobListing.tsx
 * Bambeh Marketplace â€” Post Job Listing Form (Embeddable Component)
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXED:
 *  âœ… country: "Cameroon" (was "" â€” broke location)
 *  âœ… Company logo upload via Supabase storage
 *  âœ… i18n via useLang()
 *  âœ… Correct listings table via jobs.service (not job_listings)
 */

import React, { useState, useCallback, useRef } from "react";
import { Briefcase, MapPin, DollarSign, Calendar, Users, Loader2, CheckCircle, AlertCircle, Camera } from "lucide-react";
import { createJob } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { useLang } from "@/hooks/useAppLang";

interface PostJobListingProps {
  userId: string;
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const JOB_CATEGORIES = [
  "Technology", "Marketing", "Finance", "Engineering",
  "Education", "Agriculture", "Healthcare", "Logistics",
  "Sales", "Legal", "Other",
];

const _CITIES = [
  "YaoundÃ©", "Douala", "Garoua", "Bamenda", "Maroua",
  "Bafoussam", "NgaoundÃ©rÃ©", "Kumba", "Bertoua", "Limbe",
];

const PostJobListing: React.FC<PostJobListingProps> = ({
  userId, onSuccess, onCancel, className = "",
}) => {
  const lang    = useLang();
  const logoRef = useRef<HTMLInputElement>(null);

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
    applyMethod: "in_app",
    applyContact: "",
  });

  const [logoFile,     setLogoFile]     = useState<File | null>(null);
  const [logoPreview,  setLogoPreview]  = useState<string | null>(null);
  const [uploadingLogo,setUploadingLogo]= useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!form.title.trim())        return lang === "fr" ? "Le titre du poste est obligatoire" : "Job title is required";
    if (form.title.trim().length < 5) return lang === "fr" ? "Le titre doit contenir au moins 5 caractÃ¨res" : "Title too short (min 5 chars)";
    if (!form.category)            return lang === "fr" ? "Veuillez sÃ©lectionner une catÃ©gorie" : "Please select a category";
    if (!form.description.trim())  return lang === "fr" ? "La description est obligatoire" : "Description is required";
    if (form.description.trim().length < 30) return lang === "fr" ? "Description trop courte (min 30 caractÃ¨res)" : "Description too short (min 30 chars)";
    if (!form.city)                return lang === "fr" ? "Veuillez sÃ©lectionner une ville" : "Please select a city";
    if (form.applyMethod !== "in_app" && !form.applyContact.trim())
      return lang === "fr" ? "Veuillez entrer un contact pour les candidatures" : "Please enter a contact for applications";
    return null;
  };

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    try {
      // Upload logo if provided
      let logoUrl: string | undefined;
      if (logoFile) {
        setUploadingLogo(true);
        try {
          const { supabase } = await import("@/lib/supabase");
          const ext  = logoFile.name.split(".").pop() ?? "jpg";
          const path = `job-logos/${userId}-${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("listings-media")
            .upload(path, logoFile, { upsert: true });
          if (!upErr) {
            const { data: urlData } = supabase.storage
              .from("listings-media")
              .getPublicUrl(path);
            logoUrl = urlData?.publicUrl;
          }
        } catch { /* non-critical â€” continue without logo */ }
        setUploadingLogo(false);
      }

      const { success: ok, id, error: apiErr } = await createJob(userId, {
        title:               form.title.trim(),
        company:             form.company.trim() || undefined,
        companyLogoUrl:      logoUrl,
        description:         form.description.trim(),
        requirements:        form.requirements.trim() || undefined,
        benefits:            form.benefits.trim() || undefined,
        category:            form.category,
        jobType:             form.jobType,
        experienceLevel:     form.experienceLevel,
        salaryMinXAF:        form.salaryMinXAF ? Number(form.salaryMinXAF) : undefined,
        salaryMaxXAF:        form.salaryMaxXAF ? Number(form.salaryMaxXAF) : undefined,
        isSalaryNegotiable:  form.isSalaryNegotiable,
        location: {
          city:    form.city,
          region:  form.region || form.city,
          country: "Cameroon",             // â† FIXED: was "" before
        },
        isRemote:            form.isRemote,
        applicationDeadline: form.applicationDeadline || undefined,
        status:              "active",
        applyMethod:         form.applyMethod as any,
        applyContact:        form.applyContact.trim() || undefined,
      } as any);

      if (!ok || apiErr) { setError(apiErr ?? "Erreur lors de la publication"); return; }
      setSuccess(true);
      if (id) onSuccess?.(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }, [form, logoFile, userId, onSuccess, lang]);

  if (success) {
    return (
      <div className={`text-center py-10 ${className}`}>
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {lang === "fr" ? "Offre publiÃ©e!" : "Job posted!"}
        </h2>
        <p className="text-sm text-gray-500">
          {lang === "fr" ? "Votre offre d'emploi est maintenant visible sur Bambeh." : "Your job listing is now live on Bambeh."}
        </p>
      </div>
    );
  }

  const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-teal-500 transition-colors";

  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
          {lang === "fr" ? "Publier une offre d'emploi" : "Post a Job"}
        </h2>
        <p className="text-sm text-gray-500">
          {lang === "fr" ? "Trouvez les meilleurs talents au Cameroun" : "Find the right talent across Cameroon"}
        </p>
      </div>

      {/* Company Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {lang === "fr" ? "Logo de l'entreprise" : "Company Logo"}
        </label>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border-2 border-dashed border-teal-200 dark:border-teal-700 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-teal-400" />
            )}
          </div>
          <div>
            <button type="button" onClick={() => logoRef.current?.click()}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 border border-teal-300 dark:border-teal-600 px-3 py-1.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
              {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              {lang === "fr" ? "Choisir une image" : "Choose image"}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG Â· max 2MB</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>
      </div>

      {/* Title & Company */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {lang === "fr" ? "Titre du poste *" : "Job Title *"}
          </label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" value={form.title} onChange={set("title")}
              placeholder={lang === "fr" ? "ex: DÃ©veloppeur Web Senior" : "e.g. Senior Software Engineer"}
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white" maxLength={100} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {lang === "fr" ? "Entreprise" : "Company"}
          </label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" value={form.company} onChange={set("company")}
              placeholder={lang === "fr" ? "Nom de l'entreprise" : "Company name"}
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      {/* Category & Job Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {lang === "fr" ? "CatÃ©gorie *" : "Category *"}
          </label>
          <select value={form.category} onChange={set("category")} className={inputCls}>
            <option value="">{lang === "fr" ? "Choisirâ€¦" : "Selectâ€¦"}</option>
            {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {lang === "fr" ? "Type de contrat" : "Job Type"}
          </label>
          <select value={form.jobType} onChange={set("jobType")} className={inputCls}>
            <option value="full_time">{lang === "fr" ? "Temps plein"  : "Full-time"}</option>
            <option value="part_time">{lang === "fr" ? "Temps partiel": "Part-time"}</option>
            <option value="contract"> {lang === "fr" ? "Contrat"      : "Contract"}</option>
            <option value="internship">{lang === "fr" ? "Stage"       : "Internship"}</option>
            <option value="freelance">{lang === "fr" ? "Freelance"    : "Freelance"}</option>
            <option value="temporary">{lang === "fr" ? "Temporaire"   : "Temporary"}</option>
          </select>
        </div>
      </div>

      {/* Experience & Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {lang === "fr" ? "ExpÃ©rience" : "Experience"}
          </label>
          <select value={form.experienceLevel} onChange={set("experienceLevel")} className={inputCls}>
            <option value="no_experience">{lang === "fr" ? "Sans expÃ©rience"      : "No experience"}</option>
            <option value="entry">         {lang === "fr" ? "DÃ©butant (0-2 ans)"  : "Entry (0-2 yrs)"}</option>
            <option value="mid">           {lang === "fr" ? "IntermÃ©diaire (2-5)" : "Mid (2-5 yrs)"}</option>
            <option value="senior">        {lang === "fr" ? "Senior (5+ ans)"     : "Senior (5+ yrs)"}</option>
            <option value="executive">     {lang === "fr" ? "Cadre dirigeant"     : "Executive"}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {lang === "fr" ? "Ville *" : "City *"}
          </label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <select value={form.city} onChange={set("city")}
              className="flex-1 px-2 py-2.5 text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option value="">{lang === "fr" ? "Villeâ€¦" : "Cityâ€¦"}</option>
              {_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {lang === "fr" ? "Salaire (FCFA/mois)" : "Salary (FCFA/month)"}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input type="number" value={form.salaryMinXAF} onChange={set("salaryMinXAF")}
              placeholder="Min" className="flex-1 px-3 py-2.5 text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white" min="0" />
          </div>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:border-teal-500">
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input type="number" value={form.salaryMaxXAF} onChange={set("salaryMaxXAF")}
              placeholder="Max" className="flex-1 px-3 py-2.5 text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white" min="0" />
          </div>
        </div>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input type="checkbox" checked={form.isSalaryNegotiable} onChange={toggle("isSalaryNegotiable")}
            className="w-4 h-4 text-teal-600 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {lang === "fr" ? "Salaire nÃ©gociable" : "Salary negotiable"}
          </span>
        </label>
      </div>

      {/* Remote & Deadline */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isRemote} onChange={toggle("isRemote")}
            className="w-4 h-4 text-teal-600 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {lang === "fr" ? "TÃ©lÃ©travail possible" : "Remote work available"}
          </span>
        </label>
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input type="date" value={form.applicationDeadline} onChange={set("applicationDeadline")}
            className={`flex-1 ${inputCls}`}
            min={new Date().toISOString().split("T")[0]} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {lang === "fr" ? "Description du poste *" : "Job Description *"}
        </label>
        <textarea value={form.description} onChange={set("description")}
          placeholder={lang === "fr"
            ? "DÃ©crivez le poste, les responsabilitÃ©s, l'environnement de travailâ€¦"
            : "Describe the role, responsibilities, and day-to-day tasksâ€¦"}
          rows={4} className={`${inputCls} resize-none`} maxLength={2000} />
        <p className="text-xs text-gray-400 text-right mt-0.5">{form.description.length}/2000</p>
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {lang === "fr" ? "Exigences & CompÃ©tences" : "Requirements & Skills"}
        </label>
        <textarea value={form.requirements} onChange={set("requirements")}
          placeholder={lang === "fr"
            ? "DiplÃ´mes requis, compÃ©tences techniques, languesâ€¦"
            : "Required qualifications, skills, languagesâ€¦"}
          rows={3} className={`${inputCls} resize-none`} maxLength={1000} />
      </div>

      {/* Apply method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === "fr" ? "Comment postuler ?" : "How should candidates apply?"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "in_app",   label: lang === "fr" ? "ðŸ“± Via Bambeh"      : "ðŸ“± Bambeh Platform" },
            { value: "whatsapp", label: "ðŸ’¬ WhatsApp" },
            { value: "call",     label: lang === "fr" ? "ðŸ“ž Appel"           : "ðŸ“ž Phone Call" },
            { value: "email",    label: "ðŸ“§ Email" },
          ].map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => setForm((p) => ({ ...p, applyMethod: opt.value }))}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all text-left
                ${form.applyMethod === opt.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {form.applyMethod !== "in_app" && (
          <input value={form.applyContact} onChange={set("applyContact")}
            placeholder={lang === "fr" ? "NumÃ©ro ou email pour les candidatures" : "Phone number or email for applications"}
            className={`${inputCls} mt-3`} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {lang === "fr" ? "Annuler" : "Cancel"}
          </button>
        )}
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading
            ? (lang === "fr" ? "Publicationâ€¦" : "Publishingâ€¦")
            : (lang === "fr" ? "Publier l'offre" : "Publish Job")}
        </button>
      </div>
    </div>
  );
};

export default PostJobListing;




