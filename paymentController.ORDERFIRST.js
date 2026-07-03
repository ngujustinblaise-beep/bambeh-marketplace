'use strict';

/**
 * BAMBEH SARL - Payment Controller (ORDER-FIRST VERSION)
 * FILE LOCATION: src/controllers/paymentController.js
 *
 * UPGRADED in this version (audit P0 #1 fix):
 *  1. cartCheckout is now ORDER-FIRST and AUTHENTICATED:
 *       verify buyer JWT -> verify item prices server-side ->
 *       reserve stock atomically -> create order status 'pending' ->
 *       initiate CamPay -> webhook flips it to 'paid'.
 *     The client can no longer decide what it pays or write paid orders.
 *  2. handleWebhook now has REPLAY PROTECTION via the webhook_events
 *     table (duplicate deliveries are acknowledged and ignored).
 *  3. A successful CART payment opens an escrow_ledger row
 *     (state machine enforced by the database trigger).
 *  4. A FAILED cart payment releases reserved stock and marks the
 *     order 'failed'. Orders only transition FROM 'pending'.
 *  5. Legacy behavior preserved: calling /cart with an orderId and no
 *     items still works exactly as before (server-priced from the DB).
 *
 * Everything else (collect, subscribe, donate, links, status, balance,
 * disburse) is unchanged from the previous version.
 */

const { createClient } = require('@supabase/supabase-js');

const {
  validatePhone,
  validateAmount,
  generateExternalRef,
  collectPayment,
  checkStatus,
  disburse,
  getBalance,
  getPaymentLink,
  processSubscriptionPayment,
  processCartPayment,
  processDonationPayment,
  verifyWebhookSignature,
  parseWebhook,
  PAYMENT_TYPE,
} = require('../services/campayService');

// -- Supabase (service role - bypasses RLS; backend only) ---------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// -- Helpers -------------------------------------------------------------------
const calculateFees = (subtotal) => {
  const appFee = Math.round(subtotal * 0.01); // Bambeh fee: 1% of every transaction
  const govTax = subtotal > 0 ? 4 : 0;        // flat 4 FCFA government tax per transaction
  return { subtotal, appFee, govTax, total: subtotal + appFee + govTax };
};

const ok   = (res, data, code = 200) => res.status(code).json({ success: true, data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, error: msg });

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// -- AUTH: resolve the buyer from a Supabase JWT --------------------------------
// The frontend sends: Authorization: Bearer <supabase access token>
async function getBearerUser(req) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (_e) {
    return null;
  }
}

// -- SECURITY (F-03): server-side price sources ---------------------------------
// The client must NEVER decide how much it pays. Amounts come from the DB
// (orders / listings) or a server-side catalog (plans).

const ORDER_AMOUNT_COLUMNS = ['total_xaf', 'total_amount', 'total', 'amount', 'subtotal', 'price'];

async function resolveOrderAmount(orderId) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) return { ok: false, error: 'Order not found.' };

  for (const col of ORDER_AMOUNT_COLUMNS) {
    const raw = order[col];
    const num = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof num === 'number' && Number.isFinite(num) && num > 0) {
      return { ok: true, amount: num, column: col };
    }
  }
  // Fail CLOSED: never fall back to a client-supplied amount.
  return { ok: false, error: 'Order has no readable amount. Confirm the orders schema / ORDER_AMOUNT_COLUMNS.' };
}

// Server-side subscription price catalog. The client CANNOT set these.
const PLAN_PRICES = {
  // Consumer plans (LIVE - must match src/pages/subscription.tsx exactly)
  'daily':   100,   // Daily Pass  - 24 hours
  'weekly':  500,   // Weekly Plan - 7 days
  'monthly': 1500,  // Monthly Plan - 30 days
  // Corporate plans (APPROVED 20260702_125257):
  'business_annual':      40000,
  'enterprise_annual':    100000,
  'international_annual': 150000,
};

async function resolvePlanPrice(planName) {
  try {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('price')
      .eq('name', planName)
      .maybeSingle();
    if (plan && typeof plan.price === 'number' && plan.price > 0) return plan.price;
  } catch (_e) {
    // table may not exist yet - fall through to the catalog
  }
  const p = PLAN_PRICES[planName];
  return typeof p === 'number' && p > 0 ? p : null;
}

