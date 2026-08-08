// BAMBEH_DEPLOY_TOKEN__TAXCALCULATOR_FIX291_CLEAN
// FILE LOCATION: src/services/payment/taxCalculator.ts
//
// FIX291 - THE GOVERNMENT TAX, CORRECTED. AND ONE SOURCE OF TRUTH.
//
// WHAT THIS REPLACES AND WHY
// --------------------------
// The old file did two things wrong and one thing badly.
//
//  1. WRONG: calculateWithdrawalTax() took 0.2% OFF the seller. A seller who
//     listed at 1,000 received 998. Your instruction is that a seller who
//     lists at 1,000 collects 1,000. That deduction is gone. The withdrawal-
//     side government tax is still charged - it is a real tax and the state
//     still wants it - but it is now added to the buyer's checkout total
//     alongside everything else, the way you asked.
//
//  2. WRONG: it was a second, independent fee calculator sitting next to the
//     calculate_fees database trigger and next to bambehPricing.ts. Three
//     places computing money is how a marketplace ends up with a hole in its
//     books. This file no longer decides anything. It asks bambehPricing.ts
//     and reports the answer.
//
//  3. BADLY: formatXAF had its closing brace AFTER the JSDoc comment that
//     followed it, so formatTaxAmount ended up dangling outside the function
//     it was documented against. It compiled, which is the worst kind of bug.
//     Fixed.
//
// NOTHING THAT IMPORTS THIS FILE HAS TO CHANGE. Every exported name that was
// here before is still here, still with the same shape. PaymentSuccess.tsx
// keeps importing formatXAF and keeps working.
//
// THE RATE STILL LIVES IN ONE PLACE: BAMBEH_PRICING.govTaxBp in
// bambehPricing.ts. Change it there and every screen follows.

import {
  BAMBEH_PRICING,
  quoteCheckout,
  type PricingConfig,
} from "./bambehPricing";

/** 0.2% per side, kept as a decimal for the handful of old call sites that
 *  read it directly. The authoritative value is BAMBEH_PRICING.govTaxBp. */
export const GOV_TAX_RATE = BAMBEH_PRICING.govTaxBp / 10_000;

export interface TransferTaxBreakdown {
  /** The seller's price. Untouched. */
  baseAmount: number;
  /** Government tax, both sides, all of it charged to the buyer. */
  govTax: number;
  /** Everything the buyer is charged: item, commission, VAT, tax, gateway. */
  totalCharged: number;
  taxRate: string;
}

export interface WithdrawalTaxBreakdown {
  grossAmount: number;
  /** Always 0 now. The buyer paid this at checkout. */
  govTax: number;
  /** Equal to grossAmount. The seller collects what they listed. */
  netPayout: number;
  taxRate: string;
}

function ratePercent(cfg: PricingConfig): string {
  return String(cfg.govTaxBp / 100) + "%";
}

/**
 * What the buyer is charged, government tax included.
 *
 * NOTE: totalCharged is the FULL checkout figure, not just price + tax. The
 * old version returned baseAmount + govTax and nothing else, which is how the
 * commission, the VAT and CamPay's 2% ended up being paid by Bambeh out of
 * its own pocket on every sale.
 */
export function calculateTransferTax(
  amount: number,
  cfg: PricingConfig = BAMBEH_PRICING,
): TransferTaxBreakdown {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  const quote = quoteCheckout(Math.round(amount), cfg);
  return {
    baseAmount: quote.sellerAmountXaf,
    govTax: quote.govTaxXaf,
    totalCharged: quote.buyerTotalXaf,
    taxRate: ratePercent(cfg),
  };
}

/**
 * What a seller receives when they withdraw.
 *
 * This used to shave 0.2% off. It no longer does, and that is deliberate:
 * a seller who lists an item at 1,000 collects 1,000. Both sides of the
 * government tax, plus the gateway's withdrawal fee, were already collected
 * from the buyer at checkout.
 */
export function calculateWithdrawalTax(
  amount: number,
  cfg: PricingConfig = BAMBEH_PRICING,
): WithdrawalTaxBreakdown {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  const gross = Math.round(amount);
  return {
    grossAmount: gross,
    govTax: 0,
    netPayout: gross,
    taxRate: ratePercent(cfg),
  };
}

/** Format XAF for display: 1500 becomes "1 500 FCFA". */
export function formatXAF(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe);
}

/** The government tax on a given item price, formatted for display. */
export function formatTaxAmount(
  amount: number,
  cfg: PricingConfig = BAMBEH_PRICING,
): string {
  if (!Number.isFinite(amount) || amount <= 0) return formatXAF(0);
  return formatXAF(quoteCheckout(Math.round(amount), cfg).govTaxXaf);
}
// BAMBEH_END_TOKEN__TAXCALCULATOR_FIX291__COMPLETE
