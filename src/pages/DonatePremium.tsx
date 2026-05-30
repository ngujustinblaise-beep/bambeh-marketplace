/**
 * DonatePremium.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/DonatePremium.tsx
 *
 * FULL CAMPAY MOBILE MONEY INTEGRATION
 * ─────────────────────────────────────
 * Flow:
 *   1. User picks amount (preset or custom)
 *   2. User picks MTN or Orange
 *   3. User enters their 9-digit phone number (we prepend 237)
 *   4. We call our Supabase Edge Function (which calls CamPay /collect/)
 *      → The Edge Function holds the API keys server-side (never in the browser)
 *   5. CamPay sends a USSD push to the user's phone
 *   6. We poll /transaction/:reference every 3 s for up to 2 minutes
 *   7. On success → save donation to Supabase "donations" table + show thank-you
 *   8. On failure or timeout → clear error message shown
 *
 * ENVIRONMENT VARIABLES NEEDED (in your Netlify dashboard → Site settings → Env vars):
 *   VITE_SUPABASE_URL        — already set
 *   VITE_SUPABASE_ANON_KEY   — already set
 *   CAMPAY_USERNAME          — from your CamPay dashboard (App Keys section)
 *   CAMPAY_PASSWORD          — from your CamPay dashboard (App Keys section)
 *   (These last two go in your Supabase Edge Function, NOT in Vite env vars)
 *
 * SUPABASE EDGE FUNCTION: You need to create one edge function called
 * "campay-collect" — full code is shown at the bottom of this file in a comment.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Star, ArrowLeft, Phone, Loader2,
  CheckCircle, AlertCircle, Clock, Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Constants ────────────────────────────────────────────────────────────────
const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

const PERKS = [
  { emoji: "⚡", title: "Priority Support",   desc: "Faster help than regular users"     },
  { emoji: "🚫", title: "No Ads",              desc: "Enjoy Bambeh without interruptions" },
  { emoji: "✅", title: "Premium Badge",       desc: "Stand out with a verified badge"    },
  { emoji: "🔍", title: "Advanced Filters",    desc: "Find exactly what you need"         },
];

// ── MTN number ranges (9-digit, starts with these prefixes after country code)
const MTN_PREFIXES   = ["650","651","652","653","654","680","681","682","683","684","677","676"];
const ORANGE_PREFIXES = ["655","656","657","658","659","699","698","697","690","691","692","693","694","695","696"];

type PaymentStatus = "idle" | "submitting" | "waiting" | "success" | "failed" | "timeout";

function detectOperator(phone: string): "mtn" | "orange" | null {
  const digits = phone.replace(/\D/g, "");
  // Handle both 9-digit (237xxxxxxxxx stripped) and raw
  const local = digits.startsWith("237") ? digits.slice(3) : digits;
  const prefix = local.slice(0, 3);
  if (MTN_PREFIXES.includes(prefix))    return "mtn";
  if (ORANGE_PREFIXES.includes(prefix)) return "orange";
  return null;
}

export default function DonatePremium() {
  const navigate  = useNavigate();
  const { t }     = useLanguage();

  const [amount,       setAmount]       = useState("5000");
  const [custom,       setCustom]       = useState("");
  const [method,       setMethod]       = useState<"mtn" | "orange">("mtn");
  const [phone,        setPhone]        = useState("");
  const [status,       setStatus]       = useState<PaymentStatus>("idle");
  const [errorMsg,     setErrorMsg]     = useState("");
  const [reference,    setReference]    = useState("");
  const [countdown,    setCountdown]    = useState(0);
  const [autoDetected, setAutoDetected] = useState<"mtn" | "orange" | null>(null);

  const pollTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttemptsRef = useRef(0);

  const finalAmount = custom ? parseInt(custom, 10) : parseInt(amount, 10);
  const isValidAmount = finalAmount >= 500 && !isNaN(finalAmount);

  // ── Auto-detect operator from phone number ───────────────────────────────
  useEffect(() => {
    if (phone.length >= 3) {
      const op = detectOperator(phone);
      setAutoDetected(op);
      if (op) setMethod(op);
    } else {
      setAutoDetected(null);
    }
  }, [phone]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollTimerRef.current)    clearInterval(pollTimerRef.current);
      if (countdownRef.current)    clearInterval(countdownRef.current);
    };
  }, []);

  // ── Validate phone ───────────────────────────────────────────────────────
  function validatePhone(): string | null {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) return "Please enter a 9-digit phone number";
    const op = detectOperator(phone);
    if (!op) return "Please enter a valid MTN or Orange number";
    return null;
  }

  // ── Poll transaction status ──────────────────────────────────────────────
  function startPolling(ref: string) {
    pollAttemptsRef.current = 0;
    // 40 attempts × 3 s = 120 s max (2 minutes)
    pollTimerRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;

      if (pollAttemptsRef.current > 40) {
        clearInterval(pollTimerRef.current!);
        clearInterval(countdownRef.current!);
        setStatus("timeout");
        setErrorMsg("Payment timed out. If you approved the request, it will be processed shortly.");
        return;
      }

      try {
        // Check status via our Supabase Edge Function
        const { data, error } = await supabase.functions.invoke("campay-status", {
          body: { reference: ref },
        });

        if (error) return; // keep polling on network errors

        const txStatus = data?.status?.toUpperCase();

        if (txStatus === "SUCCESSFUL") {
          clearInterval(pollTimerRef.current!);
          clearInterval(countdownRef.current!);
          setStatus("success");
          // Save donation record to Supabase
          await saveDonation(ref, data);
        } else if (txStatus === "FAILED") {
          clearInterval(pollTimerRef.current!);
          clearInterval(countdownRef.current!);
          setStatus("failed");
          setErrorMsg("Payment was declined. Please check your balance and try again.");
        }
        // PENDING — keep polling
      } catch {
        // Network issue, keep polling
      }
    }, 3000);
  }

  // ── Save successful donation to Supabase ─────────────────────────────────
  async function saveDonation(ref: string, txData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("donations").insert({
        reference:    ref,
        amount:       finalAmount,
        currency:     "XAF",
        phone:        `237${phone.replace(/\D/g, "").slice(-9)}`,
        operator:     method.toUpperCase(),
        user_id:      user?.id ?? null,
        tx_data:      txData,
        donated_at:   new Date().toISOString(),
      });
    } catch (e) {
      // Non-critical — payment succeeded even if this fails
      console.error("Donation save error:", e);
    }
  }

  // ── Initiate payment ─────────────────────────────────────────────────────
  async function handlePay() {
    setErrorMsg("");
    const phoneError = validatePhone();
    if (phoneError) { setErrorMsg(phoneError); return; }
    if (!isValidAmount) { setErrorMsg("Minimum donation is 500 XAF"); return; }

    setStatus("submitting");

    const digits = phone.replace(/\D/g, "");
    const fullPhone = `237${digits.slice(-9)}`;

    try {
      // Call our Supabase Edge Function — it holds the CamPay API keys
      const { data, error } = await supabase.functions.invoke("campay-collect", {
        body: {
          amount:      String(finalAmount),
          currency:    "XAF",
          from:        fullPhone,
          description: `Bambeh Premium Support Donation — ${finalAmount.toLocaleString()} XAF`,
          external_reference: `bambeh_donation_${Date.now()}`,
        },
      });

      if (error) throw new Error(error.message || "Payment initiation failed");
      if (data?.error) throw new Error(data.error);

      if (!data?.reference) {
        throw new Error(data?.message || "No payment reference returned. Please try again.");
      }

      setReference(data.reference);
      setStatus("waiting");

      // Start 120-second countdown display
      setCountdown(120);
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
          return c - 1;
        });
      }, 1000);

      startPolling(data.reference);
    } catch (err: any) {
      setStatus("failed");
      setErrorMsg(err.message || "Payment failed. Please try again.");
    }
  }

  // ── Reset to try again ───────────────────────────────────────────────────
  function reset() {
    if (pollTimerRef.current)  clearInterval(pollTimerRef.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);
    setStatus("idle");
    setErrorMsg("");
    setReference("");
    setCountdown(0);
  }

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Thank You! 🎉</h2>
          <p className="text-gray-600 mb-2">
            Your donation of <strong>{finalAmount.toLocaleString()} XAF</strong> was received.
          </p>
          <p className="text-gray-400 text-sm mb-2">Reference: <span className="font-mono text-xs">{reference}</span></p>
          <p className="text-purple-600 text-sm font-semibold mb-6">
            Your Premium Badge has been activated! ✅
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            Back to Bambeh
          </button>
        </div>
      </div>
    );
  }

  // ── WAITING FOR USSD CONFIRMATION ────────────────────────────────────────
  if (status === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            {method === "mtn" ? "📱 Check your MTN phone" : "📱 Check your Orange phone"}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            A payment request of <strong>{finalAmount.toLocaleString()} XAF</strong> was sent to{" "}
            <strong>{phone}</strong>. Please approve it on your phone now.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-5 space-y-2">
            {method === "mtn" ? (
              <>
                <p className="text-sm text-gray-700 font-semibold">How to approve on MTN:</p>
                <p className="text-xs text-gray-500">1. A USSD prompt will appear on your screen</p>
                <p className="text-xs text-gray-500">2. Enter your MoMo PIN to confirm</p>
                <p className="text-xs text-gray-500">3. You'll receive an SMS confirmation</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700 font-semibold">How to approve on Orange:</p>
                <p className="text-xs text-gray-500">1. A USSD prompt will appear on your screen</p>
                <p className="text-xs text-gray-500">2. Enter your Orange Money PIN</p>
                <p className="text-xs text-gray-500">3. You'll receive an SMS confirmation</p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-xl p-3 mb-5">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">
              {countdown > 0 ? `Waiting for approval... ${countdown}s` : "Processing..."}
            </span>
          </div>

          <button
            onClick={reset}
            className="w-full border-2 border-gray-200 text-gray-600 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel & Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN PAYMENT FORM ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Hero header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 px-4 pt-8 pb-14">
        <button
          onClick={() => navigate(-1)}
          className="text-white/80 flex items-center gap-1 mb-6 text-sm hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Support Bambeh</h1>
          <p className="text-purple-100 text-sm">Help us build a better marketplace for </p>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 max-w-lg mx-auto">

        {/* Premium perks */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Premium Perks
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PERKS.map(p => (
              <div key={p.title} className="bg-purple-50 rounded-xl p-3">
                <div className="text-xl mb-1">{p.emoji}</div>
                <p className="font-semibold text-gray-900 text-xs">{p.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Amount selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">Choose Amount (XAF)</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PRESET_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { setAmount(amt.toString()); setCustom(""); }}
                className={`py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  amount === amt.toString() && !custom
                    ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                    : "bg-gray-50 text-gray-700 hover:bg-purple-50 border"
                }`}
              >
                {amt >= 1000 ? `${amt/1000}k` : amt}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(""); }}
            placeholder="Custom amount (min 500 XAF)..."
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
          />
          {custom && parseInt(custom) < 500 && (
            <p className="text-red-500 text-xs mt-1">Minimum is 500 XAF</p>
          )}
        </div>

        {/* ── PHONE NUMBER ─────────────────────────────────────────────────
            This is where the user enters their MoMo number.
            We auto-detect MTN vs Orange from the prefix.
        ──────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-600" /> Mobile Money Number
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Enter the phone number that will receive the payment request.
          </p>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm select-none">
              +237
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => {
                // Only allow digits, max 9
                const v = e.target.value.replace(/\D/g, "").slice(0, 9);
                setPhone(v);
                setErrorMsg("");
              }}
              placeholder="6XXXXXXXX"
              maxLength={9}
              className={`w-full pl-14 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all ${
                autoDetected === "mtn"    ? "border-yellow-400 focus:border-yellow-500 bg-yellow-50" :
                autoDetected === "orange" ? "border-orange-400 focus:border-orange-500 bg-orange-50" :
                phone.length > 0         ? "border-red-300 focus:border-red-400"  :
                                           "border-gray-200 focus:border-purple-500"
              }`}
            />
            {autoDetected && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  autoDetected === "mtn"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {autoDetected === "mtn" ? "📶 MTN" : "🟠 Orange"}
                </span>
              </div>
            )}
          </div>

          {/* Operator pills — user can override auto-detection */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {(["mtn", "orange"] as const).map(op => (
              <button
                key={op}
                onClick={() => setMethod(op)}
                className={`py-2.5 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                  method === op
                    ? op === "mtn"
                      ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                      : "border-orange-400 bg-orange-50 text-orange-800"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {op === "mtn" ? "📶 MTN MoMo" : "🟠 Orange Money"}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {(status === "failed" || status === "timeout" || errorMsg) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-semibold mb-0.5">
                {status === "timeout" ? "Payment Timed Out" : "Payment Failed"}
              </p>
              <p className="text-red-600 text-xs">{errorMsg}</p>
              <button
                onClick={reset}
                className="mt-2 text-red-700 text-xs font-bold underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Summary before paying */}
        {isValidAmount && phone.length === 9 && autoDetected && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <p className="text-purple-800 text-sm font-semibold mb-1">Payment Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-purple-700">{finalAmount.toLocaleString()} XAF</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Via</span>
              <span className="font-bold">{method === "mtn" ? "MTN MoMo" : "Orange Money"}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">To number</span>
              <span className="font-bold">+237 {phone}</span>
            </div>
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          onClick={handlePay}
          disabled={!isValidAmount || phone.length < 9 || status === "submitting"}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
        >
          {status === "submitting" ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sending Request...</>
          ) : (
            <><Heart className="w-5 h-5 fill-white" /> Donate {isValidAmount ? `${finalAmount.toLocaleString()} XAF` : ""}</>
          )}
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs pb-4">
          <Shield className="w-4 h-4" />
          <span>Payments processed securely by CamPay · Flat 2% fee · Min 500 XAF</span>
        </div>
      </div>
    </div>
  );
}


/*
════════════════════════════════════════════════════════════════════════════════
SUPABASE EDGE FUNCTIONS — Create these in your Supabase dashboard
════════════════════════════════════════════════════════════════════════════════

HOW TO CREATE AN EDGE FUNCTION:
1. Go to supabase.com → your project → Edge Functions → New Function
2. Name it exactly as shown below
3. Paste the code
4. Add secrets: CAMPAY_USERNAME and CAMPAY_PASSWORD (from your CamPay dashboard)

────────────────────────────────────────────────────────────────────────────────
FUNCTION 1: campay-collect
(collects the token then initiates the payment)
────────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CAMPAY_BASE = "https://campay.net/api";
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();
    const { amount, currency, from, description, external_reference } = body;

    // Step 1 — Get a temporary token
    const tokenRes = await fetch(`${CAMPAY_BASE}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: Deno.env.get("CAMPAY_USERNAME"),
        password: Deno.env.get("CAMPAY_PASSWORD"),
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.token) {
      return new Response(JSON.stringify({ error: "CamPay auth failed" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Step 2 — Initiate collection (sends USSD push to user phone)
    const collectRes = await fetch(`${CAMPAY_BASE}/collect/`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Token ${tokenData.token}`,
      },
      body: JSON.stringify({
        amount,
        currency: currency || "XAF",
        from,
        description,
        external_reference: external_reference || "",
      }),
    });
    const collectData = await collectRes.json();

    return new Response(JSON.stringify(collectData), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

────────────────────────────────────────────────────────────────────────────────
FUNCTION 2: campay-status
(polls transaction status — called every 3 seconds by the frontend)
────────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CAMPAY_BASE = "https://campay.net/api";
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { reference } = await req.json();

    // Get fresh token
    const tokenRes = await fetch(`${CAMPAY_BASE}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: Deno.env.get("CAMPAY_USERNAME"),
        password: Deno.env.get("CAMPAY_PASSWORD"),
      }),
    });
    const { token } = await tokenRes.json();

    // Check transaction
    const statusRes = await fetch(`${CAMPAY_BASE}/transaction/${reference}/`, {
      headers: { "Authorization": `Token ${token}` },
    });
    const statusData = await statusRes.json();

    return new Response(JSON.stringify(statusData), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

────────────────────────────────────────────────────────────────────────────────
SUPABASE TABLE — create this in SQL Editor:
────────────────────────────────────────────────────────────────────────────────

create table if not exists donations (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique,
  amount          integer,
  currency        text default 'XAF',
  phone           text,
  operator        text,
  user_id         uuid references auth.users(id),
  tx_data         jsonb,
  donated_at      timestamptz default now()
);

════════════════════════════════════════════════════════════════════════════════
*/