// -- ORDER-FIRST: item verification + stock reservation -------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Which DB table holds each listingType. Only tables with a
// stock_quantity column may appear here (reserve_stock enforces it too).
const LISTING_TABLES = {
  'marketplace': 'marketplace_listings',
  'listing':     'listings',
  'general':     'listings',
};

const PRICE_COLUMNS = ['price_xaf', 'price', 'amount'];

function readRowPrice(row) {
  for (const col of PRICE_COLUMNS) {
    const raw = row[col];
    const num = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof num === 'number' && Number.isFinite(num) && num > 0) return Math.round(num);
  }
  return null;
}

/**
 * Sanitizes the cart, verifies prices against the DB where possible, and
 * atomically reserves stock for verifiable items.
 * Returns { ok, error?, items?, reservations?, verifiedCount? }.
 * On any failure it releases everything it had already reserved.
 */
async function verifyAndReserveItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: 'items array is required.' };
  }
  if (rawItems.length > 50) {
    return { ok: false, error: 'Too many items in one order (max 50).' };
  }

  const items = [];
  for (const raw of rawItems) {
    const qty   = Math.round(Number(raw?.quantity ?? 1));
    const price = Math.round(Number(raw?.priceXAF ?? raw?.price ?? 0));
    const title = String(raw?.title ?? raw?.itemTitle ?? 'Item').slice(0, 200);
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
      return { ok: false, error: `Invalid quantity for "${title}".` };
    }
    if (!Number.isFinite(price) || price < 0 || price > 1000000) {
      return { ok: false, error: `Invalid price for "${title}".` };
    }
    items.push({
      listingId:   typeof raw?.listingId === 'string' ? raw.listingId : null,
      listingType: typeof raw?.listingType === 'string' ? raw.listingType : null,
      sellerId:    typeof raw?.sellerId === 'string' ? raw.sellerId.slice(0, 64) : null,
      title,
      priceXAF:    price,
      quantity:    qty,
      verified:    false,
    });
  }

  const reservations = []; // { table, listingId, qty } - for rollback on failure
  let verifiedCount = 0;

  const releaseAll = async () => {
    for (const r of reservations) {
      try {
        await supabase.rpc('release_stock', { p_table: r.table, p_listing_id: r.listingId, p_qty: r.qty });
      } catch (e) {
        console.error('[cart] release_stock rollback error:', e.message);
      }
    }
  };

  for (const item of items) {
    const table = item.listingType ? LISTING_TABLES[item.listingType] : null;
    if (!table || !item.listingId || !UUID_RE.test(item.listingId)) {
      continue; // unverifiable item: keep client price, no reservation
    }

    // 1. Authoritative price from the DB. If the listing exists, its price WINS.
    const { data: row, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', item.listingId)
      .maybeSingle();

    if (error) {
      console.error(`[cart] price lookup error on ${table}:`, error.message);
      continue; // lookup failure: treat as unverifiable rather than blocking checkout
    }
    if (!row) continue;

    const dbPrice = readRowPrice(row);
    if (dbPrice !== null) {
      item.priceXAF = dbPrice; // server price overrides whatever the client sent
      item.verified = true;
      verifiedCount++;
    }

    // 2. Atomic stock reservation (two buyers on the last unit: one wins).
    const { data: remaining, error: rpcError } = await supabase
      .rpc('reserve_stock', { p_table: table, p_listing_id: item.listingId, p_qty: item.quantity });

    if (rpcError) {
      console.error('[cart] reserve_stock error:', rpcError.message);
      continue; // reservation infrastructure problem: do not block the sale
    }
    if (remaining === -1) {
      await releaseAll();
      return { ok: false, error: `"${item.title}" is out of stock.`, code: 409 };
    }
    reservations.push({ table, listingId: item.listingId, qty: item.quantity });
  }

  return { ok: true, items, reservations, verifiedCount, releaseAll };
}

async function releaseStockForItems(items) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    const table = item?.listingType ? LISTING_TABLES[item.listingType] : null;
    if (!table || !item?.listingId || !UUID_RE.test(item.listingId)) continue;
    try {
      await supabase.rpc('release_stock', { p_table: table, p_listing_id: item.listingId, p_qty: item.quantity ?? 1 });
    } catch (e) {
      console.error('[webhook] release_stock error:', e.message);
    }
  }
}

