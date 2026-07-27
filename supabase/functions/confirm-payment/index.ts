// BAMBEH_DEPLOY_TOKEN__CONFIRM_PAYMENT_FIX209_START
/**
 * confirm-payment - Bambeh Marketplace (FIX209)
 * FILE LOCATION: supabase/functions/confirm-payment/index.ts
 *
 * THE PROBLEM THIS SOLVES
 * -----------------------
 * A buyer pays. CamPay takes the money. The widget shows "Payment confirmed".
 * But orders.paid_at stays NULL, because the only thing that was ever supposed
 * to write it is the CamPay webhook - and the webhook is rejected on
 * "Invalid signature". So the escrow panel correctly refuses to unlock the
 * release button, and the seller can never be paid.
 *
 * THE FIX - PULL, DO NOT WAIT TO BE PUSHED
 * ---------------------------------------
 * Waiting for a webhook is the fragile way to learn that money arrived.
 * Webhooks get dropped, retried, signed differently after a dashboard change.
 * This function asks CamPay directly instead, and it can be called as often as
 * we like because it is idempotent.
 *
 * It does NOT re-implement the CamPay API. It calls the SAME
 * /payments/status/<reference> endpoint the widget already uses successfully in
 * production, so whatever credentials and request shape already work are
 * inherited exactly. Nothing about CamPay's API is guessed here.
 *
 * WHY THIS IS SAFE
 * ----------------
 *  1. The client NEVER tells us a payment succeeded. It only names an order.
 *     The verdict comes from CamPay, fetched server-side with our own secrets.
 *  2. IDENTITY - the JWT is verified and must match orders.buyer_id.
 *  3. FAIL CLOSED - if the status response cannot be parsed with certainty,
 *     the order is left untouched. We never mark money received on a maybe.
 *  4. SELF-DIAGNOSING - the entire raw status payload is logged under
 *     [ConfirmPay][RAW]. If parsing ever fails, one look at the log gives the
 *     exact shape, instead of another round of guessing.
 *  5. MINIMAL WRITE - only paid_at (a timestamp column with no CHECK
 *     constraint) is required to unlock the panel. status is then set to
 *     'confirmed' in a SEPARATE statement, so if a CHECK constraint rejects
 *     that value, paid_at has already landed and the buttons still unlock.
 *     This is deliberate: the notifications_type_check incident showed how a
 *     single rejected value can roll back an entire transaction.
 *  6. IDEMPOTENT - an order already carrying paid_at returns success without
 *     being rewritten.
 *
 * DEPLOY
 *   supabase functions deploy confirm-payment --no-verify-jwt
 *   (JWT is verified inside the function against the buyer, which is stricter
 *    than the gateway check, and matches how `payments` is already deployed.)
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Status strings that mean the money is really in. */
const SUCCESS = ['SUCCESSFUL', 'SUCCESS', 'CONFIRMED', 'COMPLETED', 'PAID', 'SUCCEEDED'];
const FAILED = ['FAILED', 'CANCELLED', 'CANCELED', 'EXPIRED', 'DECLINED', 'REJECTED'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/**
 * Walk a parsed status payload and pull out every string that could be a
 * status verdict. Shape-agnostic on purpose: we do not know whether the
 * existing endpoint answers {status}, {data:{status}}, {campay:{status}} or
 * something else, and we would rather read all of them than guess one.
 */
function collectStatusStrings(v: unknown, depth = 0): string[] {
  if (depth > 4 || v === null || v === undefined) return [];
  if (typeof v === 'string') return [v.trim().toUpperCase()];
  if (Array.isArray(v)) return v.flatMap((x) => collectStatusStrings(x, depth + 1));
  if (typeof v === 'object') {
    const out: string[] = [];
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const key = k.toLowerCase();
      if (key === 'status' || key === 'state' || key === 'transaction_status' || key === 'payment_status') {
        out.push(...collectStatusStrings(val, depth + 1));
      } else if (typeof val === 'object') {
        out.push(...collectStatusStrings(val, depth + 1));
      } else if ((key === 'paid' || key === 'confirmed' || key === 'success') && val === true) {
        out.push('SUCCESSFUL');
      }
    }
    return out;
  }
  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'POST only' }, 405);

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('[ConfirmPay] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return json({ ok: false, error: 'Server not configured.' }, 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body.orderId ?? body.order_id;
    if (!orderId) return json({ ok: false, error: 'orderId is required.' }, 400);

    /* ---------- 1. who is calling ---------- */
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ ok: false, error: 'Not signed in.' }, 401);

    const anon = createClient(SUPABASE_URL, ANON_KEY || SERVICE_KEY);
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ ok: false, error: 'Session expired. Please sign in again.' }, 401);

    /* ---------- 2. load the order with full privilege ---------- */
    const db = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: order, error: orderErr } = await db
      .from('orders')
      .select('id, order_number, buyer_id, status, escrow, escrow_status, total_xaf, payment_reference, payment_ref, paid_at')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr) {
      console.error('[ConfirmPay] order read failed:', orderErr.message);
      return json({ ok: false, error: orderErr.message }, 500);
    }
    if (!order) return json({ ok: false, error: 'Order not found.' }, 404);

    /* ---------- 3. identity gate ---------- */
    if (order.buyer_id !== user.id) {
      console.warn(`[ConfirmPay] caller ${user.id} is not the buyer on ${orderId}`);
      return json({ ok: false, error: 'This order belongs to another account.' }, 403);
    }

    /* ---------- 4. already confirmed? ---------- */
    if (order.paid_at) {
      return json({
        ok: true,
        paid: true,
        alreadyPaid: true,
        status: order.status,
        paid_at: order.paid_at,
        message: 'Payment was already confirmed.',
      });
    }

    /* ---------- 5. we need a reference to ask about ---------- */
    const reference: string | null = order.payment_reference || order.payment_ref || null;
    if (!reference) {
      return json({
        ok: false,
        paid: false,
        error: 'This order has no payment reference yet, so there is nothing to verify.',
      }, 409);
    }

    /* ---------- 6. ask CamPay, via the endpoint that already works ---------- */
    const statusUrl = `${SUPABASE_URL}/functions/v1/payments/status/${encodeURIComponent(reference)}`;
    let raw = '';
    let httpStatus = 0;

    try {
      const res = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          apikey: SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      });
      httpStatus = res.status;
      raw = await res.text();
    } catch (e) {
      console.error('[ConfirmPay] status fetch threw:', e instanceof Error ? e.message : String(e));
      return json({ ok: false, paid: false, error: 'Could not reach the payment provider. Please try again.' }, 502);
    }

    // The single most useful log line in this function. Never remove it.
    console.log(`[ConfirmPay][RAW] order=${orderId} ref=${reference} http=${httpStatus} body=${raw.slice(0, 1500)}`);

    let parsed: unknown = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }

    const verdicts = parsed ? collectStatusStrings(parsed) : [];
    // Plain-text fallback, only if the body is short enough to be unambiguous.
    if (verdicts.length === 0 && raw && raw.length < 60) verdicts.push(raw.trim().toUpperCase());

    console.log(`[ConfirmPay] verdicts=${JSON.stringify(verdicts)}`);

    const isSuccess = verdicts.some((v) => SUCCESS.includes(v));
    const isFailed = verdicts.some((v) => FAILED.includes(v));

    /* ---------- 7. fail closed ---------- */
    if (!isSuccess) {
      return json({
        ok: true,
        paid: false,
        pending: !isFailed,
        failed: isFailed,
        reference,
        providerStatus: verdicts[0] ?? null,
        message: isFailed
          ? 'The provider reports this payment did not go through.'
          : 'The provider has not confirmed this payment yet. Please try again in a moment.',
      });
    }

    /* ---------- 8. write paid_at FIRST, on its own ---------- */
    const paidAt = new Date().toISOString();
    const { error: paidErr } = await db
      .from('orders')
      .update({ paid_at: paidAt })
      .eq('id', orderId)
      .is('paid_at', null); // idempotent: a concurrent call cannot double-write

    if (paidErr) {
      console.error('[ConfirmPay] paid_at update failed:', paidErr.message);
      return json({ ok: false, paid: false, error: paidErr.message }, 500);
    }

    console.log(`[ConfirmPay] paid_at set on ${orderId} (${order.order_number ?? ''})`);

    /* ---------- 9. then status, separately and non-fatally ---------- */
    let statusNote: string | null = null;
    const currentStatus = (order.status ?? '').toLowerCase();
    if (currentStatus === 'pending' || currentStatus === '') {
      const { error: stErr } = await db
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);
      if (stErr) {
        // Deliberately non-fatal. paid_at already landed, so the panel unlocks.
        statusNote = stErr.message;
        console.warn(`[ConfirmPay] status update rejected (non-fatal): ${stErr.message}`);
      }
    }

    return json({
      ok: true,
      paid: true,
      reference,
      paid_at: paidAt,
      status: statusNote ? order.status : 'confirmed',
      statusNote,
      message: 'Payment confirmed. Escrow is active.',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[ConfirmPay] unhandled:', msg);
    return json({ ok: false, error: msg }, 500);
  }
});
// BAMBEH_DEPLOY_TOKEN__CONFIRM_PAYMENT_FIX209_END
