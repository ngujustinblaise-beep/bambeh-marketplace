// BAMBEH_DEPLOY_TOKEN__PAYMENTS_FIX202_START
// FILE LOCATION: Supabase Edge Function "payments" (dashboard editor)
//
// FIX202 — corrects FIX197. Deploy with Verify JWT OFF (as before).
//
//  FIX202  escrow_status removed from the handleCart insert. I had written
//          'pending_release', which orders_escrow_status_check does not allow,
//          so every cart order insert failed with 500. The DB default 'held'
//          now applies instead.
//  FIX200  resolveSellerPhone also reads the LISTING's phone columns, because
//          only 2 of 20 profiles have a number on file.
//  FIX204  new POST /refund-escrow so a buyer can decline and be refunded.
//
// RUN FIX197_orders_order_group.sql FIRST.
//
// WHAT CHANGED AND WHY
//  1. payments inserts now supply gov_tax, total_charged and user_id.
//     These are plain NOT NULL columns (verified 2026-07-27). The old code
//     omitted the first two and passed an explicit NULL for the third, so
//     EVERY payments row failed — and because fulfilOrder() looks the payment
//     up by external_ref, that silently broke every confirmation.
//  2. orders.seller_id is NOT NULL and was never supplied, so every cart
//     order insert died. Carts are now split into ONE ORDER PER SELLER,
//     sharing an order_group_id. One CamPay charge, N orders, N payouts.
//  3. escrow is a real flag again — but it DEFAULTS TO TRUE (hold).
//     The old code hardcoded true; defaulting to false would have started
//     paying sellers before delivery. Holding is the safe failure mode.
//  4. Real seller payout: resolveSellerPhone() + disburseForOrder(), written
//     into seller_payouts so a seller can never be paid twice.
//       escrow = false -> disburse as soon as the webhook confirms payment
//       escrow = true  -> hold; pay on POST /release-escrow (buyer confirms)
//  5. Webhook: signature verification is UNCHANGED and still rejects bad
//     requests. A diagnostic log now records what CamPay actually sends so
//     the "Invalid signature" failure can be fixed with facts, not guesses.
//
// Secrets: CAMPAY_ACCESS_TOKEN, CAMPAY_WEBHOOK_KEY, CAMPAY_BASE_URL (opt),
//          ADMIN_API_SECRET (opt).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CAMPAY_BASE_URL = (Deno.env.get("CAMPAY_BASE_URL") || "https://www.campay.net/api").replace(/\/+$/, "");
const ACCESS_TOKEN = Deno.env.get("CAMPAY_ACCESS_TOKEN") || "";
const WEBHOOK_KEY = Deno.env.get("CAMPAY_WEBHOOK_KEY") || "";
const ADMIN_API_SECRET = Deno.env.get("ADMIN_API_SECRET") || "";
const CAMPAY_TIMEOUT_MS = Number(Deno.env.get("CAMPAY_TIMEOUT_MS") || 15000);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

// ─────────────────────────────────────────────────────────────────────────────
// campayService  (unchanged from FIX96)
// ─────────────────────────────────────────────────────────────────────────────
const MTN_PREFIXES = [
  "650", "651", "652", "653", "654",
  "670", "671", "672", "673", "674", "675", "676", "677", "678", "679",
  "680", "681", "682", "683", "684", "685", "686", "687", "688", "689",
];
const ORANGE_PREFIXES = [
  "655", "656", "657", "658", "659",
  "690", "691", "692", "693", "694", "695", "696", "697", "698", "699",
];

const PAYMENT_TYPE: Record<string, string> = {
  SUBSCRIPTION: "SUBSCRIPTION", CART: "CART", DONATION: "DONATION",
  COLLECT: "COLLECT", DISBURSE: "DISBURSE", GENERAL: "GENERAL",
};

function generateExternalRef(type = "GENERAL"): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `${type}_${Date.now()}_${rand}`;
}

function validatePhone(raw: unknown): { valid: false; error: string } | { valid: true; normalized: string; operator: string } {
  const digits = String(raw ?? "").replace(/\D/g, "");
  let local9: string;
  if (digits.startsWith("237") && digits.length === 12) local9 = digits.slice(3);
  else if (digits.startsWith("0") && digits.length === 10) local9 = digits.slice(1);
  else if (digits.length === 9) local9 = digits;
  else return { valid: false, error: "Invalid Cameroon number. Use 9 digits or country code 237." };

  const prefix = local9.slice(0, 3);
  const isMTN = MTN_PREFIXES.includes(prefix);
  const isOrange = ORANGE_PREFIXES.includes(prefix);
  if (!isMTN && !isOrange) {
    return { valid: false, error: `Unsupported operator prefix: ${prefix}. Expected MTN or Orange Cameroon.` };
  }
  return { valid: true, normalized: `237${local9}`, operator: isMTN ? "mtn" : "orange" };
}

function validateAmount(raw: unknown): { valid: false; error: string } | { valid: true; value: number } {
  const value = Number(raw);
  if (!Number.isFinite(value)) return { valid: false, error: "Amount must be numeric." };
  if (value <= 0) return { valid: false, error: "Amount must be positive." };
  if (value < 100) return { valid: false, error: "Minimum payment is 100 XAF." };
  if (value > 1000000) return { valid: false, error: "Maximum payment is 1,000,000 XAF." };
  return { valid: true, value: Math.round(value) };
}

function assertConfigured() {
  if (!ACCESS_TOKEN) throw new Error("CAMPAY_ACCESS_TOKEN is missing");
  if (!WEBHOOK_KEY) console.warn("[CamPay] WEBHOOK_KEY is missing");
}