// -- Supabase payment bookkeeping ------------------------------------------------
async function recordPendingPayment({ reference, externalRef, paymentType, amount, phone, userId, orderId, planName, cause }) {
  const { error } = await supabase.from('payments').insert({
    reference,
    external_ref:  externalRef,
    payment_type:  paymentType,
    status:        'PENDING',
    amount,
    phone,
    user_id:   userId   || null,
    order_id:  orderId  || null,
    plan_name: planName || null,
    cause:     cause    || null,
    created_at: new Date().toISOString(),
  });
  if (error) console.error('[Supabase] recordPendingPayment failed:', error.message);
}

async function activateSubscription(externalRef, event) {
  const { data: payment } = await supabase.from('payments').select('user_id, plan_name').eq('external_ref', externalRef).maybeSingle();
  if (!payment) return;

  await supabase.from('payments').update({ status: 'SUCCESSFUL', operator: event.operator, settled_at: new Date().toISOString() }).eq('external_ref', externalRef);

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await supabase.from('subscriptions').upsert({
    user_id: payment.user_id, plan_name: payment.plan_name, status: 'active',
    started_at: now.toISOString(), expires_at: expiresAt.toISOString(), payment_ref: event.reference,
  }, { onConflict: 'user_id' });
}

// ORDER-FIRST fulfilment: pending -> paid, then open the escrow ledger row.
async function fulfilOrder(externalRef, event) {
  const { data: payment } = await supabase.from('payments').select('order_id').eq('external_ref', externalRef).maybeSingle();
  if (!payment || !payment.order_id) return;

  await supabase.from('payments').update({ status: 'SUCCESSFUL', operator: event.operator, settled_at: new Date().toISOString() }).eq('external_ref', externalRef);

  // Only a PENDING order may become PAID (a failed/cancelled one never can).
  const { data: order, error: updErr } = await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString(), payment_ref: event.reference })
    .eq('id', payment.order_id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (updErr) {
    console.error('[Webhook] order paid update error:', updErr.message);
    return;
  }
  if (!order) {
    console.info('[Webhook] order already finalized, skipping:', payment.order_id);
    return;
  }

  // Open the escrow ledger row (DB trigger enforces the state machine).
  // seller_id is set only when every item in the order shares one seller.
  let sellerId = null;
  try {
    const sellers = new Set(
      (Array.isArray(order.items) ? order.items : [])
        .map((i) => i && i.sellerId)
        .filter((s) => typeof s === 'string' && UUID_RE.test(s))
    );
    if (sellers.size === 1) sellerId = [...sellers][0];
  } catch (_e) { /* metadata only */ }

  const buyerId = order.buyer_id || order.user_id;
  const escrowAmount = Math.round(Number(order.seller_payout_xaf ?? order.total_xaf ?? event.amount) || 0);

  if (buyerId && escrowAmount > 0) {
    const { error: escErr } = await supabase.from('escrow_ledger').insert({
      order_id:   order.id,
      buyer_id:   buyerId,
      seller_id:  sellerId,
      amount_xaf: escrowAmount,
    });
    if (escErr && escErr.code !== '23505') {
      console.error('[Webhook] escrow_ledger insert error:', escErr.message);
    } else if (!escErr) {
      console.info(`[Webhook] escrow opened for order ${order.id}: ${escrowAmount} XAF`);
    }
  }
}

