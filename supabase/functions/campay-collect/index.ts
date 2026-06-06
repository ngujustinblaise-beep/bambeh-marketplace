/**
 * supabase/functions/campay-collect/index.ts
 *
 * SUPABASE EDGE FUNCTION — campay-collect
 * ═══════════════════════════════════════════════════════════════
 * Initiates a CamPay mobile money collection (USSD push).
 * Called by ALL payment flows: subscriptions, zerm coins, cart, donations.
 *
 * REQUIRED SECRETS (set in Supabase Dashboard → Edge Functions → Secrets):
 *   CAMPAY_USERNAME   — your CamPay app username
 *   CAMPAY_PASSWORD   — your CamPay app password
 *   CAMPAY_APP_NAME   — your CamPay application name (from dashboard)
 *
 * REQUEST BODY:
 *   {
 *     amount: string,             // e.g. "500" — XAF, no decimals
 *     currency: "XAF",
 *     from: string,               // phone with country code: "237670757326"
 *     description: string,        // shown on USSD prompt
 *     external_reference: string, // your order/subscription ID
 *     metadata?: object           // optional: stored for reconciliation
 *   }
 *
 * RESPONSE:
 *   { reference: string, ... }   — CamPay transaction reference
 *   { error: string }            — on failure
 *
 * DEPLOY:
 *   supabase functions deploy campay-collect --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CAMPAY_BASE = "https://campay.net/api";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { amount, currency, from, description, external_reference } = body;

    // ── Validate required fields ─────────────────────────────────────────
    if (!amount || !from || !description) {
      return json({ error: "Missing required fields: amount, from, description" }, 400);
    }

    const amountNum = parseInt(String(amount), 10);
    if (isNaN(amountNum) || amountNum < 100) {
      return json({ error: "Minimum payment amount is 100 XAF" }, 400);
    }

    // ── Validate phone format ────────────────────────────────────────────
    const phoneDigits = String(from).replace(/\D/g, "");
    if (phoneDigits.length !== 12 || !phoneDigits.startsWith("237")) {
      return json({ error: `Invalid phone number: ${from}. Must be 237XXXXXXXXX format (12 digits).` }, 400);
    }

    // ── Step 1: Get CamPay auth token ────────────────────────────────────
    const username = Deno.env.get("CAMPAY_USERNAME");
    const password = Deno.env.get("CAMPAY_PASSWORD");

    if (!username || !password) {
      console.error("CAMPAY_USERNAME or CAMPAY_PASSWORD not set in Edge Function secrets");
      return json({ error: "Payment service not configured. Please contact support@bambeh.com" }, 500);
    }

    const tokenRes = await fetch(`${CAMPAY_BASE}/token/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, password }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("CamPay token error:", tokenRes.status, err);
      return json({ error: "Payment service authentication failed. Please try again." }, 502);
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.token) {
      console.error("CamPay token response missing token:", JSON.stringify(tokenData));
      return json({ error: "Payment service returned invalid credentials. Please contact support." }, 502);
    }

    // ── Step 2: Initiate collection ──────────────────────────────────────
    const collectPayload = {
      amount:             String(amountNum),
      currency:           currency ?? "XAF",
      from:               phoneDigits,
      description:        description.slice(0, 150),   // CamPay max 150 chars
      external_reference: external_reference ?? "",
    };

    console.log("Initiating CamPay collect:", {
      amount:   collectPayload.amount,
      from:     collectPayload.from.slice(0, 6) + "XXXXXX",  // mask for logs
      ref:      collectPayload.external_reference,
    });

    const collectRes = await fetch(`${CAMPAY_BASE}/collect/`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Token ${tokenData.token}`,
      },
      body: JSON.stringify(collectPayload),
    });

    const collectData = await collectRes.json();

    console.log("CamPay collect response:", {
      status:    collectRes.status,
      reference: collectData.reference,
      error:     collectData.message ?? collectData.error ?? null,
    });

    if (!collectRes.ok || collectData.error) {
      const msg = collectData.message ?? collectData.error ?? "Payment initiation failed";
      return json({ error: msg }, collectRes.status >= 400 ? collectRes.status : 400);
    }

    if (!collectData.reference) {
      return json({ error: "No payment reference returned. Please try again." }, 502);
    }

    // ── Success: return reference to frontend for polling ────────────────
    return json({
      reference:          collectData.reference,
      operator:           collectData.operator ?? null,
      ussd_code:          collectData.ussd_code ?? null,
      external_reference: external_reference ?? null,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("campay-collect error:", msg);
    return json({ error: `Internal error: ${msg}` }, 500);
  }
});
