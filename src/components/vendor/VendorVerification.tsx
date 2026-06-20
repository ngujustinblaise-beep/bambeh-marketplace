/**
 * src/components/vendor/VendorVerification.tsx
 * Bambeh Marketplace — Vendor Verification Workflow
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import {
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  CreditCard,
  Building2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VendorVerificationProps {
  vendorId: string;
  userId: string;
  currentLevel?: string;
  onVerificationSubmitted?: () => void;
  className?: string;
}

type VerificationStep = "phone" | "id" | "business";

interface StepConfig {
  id: VerificationStep;
  label: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: "phone",
    label: "Vérification téléphone",
    description: "Confirmer votre numéro de téléphone via OTP SMS",
    icon: Phone,
    required: true,
  },
  {
    id: "id",
    label: "Vérification identité",
    description: "Télécharger une pièce d'identité nationale valide (CNI ou passeport)",
    icon: CreditCard,
    required: true,
  },
  {
    id: "business",
    label: "Vérification entreprise",
    description: "Fournir le registre de commerce ou la patente de votre entreprise",
    icon: Building2,
    required: false,
  },
];

const VendorVerification: React.FC<VendorVerificationProps> = ({
  vendorId,
  userId,
  currentLevel = "unverified",
  onVerificationSubmitted,
  className = "",
}) => {
  const [activeStep, setActiveStep] = useState<VerificationStep | null>(null);
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Set<VerificationStep>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handlePhoneVerification = useCallback(async () => {
    if (!phone.trim() || !otp.trim()) {
      setError("Veuillez entrer votre numéro et le code OTP");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      await supabase
        .from("vendor_profiles")
        .update({ phone_verified: true })
        .eq("id", vendorId);

      setSubmitted((prev) => new Set(prev).add("phone"));
      setActiveStep(null);
      onVerificationSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de vérification");
    } finally {
      setSubmitting(false);
    }
  }, [phone, otp, vendorId, onVerificationSubmitted]);

  const handleDocumentUpload = useCallback(
    async (step: VerificationStep, file: File) => {
      setSubmitting(true);
      setError(null);

      try {
        const path = `verifications/${vendorId}/${step}_${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("vendor-docs")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        await supabase.from("verification_requests").insert({
          vendor_id: vendorId,
          user_id: userId,
          step,
          document_path: path,
          status: "pending",
          submitted_at: new Date().toISOString(),
        });

        setSubmitted((prev) => new Set(prev).add(step));
        setActiveStep(null);
        onVerificationSubmitted?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors de l'envoi du document");
      } finally {
        setSubmitting(false);
      }
    },
    [vendorId, userId, onVerificationSubmitted]
  );

  const isStepDone = (step: VerificationStep): boolean => {
    return submitted.has(step) || currentLevel === "premium_verified";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <ShieldCheck className="w-5 h-5 text-teal-600" />
        <h2 className="text-base font-bold text-gray-900">Vérification du compte vendeur</h2>
      </div>

      {STEPS.map((stepConfig) => {
        const done = isStepDone(stepConfig.id);
        const active = activeStep === stepConfig.id;
        const Icon = stepConfig.icon;

        return (
          <div
            key={stepConfig.id}
            className={`border rounded-xl overflow-hidden transition-all ${
              done
                ? "border-green-200 bg-green-50"
                : active
                ? "border-teal-400 bg-teal-50"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Step header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => !done && setActiveStep(active ? null : stepConfig.id)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done
                    ? "bg-green-100"
                    : active
                    ? "bg-teal-100"
                    : "bg-gray-100"
                }`}
              >
                {done ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Icon className={`w-5 h-5 ${active ? "text-teal-600" : "text-gray-500"}`} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{stepConfig.label}</p>
                  {stepConfig.required && !done && (
                    <span className="text-xs text-red-500 font-medium">Requis</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{stepConfig.description}</p>
              </div>

              {done ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : submitted.has(stepConfig.id) ? (
                <Clock className="w-5 h-5 text-yellow-500" />
              ) : (
                <span className="text-xs text-teal-600 font-medium">
                  {active ? "Fermer" : "Commencer"}
                </span>
              )}
            </div>

            {/* Step content */}
            {active && !done && (
              <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3 mt-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {stepConfig.id === "phone" && (
                  <div className="space-y-3 pt-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Code OTP reçu par SMS
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 tracking-widest text-center text-lg font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePhoneVerification}
                      disabled={submitting}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? "Vérification..." : "Vérifier"}
                    </button>
                  </div>
                )}

                {(stepConfig.id === "id" || stepConfig.id === "business") && (
                  <div className="pt-3">
                    <label className="w-full flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-xl cursor-pointer transition-colors">
                      {submitting ? (
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {submitting
                          ? "Envoi en cours..."
                          : stepConfig.id === "id"
                          ? "Cliquer pour télécharger votre CNI ou passeport"
                          : "Cliquer pour télécharger votre registre de commerce"}
                      </span>
                      <span className="text-xs text-gray-400">JPG, PNG, PDF — max 5 MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="sr-only"
                        disabled={submitting}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload(stepConfig.id, file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          La vérification d'identité est généralement traitée sous 24–48 heures ouvrables.
          Vous recevrez une confirmation par email.
        </p>
      </div>
    </div>
  );
};

export default VendorVerification;


