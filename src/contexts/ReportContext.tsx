/**
 * REPORT CONTEXT - CENTRALIZED REPORT MANAGEMENT
 * FILE LOCATION: src/contexts/ReportContext.tsx
 * © 2025 Bambeh. All rights reserved.
 */

import React, { 
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type ReportType =
  | "scam"
  | "fraud"
  | "fake_product"
  | "inappropriate_content"
  | "harassment"
  | "spam"
  | "vendor_complaint"
  | "service_issue"
  | "payment_issue"
  | "delivery_issue"
  | "account_issue"
  | "other";

export type ReportPriority = "low" | "normal" | "high" | "urgent";

export type ReportStatus =
  | "pending"
  | "reviewing"
  | "resolved"
  | "dismissed"
  | "escalated";

export type ReportSource =
  | "regular_app"
  | "vendor_section"
  | "admin"
  | "system";

export interface Report {
  id: string;
  type: ReportType;
  priority: ReportPriority;
  status: ReportStatus;
  source: ReportSource;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  isVendor: boolean;
  subject: string;
  description: string;
  category: string;
  relatedItemId?: string;
  relatedItemType?:
    | "listing"
    | "order"
    | "user"
    | "vendor"
    | "transaction"
    | "service";
  relatedItemTitle?: string;
  accusedId?: string;
  accusedName?: string;
  accusedType?: "user" | "vendor";
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  adminNotes?: string;
  resolution?: string;
}

export interface ReportContextType {
  reports: Report[];
  pendingReports: Report[];
  isLoading: boolean;
  error: string | null;
  submitReport: (
    report: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">,
  ) => Promise<boolean>;
  updateReportStatus: (
    reportId: string,
    status: ReportStatus,
    notes?: string,
  ) => Promise<boolean>;
  assignReport: (
    reportId: string,
    adminId: string,
    adminName: string,
  ) => Promise<boolean>;
  resolveReport: (reportId: string, resolution: string) => Promise<boolean>;
  dismissReport: (reportId: string, reason: string) => Promise<boolean>;
  escalateReport: (reportId: string, reason: string) => Promise<boolean>;
  getReportsBySource: (source: ReportSource) => Report[];
  getReportsByStatus: (status: ReportStatus) => Report[];
  getReportsByType: (type: ReportType) => Report[];
  getReportById: (id: string) => Report | undefined;
  refreshReports: () => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const REPORTS_STORAGE_KEY = "bambeh_reports";

const sampleReports: Report[] = [
  {
    id: "RPT-001",
    type: "scam",
    priority: "urgent",
    status: "pending",
    source: "regular_app",
    reporterId: "USR-123",
    reporterName: "Marie Kouam",
    reporterEmail: "marie.k@email.com",
    isVendor: false,
    subject: "Scam Alert - Fake iPhone Listing",
    description:
      "I paid 650,000 XAF for an iPhone 14 Pro Max but the seller sent me a fake Chinese clone.",
    category: "Scam / Fraud",
    relatedItemId: "LST-456",
    relatedItemType: "listing",
    relatedItemTitle: "iPhone 14 Pro Max - 256GB",
    accusedId: "VND-789",
    accusedName: "TechDeals CM",
    accusedType: "vendor",
    attachments: [
      { id: "ATT-1", name: "payment_proof.jpg", url: "#", type: "image/jpeg" },
      { id: "ATT-2", name: "fake_phone.jpg", url: "#", type: "image/jpeg" },
    ],
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2025-01-15T08:30:00Z",
  },
  {
    id: "RPT-002",
    type: "vendor_complaint",
    priority: "high",
    status: "pending",
    source: "vendor_section",
    reporterId: "VND-456",
    reporterName: "TechZone ",
    reporterEmail: "techzone@email.com",
    isVendor: true,
    subject: "Customer Harassment",
    description:
      "A customer has been sending threatening messages after I refused to accept a return.",
    category: "Harassment",
    accusedId: "USR-789",
    accusedName: "Paul Ngono",
    accusedType: "user",
    createdAt: "2025-01-14T14:20:00Z",
    updatedAt: "2025-01-14T14:20:00Z",
  },
  {
    id: "RPT-003",
    type: "fake_product",
    priority: "high",
    status: "reviewing",
    source: "regular_app",
    reporterId: "USR-456",
    reporterName: "Jean Claude",
    reporterEmail: "jean.c@email.com",
    isVendor: false,
    subject: "Counterfeit Nike Shoes",
    description:
      "The Nike shoes I received are clearly fake. The quality is terrible and the logo is wrong.",
    category: "Fake Product",
    relatedItemId: "LST-789",
    relatedItemType: "listing",
    relatedItemTitle: "Nike Air Max 90 - Original",
    accusedId: "VND-123",
    accusedName: "Fashion Hub",
    accusedType: "vendor",
    createdAt: "2025-01-13T10:00:00Z",
    updatedAt: "2025-01-14T09:00:00Z",
    assignedAdminId: "ADM-001",
    assignedAdminName: "Admin",
  },
];

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (stored) {
        setReports(JSON.parse(stored));
      } else {
        setReports(sampleReports);
        localStorage.setItem(
          REPORTS_STORAGE_KEY,
          JSON.stringify(sampleReports),
        );
      }
    } catch (err) {
      setError("Failed to load reports");
      console.error("Error loading reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    }
  }, [reports]);

  const generateReportId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `RPT-${timestamp}-${randomPart}`.toUpperCase();
  };

  const submitReport = useCallback(
    async (
      reportData: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">,
    ): Promise<boolean> => {
      try {
        const now = new Date().toISOString();
        const newReport: Report = {
          ...reportData,
          id: generateReportId(),
          status: "pending",
          createdAt: now,
          updatedAt: now,
        };
        setReports((prev) => [newReport, ...prev]);
        console.log("✅ Report submitted successfully:", newReport.id);
        return true;
      } catch (err) {
        setError("Failed to submit report");
        console.error("Error submitting report:", err);
        return false;
      }
    },
    [],
  );

  const updateReportStatus = useCallback(
    async (
      reportId: string,
      status: ReportStatus,
      notes?: string,
    ): Promise<boolean> => {
      try {
        setReports((prev) =>
          prev.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                status,
                adminNotes: notes || report.adminNotes,
                updatedAt: new Date().toISOString(),
                resolvedAt:
                  status === "resolved"
                    ? new Date().toISOString()
                    : report.resolvedAt,
              };
            }
            return report;
          }),
        );
        return true;
      } catch (err) {
        setError("Failed to update report status");
        return false;
      }
    },
    [],
  );

  const assignReport = useCallback(
    async (
      reportId: string,
      adminId: string,
      adminName: string,
    ): Promise<boolean> => {
      try {
        setReports((prev) =>
          prev.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                assignedAdminId: adminId,
                assignedAdminName: adminName,
                status: "reviewing",
                updatedAt: new Date().toISOString(),
              };
            }
            return report;
          }),
        );
        return true;
      } catch (err) {
        setError("Failed to assign report");
        return false;
      }
    },
    [],
  );

  const resolveReport = useCallback(
    async (reportId: string, resolution: string): Promise<boolean> => {
      try {
        setReports((prev) =>
          prev.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                status: "resolved",
                resolution,
                updatedAt: new Date().toISOString(),
                resolvedAt: new Date().toISOString(),
              };
            }
            return report;
          }),
        );
        return true;
      } catch (err) {
        setError("Failed to resolve report");
        return false;
      }
    },
    [],
  );

  const dismissReport = useCallback(
    async (reportId: string, reason: string): Promise<boolean> => {
      try {
        setReports((prev) =>
          prev.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                status: "dismissed",
                resolution: `Dismissed: ${reason}`,
                updatedAt: new Date().toISOString(),
              };
            }
            return report;
          }),
        );
        return true;
      } catch (err) {
        setError("Failed to dismiss report");
        return false;
      }
    },
    [],
  );

  const escalateReport = useCallback(
    async (reportId: string, reason: string): Promise<boolean> => {
      try {
        setReports((prev) =>
          prev.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                status: "escalated",
                priority: "urgent",
                adminNotes: `Escalated: ${reason}`,
                updatedAt: new Date().toISOString(),
              };
            }
            return report;
          }),
        );
        return true;
      } catch (err) {
        setError("Failed to escalate report");
        return false;
      }
    },
    [],
  );

  const getReportsBySource = useCallback(
    (source: ReportSource): Report[] => {
      return reports.filter((r) => r.source === source);
    },
    [reports],
  );

  const getReportsByStatus = useCallback(
    (status: ReportStatus): Report[] => {
      return reports.filter((r) => r.status === status);
    },
    [reports],
  );

  const getReportsByType = useCallback(
    (type: ReportType): Report[] => {
      return reports.filter((r) => r.type === type);
    },
    [reports],
  );

  const getReportById = useCallback(
    (id: string): Report | undefined => {
      return reports.find((r) => r.id === id);
    },
    [reports],
  );

  const refreshReports = useCallback(async (): Promise<void> => {
    await loadReports();
  }, [loadReports]);

  const pendingReports = reports.filter((r) => r.status === "pending");

  const value: ReportContextType = {
    reports,
    pendingReports,
    isLoading,
    error,
    submitReport,
    updateReportStatus,
    assignReport,
    resolveReport,
    dismissReport,
    escalateReport,
    getReportsBySource,
    getReportsByStatus,
    getReportsByType,
    getReportById,
    refreshReports,
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
};

export const useReports = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportProvider");
  }
  return context;
};

export default ReportContext;








