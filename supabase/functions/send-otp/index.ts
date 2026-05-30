/**
 * supabase/functions/send-otp/index.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * Sends a Twilio Verify SMS OTP to a  phone number.
 *
 * Called by Register.tsx Step 1 via:
 *   supabase.functions.invoke("send-otp", { body: { phone, channel: "sms" } })
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
    const { phone, channel = "sms" } = await req.json();

    // ── Validate phone ─────────────────────────────────────────────────────
    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Accept +237XXXXXXXXX format only
    const normalized = phone.trim();
    if (!/^\+237[6-9]\d{8}$/.test(normalized)) {
      return new Response(
        JSON.stringify({ error: "Invalid  phone number. Format: +2376XXXXXXXX" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Twilio credentials ─────────────────────────────────────────────────
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken  = Deno.env.get("TWILIO_AUTH_TOKEN");
    const serviceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!accountSid || !authToken || !serviceSid) {
      console.error("[send-otp] Missing Twilio environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Call Twilio Verify API ─────────────────────────────────────────────
    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: normalized,
          Channel: channel, // "sms" or "whatsapp"
        }),
      }
    );

    const data = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("[send-otp] Twilio error:", data);
      return new Response(
        JSON.stringify({
          error: data.message ?? "Failed to send verification code",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-otp] OTP sent to ${normalized} via ${channel} — status: ${data.status}`);

    return new Response(
      JSON.stringify({ sent: true, status: data.status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[send-otp] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

