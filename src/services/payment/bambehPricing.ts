// BAMBEH_DEPLOY_TOKEN__PRICING_FIX289_CLEAN
// FILE LOCATION: src/services/payment/bambehPricing.ts
//
// FIX289 - THE MONEY MATH. ONE PLACE, INTEGERS ONLY, NO GUESSING.
//
// WHY THIS EXISTS
// ---------------
// Today PaymentCheckout.tsx hands CamPayWidget the raw cart total. No
// commission, no VAT, no gateway fee. That means on a 1,000 XAF sale Bambeh
// collects 1,000, CamPay keeps 2%, and Bambeh is left with 980 to pay a
// seller who is owed 1,000. Every single sale loses money. This file is the
// arithmetic that stops that.
//
// RULES THIS FILE OBEYS
// ---------------------
// 1. No floating point anywhere in the money path. XAF has no subunit, but
//    VAT on a small commission does (10 x 19.25% = 1.925). Everything is
//    held as whole micro-XAF integers (1 XAF = 1,000,000 uXAF) and only
//    converted to whole francs at the two edges: what the buyer is charged,
//    and what is written to the ledger.
// 2. Rates are basis points, never decimals. 1% is 100, 19.25% is 1925.
//    0.0025 + 0.0075 !== 0.01 in JavaScript. Basis points cannot drift.
// 3. Nothing here reads a price from the browser. Call it on the server (or
//    in the Edge Function) and send the client the quote id, not the maths.
// 4. Every quote carries a version and an expiry so a webhook can prove the
//    amount it received is the amount that was quoted.
//
// WHAT YOU STILL HAVE TO CONFIRM (I cannot confirm these for you)
// --------------------------------------------------------------
// - Your signed CamPay merchant rate. The public page says 2% collection and
//   1% withdrawal; a merchant contract can differ. If it differs, change
//   ONE line in BAMBEH_PRICING below and every screen follows.
// - Whether Cameroonian VAT applies to your commission only or to the whole
//   sale. This file assumes commission only. A tax professional must confirm.
// - Whether CamPay's withdrawal fee is deducted from the payout or billed
//   separately. See PAYOUT_FEE_PAID_BY below - it is the single most
//   expensive decision in this file.

/* ------------------------------------------------------------------ types */

export type PayoutFeePayer = "seller" | "buyer" | "marketplace";

export interface PricingConfig {
  /** Marketplace commission on the item price. 100 = 1%. */
  commissionBp: number;
  /** Flat marketplace commission per sale, in whole XAF. Bambeh charges 4. */
  commissionFlatXaf: number;
  /** Government transaction tax, PER SIDE. 20 = 0.2%. Charged twice (the
   *  collection side and the withdrawal side) but BOTH are paid by the buyer. */
  govTaxBp: number;
  /** VAT applied to the commission only. 1925 = 19.25%. */
  vatBp: number;
  /** Gateway fee when COLLECTING from the buyer. 200 = 2%. */
  collectFeeBp: number;
  /** Flat gateway charge per collection, in whole XAF. 0 unless your contract says otherwise. */
  collectFlatXaf: number;
  /** Gateway fee when PAYING OUT to the seller. 100 = 1%. */
  payoutFeeBp: number;
  /** Flat gateway charge per payout, in whole XAF. */
  payoutFlatXaf: number;
  /** Who absorbs the payout fee. Read the note above this constant. */
  payoutFeePaidBy: PayoutFeePayer;
  /** Stamped onto every quote so a webhook can tell which rules produced it. */
  version: string;
  /** How long a quote stays honourable, in seconds. */
  quoteTtlSeconds: number;
}

export interface CheckoutQuote {
  version: string;
  currency: "XAF";
  issuedAt: string;
  expiresAt: string;
  /** What the seller is owed for the goods. */
  sellerAmountXaf: number;
  /** Bambeh's commission, rounded to whole XAF for the ledger. */
  commissionXaf: number;
  /** VAT on the commission, rounded to whole XAF for the ledger. */
  vatXaf: number;
  /** Government tax, both sides, rounded to whole XAF for the ledger. */
  govTaxXaf: number;
  /** What the gateway will keep out of the collection. */
  collectFeeXaf: number;
  /** THE ONLY NUMBER THE BUYER EVER SEES. Whole XAF. */
  buyerTotalXaf: number;
  /** Left over after rounding up. Belongs in a rounding ledger, not in profit. */
  roundingSurplusXaf: number;
  /** Exact unrounded values in micro-XAF, for the ledger and for audit. */
  exactMicro: {
    sellerAmount: number;
    commission: number;
    vat: number;
    govTax: number;
    collectFee: number;
    buyerTotal: number;
    roundingSurplus: number;
  };
}

