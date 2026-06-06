/**
 * supabase/functions/campay-status/index.ts
 *
 * SUPABASE EDGE FUNCTION — campay-status
 * ═══════════════════════════════════════════════════════════════
 * Checks the status of a CamPay transaction by reference.
 * Called by the frontend every 3 seconds while waiting for USSD approval.
 *
 * REQUIRED SECRETS:
 *   CAMPAY_USERNAME
 *   CAMPAY_PASSWORD
 *
 * REQUEST BODY:
 *   { reference: string }
 *
 * RESPONSE:
 *   { status: "SUCCESSFUL" | "FAILED" | "PENDING", ... }
 *
 * DEPLOY:
 *   supabase functions deploy campay-status --no-verify-jwt
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return json({ error: "reference is required" }, 400);
    }

    // ── Get fresh token ──────────────────────────────────────────────────
    const username = Deno.env.get("CAMPAY_USERNAME");
    const password = Deno.env.get("CAMPAY_PASSWORD");

    if (!username || !password) {
      return json({ error: "Payment service not configured" }, 500);
    }

    const tokenRes = await fetch(`${CAMPAY_BASE}/token/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, password }),
    });

    const { token } = await tokenRes.json();

    if (!token) {
      return json({ error: "Auth failed" }, 502);
    }

    // ── Check transaction ────────────────────────────────────────────────
    const statusRes = await fetch(`${CAMPAY_BASE}/transaction/${reference}/`, {
      headers: { "Authorization": `Token ${token}` },
    });

    if (!statusRes.ok) {
      // Treat non-200 as PENDING — keep polling
      return json({ status: "PENDING", reference });
    }

    const statusData = await statusRes.json();

    console.log("CamPay status check:", {
      reference,
      status: statusData.status,
    });

    return json(statusData);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("campay-status error:", msg);
    // Return PENDING on error so frontend keeps polling
    return json({ status: "PENDING", error: msg });
  }
});
