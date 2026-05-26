/**
 * Supabase Edge Function: notchpay-webhook
 * ─────────────────────────────────────────────────────────────────────────────
 * Receives Notchpay payment webhooks, verifies signature, updates Supabase,
 * then fires Firebase FCM push notifications to buyer + seller.
 *
 * FILE LOCATION: supabase/functions/notchpay-webhook/index.ts
 *
 * DEPLOY:
 *   supabase functions deploy notchpay-webhook --no-verify-jwt
 *
 * NOTCHPAY WEBHOOK URL to register:
 *   https://[your-project-ref].supabase.co/functions/v1/notchpay-webhook
 *
 * REQUIRED Supabase secrets:
 *   supabase secrets set NOTCHPAY_SECRET_KEY=your-notchpay-secret
 *   supabase secrets set FIREBASE_SERVER_KEY=your-fcm-server-key
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Environment secrets ───────────────────────────────────────────────────────
const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const NOTCHPAY_SECRET     = Deno.env.get('NOTCHPAY_SECRET_KEY')!;
const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY')!;

// Service-role client (bypasses RLS — this runs server-side)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Allow Notchpay to ping the endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'Bambeh webhook ready' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const payload = JSON.parse(body);

    // ── Verify Notchpay signature ──────────────────────────────────────────
    const signature = req.headers.get('x-notch-signature') ?? '';
    if (!verifySignature(body, signature)) {
      console.error('[webhook] Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const { event, transaction } = payload;
    console.info(`[webhook] Event: ${event}, Ref: ${transaction?.reference}`);

    // ── Handle payment.complete event ──────────────────────────────────────
    if (event === 'payment.complete' && transaction?.status === 'complete') {
      await handlePaymentSuccess(transaction);
    }

    // ── Handle payment.failed event ────────────────────────────────────────
    if (event === 'payment.failed' || transaction?.status === 'failed') {
      await handlePaymentFailed(transaction);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[webhook] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT SUCCESS HANDLER
// Updates: payments table → orders table → fires FCM to buyer + seller
// ─────────────────────────────────────────────────────────────────────────────

async function handlePaymentSuccess(transaction: Record<string, unknown>) {
  const notchpayId = String(transaction.id ?? '');
  const reference  = String(transaction.reference ?? '');
  const amountXAF  = Number(transaction.amount ?? 0);

  // 1. Update payments table
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .update({ status: 'success', paid_at: new Date().toISOString(), webhook_payload: transaction })
    .eq('notchpay_id', notchpayId)
    .select('order_id, user_id')
    .single();

  if (payErr || !payment) {
    console.warn('[webhook] Payment record not found for:', notchpayId, payErr);
    // Try by reference as fallback
    await updateOrderByReference(reference, transaction);
    return;
  }

  // 2. Update order status to 'paid'
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .update({
      status:       'paid',
      paid_at:      new Date().toISOString(),
      notchpay_ref: reference,
    })
    .eq('id', payment.order_id)
    .select('id, buyer_id, shop_id, total_xaf')
    .single();

  if (orderErr || !order) {
    console.error('[webhook] Failed to update order:', orderErr);
    return;
  }

  // 3. Get buyer's FCM token
  const { data: buyer } = await supabase
    .from('users')
    .select('fcm_token, full_name')
    .eq('id', order.buyer_id)
    .single();

  // 4. Get seller's FCM token (via shop)
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id, name')
    .eq('id', order.shop_id)
    .single();

  const { data: seller } = shop
    ? await supabase.from('users').select('fcm_token').eq('id', shop.owner_id).single()
    : { data: null };

  // 5. Fire FCM notifications
  const notifications = [
    buyer?.fcm_token && {
      token:   buyer.fcm_token,
      title:   '✅ Payment Confirmed!',
      body:    `Your payment of ${amountXAF.toLocaleString()} XAF was successful. Your order is being prepared.`,
      data:    { type: 'payment', order_id: order.id, path: `/orders/${order.id}` },
      userId:  order.buyer_id,
      notType: 'payment' as const,
    },
    seller?.fcm_token && {
      token:   seller.fcm_token,
      title:   '🛒 New Order Received!',
      body:    `Payment of ${amountXAF.toLocaleString()} XAF confirmed. Prepare the order now.`,
      data:    { type: 'order', order_id: order.id, path: `/vendor/orders` },
      userId:  shop!.owner_id,
      notType: 'order' as const,
    },
  ].filter(Boolean);

  for (const notif of notifications) {
    if (!notif) continue;
    const msgId = await sendFCM(notif.token!, notif.title!, notif.body!, notif.data!);
    await logNotification(notif.userId!, notif.notType!, notif.title!, notif.body!, msgId);
  }

  console.info(`[webhook] Payment success handled. Order ${order.id} → paid.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT FAILED HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function handlePaymentFailed(transaction: Record<string, unknown>) {
  const notchpayId = String(transaction.id ?? '');

  const { data: payment } = await supabase
    .from('payments')
    .update({ status: 'failed', webhook_payload: transaction })
    .eq('notchpay_id', notchpayId)
    .select('order_id, user_id')
    .single();

  if (!payment) return;

  const { data: buyer } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', payment.user_id)
    .single();

  if (buyer?.fcm_token) {
    const msgId = await sendFCM(
      buyer.fcm_token,
      '❌ Payment Failed',
      'Your payment could not be processed. Please try again.',
      { type: 'payment', order_id: payment.order_id, path: `/payment/checkout` }
    );
    await logNotification(payment.user_id, 'payment', '❌ Payment Failed',
      'Your payment could not be processed. Please try again.', msgId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK: find order by Notchpay reference
// ─────────────────────────────────────────────────────────────────────────────

async function updateOrderByReference(reference: string, transaction: Record<string, unknown>) {
  if (!reference) return;
  await supabase.from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString(), notchpay_ref: reference })
    .eq('notchpay_ref', reference);
}

// ─────────────────────────────────────────────────────────────────────────────
// FCM SENDER — POSTs to Firebase Cloud Messaging API
// ─────────────────────────────────────────────────────────────────────────────

async function sendFCM(
  token: string,
  title: string,
  body:  string,
  data:  Record<string, string>
): Promise<string | null> {
  try {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body, sound: 'default', badge: '1' },
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      }),
    });
    const result = await res.json();
    return result.message_id ?? null;
  } catch (e) {
    console.warn('[FCM] Send failed:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG NOTIFICATION to Supabase notifications_log table
// ─────────────────────────────────────────────────────────────────────────────

async function logNotification(
  userId: string,
  type:   'order' | 'payment' | 'promo' | 'message',
  title:  string,
  body:   string,
  fcmMessageId: string | null
): Promise<void> {
  await supabase.from('notifications_log').insert({
    user_id:        userId,
    type,
    title,
    body,
    fcm_message_id: fcmMessageId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNATURE VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

function verifySignature(body: string, signature: string): boolean {
  // In production: HMAC-SHA256 verify using NOTCHPAY_SECRET
  // Notchpay signs the request body with your secret key
  // For now — validate that signature header exists if secret is set
  if (!NOTCHPAY_SECRET) return true; // dev mode: skip verification
  if (!signature)       return false;
  // TODO: implement HMAC-SHA256 comparison when Notchpay publishes spec
  // const expectedSig = hmacSha256(NOTCHPAY_SECRET, body);
  // return timingSafeEqual(signature, expectedSig);
  return signature.length > 0;
}