async function campayFetch(path: string, init: RequestInit): Promise<{ ok: boolean; status: number; data: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CAMPAY_TIMEOUT_MS);
  try {
    const res = await fetch(`${CAMPAY_BASE_URL}${path}`, { ...init, signal: controller.signal });
    let data: unknown = null;
    try { data = await res.json(); } catch { /* non-JSON body */ }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

type CamPayResult = { success: true; data: any; externalRef?: string } | { success: false; error: any };

async function collectPayment(
  { amount, currency = "XAF", phone, description, externalRef, metadata = {} }:
  { amount: unknown; currency?: string; phone: unknown; description?: string; externalRef?: string; metadata?: Record<string, unknown> },
): Promise<CamPayResult> {
  assertConfigured();
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return { success: false, error: amountCheck.error };
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return { success: false, error: phoneCheck.error };

  const payload: Record<string, unknown> = {
    amount: String(amountCheck.value),
    currency,
    from: phoneCheck.normalized,
    description: description || "Bambeh payment",
    external_reference: externalRef || generateExternalRef(PAYMENT_TYPE.GENERAL),
    ...metadata,
  };

  try {
    console.log("[CamPay][OUTBOUND]", JSON.stringify({ ...payload, from: String(payload.from).slice(0, 6) + "******" }));
    const res = await campayFetch("/collect/", {
      method: "POST",
      headers: {
        Authorization: `Token ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Request-Source": "bambeh-backend",
      },
      body: JSON.stringify(payload),
    });
    console.log("[CamPay][RESPONSE]", res.status, JSON.stringify(res.data));
    if (!res.ok) return { success: false, error: { message: "CamPay error", status: res.status, data: res.data } };
    return { success: true, data: res.data, externalRef: String(payload.external_reference) };
  } catch (error) {
    const detail = { message: error instanceof Error ? error.message : "Unknown error", status: null, data: null };
    console.error("[CamPay][ERROR]", detail);
    return { success: false, error: detail };
  }
}

async function processTyped(
  type: string, args: { phone: unknown; amount: unknown; description: string; metadata?: Record<string, unknown> },
): Promise<any> {
  const externalRef = generateExternalRef(type);
  const result = await collectPayment({
    amount: args.amount, phone: args.phone, description: args.description,
    externalRef, metadata: args.metadata,
  });
  if (!result.success) throw new Error(typeof result.error === "string" ? result.error : (result.error?.message || JSON.stringify(result.error)));
  return { ...(result.data as object), externalRef };
}

async function checkStatus(reference: string) {
  assertConfigured();
  try {
    const res = await campayFetch(`/transaction/${reference}/`, { headers: { Authorization: `Token ${ACCESS_TOKEN}` } });
    if (!res.ok) return { success: false, error: { message: "CamPay error", status: res.status, data: res.data } };
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: { message: e instanceof Error ? e.message : "Unknown error" } };
  }
}

async function campayDisburse({ amount, to, description, externalRef }: { amount: number; to: string; description: string; externalRef: string }) {
  assertConfigured();
  try {
    console.log("[CamPay][DISBURSE][OUTBOUND]", JSON.stringify({ amount, to: to.slice(0, 6) + "******", externalRef }));
    const res = await campayFetch("/disburse/", {
      method: "POST",
      headers: { Authorization: `Token ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: String(amount), currency: "XAF", to, description, external_reference: externalRef }),
    });
    console.log("[CamPay][DISBURSE][RESPONSE]", res.status, JSON.stringify(res.data));
    if (!res.ok) return { success: false as const, error: res.data };
    const data = res.data as any;
    return { success: true as const, data, reference: data?.reference };
  } catch (e) {
    return { success: false as const, error: { message: e instanceof Error ? e.message : "Unknown error" } };
  }
}

async function campayBalance() {
  assertConfigured();
  try {
    const res = await campayFetch("/balance/", { headers: { Authorization: `Token ${ACCESS_TOKEN}` } });
    if (!res.ok) return { success: false, error: res.data };
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: { message: e instanceof Error ? e.message : "Unknown error" } };
  }
}

