// BAMBEH passkeys-register-start (REAL WebAuthn, replaces the placeholder)
// Requires env: APP_SUPABASE_URL, APP_SUPABASE_SERVICE_ROLE_KEY, RP_ID, RP_ORIGIN
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateRegistrationOptions } from "https://esm.sh/@simplewebauthn/server@13";

const RP_ID = Deno.env.get("RP_ID") ?? "bambeh.com";
const RP_NAME = "Bambeh";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });
  try {
    const supabase = createClient(Deno.env.get("APP_SUPABASE_URL")!, Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY")!);

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const { data: existing } = await supabase
      .from("passkey_credentials").select("credential_id, transports")
      .eq("user_id", user.id).eq("is_active", true);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email ?? user.id,
      userDisplayName: (user.user_metadata?.full_name as string) ?? "Bambeh User",
      attestationType: "none",
      excludeCredentials: (existing ?? []).map((c) => ({ id: c.credential_id })),
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    });

    const challengeId = crypto.randomUUID();
    const { error: insErr } = await supabase.from("passkey_challenges").insert({
      id: challengeId, user_id: user.id, purpose: "register",
      challenge: options.challenge, challenge_hash: options.challenge,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ challengeId, options });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
