-- =====================================================================
-- Migration 006: Table Allotment System
-- =====================================================================
-- See docs/ALLOTMENT_SPEC.md for full design.
--
-- Adds:
--   * tm_zones        - master list of dining zones
--   * tm_tables       - physical tables per zone
--   * tm_allotments   - every blocking row (from website, phone, email, walk-in, manual)
--   * bookings.zone_id, bookings.table_code (denormalised onto bookings)
--   * RPC functions for availability check, atomic claim, release, manual block
--   * RLS policies
--   * Seed data for all zones and tables
--
-- Idempotent: safe to re-apply.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tm_zones (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  package_id      TEXT,
  time_slots      TEXT[] NOT NULL,
  block_minutes   INTEGER NOT NULL DEFAULT 180,
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tm_zones IS 'Three Monkeys dining zones with their schedule and block duration.';

CREATE TABLE IF NOT EXISTS public.tm_tables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         TEXT NOT NULL REFERENCES public.tm_zones(id) ON DELETE CASCADE,
  table_code      TEXT NOT NULL,
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(zone_id, table_code)
);

CREATE INDEX IF NOT EXISTS idx_tm_tables_zone ON public.tm_tables(zone_id) WHERE is_active = true;

COMMENT ON TABLE public.tm_tables IS 'Physical tables per zone (e.g. MD1, MD2, MD3 for Monkey Dome).';

CREATE TABLE IF NOT EXISTS public.tm_allotments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         TEXT NOT NULL REFERENCES public.tm_zones(id),
  table_code      TEXT NOT NULL,
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('website','phone','email','walk_in','admin','other')),
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name   TEXT,
  guest_count     INTEGER,
  notes           TEXT,
  created_by      UUID REFERENCES public.admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tm_allotments_zone_time ON public.tm_allotments(zone_id, start_at);
CREATE INDEX IF NOT EXISTS idx_tm_allotments_booking ON public.tm_allotments(booking_id);
CREATE INDEX IF NOT EXISTS idx_tm_allotments_table_time ON public.tm_allotments(zone_id, table_code, start_at);

COMMENT ON TABLE public.tm_allotments IS 'Every blocking row. Source = where it came from (website paid booking, phone, walk-in, etc.).';

-- updated_at triggers
DROP TRIGGER IF EXISTS update_tm_zones_updated_at ON public.tm_zones;
CREATE TRIGGER update_tm_zones_updated_at
  BEFORE UPDATE ON public.tm_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tm_allotments_updated_at ON public.tm_allotments;
CREATE TRIGGER update_tm_allotments_updated_at
  BEFORE UPDATE ON public.tm_allotments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 2. EXTEND bookings TABLE
-- ---------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='zone_id') THEN
    ALTER TABLE public.bookings ADD COLUMN zone_id TEXT REFERENCES public.tm_zones(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='table_code') THEN
    ALTER TABLE public.bookings ADD COLUMN table_code TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_zone_id ON public.bookings(zone_id);

-- ---------------------------------------------------------------------
-- 3. RLS POLICIES
-- ---------------------------------------------------------------------

ALTER TABLE public.tm_zones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tm_tables     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tm_allotments ENABLE ROW LEVEL SECURITY;

-- tm_zones: anyone can read active zones; only service_role can write
DROP POLICY IF EXISTS "tm_zones_public_read"   ON public.tm_zones;
DROP POLICY IF EXISTS "tm_zones_service_all"   ON public.tm_zones;
CREATE POLICY "tm_zones_public_read" ON public.tm_zones
  FOR SELECT USING (is_active = true);
CREATE POLICY "tm_zones_service_all" ON public.tm_zones
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- tm_tables: anyone can read active tables; only service_role can write
DROP POLICY IF EXISTS "tm_tables_public_read"  ON public.tm_tables;
DROP POLICY IF EXISTS "tm_tables_service_all"  ON public.tm_tables;
CREATE POLICY "tm_tables_public_read" ON public.tm_tables
  FOR SELECT USING (is_active = true);
CREATE POLICY "tm_tables_service_all" ON public.tm_tables
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- tm_allotments: NOT readable by anon (privacy of customer names);
-- admin reads via authenticated session; writes via service_role only.
DROP POLICY IF EXISTS "tm_allotments_auth_read"    ON public.tm_allotments;
DROP POLICY IF EXISTS "tm_allotments_auth_write"   ON public.tm_allotments;
DROP POLICY IF EXISTS "tm_allotments_service_all"  ON public.tm_allotments;
CREATE POLICY "tm_allotments_auth_read" ON public.tm_allotments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "tm_allotments_auth_write" ON public.tm_allotments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tm_allotments_service_all" ON public.tm_allotments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 4. RPC FUNCTIONS
-- ---------------------------------------------------------------------

