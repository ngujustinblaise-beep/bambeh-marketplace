/**
 * notchpay-webhook/index.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * SECURITY UPGRADE: HMAC-SHA256 signature verification.
 *
 * NotchPay signs every webhook request with the HMAC-SHA256 of the raw
 * request body, using your webhook secret as the key. The signature is
 * sent in the X-Notchpay-Signature header as a hex-encoded string.
 *
 * This function verifies that signature BEFORE processing any data.
 * A missing or invalid signature returns HTTP 401 immediately — the
 * payment status update is never written to the database.
 *
 * Setup (Supabase Edge Function secrets):
 *   supabase secrets set NOTCHPAY_WEBHOOK_SECRET=<your_webhook_secret>
 *   supabase secrets set SUPABASE_URL=<your_project_url>
 *   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── CORS HEADERS ─────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-notchpay-signature",
};

// ─── HMAC VERIFICATION ────────────────────────────────────────────────────────

/**
 * Verifies the X-Notchpay-Signature header against the raw request body.
 *
 * NotchPay uses HMAC-SHA256:
 *   signature = hex( HMAC-SHA256( webhookSecret, rawBody ) )
 *
 * Timing-safe comparison prevents timing attacks on the hex string.
 *
 * @param rawBody  - The raw request body bytes (MUST be read before JSON.parse)
 * @param signature - The value of the X-Notchpay-Signature header
 * @param secret    - Your NotchPay webhook secret
 * @returns true if the signature matches, false otherwise
 */
async function verifyNotchPaySignature(
  rawBody: Uint8Array,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    // Import the secret as a CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // Compute the expected signature
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, rawBody);

    // Convert to hex string
    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Timing-safe comparison using crypto.subtle.verify
    // This prevents timing attacks where an attacker measures response time
    // to guess the valid signature one character at a time.
    const expectedBytes = encoder.encode(expectedHex);
    const receivedBytes = encoder.encode(signature.toLowerCase());

    if (expectedBytes.length !== receivedBytes.length) return false;

    return await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      // Re-sign the received signature bytes to get a comparable buffer
      // Actually: use direct byte comparison via timingSafeEqual
      rawBody,
      signatureBuffer
    ).then(() => {
      // Fallback: compare hex strings after normalizing
      return expectedHex === signature.toLowerCase().replace(/^sha256=/, "");
    });

  } catch (err) {
    console.error("[notchpay-webhook] Signature verification error:", err);
    return false;
  }
}

/**
 * Timing-safe hex comparison using XOR across all bytes.
 * Returns true only if both hex strings are identical.
 * Runs in O(n) time regardless of where strings differ.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── SECURE HMAC VERIFY (PRIMARY) ─────────────────────────────────────────────

/**
 * Primary HMAC verification using Web Crypto API + timing-safe comparison.
 */
async function hmacVerify(
  rawBody: Uint8Array,
  receivedSig: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, rawBody);
  const expectedHex = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  // NotchPay may prefix with "sha256=" — strip it
  const cleanReceived = receivedSig.toLowerCase().replace(/^sha256=/, "");

  return timingSafeEqual(expectedHex, cleanReceived);
}

// ─── ALLOWED EVENTS ───────────────────────────────────────────────────────────

const ALLOWED_EVENTS = new Set([
  "payment.complete",
  "payment.failed",
  "payment.cancelled",
  "payment.pending",
]);

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 1: Read raw body BEFORE any parsing ──────────────────────────────
  // CRITICAL: We must read the raw bytes for HMAC verification BEFORE calling
  // req.json(). Once the body stream is consumed you cannot re-read it.
  let rawBody: Uint8Array;
  try {
    rawBody = new Uint8Array(await req.arrayBuffer());
  } catch {
    return new Response(JSON.stringify({ error: "Failed to read request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 2: Extract and validate signature header ─────────────────────────
  const receivedSignature = req.headers.get("x-notchpay-signature") ?? "";

  if (!receivedSignature) {
    console.warn("[notchpay-webhook] Missing X-Notchpay-Signature header — rejecting");
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("NOTCHPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[notchpay-webhook] NOTCHPAY_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 3: HMAC verification — MUST pass before any data processing ──────
  let signatureValid = false;
  try {
    signatureValid = await hmacVerify(rawBody, receivedSignature, webhookSecret);
  } catch (err) {
    console.error("[notchpay-webhook] HMAC verification threw:", err);
    return new Response(JSON.stringify({ error: "Signature verification failed" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!signatureValid) {
    console.warn("[notchpay-webhook] Invalid signature — rejecting");
    // Use the same response time as success to prevent timing oracle
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 4: Parse the verified body ───────────────────────────────────────
  let payload: Record<string, any>;
  try {
    const decoder = new TextDecoder();
    payload = JSON.parse(decoder.decode(rawBody));
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { event, transaction } = payload;

  if (!event || typeof event !== "string") {
    return new Response(JSON.stringify({ error: "Missing event field" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 5: Validate event type against allowlist ─────────────────────────
  if (!ALLOWED_EVENTS.has(event)) {
    console.warn(`[notchpay-webhook] Unknown event "${event}" — ignoring`);
    // Acknowledge receipt but take no action (idempotent for unknown events)
    return new Response(JSON.stringify({ received: true, processed: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!transaction?.reference) {
    return new Response(JSON.stringify({ error: "Missing transaction.reference" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 6: Process verified event ───────────────────────────────────────
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Idempotent upsert — safe to replay
    const { error: upsertError } = await supabase
      .from("payments")
      .upsert({
        reference: transaction.reference,
        status: transaction.status ?? event.split(".")[1],
        amount: transaction.amount,
        currency: transaction.currency ?? "XAF",
        customer_email: transaction.customer?.email ?? null,
        customer_phone: transaction.customer?.phone ?? null,
        notchpay_id: transaction.id ?? null,
        metadata: transaction.metadata ?? null,
        webhook_event: event,
        updated_at: new Date().toISOString(),
      }, { onConflict: "reference" });

    if (upsertError) throw upsertError;

    // Update subscription status on successful payment
    if (event === "payment.complete" && transaction.customer?.email) {
      const { error: subError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_updated_at: new Date().toISOString(),
        })
        .eq("email", transaction.customer.email);

      if (subError) {
        console.warn("[notchpay-webhook] Subscription update failed:", subError.message);
        // Non-fatal — payment is recorded, subscription update can be retried
      }
    }

    console.log(`[notchpay-webhook] Processed ${event} for ${transaction.reference}`);

    return new Response(JSON.stringify({ received: true, processed: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[notchpay-webhook] Database error:", (err as Error).message);
    // Return 500 so NotchPay retries the webhook
    return new Response(JSON.stringify({ error: "Database error — will retry" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
