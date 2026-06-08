/**
 * src/pages/vendor/VerifiedSeller.tsx
 * Bambeh Marketplace — Verified Seller Application Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, ArrowLeft, CheckCircle, Clock,
  AlertCircle, Upload, Star, Award, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type VerificationStatus = "not_applied" | "pending" | "approved" | "rejected";

interface VerificationApplication {
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  idDocPath?: string;
  businessDocPath?: string;
}

const BENEFITS = [
  { icon: Star, text: "Badge Vendeur Vérifié sur toutes vos annonces" },
  { icon: ShieldCheck, text: "Priorité dans les résultats de recherche" },
  { icon: Award, text: "Accès aux fonctionnalités Premium exclusives" },
  { icon: CheckCircle, text: "Confiance accrue des acheteurs (+40% de ventes)" },
];

const VerifiedSeller: React.FC = () => {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [application, setApplication] = useState<VerificationApplication>({ status: "not_applied" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [businessFile, setBusinessFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) { setLoading(false); return; }
      const { data: vendor } = await supabase.from("vendor_profiles").select("id").eq("user_id", userId).single();
      if (!vendor) { setLoading(false); return; }
      const vid = (vendor as { id: string }).id;
      setVendorId(vid);

      const { data: app } = await supabase
        .from("verification_applications")
        .select("*")
        .eq("vendor_id", vid)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (app) {
        setApplication({
          status: app.status as VerificationStatus,
          submittedAt: app.submitted_at as string,
          reviewedAt: app.reviewed_at as string | undefined,
          rejectionReason: app.rejection_reason as string | undefined,
          idDocPath: app.id_doc_path as string | undefined,
          businessDocPath: app.business_doc_path as string | undefined,
        });
      }
      setLoading(false);
    };
    void load();
  }, []);

  const uploadDoc = useCallback(async (file: File, type: "id" | "business"): Promise<string | null> => {
    const path = `verifications/${vendorId}/${type}_${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("vendor-docs").upload(path, file, { upsert: true });
    if (uploadErr) return null;
    return path;
  }, [vendorId]);

  const handleSubmit = useCallback(async () => {
    if (!idFile) { setError("Veuillez joindre votre pièce d'identité"); return; }
    if (!vendorId) return;
    setSubmitting(true);
    setError(null);
    try {
      const idPath = await uploadDoc(idFile, "id");
      const bizPath = businessFile ? await uploadDoc(businessFile, "business") : null;
      if (!idPath) { setError("Échec du téléchargement de la pièce d'identité"); return; }

      const { error: dbErr } = await supabase.from("verification_applications").insert({
        vendor_id: vendorId,
        id_doc_path: idPath,
        business_doc_path: bizPath,
        status: "pending",
        submitted_at: new Date().toISOString(),
      });
      if (dbErr) { setError(dbErr.message); return; }
      setApplication({ status: "pending", submittedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  }, [idFile, businessFile, vendorId, uploadDoc]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <ShieldCheck className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">Vendeur Vérifié</h1>
      </div>

      {/* Status cards */}
      {application.status === "approved" && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-5 text-center">
          <ShieldCheck className="w-14 h-14 text-green-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Félicitations! ✦</h2>
          <p className="text-sm text-green-700">Votre boutique est officiellement vérifiée par Bambeh.</p>
        </div>
      )}

      {application.status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
          <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-yellow-800 mb-1">Demande en cours d'examen</h2>
          <p className="text-sm text-yellow-700">Notre équipe traite votre dossier sous 24–48h ouvrables.</p>
          {application.submittedAt && (
            <p className="text-xs text-yellow-600 mt-2">Envoyée le {new Date(application.submittedAt).toLocaleDateString("fr-CM")}</p>
          )}
        </div>
      )}

      {application.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-bold text-red-700">Demande refusée</p>
          </div>
          {application.rejectionReason && (
            <p className="text-sm text-red-600">{application.rejectionReason}</p>
          )}
          <p className="text-xs text-red-500 mt-2">Corrigez les points soulevés et soumettez à nouveau.</p>
        </div>
      )}

      {/* Benefits */}
      {application.status !== "approved" && (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Avantages de la vérification</h3>
            <div className="space-y-2.5">
              {BENEFITS.map((b) => (
                <div key={b.text} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-700">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          {(application.status === "not_applied" || application.status === "rejected") && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièce d'identité (CNI ou passeport) *
                </label>
                <label className={`flex flex-col items-center gap-2 p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  idFile ? "border-teal-400 bg-teal-50" : "border-gray-300 hover:border-teal-400"
                }`}>
                  {idFile ? (
                    <><CheckCircle className="w-7 h-7 text-teal-600" /><span className="text-sm text-teal-700 font-medium">{idFile.name}</span></>
                  ) : (
                    <><Upload className="w-7 h-7 text-gray-400" /><span className="text-sm text-gray-500">Cliquer pour sélectionner</span><span className="text-xs text-gray-400">JPG, PNG, PDF — max 5 MB</span></>
                  )}
                  <input type="file" accept="image/*,application/pdf" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setIdFile(f); }} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document d'entreprise <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <label className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  businessFile ? "border-teal-400 bg-teal-50" : "border-gray-300 hover:border-teal-400"
                }`}>
                  {businessFile ? (
                    <><CheckCircle className="w-6 h-6 text-teal-600" /><span className="text-sm text-teal-700">{businessFile.name}</span></>
                  ) : (
                    <><Upload className="w-6 h-6 text-gray-400" /><span className="text-sm text-gray-500">Registre de commerce / Patente</span></>
                  )}
                  <input type="file" accept="image/*,application/pdf" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setBusinessFile(f); }} />
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button type="button" onClick={handleSubmit} disabled={submitting || !idFile}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi en cours...</> :
                 <><ShieldCheck className="w-4 h-4" />Soumettre ma demande</>}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerifiedSeller;