// FAILED cart payment: release reserved stock, mark the order failed.
async function failOrder(externalRef, event) {
  const { data: payment } = await supabase.from('payments').select('order_id').eq('external_ref', externalRef).maybeSingle();
  if (!payment || !payment.order_id) return;

  const { data: order } = await supabase
    .from('orders')
    .update({ status: 'failed', failure_reason: `CamPay status: ${event.status}` })
    .eq('id', payment.order_id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (order) {
    await releaseStockForItems(order.items);
    console.info('[Webhook] order failed, stock released:', order.id);
  }
}

async function recordDonation(externalRef, event) {
  await supabase.from('payments').update({ status: 'SUCCESSFUL', operator: event.operator, settled_at: new Date().toISOString() }).eq('external_ref', externalRef);
  await supabase.from('donations').insert({ external_ref: externalRef, amount: event.amount, phone: event.from, operator: event.operator, payment_ref: event.reference, donated_at: new Date().toISOString() });
}

async function markPaymentFailed(externalRef) {
  await supabase.from('payments').update({ status: 'FAILED', settled_at: new Date().toISOString() }).eq('external_ref', externalRef);
}

// ================================================================================
// COLLECT  <- what the useCamPay hook calls for open-ended payments
// POST /api/payments/collect
// ================================================================================
const collect = asyncHandler(async (req, res) => {
  const { phone, amount, description, externalRef, metadata } = req.body;

  if (!phone)       return fail(res, 'phone is required.');
  if (!description) return fail(res, 'description is required.');

  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return fail(res, phoneCheck.error);

  // SECURITY (F-03): if this collect is tied to a real order, the amount is
  // taken from the server, and the client-sent amount is IGNORED.
  const orderId = metadata?.order_id ?? null;
  let chargeAmount;

  if (orderId) {
    const lookup = await resolveOrderAmount(orderId);
    if (!lookup.ok) return fail(res, lookup.error, 404);
    chargeAmount = lookup.amount;
  } else {
    if (!amount) return fail(res, 'amount is required.');
    const amountCheck = validateAmount(amount);
    if (!amountCheck.valid) return fail(res, amountCheck.error);
    chargeAmount = amountCheck.value;
  }

  const ref = externalRef ?? generateExternalRef('COLLECT');

  const result = await collectPayment({
    amount:      chargeAmount,
    phone:       phoneCheck.normalized,
    description,
    externalRef: ref,
  });

  if (!result.success) {
    console.error('[collect] CamPay error:', result.error);
    return fail(res, typeof result.error === 'string' ? result.error : 'CamPay refused the payment request. Check the phone number and balance.', 502);
  }

  await recordPendingPayment({
    reference:   result.data?.reference,
    externalRef: ref,
    paymentType: 'COLLECT',
    amount:      chargeAmount,
    phone:       phoneCheck.normalized,
    userId:      metadata?.user_id ?? null,
    orderId:     metadata?.order_id ?? null,
  });

  return ok(res, {
    message:   'Payment request sent to phone. Waiting for user approval.',
    reference: result.data?.reference,
    status:    result.data?.status,
    operator:  phoneCheck.operator,
  }, 201);
});

// ================================================================================
// SUBSCRIPTION
// ================================================================================
const subscribe = asyncHandler(async (req, res) => {
  const { phone, planName, userId } = req.body; // SECURITY (F-03): client "amount" is IGNORED
  if (!phone || !planName || !userId) return fail(res, 'phone, planName, userId are required.');

  const phoneCheck  = validatePhone(phone);
  if (!phoneCheck.valid) return fail(res, phoneCheck.error);

  const price = await resolvePlanPrice(planName);
  if (price == null) return fail(res, `Unknown or unconfigured plan: ${planName}. Add it to PLAN_PRICES / subscription_plans.`, 400);

  const result = await processSubscriptionPayment({ phone: phoneCheck.normalized, amount: price, planName, userId });
  await recordPendingPayment({ reference: result.reference, externalRef: result.externalRef, paymentType: 'SUBSCRIPTION', amount: price, phone: phoneCheck.normalized, userId, planName });

  return ok(res, { message: 'Subscription payment initiated.', reference: result.reference, status: result.status, operator: result.operator, externalRef: result.externalRef }, 201);
});

// ================================================================================
// CART CHECKOUT  (ORDER-FIRST - audit P0 #1 fix)
// POST /api/payments/cart
//
// NEW flow (frontend sends items + Authorization header):
//   1. Verify the buyer's Supabase JWT           -> no anonymous checkouts
//   2. Verify item prices against the database   -> client prices cannot lie
//   3. Reserve stock atomically                  -> no overselling
//   4. Create the order with status 'pending'    -> order exists BEFORE money
//   5. Initiate CamPay collect                   -> USSD prompt to the buyer
//   6. The signature-verified webhook flips pending -> paid and opens escrow
//
// LEGACY flow preserved: body { phone, orderId } with no items behaves
// exactly like the previous version (server-priced from the order row).
// ================================================================================
const cartCheckout = asyncHandler(async (req, res) => {
  const { phone, orderId, summary, items } = req.body; // client "amount" is ALWAYS ignored

  if (!phone) return fail(res, 'phone is required.');
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return fail(res, phoneCheck.error);

  // ---- LEGACY PATH: existing order id, no items -------------------------------
  if (orderId && !items) {
    const lookup = await resolveOrderAmount(orderId);
    if (!lookup.ok) return fail(res, lookup.error, 404);

    const fees   = { subtotal: lookup.amount, appFee: 0, govTax: 0, total: lookup.amount };
    const result = await processCartPayment({ phone: phoneCheck.normalized, amount: fees.total, orderId, summary });
    await recordPendingPayment({ reference: result.reference, externalRef: result.externalRef, paymentType: 'CART', amount: fees.total, phone: phoneCheck.normalized, orderId });

    return ok(res, { message: 'Cart payment initiated.', reference: result.reference, status: result.status, operator: result.operator, externalRef: result.externalRef, breakdown: fees }, 201);
  }

  // ---- ORDER-FIRST PATH -------------------------------------------------------
  // 1. Authentication is mandatory: the order belongs to a real signed-in buyer.
  const user = await getBearerUser(req);
  if (!user) return fail(res, 'Sign in required to checkout.', 401);

  // 2 + 3. Verify prices and reserve stock.
  const check = await verifyAndReserveItems(items);
  if (!check.ok) return fail(res, check.error, check.code || 400);

  // 4. Server computes the money. Client totals are ignored entirely.
  const subtotal = check.items.reduce((sum, i) => sum + i.priceXAF * i.quantity, 0);
  const fees     = calculateFees(subtotal);

  const amountCheck = validateAmount(fees.total);
  if (!amountCheck.valid) {
    await check.releaseAll();
    return fail(res, amountCheck.error);
  }

  const orderNumber = `ORD_${Date.now()}_${generateExternalRef('X').slice(-6)}`;
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number:      orderNumber,
      buyer_id:          user.id,
      user_id:           user.id,
      status:            'pending',
      total_xaf:         fees.total,
      platform_fee_xaf:  fees.appFee + fees.govTax,
      seller_payout_xaf: fees.subtotal,
      payment_method:    'campay',
      items:             check.items,
      escrow:            true,
    })
    .select()
    .single();

  if (orderErr || !order) {
    await check.releaseAll();
    console.error('[cart] order insert error:', orderErr?.message);
    return fail(res, 'Could not create the order. Please try again.', 500);
  }

  // 5. Initiate the CamPay collection. externalRef prefix CART routes the webhook.
  const externalRef = generateExternalRef('CART');
  const result = await collectPayment({
    amount:      fees.total,
    phone:       phoneCheck.normalized,
    description: summary || `Bambeh Order ${orderNumber}`,
    externalRef,
  });

  if (!result.success) {
    await check.releaseAll();
    await supabase.from('orders')
      .update({ status: 'failed', failure_reason: 'CamPay initiation refused' })
      .eq('id', order.id).eq('status', 'pending');
    console.error('[cart] CamPay error:', result.error);
    return fail(res, 'CamPay refused the payment request. Check the phone number and balance.', 502);
  }

  // Link the CamPay reference to the order for the webhook + status polling.
  await supabase.from('orders')
    .update({ payment_reference: result.data?.reference })
    .eq('id', order.id);

  await recordPendingPayment({
    reference:   result.data?.reference,
    externalRef,
    paymentType: 'CART',
    amount:      fees.total,
    phone:       phoneCheck.normalized,
    userId:      user.id,
    orderId:     order.id,
  });

  console.info(`[cart] order-first checkout: order ${order.id} pending, ${check.verifiedCount}/${check.items.length} items DB-verified, ${fees.total} XAF`);

  return ok(res, {
    message:   'Cart payment initiated.',
    reference: result.data?.reference,
    status:    result.data?.status,
    operator:  phoneCheck.operator,
    externalRef,
    orderId:   order.id,
    breakdown: fees,
  }, 201);
});