export interface PayoutQuote {
  version: string;
  currency: "XAF";
  /** What the seller must actually end up holding. */
  sellerReceivesXaf: number;
  /** What Bambeh instructs the gateway to send. */
  transferAmountXaf: number;
  /** What the gateway keeps on the way out. */
  payoutFeeXaf: number;
  /** Who that fee came out of. */
  paidBy: PayoutFeePayer;
}

export interface LedgerLine {
  account: string;
  debitMicro: number;
  creditMicro: number;
  memo: string;
}

export interface AmountCheck {
  ok: boolean;
  reason: string;
  expectedXaf: number;
  receivedXaf: number;
}

/* ------------------------------------------------------------- the config */

const MICRO = 1_000_000;
const BP = 10_000;

/**
 * PAYOUT_FEE_PAID_BY - read this before you change anything else.
 *
 * At 1% commission and a 1% withdrawal fee, the fee to pay the seller is the
 * same size as the commission you earned. If Bambeh absorbs it, every sale
 * nets zero and you still owe the VAT out of your own pocket.
 *
 *   "seller"      - the seller is sent the gross and the gateway takes its
 *                   cut, so a seller owed 1,000 lands 990. Cheapest for
 *                   Bambeh, but sellers WILL notice and must be told up
 *                   front, on the listing form, in their own language.
 *   "buyer"       - the withdrawal fee is added to the checkout gross-up, so
 *                   the buyer pays it. The seller lands exactly 1,000 and
 *                   Bambeh keeps its full commission. Honest and sustainable,
 *                   but the buyer pays a little more.
 *   "marketplace" - Bambeh eats it. Included only so the number is visible.
 *                   At the current rates this runs at a loss. Do not ship it
 *                   without raising commissionBp first.
 *
 * Default is "buyer" because it is the only setting where nobody is
 * surprised: the seller is quoted a price and receives that price.
 */
export const BAMBEH_PRICING: PricingConfig = {
  commissionBp: 100,        // 1%
  commissionFlatXaf: 4,     // the 4 FCFA your calculate_fees trigger already charges
  govTaxBp: 20,             // 0.2% per side, both sides paid by the buyer
  vatBp: 1925,              // 19.25%
  collectFeeBp: 200,        // 2%   <-- confirm against your CamPay contract
  collectFlatXaf: 0,
  payoutFeeBp: 100,         // 1%   <-- confirm against your CamPay contract
  payoutFlatXaf: 0,
  payoutFeePaidBy: "buyer",
  version: "bambeh-pricing-2026-08-A",
  quoteTtlSeconds: 300,
};

/* ------------------------------------------------------------- validation */

const MAX_XAF = 50_000_000;

function assertWholeXaf(value: number, label: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(label + " must be a finite number, got " + String(value));
  }
  if (!Number.isInteger(value)) {
    throw new Error(label + " must be whole XAF, got " + String(value));
  }
  if (value < 0) {
    throw new Error(label + " cannot be negative, got " + String(value));
  }
  if (value > MAX_XAF) {
    throw new Error(label + " exceeds the " + String(MAX_XAF) + " XAF ceiling");
  }
}

function assertConfig(cfg: PricingConfig): void {
  const rates: Array<[string, number]> = [
    ["commissionBp", cfg.commissionBp],
    ["vatBp", cfg.vatBp],
    ["govTaxBp", cfg.govTaxBp],
    ["collectFeeBp", cfg.collectFeeBp],
    ["payoutFeeBp", cfg.payoutFeeBp],
  ];
  for (const pair of rates) {
    const name = pair[0];
    const bp = pair[1];
    if (!Number.isInteger(bp) || bp < 0) {
      throw new Error(name + " must be a whole number of basis points");
    }
  }
  if (cfg.collectFeeBp >= BP) {
    throw new Error("collectFeeBp of " + String(cfg.collectFeeBp) + " would make the gross-up divide by zero or worse");
  }
  if (cfg.payoutFeeBp >= BP) {
    throw new Error("payoutFeeBp of " + String(cfg.payoutFeeBp) + " leaves the seller nothing");
  }
  assertWholeXaf(cfg.commissionFlatXaf, "commissionFlatXaf");
  assertWholeXaf(cfg.collectFlatXaf, "collectFlatXaf");
  assertWholeXaf(cfg.payoutFlatXaf, "payoutFlatXaf");
}

/* ----------------------------------------------------------- the maths */

/** micro-XAF times basis points, rounded half-up, staying integer. */
function applyBp(micro: number, bp: number): number {
  const scaled = micro * bp;
  return Math.round(scaled / BP);
}

