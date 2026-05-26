/**
 * supabase/functions/rate-limiter/index.ts
 * ============================================================
 * SERVER-SIDE RATE LIMITER — Bambeh Marketplace
 *
 * REPLACES: window.Bambeh_checkRateLimit and
 *           window.Bambeh_recordLoginAttempt in App.tsx
 *
 * DEPLOYMENT:
 *   supabase functions deploy rate-limiter
 *
 * The old localStorage approach could be defeated by any user in
 * 2 seconds. This version:
 *   - Runs on Deno/server — user cannot touch it
 *   - Rate-limits by IP address + key combination
 *   - Auto-cleans expired locks via Supabase CRON
 * ============================================================
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Service role — not exposed to client
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { action, key } = await req.json() as {
      action: "check" | "record_success" | "record_failure";
      key: string;
    };

    // Build rate-limit key = action_key + IP (prevents cross-user collisions)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateKey = `${key}__${ip}`;

    // ── RECORD SUCCESS → clear rate limit ───────────────────────────────────
    if (action === "record_success") {
      await supabase
        .from("rate_limits")
        .delete()
        .eq("key", rateKey);

      return new Response(
        JSON.stringify({ blocked: false }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── CHECK or RECORD FAILURE ──────────────────────────────────────────────
    const now = new Date();

    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count, locked_until, last_attempt")
      .eq("key", rateKey)
      .single();

    // Check if currently locked
    if (existing?.locked_until) {
      const lockExpiry = new Date(existing.locked_until);
      if (now < lockExpiry) {
        const minutesLeft = Math.ceil(
          (lockExpiry.getTime() - now.getTime()) / 60_000
        );
        return new Response(
          JSON.stringify({ blocked: true, minutesLeft }),
          { headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
    }

    // Check if window has expired (30 min inactivity → reset)
    if (existing?.last_attempt) {
      const lastAttempt = new Date(existing.last_attempt);
      const msSinceLastAttempt = now.getTime() - lastAttempt.getTime();
      if (msSinceLastAttempt > 30 * 60_000) {
        // Window expired — clean up and start fresh
        await supabase.from("rate_limits").delete().eq("key", rateKey);
        return new Response(
          JSON.stringify({ blocked: false, requiresCaptcha: false }),
          { headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
    }

    // Just checking, not recording — return current state
    if (action === "check") {
      const count = existing?.count ?? 0;
      return new Response(
        JSON.stringify({
          blocked: false,
          requiresCaptcha: count >= 5,
          attemptsRemaining: Math.max(0, 10 - count),
        }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Record a failure
    const newCount = (existing?.count ?? 0) + 1;
    const lockedUntil =
      newCount >= 10
        ? new Date(now.getTime() + 30 * 60_000).toISOString()
        : null;

    await supabase.from("rate_limits").upsert(
      {
        key: rateKey,
        count: newCount,
        locked_until: lockedUntil,
        last_attempt: now.toISOString(),
      },
      { onConflict: "key" }
    );

    if (lockedUntil) {
      return new Response(
        JSON.stringify({ blocked: true, minutesLeft: 30 }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        blocked: false,
        requiresCaptcha: newCount >= 5,
        attemptsRemaining: Math.max(0, 10 - newCount),
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    // On error: fail OPEN (don't block the user for a server error)
    console.error("Rate limiter error:", err);
    return new Response(
      JSON.stringify({ blocked: false, requiresCaptcha: false }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