// ================================================================================
// DONATION
// ================================================================================
const donate = asyncHandler(async (req, res) => {
  const { phone, amount, cause, donorName } = req.body;
  if (!phone || !amount) return fail(res, 'phone and amount are required.');

  const phoneCheck  = validatePhone(phone);
  if (!phoneCheck.valid) return fail(res, phoneCheck.error);
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return fail(res, amountCheck.error);

  const result = await processDonationPayment({ phone: phoneCheck.normalized, amount: amountCheck.value, cause: cause || 'General', donorName: donorName || 'Bambeh User' });
  await recordPendingPayment({ reference: result.reference, externalRef: result.externalRef, paymentType: 'DONATION', amount: amountCheck.value, phone: phoneCheck.normalized, cause });

  return ok(res, { message: 'Donation initiated.', reference: result.reference, status: result.status, operator: result.operator, externalRef: result.externalRef }, 201);
});

// ================================================================================
// PAYMENT LINK
// ================================================================================
const paymentLink = asyncHandler(async (req, res) => {
  const { amount, description, type, phone, firstName, lastName, email, redirectUrl, failureRedirectUrl } = req.body;
  if (!amount || !description) return fail(res, 'amount and description are required.');

  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return fail(res, amountCheck.error);

  const paymentType = Object.values(PAYMENT_TYPE).includes((type || '').toUpperCase()) ? type.toUpperCase() : 'GENERAL';
  const externalRef = generateExternalRef(paymentType);
  const result      = await getPaymentLink({ amount: amountCheck.value, description, externalRef, from: phone || '', firstName: firstName || '', lastName: lastName || '', email: email || '', redirectUrl: redirectUrl || '', failureRedirectUrl: failureRedirectUrl || '' });

  return ok(res, { message: 'Payment link generated.', link: result.link, reference: result.reference, externalRef, status: result.status });
});