function microToWholeXafUp(micro: number): number {
  return Math.ceil(micro / MICRO);
}

function microToWholeXafNearest(micro: number): number {
  return Math.round(micro / MICRO);
}

/**
 * Work out what the buyer must be charged so that, after the gateway has
 * taken its cut, exactly the right amount is left for the seller, the
 * commission and the VAT.
 */
export function quoteCheckout(
  sellerAmountXaf: number,
  cfg: PricingConfig = BAMBEH_PRICING,
  now: Date = new Date(),
): CheckoutQuote {
  assertConfig(cfg);
  assertWholeXaf(sellerAmountXaf, "sellerAmountXaf");
  if (sellerAmountXaf === 0) {
    throw new Error("sellerAmountXaf cannot be zero - there is nothing to sell");
  }

  const sellerMicro = sellerAmountXaf * MICRO;
  const commissionMicro =
    applyBp(sellerMicro, cfg.commissionBp) + cfg.commissionFlatXaf * MICRO;
  const vatMicro = applyBp(commissionMicro, cfg.vatBp);

  // Government tax, both sides. The withdrawal side used to be deducted from
  // the seller's payout; Big's instruction is that a seller who lists at 1,000
  // collects 1,000, so the buyer now covers both.
  const govTaxMicro = applyBp(sellerMicro, cfg.govTaxBp) * 2;

  // If the buyer is covering the payout fee, it has to be inside the
  // gross-up, otherwise it comes out of the seller's money later.
  //
  // Cover the ACTUAL extra cash that leaves the account - transfer minus what
  // the seller lands - not the rounded fee figure. Those differ by a franc
  // once the payout transfer is itself rounded up, and a franc a sale is a
  // franc a sale.
  let payoutCoverMicro = 0;
  if (cfg.payoutFeePaidBy === "buyer") {
    const payout = quotePayout(sellerAmountXaf, cfg);
    payoutCoverMicro = (payout.transferAmountXaf - sellerAmountXaf) * MICRO;
  }

  const flatMicro = cfg.collectFlatXaf * MICRO;
  const requiredMicro =
    sellerMicro + commissionMicro + vatMicro + govTaxMicro + payoutCoverMicro + flatMicro;

  // gross = required / (1 - rate), kept as integers
  const grossMicro = Math.ceil((requiredMicro * BP) / (BP - cfg.collectFeeBp));
  const buyerTotalXaf = microToWholeXafUp(grossMicro);
  const buyerTotalMicro = buyerTotalXaf * MICRO;

  const collectFeeMicro = applyBp(buyerTotalMicro, cfg.collectFeeBp) + flatMicro;
  const netAfterGatewayMicro = buyerTotalMicro - collectFeeMicro;
  const surplusMicro =
    netAfterGatewayMicro -
    (sellerMicro + commissionMicro + vatMicro + govTaxMicro + payoutCoverMicro);

  const issued = now;
  const expires = new Date(issued.getTime() + cfg.quoteTtlSeconds * 1000);

  return {
    version: cfg.version,
    currency: "XAF",
    issuedAt: issued.toISOString(),
    expiresAt: expires.toISOString(),
    sellerAmountXaf,
    commissionXaf: microToWholeXafNearest(commissionMicro),
    vatXaf: microToWholeXafNearest(vatMicro),
    govTaxXaf: microToWholeXafNearest(govTaxMicro),
    collectFeeXaf: microToWholeXafNearest(collectFeeMicro),
    buyerTotalXaf,
    roundingSurplusXaf: microToWholeXafNearest(surplusMicro),
    exactMicro: {
      sellerAmount: sellerMicro,
      commission: commissionMicro,
      vat: vatMicro,
      govTax: govTaxMicro,
      collectFee: collectFeeMicro,
      buyerTotal: buyerTotalMicro,
      roundingSurplus: surplusMicro,
    },
  };
}

