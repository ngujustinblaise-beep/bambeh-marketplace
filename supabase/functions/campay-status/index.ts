import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CAMPAY_BASE = "https://www.campay.net/api";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { reference } = await req.json();
    if (!reference)
      return new Response(JSON.stringify({ error: "Required: reference" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const tokenRes = await fetch(`${CAMPAY_BASE}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: Deno.env.get("CAMPAY_USERNAME"),
        password: Deno.env.get("CAMPAY_PASSWORD"),
      }),
    });
    if (!tokenRes.ok)
      return new Response(JSON.stringify({ error: "CamPay auth failed" }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } });

    const { token } = await tokenRes.json();
    const statusRes = await fetch(
      `${CAMPAY_BASE}/transaction/${encodeURIComponent(reference)}/`,
      { headers: { "Authorization": `Token ${token}` } }
    );
    const data = await statusRes.json();
    return new Response(
      JSON.stringify({ status: data.status, operator: data.operator, amount: data.amount }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
