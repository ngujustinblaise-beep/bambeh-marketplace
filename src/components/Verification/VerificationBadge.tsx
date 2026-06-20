/**
 * src/components/Verification/VerificationBadge.tsx
 * Bambeh Marketplace — Seller / Vendor Verification Badge
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import {
  ShieldCheck,
  BadgeCheck,
  Shield,
  Star,
  Award,
  X,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type VerificationLevel =
  | "unverified"
  | "email_verified"
  | "phone_verified"
  | "id_verified"
  | "business_verified"
  | "premium_verified";

export interface VerificationStatus {
  level: VerificationLevel;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  businessVerified: boolean;
  verifiedAt?: string;
  badges: string[];
}

interface BadgeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
}

const BADGE_CONFIGS: Record<VerificationLevel, BadgeConfig> = {
  unverified: {
    label: "Non vérifié",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    icon: Shield,
    description: "Ce compte n'a pas encore été vérifié.",
  },
  email_verified: {
    label: "Email vérifié",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Check,
    description: "L'adresse e-mail de ce compte a été vérifiée.",
  },
  phone_verified: {
    label: "Téléphone vérifié",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    icon: BadgeCheck,
    description: "Le numéro de téléphone de ce compte a été vérifié.",
  },
  id_verified: {
    label: "Identité vérifiée",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    icon: ShieldCheck,
    description: "L'identité de ce membre a été vérifiée par Bambeh.",
  },
  business_verified: {
    label: "Entreprise vérifiée",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    icon: Award,
    description: "Cette entreprise a été vérifiée et enregistrée par Bambeh.",
  },
  premium_verified: {
    label: "Vendeur Premium ✦",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    icon: Star,
    description: "Vendeur Premium Bambeh — identité, entreprise et excellence de service vérifiées.",
  },
};

// ─── Badge Component ──────────────────────────────────────────────────────────
interface VerificationBadgeProps {
  level?: VerificationLevel;
  status?: Partial<VerificationStatus>;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: "w-3 h-3", text: "text-xs", padding: "px-1.5 py-0.5", gap: "gap-1" },
  sm: { icon: "w-3.5 h-3.5", text: "text-xs", padding: "px-2 py-1", gap: "gap-1" },
  md: { icon: "w-4 h-4", text: "text-sm", padding: "px-2.5 py-1", gap: "gap-1.5" },
  lg: { icon: "w-5 h-5", text: "text-base", padding: "px-3 py-1.5", gap: "gap-2" },
};

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  level = "unverified",
  status,
  size = "sm",
  showLabel = true,
  showTooltip = true,
  className = "",
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const effectiveLevel: VerificationLevel = status
    ? (status.level ?? level)
    : level;

  if (effectiveLevel === "unverified") return null;

  const config = BADGE_CONFIGS[effectiveLevel];
  const sizes = SIZE_MAP[size];
  const Icon = config.icon;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => showTooltip && setTooltipOpen((v) => !v)}
        className={`inline-flex items-center border rounded-full font-medium transition-colors ${sizes.padding} ${sizes.gap} ${config.bgColor} ${config.borderColor} ${config.color} ${showTooltip ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
        aria-label={`Vérification: ${config.label}`}
      >
        <Icon className={sizes.icon} />
        {showLabel && <span className={sizes.text}>{config.label}</span>}
      </button>

      {/* Tooltip */}
      {showTooltip && tooltipOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setTooltipOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className={`flex items-center gap-1.5 font-semibold text-sm ${config.color}`}>
                <Icon className="w-4 h-4" />
                {config.label}
              </div>
              <button
                type="button"
                onClick={() => setTooltipOpen(false)}
                className="p-0.5 rounded hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-600">{config.description}</p>

            {status && (
              <div className="mt-3 space-y-1.5">
                <VerificationCheck
                  label="Email vérifié"
                  done={status.emailVerified ?? false}
                />
                <VerificationCheck
                  label="Téléphone vérifié"
                  done={status.phoneVerified ?? false}
                />
                <VerificationCheck
                  label="Identité vérifiée"
                  done={status.idVerified ?? false}
                />
                <VerificationCheck
                  label="Entreprise vérifiée"
                  done={status.businessVerified ?? false}
                />
              </div>
            )}

            {status?.verifiedAt && (
              <p className="mt-2 text-xs text-gray-400">
                Vérifié le {new Date(status.verifiedAt).toLocaleDateString("fr-CM")}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────
const VerificationCheck: React.FC<{ label: string; done: boolean }> = ({
  label,
  done,
}) => (
  <div className="flex items-center gap-2">
    {done ? (
      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
    ) : (
      <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
    )}
    <span className={`text-xs ${done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
  </div>
);

// ─── Verification Steps Panel ─────────────────────────────────────────────────
interface VerificationStepsPanelProps {
  status: Partial<VerificationStatus>;
  onStartVerification?: (step: string) => void;
  className?: string;
}

export const VerificationStepsPanel: React.FC<VerificationStepsPanelProps> = ({
  status,
  onStartVerification,
  className = "",
}) => {
  const steps = [
    {
      id: "email",
      label: "Vérification email",
      done: status.emailVerified ?? false,
      required: true,
    },
    {
      id: "phone",
      label: "Vérification téléphone",
      done: status.phoneVerified ?? false,
      required: true,
    },
    {
      id: "id",
      label: "Vérification identité",
      done: status.idVerified ?? false,
      required: false,
    },
    {
      id: "business",
      label: "Vérification entreprise",
      done: status.businessVerified ?? false,
      required: false,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Niveau de vérification</h3>
        <span className="text-sm text-gray-500">
          {completedCount}/{totalCount} étapes
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-teal-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              {step.done ? (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
              <div>
                <p className={`text-sm font-medium ${step.done ? "text-gray-700" : "text-gray-500"}`}>
                  {step.label}
                </p>
                {step.required && !step.done && (
                  <p className="text-xs text-red-500">Obligatoire</p>
                )}
              </div>
            </div>

            {!step.done && onStartVerification && (
              <button
                type="button"
                onClick={() => onStartVerification(step.id)}
                className="text-xs text-teal-600 font-medium hover:text-teal-800 transition-colors"
              >
                Commencer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationBadge;


