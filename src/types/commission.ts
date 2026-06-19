export type CommissionableTransactionType =
  | "marketplace_sale" | "service_booking" | "rental_booking"
  | "vehicle_rental"   | "escrow_release";

export interface CommissionRate {
  id: string;
  transactionType: CommissionableTransactionType;
  percentage: number;
  flatFee?: number;
  minAmount?: number;
  maxAmount?: number;
  rate?: number;
  description?: string;
}

export interface CommissionCalculation {
  commissionAmount: number;
  vendorReceives: number;
  totalCommission?: number;
  transactionAmount?: number;
}

export interface CommissionRecord {
  id?: string;
  vendorId: string;
  transactionType: CommissionableTransactionType;
  transactionAmount: number;
  commissionAmount: number;
  status: "pending" | "confirmed" | "paid" | "disputed";
  notes?: string;
  createdAt?: string;
}

export interface VendorCommissionSummary {
  totalCommissionXAF: number;
  pendingCommissionXAF: number;
  paidCommissionXAF: number;
}
