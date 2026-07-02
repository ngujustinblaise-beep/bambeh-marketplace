// BAMBEH passkeys-login-verify (REAL assertion verification + counter update)
// Requires env: APP_SUPABASE_URL, APP_SUPABASE_SERVICE_ROLE_KEY, RP_ID, RP_ORIGIN
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyAuthenticationResponse } from "https://esm.sh/@simplewebauthn/server@13";

const RP_ID = Deno.env.get("RP_ID") ?? "bambeh.com";
const RP_ORIGIN = Deno.env.get("RP_ORIGIN") ?? "https://bambeh.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function fromB64url(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });
  try {
    const supabase = createClient(Deno.env.get("APP_SUPABASE_URL")!, Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const { challengeId, assertion } = await req.json();

    const { data: ch, error: chErr } = await supabase
      .from("passkey_challenges").select("*")
      .eq("id", challengeId).eq("purpose", "login").eq("user_id", user.id).single();
    if (chErr || !ch) return json({ error: "Invalid challenge" }, 400);
    if (ch.used_at) return json({ error: "Challenge already used" }, 400);
    if (new Date(ch.expires_at).getTime() < Date.now()) return json({ error: "Challenge expired" }, 400);

    const { data: dbCred } = await supabase
      .from("passkey_credentials").select("*")
      .eq("credential_id", assertion.id).eq("user_id", user.id).eq("is_active", true).single();
    if (!dbCred) return json({ error: "Unknown credential" }, 400);

    const verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge: ch.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
      credential: {
        id: dbCred.credential_id,
        publicKey: fromB64url(dbCred.public_key),
        counter: Number(dbCred.counter) || 0,
      },
    });

    if (!verification.verified) return json({ error: "Assertion failed verification" }, 400);

    await supabase.from("passkey_challenges").update({ used_at: new Date().toISOString() }).eq("id", challengeId);
    await supabase.from("passkey_credentials")
      .update({ counter: verification.authenticationInfo.newCounter, last_used_at: new Date().toISOString() })
      .eq("id", dbCred.id);

    // NOTE: the passkey is now cryptographically verified for this user.
    // Because register/login here happen while the user already holds a valid
    // Supabase session (fingerprint = "confirm it's me"), we simply acknowledge.
    // If you later want passwordless FIRST-factor login (no existing session),
    // that needs a session-minting step - ask me and I'll wire the OTP exchange.
    return json({ ok: true, verified: true, userId: user.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