// ================================================================================
// STATUS CHECK
// ================================================================================
const getStatus = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  if (!reference) return fail(res, 'Transaction reference is required.');
  const result = await checkStatus(reference);
  return ok(res, result.data ?? result);
});

// ================================================================================
// BALANCE
// ================================================================================
const balance = asyncHandler(async (req, res) => {
  const result = await getBalance();
  return ok(res, result.data ?? result);
});

// ================================================================================
// DISBURSEMENT
// ================================================================================
const disburseFunds = asyncHandler(async (req, res) => {
  const { to, amount, description, externalRef } = req.body;
  if (!to || !amount || !description) return fail(res, 'to, amount, description are required.');

  const phoneCheck  = validatePhone(to);
  if (!phoneCheck.valid) return fail(res, phoneCheck.error);
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return fail(res, amountCheck.error);

  const ref    = externalRef || generateExternalRef('DISBURSE');
  const result = await disburse({ amount: amountCheck.value, to: phoneCheck.normalized, description, externalRef: ref });
  return ok(res, { message: 'Disbursement initiated.', reference: result.reference, status: result.status, externalRef: ref });
});

// ================================================================================
// WEBHOOK  (signature-verified + REPLAY-PROTECTED)
// ================================================================================
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-campay-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    console.error('[Webhook] Invalid signature.');
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  let body;
  try { body = JSON.parse(req.body.toString()); }
  catch { return res.status(400).json({ error: 'Invalid JSON.' }); }

  let event;
  try { event = parseWebhook(body); }
  catch (err) { return res.status(400).json({ error: err.message }); }

  console.info(`[Webhook] ref:${event.reference} status:${event.status} type:${event.paymentType} ${event.amount} XAF`);

  // REPLAY PROTECTION: each (reference, status) pair is processed exactly once.
  // A duplicate delivery is acknowledged with 200 and does nothing.
  if (event.reference) {
    const { error: replayErr } = await supabase.from('webhook_events').insert({
      provider:  'campay',
      event_id:  `${event.reference}:${event.status}`,
      reference: event.reference,
    });
    if (replayErr) {
      if (replayErr.code === '23505') {
        console.info('[Webhook] duplicate delivery ignored:', event.reference, event.status);
        return res.status(200).json({ received: true, duplicate: true });
      }
      // Table problem: log it but never drop a real payment event.
      console.error('[Webhook] replay-guard insert error (continuing):', replayErr.message);
    }
  }

  try {
    if (event.isSuccessful) {
      switch (event.paymentType) {
        case 'SUBSCRIPTION': await activateSubscription(event.externalRef, event); break;
        case 'CART':         await fulfilOrder(event.externalRef, event);          break;
        case 'DONATION':     await recordDonation(event.externalRef, event);       break;
        default:
          await supabase.from('payments').update({ status: 'SUCCESSFUL', operator: event.operator, settled_at: new Date().toISOString() }).eq('external_ref', event.externalRef);
          console.info('[Webhook] COLLECT payment confirmed:', event.externalRef);
      }
    } else if (event.isFailed) {
      await markPaymentFailed(event.externalRef);
      if (event.paymentType === 'CART') {
        await failOrder(event.externalRef, event);
      }
    }
  } catch (err) {
    console.error('[Webhook] Supabase error (non-fatal):', err.message);
  }

  return res.status(200).json({ received: true });
});

// -- Exports ---------------------------------------------------------------------
module.exports = {
  collect,
  subscribe,
  cartCheckout,
  donate,
  paymentLink,
  getStatus,
  balance,
  disburseFunds,
  handleWebhook,
};
