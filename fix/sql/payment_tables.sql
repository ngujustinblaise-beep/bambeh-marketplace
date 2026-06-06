-- ════════════════════════════════════════════════════════════════════════
-- BAMBEH PAYMENT TABLES MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS)
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. SUBSCRIPTIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type    text NOT NULL CHECK (plan_type IN ('daily','weekly','monthly')),
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  reference    text,
  expires_at   timestamptz NOT NULL,
  activated_at timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 2. SUBSCRIPTION PAYMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_payments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id    text NOT NULL,
  amount_xaf integer NOT NULL,
  reference  text,
  status     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed')),
  paid_at    timestamptz DEFAULT now()
);

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own payments" ON subscription_payments;
CREATE POLICY "Users read own payments"
  ON subscription_payments FOR SELECT
  USING (auth.uid() = user_id);

-- ── 3. ZERM COINS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zerm_coins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance    integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE zerm_coins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own coins" ON zerm_coins;
CREATE POLICY "Users read own coins"
  ON zerm_coins FOR SELECT
  USING (auth.uid() = user_id);

-- ── 4. ZERM PURCHASES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zerm_purchases (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id     text NOT NULL,
  coins_bought   integer NOT NULL,
  bonus_coins    integer NOT NULL DEFAULT 0,
  total_coins    integer NOT NULL,
  price_xaf      integer NOT NULL,
  payment_method text,
  phone_number   text,
  reference      text,
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE zerm_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own purchases" ON zerm_purchases;
CREATE POLICY "Users read own purchases"
  ON zerm_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ── 5. ZERM TRANSACTIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zerm_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('credit','debit')),
  amount      integer NOT NULL,
  description text,
  reference   text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zerm_tx_user ON zerm_transactions(user_id);

ALTER TABLE zerm_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own tx" ON zerm_transactions;
CREATE POLICY "Users read own tx"
  ON zerm_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ── 6. DONATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference  text UNIQUE,
  amount     integer NOT NULL,
  currency   text DEFAULT 'XAF',
  phone      text,
  operator   text,
  user_id    uuid REFERENCES auth.users(id),
  tx_data    jsonb,
  donated_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert donation" ON donations;
CREATE POLICY "Anyone can insert donation"
  ON donations FOR INSERT
  WITH CHECK (true);

-- ── 7. ORDERS (Cart checkout) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               text PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id),
  items            jsonb,
  subtotal         integer,
  delivery_fee     integer DEFAULT 0,
  total            integer NOT NULL,
  delivery_address text,
  reference        text,
  status           text DEFAULT 'paid',
  paid_at          timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- ── 8. ESCROW TRANSACTIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   text,
  buyer_id   uuid REFERENCES auth.users(id),
  seller_id  uuid REFERENCES auth.users(id),
  amount     integer NOT NULL,
  fee        integer DEFAULT 0,
  reference  text,
  status     text DEFAULT 'payment_confirmed'
              CHECK (status IN ('pending','payment_confirmed','delivered','completed','disputed','refunded')),
  paid_at    timestamptz DEFAULT now(),
  released_at timestamptz
);

ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own escrow" ON escrow_transactions;
CREATE POLICY "Users read own escrow"
  ON escrow_transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ════════════════════════════════════════════════════════════════════════
-- DONE. All payment tables are ready.
-- ════════════════════════════════════════════════════════════════════════