async function campayPaymentLink(
  { amount, description, externalRef, from, firstName, lastName, email, redirectUrl, failureRedirectUrl }:
  { amount: number; description: string; externalRef: string; from?: string; firstName?: string; lastName?: string; email?: string; redirectUrl?: string; failureRedirectUrl?: string },
) {
  assertConfigured();
  const phoneCheck = from ? validatePhone(from) : null;
  if (from && phoneCheck && !phoneCheck.valid) return { success: false as const, error: phoneCheck.error };
  try {
    const res = await campayFetch("/get-payment-link/", {
      method: "POST",
      headers: { Authorization: `Token ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: String(amount), currency: "XAF", description,
        external_reference: externalRef,
        from: phoneCheck && phoneCheck.valid ? phoneCheck.normalized : undefined,
        first_name: firstName, last_name: lastName, email,
        redirect_url: redirectUrl, failure_redirect_url: failureRedirectUrl,
      }),
    });
    const data = res.data as any;
    if (!res.ok) return { success: false as const, error: data };
    return { success: true as const, link: data?.link, reference: data?.reference };
  } catch (e) {
    return { success: false as const, error: { message: e instanceof Error ? e.message : "Unknown error" } };
  }
}

async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!WEBHOOK_KEY || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(WEBHOOK_KEY),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  const expected = Array.from(mac).map((b) => b.toString(16).padStart(2, "0")).join("");
  const given = signature.trim().toLowerCase();
  if (expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

function parseWebhook(body: any) {
  const status = String(body?.status ?? "").toUpperCase();
  const paymentType = String(body?.external_reference ?? "").split("_")[0] || PAYMENT_TYPE.GENERAL;
  return {
    reference: body?.reference, externalRef: body?.external_reference, status, paymentType,
    amount: body?.amount, operator: body?.operator, from: body?.from,
    isSuccessful: status === "SUCCESSFUL", isFailed: status === "FAILED",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// paymentController
// ─────────────────────────────────────────────────────────────────────────────
const calculateFees = (subtotal: number) => {
  const appFee = Math.round(subtotal * 0.01); // Bambeh fee: 1%
  const govTax = subtotal > 0 ? 4 : 0;        // flat 4 FCFA per transaction
  return { subtotal, appFee, govTax, total: subtotal + appFee + govTax };
};

function json(body: unknown, code = 200): Response {
  return new Response(JSON.stringify(body), {
    status: code,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
const ok = (data: unknown, code = 200) => json({ success: true, data }, code);
const fail = (msg: string, code = 400) => json({ success: false, error: msg }, code);

async function getBearerUser(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

async function isAdmin(req: Request): Promise<boolean> {
  if (ADMIN_API_SECRET && req.headers.get("x-admin-secret") === ADMIN_API_SECRET) return true;
  const user = await getBearerUser(req);
  if (!user) return false;
  try {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (!profile) return false;
    const role = String(profile.role ?? profile.user_role ?? "").toLowerCase();
    return profile.is_admin === true || role === "admin" || role === "super_admin" || role === "superadmin";
  } catch {
    return false;
  }
}

const rlBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rlBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rlBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count++;
  return bucket.count > limit;
}
function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
}

const ORDER_AMOUNT_COLUMNS = ["total_xaf", "total_amount", "total", "amount", "subtotal", "price"];

async function resolveOrderAmount(orderId: string): Promise<{ ok: true; amount: number } | { ok: false; error: string }> {
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (error || !order) return { ok: false, error: "Order not found." };
  for (const col of ORDER_AMOUNT_COLUMNS) {
    const raw = (order as any)[col];
    const num = typeof raw === "string" ? Number(raw) : raw;
    if (typeof num === "number" && Number.isFinite(num) && num > 0) return { ok: true, amount: num };
  }
  return { ok: false, error: "Order has no readable amount. Confirm the orders schema / ORDER_AMOUNT_COLUMNS." };
}

const PLAN_PRICES: Record<string, number> = { "daily": 100, "weekly": 500, "monthly": 1500 };

async function resolvePlanPrice(planName: string): Promise<number | null> {
  try {
    const { data: plan } = await supabase.from("subscription_plans").select("price").eq("name", planName).maybeSingle();
    if (plan && typeof (plan as any).price === "number" && (plan as any).price > 0) return (plan as any).price;
  } catch { /* table may not exist yet */ }
  const p = PLAN_PRICES[planName];
  return typeof p === "number" && p > 0 ? p : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LISTING_TABLES: Record<string, string> = { marketplace: "marketplace_listings", listing: "listings", general: "listings" };
const PRICE_COLUMNS = ["price_xaf", "price", "amount"];

function readRowPrice(row: any): number | null {
  for (const col of PRICE_COLUMNS) {
    const raw = row[col];
    const num = typeof raw === "string" ? Number(raw) : raw;
    if (typeof num === "number" && Number.isFinite(num) && num > 0) return Math.round(num);
  }
  return null;
}

type CartItem = {
  listingId: string | null; listingType: string | null; sellerId: string | null;
  title: string; priceXAF: number; quantity: number; verified: boolean;
};

async function verifyAndReserveItems(rawItems: unknown): Promise<
  { ok: true; items: CartItem[]; reservations: { table: string; listingId: string; qty: number }[]; verifiedCount: number; releaseAll: () => Promise<void> }
  | { ok: false; error: string; code?: number }
> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return { ok: false, error: "items array is required." };
  if (rawItems.length > 50) return { ok: false, error: "Too many items in one order (max 50)." };

  const items: CartItem[] = [];
  for (const raw of rawItems as any[]) {
    const qty = Math.round(Number(raw?.quantity ?? 1));
    const price = Math.round(Number(raw?.priceXAF ?? raw?.price ?? 0));
    const title = String(raw?.title ?? raw?.itemTitle ?? "Item").slice(0, 200);
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) return { ok: false, error: `Invalid quantity for "${title}".` };
    if (!Number.isFinite(price) || price < 0 || price > 1000000) return { ok: false, error: `Invalid price for "${title}".` };
    items.push({
      listingId: typeof raw?.listingId === "string" ? raw.listingId : null,
      listingType: typeof raw?.listingType === "string" ? raw.listingType : null,
      sellerId: typeof raw?.sellerId === "string" && UUID_RE.test(raw.sellerId) ? raw.sellerId : null,
      title, priceXAF: price, quantity: qty, verified: false,
    });
  }

  const reservations: { table: string; listingId: string; qty: number }[] = [];
  let verifiedCount = 0;

  const releaseAll = async () => {
    for (const r of reservations) {
      try {
        await supabase.rpc("release_stock", { p_table: r.table, p_listing_id: r.listingId, p_qty: r.qty });
      } catch (e) {
        console.error("[cart] release_stock rollback error:", e instanceof Error ? e.message : e);
      }
    }
  };

  for (const item of items) {
    const table = item.listingType ? LISTING_TABLES[item.listingType] : null;
    if (!table || !item.listingId || !UUID_RE.test(item.listingId)) continue;

    const { data: row, error } = await supabase.from(table).select("*").eq("id", item.listingId).maybeSingle();
    if (error) { console.error(`[cart] price lookup error on ${table}:`, error.message); continue; }
    if (!row) continue;

    const dbPrice = readRowPrice(row);
    if (dbPrice !== null) { item.priceXAF = dbPrice; item.verified = true; verifiedCount++; }

    // FIX197: trust the DB for the seller too, when the row exposes one.
    const rowSeller = (row as any).user_id ?? (row as any).seller_id ?? null;
    if (typeof rowSeller === "string" && UUID_RE.test(rowSeller)) item.sellerId = rowSeller;

    const { data: remaining, error: rpcError } = await supabase
      .rpc("reserve_stock", { p_table: table, p_listing_id: item.listingId, p_qty: item.quantity });
    if (rpcError) { console.error("[cart] reserve_stock error:", rpcError.message); continue; }
    if (remaining === -1) {
      await releaseAll();
      return { ok: false, error: `"${item.title}" is out of stock.`, code: 409 };
    }
    reservations.push({ table, listingId: item.listingId, qty: item.quantity });
  }

  return { ok: true, items, reservations, verifiedCount, releaseAll };
}

async function releaseStockForItems(items: unknown) {
  if (!Array.isArray(items)) return;
  for (const item of items as any[]) {
    const table = item?.listingType ? LISTING_TABLES[item.listingType] : null;
    if (!table || !item?.listingId || !UUID_RE.test(item.listingId)) continue;
    try {
      await supabase.rpc("release_stock", { p_table: table, p_listing_id: item.listingId, p_qty: item.quantity ?? 1 });
    } catch (e) {
      console.error("[webhook] release_stock error:", e instanceof Error ? e.message : e);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX197 — payments insert that actually satisfies the schema.
// gov_tax, total_charged and user_id are plain NOT NULL columns.
// user_id is only included when we have a real one, so a column default (if
// any) can apply; if it still fails the log names it explicitly.
// ─────────────────────────────────────────────────────────────────────────────
async function recordPendingPayment(
  { reference, externalRef, paymentType, amount, phone, userId, orderId, planName, cause, govTax, totalCharged }:
  {
    reference?: string; externalRef: string; paymentType: string; amount: number; phone: string;
    userId?: string | null; orderId?: string | null; planName?: string | null; cause?: string | null;
    govTax?: number; totalCharged?: number;
  },
) {
  const row: Record<string, unknown> = {
    reference,
    external_ref: externalRef,
    payment_type: paymentType,
    status: "PENDING",
    amount,
    gov_tax: Math.round(govTax ?? 0),
    total_charged: Math.round(totalCharged ?? amount),
    phone,
    order_id: orderId || null,
    plan_name: planName || null,
    cause: cause || null,
    created_at: new Date().toISOString(),
  };
  if (userId && UUID_RE.test(userId)) row.user_id = userId;

  const { error } = await supabase.from("payments").insert(row);
  if (error) {
    console.error("[Supabase] recordPendingPayment FAILED:", error.message, "| ref:", externalRef);
    if (/user_id/.test(error.message)) {
      console.error("[Supabase] payments.user_id is NOT NULL and this payment has no signed-in user " +
        "(donations are anonymous). Either require sign-in for donations or make payments.user_id nullable.");
    }
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

async function activateSubscription(externalRef: string, event: any) {
  const { data: payment } = await supabase.from("payments").select("user_id, plan_name").eq("external_ref", externalRef).maybeSingle();
  if (!payment) return;

  await supabase.from("payments").update({ status: "SUCCESSFUL", operator: event.operator, settled_at: new Date().toISOString() }).eq("external_ref", externalRef);

  const now = new Date();
  const expiresAt = new Date(now);
  const planKey = String((payment as any).plan_name || "").toLowerCase();
  if (planKey === "daily") expiresAt.setDate(expiresAt.getDate() + 1);
  else if (planKey === "weekly") expiresAt.setDate(expiresAt.getDate() + 7);
  else expiresAt.setDate(expiresAt.getDate() + 30);

  const row: Record<string, unknown> = {
    user_id: (payment as any).user_id,
    plan: planKey,
    status: "active",
    price_xaf: Math.round(Number(event.amount)) || null,
    payment_reference: event.reference ?? null,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
  };

  const { data: updated, error: updErr } = await supabase
    .from("subscriptions").update(row).eq("user_id", row.user_id as string).select("id");
  if (updErr) console.error("[Webhook] subscription update error:", updErr.message);
  if (updated && updated.length > 0) {
    console.info("[Webhook] subscription RENEWED:", row.user_id, planKey, row.expires_at);
    return;
  }
  const { error: insErr } = await supabase.from("subscriptions").insert(row);
  if (insErr) console.error("[Webhook] subscription insert FAILED:", insErr.message);
  else console.info("[Webhook] subscription ACTIVATED:", row.user_id, planKey, row.expires_at);
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX197 — SELLER PAYOUT
// ─────────────────────────────────────────────────────────────────────────────

// Same defensive idiom the file already uses for order amounts: we do not know
// which column holds a seller's payout number, so try the plausible ones.
const SELLER_PHONE_TABLES = ["profiles", "shops", "users"];
const SELLER_PHONE_COLUMNS = [
  "payout_phone", "momo_phone", "mobile_money_number", "mobile_money",
  "phone_number", "phone", "whatsapp", "contact_phone",
];

// FIX200: the number the seller typed when posting the item. Far more
// populated than profiles.phone (2 of 20 as of 2026-07-27).
const LISTING_PHONE_COLUMNS = [
  "payout_phone", "momo_phone", "phone", "contact_phone", "vendor_phone", "seller_phone",
];

function firstValidPhone(row: any, columns: string[]): string | null {
  if (!row) return null;
  for (const col of columns) {
    const raw = row[col];
    if (!raw) continue;
    const check = validatePhone(raw);
    if (check.valid) return check.normalized;
  }
  return null;
}

/**
 * Find a payout number for this seller.
 *  1. profiles / vendor_profiles / shops / users / farmers
 *  2. FIX200 - the listing(s) the ordered items came from
 */
async function resolveSellerPhone(sellerId: string | null, order?: any): Promise<string | null> {
  if (sellerId && UUID_RE.test(sellerId)) {
    for (const table of SELLER_PHONE_TABLES) {
      try {
        const { data: row, error } = await supabase.from(table).select("*").eq("id", sellerId).maybeSingle();
        if (error || !row) continue;
        const found = firstValidPhone(row, SELLER_PHONE_COLUMNS);
        if (found) {
          console.info(`[payout] seller phone resolved from ${table}`);
          return found;
        }
      } catch { /* table may not exist */ }
    }
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  const tried = new Set<string>();
  for (const item of items as any[]) {
    const listingId = item?.listingId;
    if (!listingId || !UUID_RE.test(String(listingId))) continue;

    const candidates = [
      item?.listingType ? LISTING_TABLES[item.listingType] : null,
      "listings",
      "marketplace_listings",
    ].filter(Boolean) as string[];

    for (const table of candidates) {
      const key = `${table}:${listingId}`;
      if (tried.has(key)) continue;
      tried.add(key);
      try {
        const { data: row, error } = await supabase.from(table).select("*").eq("id", listingId).maybeSingle();
        if (error || !row) continue;
        const found = firstValidPhone(row, LISTING_PHONE_COLUMNS);
        if (found) {
          console.info(`[payout] seller phone resolved from ${table} (listing ${listingId})`);
          return found;
        }
      } catch { /* table may not exist */ }
    }
  }

  return null;
}

/**
 * Pay one order's seller. Idempotent: seller_payouts has a unique index on
 * order_id, so a duplicate webhook or a retry can never pay twice.
 */
async function disburseForOrder(order: any, reason: string): Promise<void> {
  const orderId = order?.id;
  if (!orderId) return;

  const amount = Math.round(Number(order.seller_payout_xaf ?? 0));
  const sellerId: string | null = order.seller_id ?? null;

  // Claim the payout row first. If it already exists we stop immediately.
  const externalRef = generateExternalRef("DISBURSE");
  const { error: claimErr } = await supabase.from("seller_payouts").insert({
    order_id: orderId, seller_id: sellerId, amount_xaf: amount,
    external_ref: externalRef, status: "pending",
  });
  if (claimErr) {
    if (claimErr.code === "23505") {
      console.info("[payout] already claimed for order", orderId, "- skipping");
    } else {
      console.error("[payout] could not claim payout row:", claimErr.message);
    }
    return;
  }

  if (amount <= 0) {
    await supabase.from("seller_payouts").update({ status: "failed", failure_reason: "amount is zero" }).eq("order_id", orderId);
    console.error("[payout] order", orderId, "has no seller_payout_xaf");
    return;
  }

  const phone = await resolveSellerPhone(sellerId, order);
  if (!phone) {
    await supabase.from("seller_payouts")
      .update({ status: "no_phone", failure_reason: "no valid payout number on file for this seller" })
      .eq("order_id", orderId);
    console.error(`[payout] NO PAYOUT NUMBER for seller ${sellerId} (order ${orderId}). ` +
      `Money stays with Bambeh until the seller adds a mobile money number.`);
    return;
  }

  const result = await campayDisburse({
    amount, to: phone,
    description: `Bambeh payout for order ${order.order_number ?? orderId}`,
    externalRef,
  });

  if (!result.success) {
    await supabase.from("seller_payouts")
      .update({ status: "failed", to_phone: phone, failure_reason: JSON.stringify(result.error).slice(0, 500) })
      .eq("order_id", orderId);
    console.error("[payout] disbursement REFUSED for order", orderId, result.error);
    return;
  }

  await supabase.from("seller_payouts").update({
    status: "sent", to_phone: phone,
    campay_reference: result.reference ?? null,
    settled_at: new Date().toISOString(),
  }).eq("order_id", orderId);

  await supabase.from("orders").update({
    escrow_status: "released", updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  console.info(`[payout] SENT ${amount} XAF to seller ${sellerId} for order ${orderId} (${reason})`);
}

/**
 * FIX197 — settle EVERY order in the payment's group, then pay the sellers of
 * any order that is not held in escrow.
 */
async function fulfilOrder(externalRef: string, event: any) {
  const { data: payment } = await supabase.from("payments").select("order_id").eq("external_ref", externalRef).maybeSingle();
  if (!payment || !(payment as any).order_id) {
    console.error("[Webhook] no payments row for external_ref", externalRef, "- cannot fulfil");
    return;
  }

  await supabase.from("payments").update({ status: "SUCCESSFUL", operator: event.operator, settled_at: new Date().toISOString() }).eq("external_ref", externalRef);

  // Find the group this order belongs to (may be a single order).
  const { data: anchor } = await supabase.from("orders")
    .select("id, order_group_id").eq("id", (payment as any).order_id).maybeSingle();
  if (!anchor) { console.error("[Webhook] order row vanished:", (payment as any).order_id); return; }

  const groupId = (anchor as any).order_group_id;

  const query = supabase.from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_ref: event.reference })
    .eq("status", "pending")
    .select();

  const { data: paidOrders, error: updErr } = groupId
    ? await query.eq("order_group_id", groupId)
    : await query.eq("id", (anchor as any).id);

  if (updErr) { console.error("[Webhook] order paid update error:", updErr.message); return; }
  if (!paidOrders || paidOrders.length === 0) {
    console.info("[Webhook] orders already finalized, skipping:", groupId ?? (anchor as any).id);
    return;
  }

  console.info(`[Webhook] marked ${paidOrders.length} order(s) paid for group ${groupId ?? "single"}`);

  for (const order of paidOrders as any[]) {
    const buyerId = order.buyer_id || order.user_id;
    const escrowAmount = Math.round(Number(order.seller_payout_xaf ?? order.total_xaf ?? 0));

    if (buyerId && escrowAmount > 0) {
      const { error: escErr } = await supabase.from("escrow_ledger").insert({
        order_id: order.id, buyer_id: buyerId, seller_id: order.seller_id ?? null, amount_xaf: escrowAmount,
      });
      if (escErr && escErr.code !== "23505") console.error("[Webhook] escrow_ledger insert error:", escErr.message);
    }

    // THE RULE: hold escrow orders, pay everything else immediately.
    if (order.escrow === true) {
      console.info(`[Webhook] order ${order.id} is ESCROW - holding ${escrowAmount} XAF until the buyer confirms receipt`);
    } else {
      await disburseForOrder(order, "non-escrow order, payment confirmed");
    }
  }
}

async function failOrder(externalRef: string, event: any) {
  const { data: payment } = await supabase.from("payments").select("order_id").eq("external_ref", externalRef).maybeSingle();
  if (!payment || !(payment as any).order_id) return;

  const { data: anchor } = await supabase.from("orders")
    .select("id, order_group_id").eq("id", (payment as any).order_id).maybeSingle();
  if (!anchor) return;

  const groupId = (anchor as any).order_group_id;
  const q = supabase.from("orders")
    .update({ status: "failed", failure_reason: `CamPay status: ${event.status}` })
    .eq("status", "pending").select();

  const { data: orders } = groupId ? await q.eq("order_group_id", groupId) : await q.eq("id", (anchor as any).id);

  for (const order of (orders ?? []) as any[]) {
    await releaseStockForItems(order.items);
    console.info("[Webhook] order failed, stock released:", order.id);
  }
}

async function recordDonation(externalRef: string, event: any) {
  await supabase.from("payments").update({ status: "SUCCESSFUL", operator: event.operator, settled_at: new Date().toISOString() }).eq("external_ref", externalRef);
  const { error } = await supabase.from("donations").insert({
    external_ref: externalRef, amount: event.amount, phone: event.from,
    operator: event.operator, payment_ref: event.reference, donated_at: new Date().toISOString(),
  });
  if (error) console.error("[Webhook] donation insert error:", error.message);
}

async function markPaymentFailed(externalRef: string) {
  await supabase.from("payments").update({ status: "FAILED", settled_at: new Date().toISOString() }).eq("external_ref", externalRef);
}

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────
async function handleCollect(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { phone, amount, description, externalRef, metadata } = body;

  if (!phone) return fail("phone is required.");
  if (!description) return fail("description is required.");
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return fail(phoneCheck.error);

  const orderId = metadata?.order_id ?? null;
  let chargeAmount: number;
  if (orderId) {
    const lookup = await resolveOrderAmount(orderId);
    if (!lookup.ok) return fail(lookup.error, 404);
    chargeAmount = lookup.amount;
  } else {
    if (!amount) return fail("amount is required.");
    const amountCheck = validateAmount(amount);
    if (!amountCheck.valid) return fail(amountCheck.error);
    chargeAmount = amountCheck.value;
  }

  const ref = externalRef ?? generateExternalRef("COLLECT");
  const result = await collectPayment({ amount: chargeAmount, phone: phoneCheck.normalized, description, externalRef: ref });
  if (!result.success) {
    console.error("[collect] CamPay error:", result.error);
    return fail(typeof result.error === "string" ? result.error : "CamPay refused the payment request. Check the phone number and balance.", 502);
  }

  const user = await getBearerUser(req);
  await recordPendingPayment({
    reference: (result.data as any)?.reference, externalRef: ref, paymentType: "COLLECT",
    amount: chargeAmount, phone: phoneCheck.normalized,
    userId: metadata?.user_id ?? user?.id ?? null, orderId: metadata?.order_id ?? null,
    govTax: 0, totalCharged: chargeAmount,
  });

  return ok({
    message: "Payment request sent to phone. Waiting for user approval.",
    reference: (result.data as any)?.reference, status: (result.data as any)?.status, operator: phoneCheck.operator,
  }, 201);
}

async function handleSubscribe(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { phone, planName, userId } = body; // client "amount" is IGNORED
  if (!phone || !planName || !userId) return fail("phone, planName, userId are required.");

  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return fail(phoneCheck.error);

  const price = await resolvePlanPrice(planName);
  if (price == null) return fail(`Unknown or unconfigured plan: ${planName}. Add it to PLAN_PRICES / subscription_plans.`, 400);

  try {
    const result = await processTyped("SUBSCRIPTION", {
      phone: phoneCheck.normalized, amount: price,
      description: `Bambeh ${planName} Subscription`,
      metadata: { user_id: userId, plan_name: planName },
    });
    await recordPendingPayment({
      reference: result.reference, externalRef: result.externalRef, paymentType: "SUBSCRIPTION",
      amount: price, phone: phoneCheck.normalized, userId, planName,
      govTax: 0, totalCharged: price,
    });
    return ok({
      message: "Subscription payment initiated.",
      reference: result.reference,
      status: result.status,
      operator: phoneCheck.operator,
      externalRef: result.externalRef,
      // FIX270: CamPay returns a USSD code because the automatic push is
      // unreliable on MTN Cameroon. Passing it to the client gives the user
      // a way to approve the payment by hand when no prompt arrives.
      ussd_code: (result as any)?.ussd_code ?? (result as any)?.data?.ussd_code ?? null,
      paymentUrl: (result as any)?.paymentUrl ?? (result as any)?.data?.payment_url ?? null,
    }, 201);
  } catch (e) {
    console.error("[subscribe] CamPay error:", e);
    return fail("CamPay refused the payment request. Check the phone number and balance.", 502);
  }
}

/**
 * FIX197 — ORDER-FIRST CART, SPLIT ONE ORDER PER SELLER.
 *
 * One CamPay charge for the whole cart. N order rows sharing an
 * order_group_id, each carrying its own seller_id (NOT NULL) and its own
 * share of the fees. The sum of every order's total_xaf equals the charge
 * exactly — the last order absorbs the rounding remainder.
 */
async function handleCart(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { phone, orderId, summary, items } = body; // client "amount" is ALWAYS ignored

  // SAFETY: hold by default. Only an explicit escrow:false pays instantly.
  const escrowHold = body?.escrow === false ? false : true;

  if (!phone) return fail("phone is required.");
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return fail(phoneCheck.error);

  // ---- LEGACY PATH: existing order id, no items ------------------------------
  if (orderId && !items) {
    const lookup = await resolveOrderAmount(orderId);
    if (!lookup.ok) return fail(lookup.error, 404);
    const fees = { subtotal: lookup.amount, appFee: 0, govTax: 0, total: lookup.amount };
    try {
      const result = await processTyped("CART", {
        phone: phoneCheck.normalized, amount: fees.total,
        description: summary || "Bambeh Cart Purchase", metadata: { order_id: orderId },
      });
      await recordPendingPayment({
        reference: result.reference, externalRef: result.externalRef, paymentType: "CART",
        amount: fees.total, phone: phoneCheck.normalized, orderId,
        govTax: 0, totalCharged: fees.total,
      });
      return ok({ message: "Cart payment initiated.", reference: result.reference, status: result.status, operator: phoneCheck.operator, externalRef: result.externalRef, breakdown: fees }, 201);
    } catch (e) {
      console.error("[cart-legacy] CamPay error:", e);
      return fail("CamPay refused the payment request. Check the phone number and balance.", 502);
    }
  }

  // ---- ORDER-FIRST PATH -----------------------------------------------------
  const user = await getBearerUser(req);
  if (!user) return fail("Sign in required to checkout.", 401);

  const check = await verifyAndReserveItems(items);
  if (!check.ok) return fail(check.error, check.code || 400);

  // Every item must have a seller — orders.seller_id is NOT NULL.
  const orphan = check.items.find((i) => !i.sellerId);
  if (orphan) {
    await check.releaseAll();
    console.error("[cart] item without a sellerId:", orphan.title);
    return fail(`We could not identify the seller of "${orphan.title}". Please remove it and try again.`, 422);
  }

  const grandSubtotal = check.items.reduce((s, i) => s + i.priceXAF * i.quantity, 0);
  const fees = calculateFees(grandSubtotal);

  const amountCheck = validateAmount(fees.total);
  if (!amountCheck.valid) { await check.releaseAll(); return fail(amountCheck.error); }

  // Group items by seller.
  const bySeller = new Map<string, CartItem[]>();
  for (const item of check.items) {
    const key = item.sellerId as string;
    if (!bySeller.has(key)) bySeller.set(key, []);
    bySeller.get(key)!.push(item);
  }

  const groupId = crypto.randomUUID();
  const sellers = [...bySeller.keys()];
  const rows: Record<string, unknown>[] = [];
  let allocatedTotal = 0;

  sellers.forEach((sellerId, idx) => {
    const sellerItems = bySeller.get(sellerId)!;
    const sellerSubtotal = sellerItems.reduce((s, i) => s + i.priceXAF * i.quantity, 0);

    // 1% app fee prorated by subtotal; the flat 4 XAF sits on the first order.
    let appFeeShare = grandSubtotal > 0 ? Math.round(fees.appFee * sellerSubtotal / grandSubtotal) : 0;
    let govShare = idx === 0 ? fees.govTax : 0;
    let orderTotal = sellerSubtotal + appFeeShare + govShare;

    // Last order absorbs any rounding remainder so the sums match exactly.
    if (idx === sellers.length - 1) {
      const remainder = fees.total - (allocatedTotal + orderTotal);
      appFeeShare += remainder;
      orderTotal += remainder;
    }
    allocatedTotal += orderTotal;

    rows.push({
      order_number: `ORD_${Date.now()}_${generateExternalRef("X").slice(-6)}`,
      order_group_id: groupId,
      buyer_id: user.id,
      user_id: user.id,
      seller_id: sellerId,
      status: "pending",
      total_xaf: orderTotal,
      platform_fee_xaf: appFeeShare + govShare,
      seller_payout_xaf: sellerSubtotal,
      payment_method: "campay",
      items: sellerItems,
      escrow: escrowHold,
      // FIX202: escrow_status omitted on purpose - the DB default 'held' is
      // guaranteed valid under orders_escrow_status_check.
    });
  });

  const { data: orders, error: orderErr } = await supabase.from("orders").insert(rows).select();

  if (orderErr || !orders || orders.length === 0) {
    await check.releaseAll();
    console.error("[cart] order insert error:", orderErr?.message, "| details:", orderErr?.details, "| hint:", orderErr?.hint);
    return fail(`Could not create the order. ${orderErr?.message ?? "Please try again."}`, 500);
  }

  const anchorOrder = (orders as any[])[0];
  const externalRef = generateExternalRef("CART");
  const result = await collectPayment({
    amount: fees.total, phone: phoneCheck.normalized,
    description: summary || `Bambeh Order ${anchorOrder.order_number}`, externalRef,
  });

  if (!result.success) {
    await check.releaseAll();
    await supabase.from("orders")
      .update({ status: "failed", failure_reason: "CamPay initiation refused" })
      .eq("order_group_id", groupId).eq("status", "pending");
    console.error("[cart] CamPay error:", result.error);
    return fail("CamPay refused the payment request. Check the phone number and balance.", 502);
  }

  await supabase.from("orders")
    .update({ payment_reference: (result.data as any)?.reference })
    .eq("order_group_id", groupId);

  await recordPendingPayment({
    reference: (result.data as any)?.reference, externalRef, paymentType: "CART",
    amount: fees.total, phone: phoneCheck.normalized, userId: user.id, orderId: anchorOrder.id,
    govTax: fees.govTax, totalCharged: fees.total,
  });

  console.info(`[cart] order-first checkout: group ${groupId}, ${orders.length} order(s) across ` +
    `${sellers.length} seller(s), ${check.verifiedCount}/${check.items.length} DB-verified, ` +
    `${fees.total} XAF, escrow=${escrowHold}`);

  return ok({
    message: "Cart payment initiated.",
    reference: (result.data as any)?.reference, status: (result.data as any)?.status,
    operator: phoneCheck.operator, externalRef,
    orderId: anchorOrder.id, orderGroupId: groupId,
    orderIds: (orders as any[]).map((o) => o.id),
    breakdown: fees,
  }, 201);
}

async function handleDonate(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { phone, amount, cause, donorName } = body;
  if (!phone || !amount) return fail("phone and amount are required.");

  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return fail(phoneCheck.error);
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return fail(amountCheck.error);

  const user = await getBearerUser(req); // may be null — donations can be anonymous

  try {
    const result = await processTyped("DONATION", {
      phone: phoneCheck.normalized, amount: amountCheck.value,
      description: `Bambeh Donation — ${cause || "General Support"}`,
      metadata: { donor_name: donorName || "Anonymous" },
    });
    const rec = await recordPendingPayment({
      reference: result.reference, externalRef: result.externalRef, paymentType: "DONATION",
      amount: amountCheck.value, phone: phoneCheck.normalized, cause,
      userId: body?.userId ?? user?.id ?? null,
      govTax: 0, totalCharged: amountCheck.value,
    });
    // The donor has been charged by now, so never hide a bookkeeping failure.
    if (!rec.ok) {
      return ok({
        message: "Donation initiated, but it could not be recorded. Keep this reference.",
        reference: result.reference, status: result.status, operator: phoneCheck.operator,
        externalRef: result.externalRef, warning: rec.error,
      }, 201);
    }
    return ok({ message: "Donation initiated.", reference: result.reference, status: result.status, operator: phoneCheck.operator, externalRef: result.externalRef }, 201);
  } catch (e) {
    console.error("[donate] CamPay error:", e);
    return fail("CamPay refused the payment request. Check the phone number and balance.", 502);
  }
}

async function handlePaymentLink(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { amount, description, type, phone, firstName, lastName, email, redirectUrl, failureRedirectUrl } = body;
  if (!amount || !description) return fail("amount and description are required.");

  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return fail(amountCheck.error);

  const paymentType = Object.values(PAYMENT_TYPE).includes((type || "").toUpperCase()) ? (type as string).toUpperCase() : "GENERAL";
  const externalRef = generateExternalRef(paymentType);
  const result = await campayPaymentLink({
    amount: amountCheck.value, description, externalRef,
    from: phone || "", firstName: firstName || "", lastName: lastName || "", email: email || "",
    redirectUrl: redirectUrl || "", failureRedirectUrl: failureRedirectUrl || "",
  });
  if (!result.success) return fail("Could not generate a payment link.", 502);
  return ok({ message: "Payment link generated.", link: result.link, reference: result.reference, externalRef });
}

async function handleStatus(reference: string): Promise<Response> {
  if (!reference) return fail("Transaction reference is required.");
  const result = await checkStatus(reference);
  return ok((result as any).data ?? result);
}

async function handleBalance(): Promise<Response> {
  const result = await campayBalance();
  return ok((result as any).data ?? result);
}

async function handleDisburse(req: Request): Promise<Response> {
  if (!(await isAdmin(req))) return fail("Admin authorization required.", 403);

  const body = await req.json().catch(() => ({}));
  const { to, amount, description, externalRef } = body;
  if (!to || !amount || !description) return fail("to, amount, description are required.");

  const phoneCheck = validatePhone(to);
  if (!phoneCheck.valid) return fail(phoneCheck.error);
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return fail(amountCheck.error);

  const ref = externalRef || generateExternalRef("DISBURSE");
  const result = await campayDisburse({ amount: amountCheck.value, to: phoneCheck.normalized, description, externalRef: ref });
  if (!result.success) return fail("Disbursement failed.", 502);
  return ok({ message: "Disbursement initiated.", reference: result.reference, status: (result.data as any)?.status, externalRef: ref });
}

/** Shared guard for the two buyer-driven escrow actions. */
async function loadOrderForBuyer(req: Request, orderId: unknown): Promise<
  { ok: true; order: any; admin: boolean } | { ok: false; res: Response }
> {
  if (!orderId || !UUID_RE.test(String(orderId))) {
    return { ok: false, res: fail("A valid orderId is required.") };
  }
  const user = await getBearerUser(req);
  const admin = await isAdmin(req);
  if (!user && !admin) return { ok: false, res: fail("Sign in required.", 401) };

  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !order) return { ok: false, res: fail("Order not found.", 404) };

  const buyerId = (order as any).buyer_id ?? (order as any).user_id;
  if (!admin && buyerId !== user!.id) {
    return { ok: false, res: fail("Only the buyer of this order can do that.", 403) };
  }
  if ((order as any).status !== "paid") {
    return { ok: false, res: fail("This order has not been paid yet.", 409) };
  }
  return { ok: true, order, admin };
}

/**
 * POST /release-escrow  { orderId }
 * The BUYER confirms receipt; the seller gets paid.
 */
async function handleReleaseEscrow(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const guard = await loadOrderForBuyer(req, body?.orderId);
  if (!guard.ok) return guard.res;
  const order = guard.order;

  const { data: existingRefund } = await supabase.from("refunds")
    .select("status").eq("order_id", order.id).maybeSingle();
  if (existingRefund) {
    return fail("This order has already been refunded and cannot be released.", 409);
  }

  await supabase.from("orders").update({
    escrow: false, escrow_status: "released", updated_at: new Date().toISOString(),
  }).eq("id", order.id);

  await disburseForOrder({ ...order, escrow: false }, "buyer confirmed receipt");

  const { data: payout } = await supabase.from("seller_payouts")
    .select("status, amount_xaf, failure_reason").eq("order_id", order.id).maybeSingle();

  return ok({
    message: "Receipt confirmed. The seller is being paid.",
    payoutStatus: (payout as any)?.status ?? "unknown",
    amount: (payout as any)?.amount_xaf ?? null,
    note: (payout as any)?.failure_reason ?? null,
  });
}

/**
 * FIX204 — POST /refund-escrow  { orderId, reason? }
 * The BUYER declines the item. The money goes back to the number that paid.
 * Idempotent: refunds.order_id is unique, so a double-tap cannot refund twice.
 * Refuses if the seller has already been paid.
 */
async function handleRefundEscrow(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const guard = await loadOrderForBuyer(req, body?.orderId);
  if (!guard.ok) return guard.res;
  const order = guard.order;

  const { data: payout } = await supabase.from("seller_payouts")
    .select("status").eq("order_id", order.id).maybeSingle();
  if (payout && (payout as any).status === "sent") {
    return fail("The seller has already been paid for this order. Please open a dispute instead.", 409);
  }

  const amount = Math.round(Number(order.total_xaf ?? 0));
  if (amount <= 0) return fail("This order has no refundable amount.", 409);

  const externalRef = generateExternalRef("REFUND");
  const { error: claimErr } = await supabase.from("refunds").insert({
    order_id: order.id,
    buyer_id: order.buyer_id ?? order.user_id ?? null,
    amount_xaf: amount,
    reason: String(body?.reason ?? "Buyer declined the item").slice(0, 500),
    external_ref: externalRef,
    status: "pending",
  });
  if (claimErr) {
    if (claimErr.code === "23505") return fail("A refund for this order is already in progress.", 409);
    console.error("[refund] could not claim refund row:", claimErr.message);
    return fail("Could not start the refund. Please contact support.", 500);
  }

  // Refund to the number that actually paid.
  let toPhone: string | null = null;
  const { data: pay } = await supabase.from("payments")
    .select("phone").eq("order_id", order.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  const payCheck = validatePhone((pay as any)?.phone);
  if (payCheck.valid) toPhone = payCheck.normalized;

  if (!toPhone) {
    const buyerId = order.buyer_id ?? order.user_id;
    if (buyerId) {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", buyerId).maybeSingle();
      toPhone = firstValidPhone(prof, SELLER_PHONE_COLUMNS);
    }
  }

  if (!toPhone) {
    await supabase.from("refunds")
      .update({ status: "no_phone", failure_reason: "no valid number to refund to" })
      .eq("order_id", order.id);
    await supabase.from("orders").update({
      status: "refund_pending",
      failure_reason: "Refund requested but no payout number found",
      updated_at: new Date().toISOString(),
    }).eq("id", order.id);
    console.error("[refund] no number to refund to for order", order.id);
    return ok({
      message: "Refund recorded, but we could not find a number to send it to. " +
        "Our team will contact you within 24 hours.",
      refundStatus: "no_phone",
    });
  }

  const result = await campayDisburse({
    amount, to: toPhone,
    description: `Bambeh refund for order ${order.order_number ?? order.id}`,
    externalRef,
  });

  if (!result.success) {
    await supabase.from("refunds")
      .update({ status: "failed", to_phone: toPhone, failure_reason: JSON.stringify(result.error).slice(0, 500) })
      .eq("order_id", order.id);
    await supabase.from("orders").update({
      status: "refund_pending", updated_at: new Date().toISOString(),
    }).eq("id", order.id);
    console.error("[refund] disbursement REFUSED for order", order.id, result.error);
    return ok({
      message: "Your refund is recorded but the transfer did not go through. " +
        "Our team will complete it manually within 24 hours.",
      refundStatus: "failed",
    });
  }

  await supabase.from("refunds").update({
    status: "sent", to_phone: toPhone,
    campay_reference: result.reference ?? null,
    settled_at: new Date().toISOString(),
  }).eq("order_id", order.id);

  await supabase.from("orders").update({
    status: "refunded", escrow: false, escrow_status: "refunded",
    failure_reason: String(body?.reason ?? "Buyer declined the item").slice(0, 500),
    updated_at: new Date().toISOString(),
  }).eq("id", order.id);

  await releaseStockForItems(order.items);

  console.info(`[refund] SENT ${amount} XAF back to buyer for order ${order.id}`);

  return ok({
    message: "Refund sent. The money is on its way back to your mobile money account.",
    refundStatus: "sent",
    amount,
    reference: result.reference ?? null,
  });
}

async function handleWebhook(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-campay-signature");

  // FIX197 DIAGNOSTIC: learn what CamPay actually sends. Logged BEFORE the
  // rejection so a failing signature still teaches us something. This reveals
  // header names only, never the webhook key.
  let bodyHasSignatureField = false;
  try { bodyHasSignatureField = !!JSON.parse(rawBody)?.signature; } catch { /* ignore */ }
  console.info("[Webhook][DIAG] headers:", JSON.stringify([...req.headers.keys()]),
    "| x-campay-signature present:", !!signature,
    "| signature length:", signature ? signature.trim().length : 0,
    "| body has 'signature' field:", bodyHasSignatureField,
    "| webhook key configured:", !!WEBHOOK_KEY);

  if (!(await verifyWebhookSignature(rawBody, signature))) {
    console.error("[Webhook] Invalid signature. See [Webhook][DIAG] above for what was received.");
    return json({ error: "Invalid webhook signature." }, 401);
  }

  let body: any;
  try { body = JSON.parse(rawBody); } catch { return json({ error: "Invalid JSON." }, 400); }

  const event = parseWebhook(body);
  console.info(`[Webhook] ref:${event.reference} status:${event.status} type:${event.paymentType} ${event.amount} XAF`);

  if (event.reference) {
    const { error: replayErr } = await supabase.from("webhook_events").insert({
      provider: "campay", event_id: `${event.reference}:${event.status}`, reference: event.reference,
    });
    if (replayErr) {
      if (replayErr.code === "23505") {
        console.info("[Webhook] duplicate delivery ignored:", event.reference, event.status);
        return json({ received: true, duplicate: true }, 200);
      }
      console.error("[Webhook] replay-guard insert error (continuing):", replayErr.message);
    }
  }

  try {
    if (event.isSuccessful) {
      switch (event.paymentType) {
        case "SUBSCRIPTION": await activateSubscription(event.externalRef, event); break;
        case "CART": await fulfilOrder(event.externalRef, event); break;
        case "DONATION": await recordDonation(event.externalRef, event); break;
        case "REFUND": case "DISBURSE":
          console.info("[Webhook] outbound transfer confirmed:", event.externalRef);
          break;
        default:
          await supabase.from("payments").update({ status: "SUCCESSFUL", operator: event.operator, settled_at: new Date().toISOString() }).eq("external_ref", event.externalRef);
          console.info("[Webhook] COLLECT payment confirmed:", event.externalRef);
      }
    } else if (event.isFailed) {
      await markPaymentFailed(event.externalRef);
      if (event.paymentType === "CART") await failOrder(event.externalRef, event);
    }
  } catch (err) {
    console.error("[Webhook] Supabase error (non-fatal):", err instanceof Error ? err.message : err);
  }

  return json({ received: true }, 200);
}

const PLANS_CATALOG = [
  { id: "daily", name: "Daily Pass", price: 100, currency: "XAF", duration: "24 hours",
    features: ["Full marketplace access", "Browse all listings", "Contact sellers", "Chat"] },
  { id: "weekly", name: "Weekly Plan", price: 500, currency: "XAF", duration: "7 days (168 hours)",
    features: ["Everything in Daily", "Flash Deals", "Group Buying", "AI Assistant"] },
  { id: "monthly", name: "Monthly Plan", price: 1500, currency: "XAF", duration: "30 days (720 hours)",
    features: ["Everything in Weekly", "Tontine", "FarmFresh", "Community", "Priority Support"] },
];

async function handleSubscriptionLookup(userId: string): Promise<Response> {
  try {
    const { data: rows } = await supabase
      .from("subscriptions").select("*").eq("user_id", userId)
      .order("expires_at", { ascending: false }).limit(3);
    const nowMs = Date.now();
    const row: any = (rows || []).find((r: any) => {
      const alive = r.is_active === true || String(r.status || "").toLowerCase() === "active";
      return alive && r.expires_at && new Date(r.expires_at).getTime() > nowMs;
    }) ?? null;
    return json({
      isActive: !!row,
      planType: row ? (row.plan ?? row.plan_type ?? row.plan_name ?? null) : null,
      expiresAt: row ? row.expires_at : null,
    }, 200);
  } catch {
    return json({ isActive: false, planType: null, expiresAt: null, message: "subscription lookup error" }, 200);
  }
}

function handleHealth(): Response {
  return json({
    status: "ok", service: "bambeh-payments", version: "fix202",
    campayConfigured: !!ACCESS_TOKEN, webhookKeyConfigured: !!WEBHOOK_KEY,
    time: new Date().toISOString(),
  }, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const url = new URL(req.url);
    const segs = url.pathname.split("/").filter(Boolean);
    while (segs.length > 0 && ["payments", "payment", "api", "functions", "v1"].includes(segs[0].toLowerCase())) {
      segs.shift();
    }
    const route = segs[0]?.toLowerCase() ?? "";
    const param = segs[1] ?? "";
    const ip = clientIp(req);

    const isWebhook = route === "webhook";
    if (req.method === "POST" && !isWebhook && rateLimited(`pay:${ip}`, 20, 60_000)) {
      return fail("Too many payment attempts. Please wait a minute.", 429);
    }
    if (isWebhook && rateLimited(`hook:${ip}`, 120, 60_000)) {
      return json({ error: "rate limited" }, 429);
    }

    if (req.method === "POST") {
      switch (route) {
        case "collect": return await handleCollect(req);
        case "subscribe": return await handleSubscribe(req);
        case "initiate": return await handleSubscribe(req);
        case "cart": return await handleCart(req);
        case "donate": return await handleDonate(req);
        case "link": return await handlePaymentLink(req);
        case "disburse": return await handleDisburse(req);
        case "release-escrow": return await handleReleaseEscrow(req);
        case "refund-escrow": return await handleRefundEscrow(req);
        case "webhook": return await handleWebhook(req);
      }
    }

    if (req.method === "GET") {
      switch (route) {
        case "status": return await handleStatus(param);
        case "balance": return await handleBalance();
        case "plans": return json(PLANS_CATALOG, 200);
        case "subscription": return param ? await handleSubscriptionLookup(param) : fail("userId is required.");
        case "health": case "": return handleHealth();
      }
    }

    return json({ success: false, error: `Route not found: ${req.method} ${url.pathname}` }, 404);
  } catch (e) {
    console.error("[payments] unhandled error:", e);
    return json({ success: false, error: "Internal server error." }, 500);
  }
});
// BAMBEH_END_TOKEN__PAYMENTS_FIX202__COMPLETE