/** The other leg: getting the money out to the seller's mobile money. */
export function quotePayout(
  sellerReceivesXaf: number,
  cfg: PricingConfig = BAMBEH_PRICING,
): PayoutQuote {
  assertConfig(cfg);
  assertWholeXaf(sellerReceivesXaf, "sellerReceivesXaf");

  const flatMicro = cfg.payoutFlatXaf * MICRO;

  if (cfg.payoutFeePaidBy === "seller") {
    // Send exactly what is owed; the gateway shaves its cut off the top and
    // the seller lands less. Nobody is subsidising anyone, but the seller
    // must have been told this before they listed.
    const transferMicro = sellerReceivesXaf * MICRO;
    const feeMicro = applyBp(transferMicro, cfg.payoutFeeBp) + flatMicro;
    return {
      version: cfg.version,
      currency: "XAF",
      sellerReceivesXaf: Math.floor((transferMicro - feeMicro) / MICRO),
      transferAmountXaf: sellerReceivesXaf,
      payoutFeeXaf: microToWholeXafNearest(feeMicro),
      paidBy: "seller",
    };
  }

  // buyer or marketplace: gross the transfer up so the seller lands the
  // exact figure they were promised.
  const targetMicro = sellerReceivesXaf * MICRO + flatMicro;
  const transferMicro = Math.ceil((targetMicro * BP) / (BP - cfg.payoutFeeBp));
  const transferXaf = microToWholeXafUp(transferMicro);
  const feeMicro = applyBp(transferXaf * MICRO, cfg.payoutFeeBp) + flatMicro;

  return {
    version: cfg.version,
    currency: "XAF",
    sellerReceivesXaf,
    transferAmountXaf: transferXaf,
    payoutFeeXaf: microToWholeXafNearest(feeMicro),
    paidBy: cfg.payoutFeePaidBy,
  };
}

/**
 * Webhook guard. Never mark an order paid because the browser said so.
 * Compare what the gateway actually reports against the quote you issued.
 */
export function verifyPaidAmount(
  quote: CheckoutQuote,
  receivedXaf: number,
  toleranceXaf: number = 0,
): AmountCheck {
  const base: AmountCheck = {
    ok: false,
    reason: "",
    expectedXaf: quote.buyerTotalXaf,
    receivedXaf,
  };

  if (!Number.isFinite(receivedXaf)) {
    return { ...base, reason: "the gateway did not report a usable amount" };
  }
  const shortfall = quote.buyerTotalXaf - receivedXaf;
  if (shortfall > toleranceXaf) {
    return { ...base, reason: "underpaid by " + String(shortfall) + " XAF" };
  }
  if (receivedXaf - quote.buyerTotalXaf > toleranceXaf) {
    return { ...base, reason: "overpaid - hold and refund the difference by hand" };
  }
  return { ...base, ok: true, reason: "amount matches the quote" };
}

/** Has this quote gone stale? Prices must not be honoured forever. */
export function isQuoteExpired(quote: CheckoutQuote, now: Date = new Date()): boolean {
  return now.getTime() > new Date(quote.expiresAt).getTime();
}

/**
 * Double-entry lines for one successful collection. Debits must equal
 * credits or the ledger is wrong - assertBalanced below proves it.
 */
export function settlementLedger(quote: CheckoutQuote): LedgerLine[] {
  const m = quote.exactMicro;
  const lines: LedgerLine[] = [
    { account: "buyer_payment_clearing", debitMicro: m.buyerTotal, creditMicro: 0, memo: "buyer paid" },
    { account: "seller_payable", debitMicro: 0, creditMicro: m.sellerAmount, memo: "owed to seller" },
    { account: "marketplace_commission", debitMicro: 0, creditMicro: m.commission, memo: "Bambeh commission" },
    { account: "vat_payable", debitMicro: 0, creditMicro: m.vat, memo: "VAT on commission" },
    { account: "gov_tax_payable", debitMicro: 0, creditMicro: m.govTax, memo: "government tax, both sides" },
    { account: "gateway_fee_expense", debitMicro: 0, creditMicro: m.collectFee, memo: "collection fee" },
  ];
  const credited = m.sellerAmount + m.commission + m.vat + m.govTax + m.collectFee;
  const remainder = m.buyerTotal - credited;
  if (remainder !== 0) {
    lines.push({
      account: "rounding_adjustment",
      debitMicro: 0,
      creditMicro: remainder,
      memo: "gross-up rounding, not profit",
    });
  }
  return lines;
}

export function assertBalanced(lines: LedgerLine[]): void {
  let debits = 0;
  let credits = 0;
  for (const line of lines) {
    debits += line.debitMicro;
    credits += line.creditMicro;
  }
  if (debits !== credits) {
    throw new Error(
      "ledger does not balance: debits " + String(debits) + " vs credits " + String(credits),
    );
  }
}

/** What to show the buyer. Never invent a second version of this on a screen. */
export function formatQuoteForBuyer(quote: CheckoutQuote): Array<{ label: string; xaf: number }> {
  return [
    { label: "item", xaf: quote.sellerAmountXaf },
    { label: "serviceFee", xaf: quote.commissionXaf },
    { label: "vat", xaf: quote.vatXaf },
    { label: "govTax", xaf: quote.govTaxXaf },
    { label: "paymentCharge", xaf: quote.collectFeeXaf },
    { label: "total", xaf: quote.buyerTotalXaf },
  ];
}
// BAMBEH_END_TOKEN__PRICING_FIX289__COMPLETE
