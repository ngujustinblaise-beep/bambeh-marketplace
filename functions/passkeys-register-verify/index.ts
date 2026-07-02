// BAMBEH passkeys-register-verify (REAL attestation verification + credential storage)
// Requires env: APP_SUPABASE_URL, APP_SUPABASE_SERVICE_ROLE_KEY, RP_ID, RP_ORIGIN
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyRegistrationResponse } from "https://esm.sh/@simplewebauthn/server@13";

const RP_ID = Deno.env.get("RP_ID") ?? "bambeh.com";
const RP_ORIGIN = Deno.env.get("RP_ORIGIN") ?? "https://bambeh.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// base64url encode a Uint8Array (for storing the public key)
function b64url(bytes: Uint8Array): string {
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });
  try {
    const supabase = createClient(Deno.env.get("APP_SUPABASE_URL")!, Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY")!);

    // The user must still be signed in to enroll a passkey.
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const { challengeId, credential } = await req.json();

    const { data: ch, error: chErr } = await supabase
      .from("passkey_challenges").select("*")
      .eq("id", challengeId).eq("purpose", "register").eq("user_id", user.id).single();
    if (chErr || !ch) return json({ error: "Invalid challenge" }, 400);
    if (ch.used_at) return json({ error: "Challenge already used" }, 400);
    if (new Date(ch.expires_at).getTime() < Date.now()) return json({ error: "Challenge expired" }, 400);

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: ch.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return json({ error: "Attestation failed verification" }, 400);
    }

    // mark challenge used (single-use)
    await supabase.from("passkey_challenges").update({ used_at: new Date().toISOString() }).eq("id", challengeId);

    const info = verification.registrationInfo;
    const cred = info.credential; // { id: base64url string, publicKey: Uint8Array, counter: number }

    const { error: insErr } = await supabase.from("passkey_credentials").insert({
      user_id: user.id,
      credential_id: cred.id,
      public_key: b64url(cred.publicKey),
      counter: cred.counter ?? 0,
      transports: cred.transports ?? null,
      device_type: info.credentialDeviceType ?? null,
      backed_up: info.credentialBackedUp ?? false,
      is_active: true,
    });
    if (insErr) {
      // unique violation => this passkey is already enrolled
      if (String(insErr.message).includes("duplicate")) return json({ ok: true, alreadyRegistered: true });
      return json({ error: insErr.message }, 500);
    }

    return json({ ok: true, verified: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
