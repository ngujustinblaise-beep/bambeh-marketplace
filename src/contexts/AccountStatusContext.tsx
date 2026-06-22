/**
 * ACCOUNT STATUS CONTEXT - USER ACCOUNT STATE MANAGEMENT
 * FILE LOCATION: src/contexts/AccountStatusContext.tsx
 * Â© 2025 Bambeh. All rights reserved.
 */

import React, { useEffect, 
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type AccountStatus =
  | "active"
  | "frozen"
  | "suspended"
  | "banned"
  | "pending_verification";

export type AccountType = "user" | "vendor";

export interface AccountRestriction {
  id: string;
  accountId: string;
  accountType: AccountType;
  accountName: string;
  accountEmail: string;
  status: AccountStatus;
  reason: string;
  restrictedAt: string;
  restrictedBy: string;
  restrictedByName: string;
  expiresAt?: string;
  liftedAt?: string;
  liftedBy?: string;
  liftedByName?: string;
  notes?: string;
}

export interface AccountStatusMessage {
  title: string;
  message: string;
  contactInfo: string;
  canAppeal: boolean;
}

export interface AccountStatusContextType {
  restrictions: AccountRestriction[];
  isLoading: boolean;
  error: string | null;
  isAccountRestricted: (accountId: string) => boolean;
  getAccountStatus: (accountId: string) => AccountStatus;
  getRestrictionDetails: (accountId: string) => AccountRestriction | undefined;
  getStatusMessage: (status: AccountStatus) => AccountStatusMessage;
  freezeAccount: (
    accountId: string,
    accountType: AccountType,
    accountName: string,
    accountEmail: string,
    reason: string,
    adminId: string,
    adminName: string,
    duration?: number,
  ) => Promise<boolean>;
  suspendAccount: (
    accountId: string,
    accountType: AccountType,
    accountName: string,
    accountEmail: string,
    reason: string,
    adminId: string,
    adminName: string,
    duration?: number,
  ) => Promise<boolean>;
  banAccount: (
    accountId: string,
    accountType: AccountType,
    accountName: string,
    accountEmail: string,
    reason: string,
    adminId: string,
    adminName: string,
  ) => Promise<boolean>;
  liftRestriction: (
    accountId: string,
    adminId: string,
    adminName: string,
  ) => Promise<boolean>;
  getFrozenAccounts: () => AccountRestriction[];
  getSuspendedAccounts: () => AccountRestriction[];
  getBannedAccounts: () => AccountRestriction[];
  getRestrictedVendors: () => AccountRestriction[];
  getRestrictedUsers: () => AccountRestriction[];
  refreshRestrictions: () => Promise<void>;
}

const AccountStatusContext = createContext<
  AccountStatusContextType | undefined
>(undefined);

const RESTRICTIONS_STORAGE_KEY = "bambeh_account_restrictions";

const STATUS_MESSAGES: Record<AccountStatus, AccountStatusMessage> = {
  active: {
    title: "Account Active",
    message: "Your account is in good standing.",
    contactInfo: "",
    canAppeal: false,
  },
  frozen: {
    title: "âš Ã¯Â¸Â Account Frozen",
    message:
      "Your account has been temporarily frozen due to suspicious activity or policy violation.",
    contactInfo:
      "Contact Bambeh Admin at support@bambeh.cm or call +237 6XX XXX XXX to resolve this issue.",
    canAppeal: true,
  },
  suspended: {
    title: "ðŸš« Account Suspended",
    message:
      "Your account has been suspended due to violation of our Terms of Service.",
    contactInfo:
      "Contact Bambeh Admin at support@bambeh.cm to appeal this decision.",
    canAppeal: true,
  },
  banned: {
    title: "âŒ Account Banned",
    message:
      "Your account has been permanently banned due to serious violation of our Terms of Service.",
    contactInfo:
      "If you believe this was a mistake, contact Bambeh Admin at support@bambeh.cm within 30 days.",
    canAppeal: false,
  },
  pending_verification: {
    title: "â³ Verification Pending",
    message:
      "Your account is pending verification. Some features may be limited until verification is complete.",
    contactInfo:
      "Complete your verification at /profile/verify or contact support for assistance.",
    canAppeal: false,
  },
};

const sampleRestrictions: AccountRestriction[] = [
  {
    id: "RST-001",
    accountId: "USR-789",
    accountType: "user",
    accountName: "Jean Claude",
    accountEmail: "jean.c@email.com",
    status: "suspended",
    reason: "Multiple fraudulent transaction reports",
    restrictedAt: "2025-01-10T10:00:00Z",
    restrictedBy: "ADM-001",
    restrictedByName: "Master Admin",
    expiresAt: "2025-01-24T10:00:00Z",
    notes: "User has been involved in 5 disputed transactions",
  },
  {
    id: "RST-002",
    accountId: "VND-456",
    accountType: "vendor",
    accountName: "FakeGoods Store",
    accountEmail: "fake@store.com",
    status: "banned",
    reason: "Selling counterfeit products",
    restrictedAt: "2025-01-08T14:00:00Z",
    restrictedBy: "ADM-001",
    restrictedByName: "Master Admin",
    notes: "Permanent ban for repeated counterfeit sales",
  },
];

interface AccountStatusProviderProps {
  children: ReactNode;
}

export const AccountStatusProvider: React.FC<AccountStatusProviderProps> = ({
  children,
}) => {
  const [restrictions, setRestrictions] = useState<AccountRestriction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestrictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(RESTRICTIONS_STORAGE_KEY);
      if (stored) {
        setRestrictions(JSON.parse(stored));
      } else {
        setRestrictions(sampleRestrictions);
        localStorage.setItem(
          RESTRICTIONS_STORAGE_KEY,
          JSON.stringify(sampleRestrictions),
        );
      }
    } catch (err) {
      setError("Failed to load account restrictions");
      console.error("Error loading restrictions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestrictions();
  }, []);

  useEffect(() => {
    if (restrictions.length > 0) {
      localStorage.setItem(
        RESTRICTIONS_STORAGE_KEY,
        JSON.stringify(restrictions),
      );
    }
  }, [restrictions]);

  useEffect(() => {
    const checkExpiredRestrictions = () => {
      const now = new Date();
      setRestrictions((prev) =>
        prev.map((r) => {
          if (
            r.expiresAt &&
            new Date(r.expiresAt) < now &&
            r.status !== "active"
          ) {
            return {
              ...r,
              status: "active" as AccountStatus,
              liftedAt: now.toISOString(),
            };
          }
          return r;
        }),
      );
    };

    const interval = setInterval(checkExpiredRestrictions, 60000);
    checkExpiredRestrictions();

    return () => clearInterval(interval);
  }, []);

  const generateRestrictionId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `RST-${timestamp}-${randomPart}`.toUpperCase();
  };

  const isAccountRestricted = useCallback(
    (accountId: string): boolean => {
      const restriction = restrictions.find((r) => r.accountId === accountId);
      if (!restriction) return false;
      return ["frozen", "suspended", "banned"].includes(restriction.status);
    },
    [restrictions],
  );

  const getAccountStatus = useCallback(
    (accountId: string): AccountStatus => {
      const restriction = restrictions.find((r) => r.accountId === accountId);
      return restriction?.status || "active";
    },
    [restrictions],
  );

  const getRestrictionDetails = useCallback(
    (accountId: string): AccountRestriction | undefined => {
      return restrictions.find((r) => r.accountId === accountId);
    },
    [restrictions],
  );

  const getStatusMessage = useCallback(
    (status: AccountStatus): AccountStatusMessage => {
      return STATUS_MESSAGES[status];
    },
    [],
  );

  const freezeAccount = useCallback(
    async (
      accountId: string,
      accountType: AccountType,
      accountName: string,
      accountEmail: string,
      reason: string,
      adminId: string,
      adminName: string,
      duration?: number,
    ): Promise<boolean> => {
      try {
        const now = new Date();
        const expiresAt = duration
          ? new Date(now.getTime() + duration * 60 * 60 * 1000).toISOString()
          : undefined;

        const newRestriction: AccountRestriction = {
          id: generateRestrictionId(),
          accountId,
          accountType,
          accountName,
          accountEmail,
          status: "frozen",
          reason,
          restrictedAt: now.toISOString(),
          restrictedBy: adminId,
          restrictedByName: adminName,
          expiresAt,
        };

        setRestrictions((prev) => [
          ...prev.filter((r) => r.accountId !== accountId),
          newRestriction,
        ]);

        console.log(`âœ… Account ${accountId} frozen by ${adminName}`);
        return true;
      } catch (err) {
        setError("Failed to freeze account");
        return false;
      }
    },
    [],
  );

  const suspendAccount = useCallback(
    async (
      accountId: string,
      accountType: AccountType,
      accountName: string,
      accountEmail: string,
      reason: string,
      adminId: string,
      adminName: string,
      duration?: number,
    ): Promise<boolean> => {
      try {
        const now = new Date();
        const expiresAt = duration
          ? new Date(
              now.getTime() + duration * 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined;

        const newRestriction: AccountRestriction = {
          id: generateRestrictionId(),
          accountId,
          accountType,
          accountName,
          accountEmail,
          status: "suspended",
          reason,
          restrictedAt: now.toISOString(),
          restrictedBy: adminId,
          restrictedByName: adminName,
          expiresAt,
        };

        setRestrictions((prev) => [
          ...prev.filter((r) => r.accountId !== accountId),
          newRestriction,
        ]);

        console.log(`âœ… Account ${accountId} suspended by ${adminName}`);
        return true;
      } catch (err) {
        setError("Failed to suspend account");
        return false;
      }
    },
    [],
  );

  const banAccount = useCallback(
    async (
      accountId: string,
      accountType: AccountType,
      accountName: string,
      accountEmail: string,
      reason: string,
      adminId: string,
      adminName: string,
    ): Promise<boolean> => {
      try {
        const now = new Date();

        const newRestriction: AccountRestriction = {
          id: generateRestrictionId(),
          accountId,
          accountType,
          accountName,
          accountEmail,
          status: "banned",
          reason,
          restrictedAt: now.toISOString(),
          restrictedBy: adminId,
          restrictedByName: adminName,
        };

        setRestrictions((prev) => [
          ...prev.filter((r) => r.accountId !== accountId),
          newRestriction,
        ]);

        console.log(`âœ… Account ${accountId} banned by ${adminName}`);
        return true;
      } catch (err) {
        setError("Failed to ban account");
        return false;
      }
    },
    [],
  );

  const liftRestriction = useCallback(
    async (
      accountId: string,
      adminId: string,
      adminName: string,
    ): Promise<boolean> => {
      try {
        const now = new Date().toISOString();

        setRestrictions((prev) =>
          prev.map((r) => {
            if (r.accountId === accountId) {
              return {
                ...r,
                status: "active" as AccountStatus,
                liftedAt: now,
                liftedBy: adminId,
                liftedByName: adminName,
              };
            }
            return r;
          }),
        );

        console.log(
          `âœ… Restriction lifted for account ${accountId} by ${adminName}`,
        );
        return true;
      } catch (err) {
        setError("Failed to lift restriction");
        return false;
      }
    },
    [],
  );

  const getFrozenAccounts = useCallback(
    (): AccountRestriction[] =>
      restrictions.filter((r) => r.status === "frozen"),
    [restrictions],
  );

  const getSuspendedAccounts = useCallback(
    (): AccountRestriction[] =>
      restrictions.filter((r) => r.status === "suspended"),
    [restrictions],
  );

  const getBannedAccounts = useCallback(
    (): AccountRestriction[] =>
      restrictions.filter((r) => r.status === "banned"),
    [restrictions],
  );

  const getRestrictedVendors = useCallback(
    (): AccountRestriction[] =>
      restrictions.filter(
        (r) =>
          r.accountType === "vendor" &&
          ["frozen", "suspended", "banned"].includes(r.status),
      ),
    [restrictions],
  );

  const getRestrictedUsers = useCallback(
    (): AccountRestriction[] =>
      restrictions.filter(
        (r) =>
          r.accountType === "user" &&
          ["frozen", "suspended", "banned"].includes(r.status),
      ),
    [restrictions],
  );

  const refreshRestrictions = useCallback(async (): Promise<void> => {
    await loadRestrictions();
  }, [loadRestrictions]);

  const value: AccountStatusContextType = {
    restrictions,
    isLoading,
    error,
    isAccountRestricted,
    getAccountStatus,
    getRestrictionDetails,
    getStatusMessage,
    freezeAccount,
    suspendAccount,
    banAccount,
    liftRestriction,
    getFrozenAccounts,
    getSuspendedAccounts,
    getBannedAccounts,
    getRestrictedVendors,
    getRestrictedUsers,
    refreshRestrictions,
  };

  return (
    <AccountStatusContext.Provider value={value}>
      {children}
    </AccountStatusContext.Provider>
  );
};

export const useAccountStatus = (): AccountStatusContextType => {
  const context = useContext(AccountStatusContext);
  if (context === undefined) {
    throw new Error(
      "useAccountStatus must be used within an AccountStatusProvider",
    );
  }
  return context;
};

export default AccountStatusContext;






