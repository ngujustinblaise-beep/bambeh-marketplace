/**
 * supabase/functions/verify-otp/index.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * Verifies a Twilio Verify OTP code against the phone number.
 *
 * Called by Register.tsx Step 2 via:
 *   supabase.functions.invoke("verify-otp", { body: { phone, code } })
 *
 * Returns:
 *   { valid: true }              — code is correct → proceed with registration
 *   { valid: false, error: "…" } — wrong code / expired
 *
 * Secrets required (already set):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_VERIFY_SERVICE_SID
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ valid: false, error: "Phone and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return new Response(
        JSON.stringify({ valid: false, error: "Code must be a 6-digit number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Twilio credentials ─────────────────────────────────────────────────
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken  = Deno.env.get("TWILIO_AUTH_TOKEN");
    const serviceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!accountSid || !authToken || !serviceSid) {
      console.error("[verify-otp] Missing Twilio environment variables");
      return new Response(
        JSON.stringify({ valid: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Call Twilio Verify Check API ───────────────────────────────────────
    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone.trim(),
          Code: code.trim(),
        }),
      }
    );

    const data = await twilioRes.json();

    // Twilio returns 404 if code is expired or already used
    if (!twilioRes.ok) {
      console.warn(`[verify-otp] Twilio check failed for ${phone}:`, data.message);
      return new Response(
        JSON.stringify({
          valid: false,
          error: data.message ?? "Code verification failed",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Twilio returns status "approved" for a valid code
    if (data.status !== "approved") {
      console.warn(`[verify-otp] Code not approved for ${phone} — status: ${data.status}`);
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Invalid or expired code. Please request a new one.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[verify-otp] Code approved for ${phone}`);

    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[verify-otp] Unexpected error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: (err as Error).message ?? "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
