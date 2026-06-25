/**
 * ════════════════════════════════════════════════════════════════
 * src/services/payment/taxCalculator.ts
 * Government Tax Calculator for Bambeh Marketplace
 *
 *  government tax: 0.2% per side of every transaction
 *   • Buyer pays:   item price + 0.2% gov tax  → platform collects it
 *   • Vendor gets:  item price - 0.2% gov tax  → deducted at withdrawal
 *   • Total gov tax per deal = 0.4% of item value
 *
 * ⚠ï¸  Subscription payments are TAX-EXEMPT (pass isSubscription=true).
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 * ════════════════════════════════════════════════════════════════
 */

/** Tax rate: 0.2% = 0.002 */
export const GOV_TAX_RATE = parseFloat(
  import.meta.env.VITE_GOV_TAX_RATE || "0.002",
);

export interface TransferTaxBreakdown {
  baseAmount: number; // Original item price,
  govTax: number; // 0.2% tax added on top,
  totalCharged: number; // What buyer pays = baseAmount + govTax,
  taxRate: string; // e.g. "0.2%"
}

export interface WithdrawalTaxBreakdown {
  grossAmount: number; // Amount vendor requests to withdraw,
  govTax: number; // 0.2% deducted from gross,
  netPayout: number; // What vendor actually receives,
  taxRate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUYER-SIDE TAX  (applies to all marketplace payments except subscriptions)
// ─────────────────────────────────────────────────────────────────────────────
export function calculateTransferTax(amount: number): TransferTaxBreakdown {
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  const govTax = Math.max(1, Math.ceil(amount * GOV_TAX_RATE));
  return { baseAmount: amount,
    govTax,
    totalCharged: amount + govTax,
    taxRate: `${GOV_TAX_RATE * 100}%`,
  }; }

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR-SIDE TAX  (applies to every vendor withdrawal)
// ─────────────────────────────────────────────────────────────────────────────
export function calculateWithdrawalTax(amount: number): WithdrawalTaxBreakdown {
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  const govTax = Math.max(1, Math.ceil(amount * GOV_TAX_RATE));
  return { grossAmount: amount,
    govTax,
    netPayout: amount - govTax,
    taxRate: `${GOV_TAX_RATE * 100}%`,
  }; }

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format XAF currency for display: 1500 → "1 500 XAF" */
export function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-CM", { style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/** e.g. returns "21 XAF" for 10000 XAF at 0.2% tax */
}
export function formatTaxAmount(amount: number): string {
  const tax = Math.max(1, Math.ceil(amount * GOV_TAX_RATE));
  return formatXAF(tax);
}

