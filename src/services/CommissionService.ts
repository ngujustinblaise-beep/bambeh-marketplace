// @ts-nocheck
import type {
  CommissionRate, CommissionCalculation, CommissionRecord,
  CommissionableTransactionType, VendorCommissionSummary,
} from "../types/commission";

export type { CommissionRate, CommissionCalculation, CommissionRecord, VendorCommissionSummary };

const PCT: Record<CommissionableTransactionType, number> = {
  marketplace_sale: 0.05, service_booking: 0.07,
  rental_booking:   0.06, vehicle_rental:  0.08, escrow_release: 0.03,
};

export class CommissionService {
  calculate(
    type: CommissionableTransactionType,
    amount: number,
    rate?: CommissionRate,
  ): CommissionCalculation {
    const pct = rate?.percentage ?? PCT[type] ?? 0.05;
    let c = amount * pct + (rate?.flatFee ?? 0);
    if (rate?.minAmount && c < rate.minAmount) c = rate.minAmount;
    if (rate?.maxAmount && c > rate.maxAmount) c = rate.maxAmount;
    const r = Math.round(c);
    return { commissionAmount: r, vendorReceives: Math.round(amount - c), totalCommission: r, transactionAmount: amount };
  }

  createRecord(
    vendorId: string,
    transactionType: CommissionableTransactionType,
    transactionAmount: number,
    calc: CommissionCalculation,
  ): CommissionRecord {
    return { vendorId, transactionType, transactionAmount, commissionAmount: calc.commissionAmount, status: "pending", createdAt: new Date().toISOString() };
  }

  confirm(r: CommissionRecord): CommissionRecord { return { ...r, status: "confirmed" }; }
  pay(r: CommissionRecord):     CommissionRecord { return { ...r, status: "paid"      }; }
  dispute(r: CommissionRecord, notes?: string): CommissionRecord { return { ...r, status: "disputed", notes }; }

  summary(records: CommissionRecord[]): VendorCommissionSummary {
    let total = 0, pending = 0, paid = 0;
    for (const r of records) {
      total   += r.commissionAmount;
      if (r.status === "pending") pending += r.commissionAmount;
      if (r.status === "paid")    paid    += r.commissionAmount;
    }
    return { totalCommissionXAF: total, pendingCommissionXAF: pending, paidCommissionXAF: paid };
  }
}

export const commissionService = new CommissionService();

