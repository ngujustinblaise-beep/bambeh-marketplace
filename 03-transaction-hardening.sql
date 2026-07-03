-- =====================================================================
-- 03-transaction-hardening.sql  -- BAMBEH P0 FIX 3 of 4
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Project: rjbjdxefwzvgmioearie
--
-- Covers audit blockers:
--   FIX 2  RLS on orders (read/insert own rows only)
--   FIX 5  Payment idempotency (unique payment_reference)
--   NEW    Webhook replay protection (webhook_events table)
--   FIX 4  Escrow ledger with a REAL server-enforced state machine
--   FIX 3  Inventory locking (atomic stock reservation, FOR UPDATE)
--
-- Every block is defensive: IF NOT EXISTS everywhere, column detection
-- via information_schema, nothing destructive, nothing dropped.
-- REVERSIBLE: a full rollback block is at the bottom (commented out).
-- =====================================================================

-- ---------------------------------------------------------------
-- SECTION 1: RLS ON ORDERS
-- Users can SELECT and INSERT only their own orders. No client-side
-- UPDATE or DELETE at all (only the backend service role can, which
-- bypasses RLS). This keeps the current checkout working while
-- closing cross-user reads and order tampering.
-- ---------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  has_buyer boolean;
  has_user  boolean;
  own_expr  text;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='orders' AND column_name='buyer_id') INTO has_buyer;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='orders' AND column_name='user_id') INTO has_user;

  IF has_buyer AND has_user THEN
    own_expr := '(auth.uid() = buyer_id OR auth.uid() = user_id)';
  ELSIF has_buyer THEN
    own_expr := '(auth.uid() = buyer_id)';
  ELSIF has_user THEN
    own_expr := '(auth.uid() = user_id)';
  ELSE
    RAISE EXCEPTION 'orders has neither buyer_id nor user_id - stop and report';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='orders_select_own') THEN
    EXECUTE format('CREATE POLICY orders_select_own ON public.orders FOR SELECT USING %s', own_expr);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='orders_insert_own') THEN
    EXECUTE format('CREATE POLICY orders_insert_own ON public.orders FOR INSERT WITH CHECK %s', own_expr);
  END IF;
END $$;

-- ---------------------------------------------------------------
-- SECTION 2: PAYMENT IDEMPOTENCY
-- One payment reference can pay for exactly one order. A replayed
-- CamPay callback or a double-tapped checkout can never create a
-- second paid order with the same reference.
-- ---------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique
  ON public.orders (payment_reference)
  WHERE payment_reference IS NOT NULL;

-- ---------------------------------------------------------------
-- SECTION 3: WEBHOOK REPLAY PROTECTION
-- The backend must INSERT the provider event id here BEFORE acting
-- on any webhook. A duplicate insert fails -> the event is a replay
-- -> respond 200 and do nothing. Service-role only (RLS, no policies).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider     text NOT NULL DEFAULT 'campay',
  event_id     text NOT NULL,
  reference    text,
  received_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- SECTION 4: ESCROW LEDGER + ENFORCED STATE MACHINE
-- Escrow stops being marketing text. Allowed transitions ONLY:
--   PENDING_FUNDS -> SHIPPED | REFUNDED | DISPUTED
--   SHIPPED       -> DELIVERED | DISPUTED
--   DELIVERED     -> RELEASED | DISPUTED
--   DISPUTED      -> RELEASED | REFUNDED
--   RELEASED / REFUNDED = terminal, immutable.
-- A trigger REJECTS every other transition at the database level, so
-- not even a bug in the backend can jump PENDING -> RELEASED.
-- Clients: read own rows only. Writes: service role only.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escrow_ledger (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id),
  buyer_id    uuid NOT NULL,
  seller_id   uuid,
  amount_xaf  integer NOT NULL CHECK (amount_xaf > 0),
  status      text NOT NULL DEFAULT 'PENDING_FUNDS'
              CHECK (status IN ('PENDING_FUNDS','SHIPPED','DELIVERED','RELEASED','DISPUTED','REFUNDED')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

CREATE OR REPLACE FUNCTION public.enforce_escrow_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  IF OLD.status IN ('RELEASED','REFUNDED') THEN
    RAISE EXCEPTION 'escrow % is terminal (%), no further transitions', OLD.id, OLD.status;
  END IF;
  IF NOT (
       (OLD.status = 'PENDING_FUNDS' AND NEW.status IN ('SHIPPED','REFUNDED','DISPUTED'))
    OR (OLD.status = 'SHIPPED'       AND NEW.status IN ('DELIVERED','DISPUTED'))
    OR (OLD.status = 'DELIVERED'     AND NEW.status IN ('RELEASED','DISPUTED'))
    OR (OLD.status = 'DISPUTED'      AND NEW.status IN ('RELEASED','REFUNDED'))
  ) THEN
    RAISE EXCEPTION 'illegal escrow transition % -> %', OLD.status, NEW.status;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_escrow_transition ON public.escrow_ledger;
CREATE TRIGGER trg_escrow_transition
  BEFORE UPDATE ON public.escrow_ledger
  FOR EACH ROW EXECUTE FUNCTION public.enforce_escrow_transition();

ALTER TABLE public.escrow_ledger ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='escrow_ledger' AND policyname='escrow_select_own') THEN
    CREATE POLICY escrow_select_own ON public.escrow_ledger FOR SELECT
      USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
