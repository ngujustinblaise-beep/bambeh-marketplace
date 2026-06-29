// @ts-nocheck
import React from "react";
import type { VendorStatus, VendorVerificationLevel } from "@/types/vendor";

type ElementType = React.ElementType;

interface VendorIconProps {
  status: VendorStatus;
  size?: "sm" | "md" | "lg";
}

interface VendorCardBadgeProps {
  status: VendorStatus;
  verificationLevel?: VendorVerificationLevel;
}

interface BecomeVendorButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  label?: string;
}

const STATUS_CONFIG: Partial<Record<VendorStatus, {
  label: string; color: string; bgColor: string; icon: string;
}>> = {
  pending:   { label: "Pending",   color: "text-yellow-700", bgColor: "bg-yellow-100", icon: "⏳" },
  approved:  { label: "Approved",  color: "text-green-700",  bgColor: "bg-green-100",  icon: "✅" },
  rejected:  { label: "Rejected",  color: "text-red-700",    bgColor: "bg-red-100",    icon: "❌" },
  suspended: { label: "Suspended", color: "text-gray-700",   bgColor: "bg-gray-100",   icon: "🔒" },
  none:      { label: "Not Vendor",color: "text-gray-500",   bgColor: "bg-gray-50",    icon: "—"  },
};

const VendorIcon: React.FC<VendorIconProps> = ({ status, size = "md" }) => {
  const cfg  = STATUS_CONFIG[status] ?? STATUS_CONFIG["none"]!;
  const sz   = { sm: "text-sm", md: "text-xl", lg: "text-3xl" }[size];
  return <span className={sz} title={cfg.label}>{cfg.icon}</span>;
};

const VendorCardBadge: React.FC<VendorCardBadgeProps> = ({ status, verificationLevel }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["none"]!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
      {cfg.icon} {cfg.label}
      {verificationLevel && verificationLevel !== "unverified" && (
        <span className="ml-1 opacity-70">· {verificationLevel}</span>
      )}
    </span>
  );
};

const BecomeVendorButton: React.FC<BecomeVendorButtonProps> = ({
  onPress, disabled, label = "Become a Vendor",
}) => (
  <button
    onClick={onPress}
    disabled={disabled}
    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white
      font-semibold px-5 py-2 rounded-full text-sm transition-colors"
  >
    {label}
  </button>
);

interface VendorBadgeProps {
  status: VendorStatus;
  verificationLevel?: VendorVerificationLevel;
  showIcon?: boolean;
}

const VendorBadge: React.FC<VendorBadgeProps> = ({ status, verificationLevel, showIcon }) => (
  <div className="inline-flex items-center gap-2">
    {showIcon && <VendorIcon status={status} />}
    <VendorCardBadge status={status} verificationLevel={verificationLevel} />
  </div>
);

export default VendorBadge;
export { VendorIcon, VendorCardBadge, BecomeVendorButton };
export type { VendorIconProps, VendorCardBadgeProps, BecomeVendorButtonProps };



