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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const challenge = crypto.randomUUID().replace(/-/g, "");
    const challengeId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("passkey_challenges").insert({
      id: challengeId,
      user_id: userData.user.id,
      purpose: "register",
      challenge,
      challenge_hash: challenge,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        challengeId,
        challenge,
        rpId: "your-domain.com",
        userId: btoa(userData.user.id),
        username: userData.user.email ?? "user",
        displayName: userData.user.user_metadata?.full_name ?? "User",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