END $$;
-- No INSERT/UPDATE policies on purpose: only the service role (backend)
-- can write escrow rows, and even it must obey the transition trigger.

-- ---------------------------------------------------------------
-- SECTION 5: INVENTORY LOCKING
-- Adds stock_quantity (default 1 = classifieds behaviour, changes
-- nothing for existing single-item listings) and an atomic reserve
-- function using FOR UPDATE row locks. Two buyers hitting the last
-- unit at the same millisecond: exactly one wins.
-- ---------------------------------------------------------------
ALTER TABLE public.listings            ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0);
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0);

CREATE OR REPLACE FUNCTION public.reserve_stock(p_table text, p_listing_id uuid, p_qty integer DEFAULT 1)
RETURNS integer                       -- remaining stock, or -1 if insufficient
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  remaining integer;
BEGIN
  IF p_table NOT IN ('listings','marketplace_listings') THEN
    RAISE EXCEPTION 'reserve_stock: table % not allowed', p_table;
  END IF;
  IF p_qty < 1 THEN
    RAISE EXCEPTION 'reserve_stock: quantity must be >= 1';
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET stock_quantity = stock_quantity - $1
     WHERE id = $2 AND stock_quantity >= $1
     RETURNING stock_quantity', p_table)
  INTO remaining
  USING p_qty, p_listing_id;

  IF remaining IS NULL THEN
    RETURN -1;   -- out of stock or listing not found: DO NOT take payment
  END IF;
  RETURN remaining;
END $$;

-- Backend (service role) only. Locked away from browsers.
REVOKE ALL ON FUNCTION public.reserve_stock(text, uuid, integer) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------
-- SECTION 6: VERIFICATION (run these, expect the listed results)
-- ---------------------------------------------------------------
-- Expect rowsecurity = true for orders, escrow_ledger, webhook_events:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname='public' AND tablename IN ('orders','escrow_ledger','webhook_events');
--
-- Expect 2 policies on orders, 1 on escrow_ledger:
--   SELECT tablename, policyname FROM pg_policies
--   WHERE tablename IN ('orders','escrow_ledger') ORDER BY 1,2;
--
-- Escrow state machine self-test (expect the UPDATE to FAIL loudly):
--   -- INSERT INTO escrow_ledger (order_id, buyer_id, amount_xaf)
--   --   VALUES ('<any real order uuid>', '<any profile uuid>', 1000);
--   -- UPDATE escrow_ledger SET status='RELEASED' WHERE status='PENDING_FUNDS';
--   --   ^ must raise: illegal escrow transition PENDING_FUNDS -> RELEASED

-- ---------------------------------------------------------------
-- ROLLBACK (only if something breaks; uncomment and run)
-- ---------------------------------------------------------------
-- DROP POLICY IF EXISTS orders_select_own ON public.orders;
-- DROP POLICY IF EXISTS orders_insert_own ON public.orders;
-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS orders_payment_reference_unique;
-- DROP TABLE IF EXISTS public.webhook_events;
-- DROP TRIGGER IF EXISTS trg_escrow_transition ON public.escrow_ledger;
-- DROP FUNCTION IF EXISTS public.enforce_escrow_transition();
-- DROP TABLE IF EXISTS public.escrow_ledger;
-- DROP FUNCTION IF EXISTS public.reserve_stock(text, uuid, integer);
-- (stock_quantity columns are harmless; leave them.)