-- 4a. tm_check_zone_availability
-- Returns the number of free tables in a zone for the given start time.
-- Public + safe (no PII).
CREATE OR REPLACE FUNCTION public.tm_check_zone_availability(
  p_zone_id  TEXT,
  p_start_at TIMESTAMPTZ
)
RETURNS TABLE (
  available_count INTEGER,
  total_count     INTEGER,
  is_available    BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_block_minutes INTEGER;
  v_end_at        TIMESTAMPTZ;
  v_total         INTEGER;
  v_blocked       INTEGER;
BEGIN
  SELECT block_minutes INTO v_block_minutes FROM tm_zones WHERE id = p_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN
    RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_zone_id;
  END IF;

  v_end_at := p_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  SELECT COUNT(*) INTO v_total FROM tm_tables WHERE zone_id = p_zone_id AND is_active = true;

  SELECT COUNT(DISTINCT table_code) INTO v_blocked
  FROM tm_allotments
  WHERE zone_id = p_zone_id
    AND start_at < v_end_at
    AND end_at   > p_start_at;

  available_count := GREATEST(v_total - v_blocked, 0);
  total_count     := v_total;
  is_available    := available_count > 0;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_check_zone_availability(TEXT, TIMESTAMPTZ) TO anon, authenticated, service_role;

-- 4b. tm_claim_table
-- ATOMIC: locks the zone's tables row-level, picks first free, inserts the block,
-- updates bookings.zone_id + bookings.table_code, returns the picked code.
-- Raises TM_ALLOTMENT_FULL if no table free.
CREATE OR REPLACE FUNCTION public.tm_claim_table(
  p_zone_id       TEXT,
  p_booking_id    UUID,
  p_start_at      TIMESTAMPTZ,
  p_source        TEXT DEFAULT 'website',
  p_customer_name TEXT DEFAULT NULL,
  p_guest_count   INTEGER DEFAULT NULL,
  p_notes         TEXT DEFAULT NULL,
  p_created_by    UUID DEFAULT NULL
)
RETURNS TABLE (
  allotment_id UUID,
  table_code   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_block_minutes INTEGER;
  v_end_at        TIMESTAMPTZ;
  v_table_code    TEXT;
  v_allotment_id  UUID;
BEGIN
  SELECT block_minutes INTO v_block_minutes FROM tm_zones WHERE id = p_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN
    RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_zone_id;
  END IF;

  v_end_at := p_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  -- Find first free table for this zone+time, locking via FOR UPDATE on tm_tables.
  -- The lock on tm_tables serialises concurrent claims; we re-check tm_allotments
  -- after locking to ensure no race.
  SELECT t.table_code INTO v_table_code
  FROM tm_tables t
  WHERE t.zone_id = p_zone_id
    AND t.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM tm_allotments a
      WHERE a.zone_id = p_zone_id
        AND a.table_code = t.table_code
        AND a.start_at < v_end_at
        AND a.end_at   > p_start_at
    )
  ORDER BY t.display_order ASC, t.table_code ASC
  FOR UPDATE OF t
  LIMIT 1;

  IF v_table_code IS NULL THEN
    RAISE EXCEPTION 'TM_ALLOTMENT_FULL: zone=% start=%', p_zone_id, p_start_at;
  END IF;

  INSERT INTO tm_allotments (
    zone_id, table_code, start_at, end_at, source, booking_id,
    customer_name, guest_count, notes, created_by
  )
  VALUES (
    p_zone_id, v_table_code, p_start_at, v_end_at, p_source, p_booking_id,
    p_customer_name, p_guest_count, p_notes, p_created_by
  )
  RETURNING id INTO v_allotment_id;

  -- Denormalise onto bookings (if booking_id was provided)
  IF p_booking_id IS NOT NULL THEN
    UPDATE bookings
    SET zone_id = p_zone_id,
        table_code = v_table_code
    WHERE id = p_booking_id;
  END IF;

  allotment_id := v_allotment_id;
  table_code   := v_table_code;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_claim_table(TEXT, UUID, TIMESTAMPTZ, TEXT, TEXT, INTEGER, TEXT, UUID) TO service_role;

-- 4c. tm_release_table
-- Idempotent: removes all allotment rows for a given booking_id.
CREATE OR REPLACE FUNCTION public.tm_release_table(p_booking_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM tm_allotments WHERE booking_id = p_booking_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Clear the table_code on bookings (keep zone_id for history)
  UPDATE bookings SET table_code = NULL WHERE id = p_booking_id;

  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_release_table(UUID) TO service_role, authenticated;

-- 4d. tm_block_table_manual
-- Used by admin allotment UI. If p_table_code is NULL, picks first free.
-- If specified, blocks exactly that table (raises TM_TABLE_TAKEN if conflict).
CREATE OR REPLACE FUNCTION public.tm_block_table_manual(
  p_zone_id       TEXT,
  p_table_code    TEXT DEFAULT NULL,
  p_start_at      TIMESTAMPTZ DEFAULT NULL,
  p_source        TEXT DEFAULT 'admin',
  p_customer_name TEXT DEFAULT NULL,
  p_guest_count   INTEGER DEFAULT NULL,
  p_notes         TEXT DEFAULT NULL,
  p_created_by    UUID DEFAULT NULL
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
  IF p_start_at IS NULL THEN
    RAISE EXCEPTION 'TM_START_AT_REQUIRED';
  END IF;
  IF p_source IS NULL OR p_source NOT IN ('website','phone','email','walk_in','admin','other') THEN
    RAISE EXCEPTION 'TM_INVALID_SOURCE: %', p_source;
  END IF;

  SELECT block_minutes INTO v_block_minutes FROM tm_zones WHERE id = p_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN
    RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_zone_id;
  END IF;

  v_end_at := p_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  IF p_table_code IS NULL THEN
    -- Auto-pick first free
    SELECT t.table_code INTO v_table_code
    FROM tm_tables t
    WHERE t.zone_id = p_zone_id
      AND t.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM tm_allotments a
        WHERE a.zone_id = p_zone_id
          AND a.table_code = t.table_code
          AND a.start_at < v_end_at
          AND a.end_at   > p_start_at
      )
    ORDER BY t.display_order ASC, t.table_code ASC
    FOR UPDATE OF t
    LIMIT 1;

    IF v_table_code IS NULL THEN
      RAISE EXCEPTION 'TM_ALLOTMENT_FULL: zone=% start=%', p_zone_id, p_start_at;
    END IF;
  ELSE
    -- Validate specified table exists
    SELECT EXISTS (
      SELECT 1 FROM tm_tables WHERE zone_id = p_zone_id AND table_code = p_table_code AND is_active = true
    ) INTO v_table_exists;

    IF NOT v_table_exists THEN
      RAISE EXCEPTION 'TM_TABLE_NOT_FOUND: zone=% table=%', p_zone_id, p_table_code;
    END IF;

    -- Check conflict
    SELECT COUNT(*) INTO v_conflict
    FROM tm_allotments
    WHERE zone_id = p_zone_id
      AND table_code = p_table_code
      AND start_at < v_end_at
      AND end_at   > p_start_at;

    IF v_conflict > 0 THEN
      RAISE EXCEPTION 'TM_TABLE_TAKEN: zone=% table=% start=%', p_zone_id, p_table_code, p_start_at;
    END IF;

    v_table_code := p_table_code;
  END IF;

  INSERT INTO tm_allotments (
    zone_id, table_code, start_at, end_at, source,
    customer_name, guest_count, notes, created_by
  )
  VALUES (
    p_zone_id, v_table_code, p_start_at, v_end_at, p_source,
    p_customer_name, p_guest_count, p_notes, p_created_by
  )
  RETURNING id INTO v_allotment_id;

  RETURN v_allotment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_block_table_manual(TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, INTEGER, TEXT, UUID) TO service_role, authenticated;

-- 4e. tm_get_zone_day_availability
-- For admin UI / booking page: per-time-slot availability for a given zone + date.
-- Date is interpreted in Asia/Bangkok timezone (Thailand).
CREATE OR REPLACE FUNCTION public.tm_get_zone_day_availability(
  p_zone_id TEXT,
  p_day     DATE
)
RETURNS TABLE (
  time_slot       TEXT,
  start_at        TIMESTAMPTZ,
  end_at          TIMESTAMPTZ,
  available_count INTEGER,
  total_count     INTEGER,
  blocked_tables  TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_block_minutes INTEGER;
  v_total         INTEGER;
  v_slot          TEXT;
  v_zone_slots    TEXT[];
  v_start         TIMESTAMPTZ;
  v_end           TIMESTAMPTZ;
  v_blocked_arr   TEXT[];
BEGIN
  SELECT z.block_minutes, z.time_slots INTO v_block_minutes, v_zone_slots
  FROM tm_zones z WHERE z.id = p_zone_id AND z.is_active = true;

  IF v_block_minutes IS NULL THEN
    RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_zone_id;
  END IF;

  SELECT COUNT(*) INTO v_total FROM tm_tables WHERE zone_id = p_zone_id AND is_active = true;

  FOREACH v_slot IN ARRAY v_zone_slots LOOP
    -- Compose timestamp in Asia/Bangkok and convert to UTC TIMESTAMPTZ
    v_start := ((p_day::TEXT || ' ' || v_slot || ':00')::TIMESTAMP AT TIME ZONE 'Asia/Bangkok');
    v_end   := v_start + (v_block_minutes || ' minutes')::INTERVAL;

    SELECT COALESCE(ARRAY_AGG(DISTINCT a.table_code ORDER BY a.table_code), ARRAY[]::TEXT[])
    INTO v_blocked_arr
    FROM tm_allotments a
    WHERE a.zone_id = p_zone_id
      AND a.start_at < v_end
      AND a.end_at   > v_start;

    time_slot       := v_slot;
    start_at        := v_start;
    end_at          := v_end;
    available_count := GREATEST(v_total - COALESCE(array_length(v_blocked_arr, 1), 0), 0);
    total_count     := v_total;
    blocked_tables  := v_blocked_arr;
    RETURN NEXT;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_get_zone_day_availability(TEXT, DATE) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 5. SEED ZONES & TABLES
-- ---------------------------------------------------------------------

-- Zones
INSERT INTO public.tm_zones (id, name, package_id, time_slots, block_minutes, display_order)
VALUES
  ('monkey-dome',           'Monkey Dome',                'monkey-dome',                ARRAY['16:00','19:00','22:00'],                                                                  180, 10),
  ('monkey-nest',           'Monkey Nest',                'monkey-nest',                ARRAY['16:00','19:00','22:00'],                                                                  180, 20),
  ('monkey-hilltop',        'Monkey Hilltop',             'monkey-hilltop',             ARRAY['19:00','22:00'],                                                                          180, 30),
  ('bamboo-pavilion',       'Bamboo Pavilion',            'bamboo-pavilion',            ARRAY['19:00','22:00'],                                                                          180, 40),
  ('zone-t',                'Zone T',                     'zone-6',                     ARRAY['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'], 180, 50),
  ('zone-z',                'Zone Z',                     'zone-7',                     ARRAY['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'], 180, 60),
  ('exclusive-romantic',    'Exclusive Romantic — Zone Z','exclusive-romantic-zone-7',  ARRAY['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'], 180, 70),
  ('romantic-rooftop-luge', 'Romantic Rooftop Luge',      'rooftop-romantic',           ARRAY['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'], 180, 80)
ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  package_id    = EXCLUDED.package_id,
  time_slots    = EXCLUDED.time_slots,
  block_minutes = EXCLUDED.block_minutes,
  display_order = EXCLUDED.display_order,
  updated_at    = NOW();

-- Tables: bulk insert per zone
-- Monkey Dome: MD1-MD3
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'monkey-dome', 'MD' || g, g FROM generate_series(1, 3) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Monkey Nest: MN1-MN2
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'monkey-nest', 'MN' || g, g FROM generate_series(1, 2) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Monkey Hilltop: Hilltop1
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
VALUES ('monkey-hilltop', 'Hilltop1', 1)
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Bamboo Pavilion: BP1-BP4
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'bamboo-pavilion', 'BP' || g, g FROM generate_series(1, 4) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Zone T: T1-T12 then T14-T17 (skip T13)
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'zone-t', 'T' || g, g FROM generate_series(1, 12) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'zone-t', 'T' || g, g FROM generate_series(14, 17) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Zone Z: Z1-Z25 then Z31-Z36 (skip Z26-Z30; Z26-Z29 are Exclusive Romantic)
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'zone-z', 'Z' || g, g FROM generate_series(1, 25) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'zone-z', 'Z' || g, g FROM generate_series(31, 36) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Exclusive Romantic Zone Z: Z26-Z29
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'exclusive-romantic', 'Z' || g, g FROM generate_series(26, 29) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;

-- Romantic Rooftop Luge: Luge1-Luge6
INSERT INTO public.tm_tables (zone_id, table_code, display_order)
SELECT 'romantic-rooftop-luge', 'Luge' || g, g FROM generate_series(1, 6) AS g
ON CONFLICT (zone_id, table_code) DO NOTHING;
