import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CAMPAY_BASE = "https://www.campay.net/api";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { amount, from, description, external_reference } = await req.json();
    if (!amount || !from || !external_reference)
      return new Response(JSON.stringify({ error: "Required: amount, from, external_reference" }),
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
    const collectRes = await fetch(`${CAMPAY_BASE}/collect/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Token ${token}` },
      body: JSON.stringify({
        amount: String(amount), currency: "XAF", from,
        description: description || "Bambeh donation",
        external_reference,
      }),
    });
    const data = await collectRes.json();
    if (!collectRes.ok)
      return new Response(JSON.stringify({ error: data.message || "Collection failed" }),
        { status: collectRes.status, headers: { ...cors, "Content-Type": "application/json" } });

    return new Response(
      JSON.stringify({ success: true, reference: data.reference, ussd_code: data.ussd_code }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
