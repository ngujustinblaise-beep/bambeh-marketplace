import {
  BAMBEH_PRICING,
  quoteCheckout,
  quotePayout,
  verifyPaidAmount,
  isQuoteExpired,
  settlementLedger,
  assertBalanced,
} from "./bambehPricing.ts";

let pass = 0;
let fail = 0;

function check(name: string, got: unknown, want: unknown): void {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) { pass++; console.log("  PASS  " + name + "  = " + a); }
  else { fail++; console.log("  FAIL  " + name + "  got " + a + "  want " + b); }
}

function throws(name: string, fn: () => unknown): void {
  try { fn(); fail++; console.log("  FAIL  " + name + " did not throw"); }
  catch { pass++; console.log("  PASS  " + name + " rejected"); }
}

console.log("\n=== 1. Big's worked example, seller-absorbs-payout (his doc's assumption) ===");
const docCfg = { ...BAMBEH_PRICING, payoutFeePaidBy: "seller" as const };
const q = quoteCheckout(1000, docCfg);
check("buyer pays", q.buyerTotalXaf, 1033);
check("seller amount", q.sellerAmountXaf, 1000);
check("commission", q.commissionXaf, 10);
check("VAT (exact micro)", q.exactMicro.vat, 1_925_000);
check("collect fee (exact micro)", q.exactMicro.collectFee, 20_660_000);
check("surplus micro", q.exactMicro.roundingSurplus, 415_000);

console.log("\n=== 2. The trap: seller only lands 990 under that setting ===");
const payoutSellerPays = quotePayout(1000, docCfg);
check("transfer sent", payoutSellerPays.transferAmountXaf, 1000);
check("seller actually receives", payoutSellerPays.sellerReceivesXaf, 990);
check("payout fee", payoutSellerPays.payoutFeeXaf, 10);

console.log("\n=== 3. Default setting: buyer covers payout, seller lands the full 1000 ===");
const qb = quoteCheckout(1000);
const pb = quotePayout(1000);
check("buyer pays", qb.buyerTotalXaf, 1044);
check("seller receives exactly", pb.sellerReceivesXaf, 1000);
check("transfer sent", pb.transferAmountXaf, 1011);
check("commission kept whole", qb.commissionXaf, 10);

console.log("\n=== 4. Marketplace-absorbs proves the loss ===");
const lossCfg = { ...BAMBEH_PRICING, payoutFeePaidBy: "marketplace" as const };
const ql = quoteCheckout(1000, lossCfg);
const pl = quotePayout(1000, lossCfg);
const kept = ql.commissionXaf - (pl.transferAmountXaf - 1000);
check("buyer pays", ql.buyerTotalXaf, 1033);
check("Bambeh keeps after paying the seller", kept, -1);
console.log("  ^^ negative. Every sale loses money before VAT is even paid.");

console.log("\n=== 5. Ledger balances on a spread of prices ===");
for (const amt of [1, 100, 999, 1000, 2500, 17_350, 250_000, 1_000_000]) {
  const qq = quoteCheckout(amt);
  const lines = settlementLedger(qq);
  assertBalanced(lines);
  const netToBambeh = qq.buyerTotalXaf - qq.collectFeeXaf - qq.sellerAmountXaf;
  const covered = netToBambeh >= qq.commissionXaf + qq.vatXaf ? "covered" : "SHORT";
  console.log(
    "  " + String(amt).padStart(9) + " XAF item -> buyer " +
    String(qq.buyerTotalXaf).padStart(9) + "  fee " + String(qq.collectFeeXaf).padStart(6) +
    "  commission+VAT " + String(qq.commissionXaf + qq.vatXaf).padStart(6) + "  " + covered,
  );
  if (covered === "SHORT") { fail++; } else { pass++; }
}

console.log("\n=== 6. No float drift anywhere ===");
let drift = 0;
for (let amt = 1; amt <= 5000; amt++) {
  const qq = quoteCheckout(amt);
  const net = qq.exactMicro.buyerTotal - qq.exactMicro.collectFee;
  const need = qq.exactMicro.sellerAmount + qq.exactMicro.commission + qq.exactMicro.vat;
  if (net < need) drift++;
  if (!Number.isInteger(qq.buyerTotalXaf)) drift++;
}
check("prices 1..5000 that would underfund the platform", drift, 0);

console.log("\n=== 7. Webhook guard ===");
check("exact amount", verifyPaidAmount(qb, 1044).ok, true);
check("one franc short", verifyPaidAmount(qb, 1043).ok, false);
check("short, with tolerance", verifyPaidAmount(qb, 1043, 1).ok, true);
check("overpaid is held", verifyPaidAmount(qb, 2000).ok, false);
check("garbage amount", verifyPaidAmount(qb, NaN).ok, false);

console.log("\n=== 8. Quote expiry ===");
const old = quoteCheckout(1000, BAMBEH_PRICING, new Date("2026-08-07T10:00:00Z"));
check("fresh", isQuoteExpired(old, new Date("2026-08-07T10:04:00Z")), false);
check("stale after 5 min", isQuoteExpired(old, new Date("2026-08-07T10:06:00Z")), true);

console.log("\n=== 9. Bad input is refused, not silently coerced ===");
throws("zero price", () => quoteCheckout(0));
throws("negative price", () => quoteCheckout(-500));
throws("fractional price", () => quoteCheckout(999.5));
throws("string price", () => quoteCheckout("1000" as unknown as number));
throws("NaN", () => quoteCheckout(NaN));
throws("absurd price", () => quoteCheckout(99_000_000));
throws("100% gateway fee", () => quoteCheckout(1000, { ...BAMBEH_PRICING, collectFeeBp: 10_000 }));

console.log("\n=== 10. Contract change is one line ===");
const negotiated = { ...BAMBEH_PRICING, collectFeeBp: 150, payoutFeePaidBy: "seller" as const };
check("at 1.5% collection", quoteCheckout(1000, negotiated).buyerTotalXaf, 1028);
const richer = { ...BAMBEH_PRICING, commissionBp: 300, payoutFeePaidBy: "seller" as const };
check("at 3% commission", quoteCheckout(1000, richer).buyerTotalXaf, 1057);

console.log("\n===============================================");
console.log("  PASSED " + String(pass) + "   FAILED " + String(fail));
console.log("===============================================\n");
if (fail > 0) process.exit(1);

console.log("\n=== 11. Both legs together: is Bambeh whole after paying the seller? ===");
let shortSales = 0;
for (let amt = 50; amt <= 200_000; amt += 137) {
  const c = quoteCheckout(amt);
  const p = quotePayout(amt);
  const inHand = c.buyerTotalXaf - c.collectFeeXaf;      // after the gateway takes collection
  const out = c.sellerAmountXaf + (p.transferAmountXaf - c.sellerAmountXaf); // transfer to seller
  const keptXaf = inHand - out;                           // commission + VAT + rounding
  if (keptXaf < c.commissionXaf) shortSales++;
}
check("sales where Bambeh fails to keep its commission", shortSales, 0);
