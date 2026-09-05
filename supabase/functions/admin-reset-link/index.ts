// BAMBEH_DEPLOY_TOKEN__ADMINRESETLINK_FIX474A_CLEAN
/**
 * supabase/functions/admin-reset-link/index.ts — Bambeh Marketplace
 *
 * FIX474a — GENERATE A PASSWORD RECOVERY LINK, SEND NOTHING.
 * ─────────────────────────────────────────────────────────
 *
 * WHY THIS EXISTS
 *   Most Bambeh accounts are phone registrations carrying a synthetic address
 *   like 237656323629@phone.bambeh.com. That mailbox does not exist, so an
 *   emailed reset goes nowhere. And a link cannot reach a phone without SMS,
 *   which is not funded yet.
 *
 *   So we do not send. Supabase can MINT a recovery link and hand it back
 *   without delivering it anywhere. Staff then pass it to the user through a
 *   channel that already exists and costs nothing: WhatsApp, a phone call, or
 *   Bambeh's own chat.
 *
 * WHY IT IS A SERVER FUNCTION AND NOT A BUTTON IN THE APP
 *   Minting a link needs the SERVICE ROLE key, which can read and write every
 *   row in the database, bypassing RLS entirely. It must never be shipped to a
 *   browser. It lives here, where only Supabase can see it.
 *
 * SECURITY, IN ORDER
 *   1. The caller's own JWT is verified against Supabase — a forged token dies
 *      at step one.
 *   2. That verified user id is looked up in `profiles`, and admin_role must be
 *      moderator, admin or super_admin. The role is read SERVER-SIDE from the
 *      database, never taken from anything the caller sent.
 *   3. Only then is the service-role client used, and only to mint one link
 *      for one user.
 *   The service role is never used to decide WHO may call this. That decision
 *   is made before it is touched.
 *
 * WHERE THE LINK LANDS
 *   /#/security-recovery — the screen FIX378 already built. It accepts ?code=
 *   and #access_token, verifies the one-time token, and lets the user set a new
 *   password. Nothing new was needed on the receiving end.
 *
 * DEPLOY
 *   supabase functions deploy admin-reset-link
 *
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by
 *   the platform. You do not set them and must not commit them.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_ORIGIN = "https://app.bambeh.com";
const REDIRECT_TO = `${APP_ORIGIN}/#/security-recovery`;

/** Roles allowed to mint a recovery link. */
const STAFF_ROLES = ["moderator", "admin", "super_admin"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/**
 * A phone registration carries a synthetic address. Email delivery to one of
 * these is guaranteed to fail, so the UI needs to know in order to grey the
 * Email button out instead of pretending.
 */
function isSyntheticEmail(email: string | null): boolean {
  if (!email) return true;
  return email.toLowerCase().endsWith("@phone.bambeh.com");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!SUPABASE_URL || !SERVICE_KEY) {
    // Loud, not silent. A missing secret must never look like "no admins found".
    console.error("[admin-reset-link] SUPABASE_URL or SERVICE_ROLE_KEY missing from the environment");
    return json({ error: "Server not configured" }, 500);
  }

  // ---- 1. who is calling? ---------------------------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Not signed in" }, 401);

  const asCaller = createClient(SUPABASE_URL, ANON_KEY || SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await asCaller.auth.getUser(token);
  const caller = userData?.user ?? null;
  if (userErr || !caller) return json({ error: "Not signed in" }, 401);

  // ---- 2. are they staff? Read the role from the database, not the request --
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("admin_role, full_name")
    .eq("id", caller.id)
    .maybeSingle();

  if (meErr) {
    console.error("[admin-reset-link] could not read caller profile:", meErr.message);
    return json({ error: "Could not verify your role" }, 500);
  }

  const callerRole = (me?.admin_role ?? "") as string;
  if (!STAFF_ROLES.includes(callerRole)) {
    return json({ error: "Not authorised" }, 403);
  }

  // ---- 3. which account? ----------------------------------------------------
  let body: { user_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request body" }, 400);
  }

  const targetId = (body.user_id ?? "").trim();
  if (!targetId) return json({ error: "user_id is required" }, 400);

  const { data: target, error: targetErr } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, admin_role")
    .eq("id", targetId)
    .maybeSingle();

  if (targetErr || !target) return json({ error: "User not found" }, 404);

  // A moderator must not be able to seize an admin's account by minting a
  // reset link for it. Only a super admin may reset another staff member.
  if (target.admin_role && callerRole !== "super_admin") {
    return json({ error: "Only the Super Admin can reset a staff account" }, 403);
  }

  const email = (target.email ?? "").trim();
  if (!email) return json({ error: "That account has no email address on file" }, 422);

  // ---- 4. mint the link. Nothing is sent. -----------------------------------
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: REDIRECT_TO },
  });

  if (linkErr) {
    console.error("[admin-reset-link] generateLink failed:", linkErr.message);
    return json({ error: `Could not generate a link: ${linkErr.message}` }, 500);
  }

  const link =
    linkData?.properties?.action_link ??
    (linkData as unknown as { action_link?: string })?.action_link ??
    "";

  if (!link) {
    console.error("[admin-reset-link] generateLink returned no action_link");
    return json({ error: "Supabase returned no link" }, 500);
  }

  // ---- 5. leave a record. Who reset whose password matters later. ----------
  // Best effort: a failed audit write must not deny support to a locked-out
  // user, but it is logged loudly so a missing trail is never a silent gap.
  try {
    await admin.from("admin_actions").insert({
      actor_id: caller.id,
      actor_role: callerRole,
      action: "generate_reset_link",
      target_type: "user",
      target_id: targetId,
      details: { email, delivered: false },
    });
  } catch (e) {
    console.error("[admin-reset-link] audit write failed (link still issued):", e);
  }

  // ---- 6. hand it back ------------------------------------------------------
  // `phone` is returned digits-only so the UI can build a wa.me link without
  // guessing at the format.
  const phoneDigits = (target.phone ?? "").replace(/\D/g, "");

  return json({
    link,
    email,
    full_name: target.full_name ?? null,
    phone: phoneDigits || null,
    /** true = the address is synthetic, email delivery cannot work */
    email_is_synthetic: isSyntheticEmail(email),
    /** recovery links are one-time and short-lived; shown to the admin */
    note: "This link works once. Send it to the user now.",
  });
});
// BAMBEH_END_TOKEN__ADMINRESETLINK_FIX474A__COMPLETE
