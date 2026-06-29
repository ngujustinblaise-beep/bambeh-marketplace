import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const supabase = createClient(
      Deno.env.get("APP_SUPABASE_URL")!,
      Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { challengeId, credential } = await req.json();

    const { data: challengeRow, error: challengeError } = await supabase
      .from("passkey_challenges")
      .select("*")
      .eq("id", challengeId)
      .eq("purpose", "register")
      .single();

    if (challengeError || !challengeRow) {
      return new Response(JSON.stringify({ error: "Invalid challenge" }), { status: 400 });
    }

    if (challengeRow.used_at) {
      return new Response(JSON.stringify({ error: "Challenge already used" }), { status: 400 });
    }

    if (new Date(challengeRow.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Challenge expired" }), { status: 400 });
    }

    const { error: updateChallengeError } = await supabase
      .from("passkey_challenges")
      .update({ used_at: new Date().toISOString() })
      .eq("id", challengeId);

    if (updateChallengeError) {
      return new Response(JSON.stringify({ error: updateChallengeError.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Registration verified placeholder",
        credentialReceived: !!credential,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
