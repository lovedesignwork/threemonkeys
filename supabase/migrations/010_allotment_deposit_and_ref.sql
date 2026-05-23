-- =====================================================================
-- Migration 010: Add deposit_amount + booking_ref to tm_allotments
-- =====================================================================
-- We denormalise the customer's deposit (what they paid) and the booking
-- reference number onto every allotment row so the admin timeline can
-- show them at a glance without joining the bookings table.
--
-- For website bookings, both are populated automatically when the Stripe
-- webhook claims a table (from bookings.total_amount + bookings.booking_ref).
--
-- For manual blocks (phone / email / walk-in), the admin can enter a
-- deposit amount when blocking — useful when the customer paid cash for
-- a phone reservation, for example.
-- =====================================================================

ALTER TABLE public.tm_allotments
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS booking_ref TEXT;

-- ---------------------------------------------------------------------
-- Backfill from bookings for any allotments already linked
-- ---------------------------------------------------------------------
UPDATE public.tm_allotments a
SET deposit_amount = b.total_amount,
    booking_ref    = b.booking_ref
FROM public.bookings b
WHERE a.booking_id = b.id
  AND a.booking_ref IS NULL;

-- ---------------------------------------------------------------------
-- Re-create tm_claim_table with the new optional params
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.tm_claim_table(TEXT, UUID, TIMESTAMPTZ, TEXT, TEXT, INTEGER, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.tm_claim_table(
  p_zone_id        TEXT,
  p_booking_id     UUID,
  p_start_at       TIMESTAMPTZ,
  p_source         TEXT DEFAULT 'website',
  p_customer_name  TEXT DEFAULT NULL,
  p_guest_count    INTEGER DEFAULT NULL,
  p_notes          TEXT DEFAULT NULL,
  p_created_by     UUID DEFAULT NULL,
  p_deposit_amount NUMERIC DEFAULT NULL,
  p_booking_ref    TEXT DEFAULT NULL
)
RETURNS TABLE (allotment_id UUID, table_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_block_minutes INTEGER;
  v_end_at        TIMESTAMPTZ;
  v_table_code    TEXT;
  v_allotment_id  UUID;
  v_deposit       NUMERIC := p_deposit_amount;
  v_ref           TEXT    := p_booking_ref;
BEGIN
  SELECT block_minutes INTO v_block_minutes FROM tm_zones WHERE id = p_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_zone_id; END IF;

  v_end_at := p_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  -- If linked to a booking and caller didn't supply deposit/ref, auto-fill
  IF p_booking_id IS NOT NULL AND (v_deposit IS NULL OR v_ref IS NULL) THEN
    SELECT COALESCE(v_deposit, b.total_amount),
           COALESCE(v_ref, b.booking_ref)
    INTO v_deposit, v_ref
    FROM bookings b WHERE b.id = p_booking_id;
  END IF;

  SELECT t.table_code INTO v_table_code
  FROM tm_tables t
  WHERE t.zone_id = p_zone_id AND t.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM tm_allotments a
      WHERE a.zone_id = p_zone_id AND a.table_code = t.table_code
        AND a.start_at < v_end_at AND a.end_at > p_start_at
    )
  ORDER BY t.display_order ASC, t.table_code ASC
  FOR UPDATE OF t LIMIT 1;

  IF v_table_code IS NULL THEN
    RAISE EXCEPTION 'TM_ALLOTMENT_FULL: zone=% start=%', p_zone_id, p_start_at;
  END IF;

  INSERT INTO tm_allotments (
    zone_id, table_code, start_at, end_at, source, booking_id,
    customer_name, guest_count, notes, created_by, deposit_amount, booking_ref
  )
  VALUES (
    p_zone_id, v_table_code, p_start_at, v_end_at, p_source, p_booking_id,
    p_customer_name, p_guest_count, p_notes, p_created_by, v_deposit, v_ref
  )
  RETURNING id INTO v_allotment_id;

  IF p_booking_id IS NOT NULL THEN
    UPDATE bookings SET zone_id = p_zone_id, table_code = v_table_code WHERE id = p_booking_id;
  END IF;

  allotment_id := v_allotment_id;
  table_code   := v_table_code;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_claim_table(TEXT, UUID, TIMESTAMPTZ, TEXT, TEXT, INTEGER, TEXT, UUID, NUMERIC, TEXT)
  TO service_role;

-- ---------------------------------------------------------------------
-- Re-create tm_block_table_manual with new optional deposit_amount
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.tm_block_table_manual(TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, INTEGER, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.tm_block_table_manual(
  p_zone_id        TEXT,
  p_table_code     TEXT DEFAULT NULL,
  p_start_at       TIMESTAMPTZ DEFAULT NULL,
  p_source         TEXT DEFAULT 'admin',
  p_customer_name  TEXT DEFAULT NULL,
  p_guest_count    INTEGER DEFAULT NULL,
  p_notes          TEXT DEFAULT NULL,
  p_created_by     UUID DEFAULT NULL,
  p_deposit_amount NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_block_minutes INTEGER;
  v_end_at        TIMESTAMPTZ;
  v_table_code    TEXT;
  v_allotment_id  UUID;
  v_table_exists  BOOLEAN;
  v_conflict      INTEGER;
BEGIN
  IF p_start_at IS NULL THEN RAISE EXCEPTION 'TM_START_AT_REQUIRED'; END IF;
  IF p_source IS NULL OR p_source NOT IN ('website','phone','email','walk_in','admin','other') THEN
    RAISE EXCEPTION 'TM_INVALID_SOURCE: %', p_source;
  END IF;

  SELECT block_minutes INTO v_block_minutes FROM tm_zones WHERE id = p_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_zone_id; END IF;
  v_end_at := p_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  IF p_table_code IS NULL THEN
    SELECT t.table_code INTO v_table_code
    FROM tm_tables t
    WHERE t.zone_id = p_zone_id AND t.is_active = true
      AND NOT EXISTS (SELECT 1 FROM tm_allotments a
        WHERE a.zone_id = p_zone_id AND a.table_code = t.table_code
          AND a.start_at < v_end_at AND a.end_at > p_start_at)
    ORDER BY t.display_order ASC, t.table_code ASC
    FOR UPDATE OF t LIMIT 1;
    IF v_table_code IS NULL THEN RAISE EXCEPTION 'TM_ALLOTMENT_FULL: zone=% start=%', p_zone_id, p_start_at; END IF;
  ELSE
    SELECT EXISTS (SELECT 1 FROM tm_tables WHERE zone_id = p_zone_id AND table_code = p_table_code AND is_active = true) INTO v_table_exists;
    IF NOT v_table_exists THEN RAISE EXCEPTION 'TM_TABLE_NOT_FOUND: zone=% table=%', p_zone_id, p_table_code; END IF;
    SELECT COUNT(*) INTO v_conflict FROM tm_allotments
      WHERE zone_id = p_zone_id AND table_code = p_table_code
        AND start_at < v_end_at AND end_at > p_start_at;
    IF v_conflict > 0 THEN RAISE EXCEPTION 'TM_TABLE_TAKEN: zone=% table=% start=%', p_zone_id, p_table_code, p_start_at; END IF;
    v_table_code := p_table_code;
  END IF;

  INSERT INTO tm_allotments (
    zone_id, table_code, start_at, end_at, source, customer_name,
    guest_count, notes, created_by, deposit_amount
  )
  VALUES (
    p_zone_id, v_table_code, p_start_at, v_end_at, p_source, p_customer_name,
    p_guest_count, p_notes, p_created_by, p_deposit_amount
  )
  RETURNING id INTO v_allotment_id;

  RETURN v_allotment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_block_table_manual(TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, INTEGER, TEXT, UUID, NUMERIC)
  TO service_role, authenticated;

-- ---------------------------------------------------------------------
-- tm_move_allotment already copies all metadata via v_old — just add the
-- two new columns to its INSERT.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tm_move_allotment(
  p_allotment_id   UUID,
  p_new_zone_id    TEXT,
  p_new_start_at   TIMESTAMPTZ,
  p_new_table_code TEXT DEFAULT NULL
)
RETURNS TABLE (allotment_id UUID, table_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old           tm_allotments%ROWTYPE;
  v_block_minutes INTEGER;
  v_end           TIMESTAMPTZ;
  v_target_table  TEXT;
  v_new_id        UUID;
BEGIN
  SELECT * INTO v_old FROM tm_allotments WHERE id = p_allotment_id FOR UPDATE;
  IF v_old.id IS NULL THEN RAISE EXCEPTION 'TM_ALLOTMENT_NOT_FOUND: %', p_allotment_id; END IF;

  SELECT block_minutes INTO v_block_minutes FROM tm_zones WHERE id = p_new_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_new_zone_id; END IF;
  v_end := p_new_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  DELETE FROM tm_allotments WHERE id = p_allotment_id;

  IF p_new_table_code IS NULL THEN
    SELECT t.table_code INTO v_target_table
    FROM tm_tables t
    WHERE t.zone_id = p_new_zone_id AND t.is_active = true
      AND NOT EXISTS (SELECT 1 FROM tm_allotments a
        WHERE a.zone_id = p_new_zone_id AND a.table_code = t.table_code
          AND a.start_at < v_end AND a.end_at > p_new_start_at)
    ORDER BY t.display_order ASC, t.table_code ASC
    FOR UPDATE OF t LIMIT 1;
    IF v_target_table IS NULL THEN RAISE EXCEPTION 'TM_ALLOTMENT_FULL: zone=% start=%', p_new_zone_id, p_new_start_at; END IF;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM tm_tables WHERE zone_id = p_new_zone_id AND table_code = p_new_table_code AND is_active = true) THEN
      RAISE EXCEPTION 'TM_TABLE_NOT_FOUND: zone=% table=%', p_new_zone_id, p_new_table_code;
    END IF;
    IF EXISTS (SELECT 1 FROM tm_allotments
      WHERE zone_id = p_new_zone_id AND table_code = p_new_table_code
        AND start_at < v_end AND end_at > p_new_start_at) THEN
      RAISE EXCEPTION 'TM_TABLE_TAKEN: zone=% table=% start=%', p_new_zone_id, p_new_table_code, p_new_start_at;
    END IF;
    v_target_table := p_new_table_code;
  END IF;

  INSERT INTO tm_allotments (
    zone_id, table_code, start_at, end_at, source, booking_id, customer_name,
    guest_count, notes, created_by, deposit_amount, booking_ref
  )
  VALUES (
    p_new_zone_id, v_target_table, p_new_start_at, v_end, v_old.source, v_old.booking_id, v_old.customer_name,
    v_old.guest_count, v_old.notes, v_old.created_by, v_old.deposit_amount, v_old.booking_ref
  )
  RETURNING id INTO v_new_id;

  IF v_old.booking_id IS NOT NULL THEN
    UPDATE bookings SET zone_id = p_new_zone_id, table_code = v_target_table WHERE id = v_old.booking_id;
  END IF;

  allotment_id := v_new_id;
  table_code   := v_target_table;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_move_allotment(UUID, TEXT, TIMESTAMPTZ, TEXT) TO service_role, authenticated;
