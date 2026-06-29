import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type BadgeType = "identity" | "business" | "address" | "phone";
export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export interface VerificationBadge {
  type: BadgeType;
  label: string;
  grantedAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  type: BadgeType;
  status: VerificationRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface VerificationContextValue {
  userBadges: VerificationBadge[];
  verificationRequests: VerificationRequest[];
  isLoading: boolean;
  submitVerificationRequest: (type: BadgeType, documents: File[]) => Promise<void>;
  getVerificationBadgeLabel: (type: BadgeType) => string;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

const BADGE_LABELS: Record<BadgeType, string> = {
  identity: "Identity Verified",
  business: "Business Verified",
  address:  "Address Verified",
  phone:    "Phone Verified",
};

export const VerificationProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [userBadges,            setUserBadges]            = useState<VerificationBadge[]>([]);
  const [verificationRequests,  setVerificationRequests]  = useState<VerificationRequest[]>([]);
  const [isLoading,             setIsLoading]             = useState(false);

  const submitVerificationRequest = async (type: BadgeType, _documents: File[]): Promise<void> => {
    setIsLoading(true);
    try {
      const req: VerificationRequest = {
        id:          `vr_${Date.now()}`,
        userId:      "current_user",
        type,
        status:      "pending",
        submittedAt: new Date().toISOString(),
      };
      setVerificationRequests(prev => [...prev, req]);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationBadgeLabel = (type: BadgeType): string => BADGE_LABELS[type];

  return (
    <VerificationContext.Provider value={{
      userBadges, verificationRequests, isLoading,
      submitVerificationRequest, getVerificationBadgeLabel,
    }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = (): VerificationContextValue => {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be inside VerificationProvider");
  return ctx;
};





