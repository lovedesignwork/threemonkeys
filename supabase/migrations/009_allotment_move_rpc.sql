-- =====================================================================
-- Migration 009: tm_move_allotment RPC
-- =====================================================================
-- Atomically moves an existing allotment to a new zone/time/table.
-- The whole thing runs in a single transaction so if the destination
-- is full or invalid, the original block is preserved (Postgres rolls
-- back the DELETE).
--
-- Used by the admin allotment page when staff drags or "Moves" a
-- booked table to another slot.
-- =====================================================================

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
  -- 1. Load + lock the existing block
  SELECT * INTO v_old FROM tm_allotments WHERE id = p_allotment_id FOR UPDATE;
  IF v_old.id IS NULL THEN
    RAISE EXCEPTION 'TM_ALLOTMENT_NOT_FOUND: %', p_allotment_id;
  END IF;

  -- 2. Resolve the destination zone's block duration
  SELECT block_minutes INTO v_block_minutes
  FROM tm_zones WHERE id = p_new_zone_id AND is_active = true;
  IF v_block_minutes IS NULL THEN
    RAISE EXCEPTION 'TM_ZONE_NOT_FOUND: %', p_new_zone_id;
  END IF;
  v_end := p_new_start_at + (v_block_minutes || ' minutes')::INTERVAL;

  -- 3. Delete old block FIRST so the destination check doesn't see ourselves
  DELETE FROM tm_allotments WHERE id = p_allotment_id;

  -- 4. Pick target table (auto if not specified)
  IF p_new_table_code IS NULL THEN
    SELECT t.table_code INTO v_target_table
    FROM tm_tables t
    WHERE t.zone_id = p_new_zone_id AND t.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM tm_allotments a
        WHERE a.zone_id = p_new_zone_id
          AND a.table_code = t.table_code
          AND a.start_at < v_end
          AND a.end_at   > p_new_start_at
      )
    ORDER BY t.display_order ASC, t.table_code ASC
    FOR UPDATE OF t
    LIMIT 1;

    IF v_target_table IS NULL THEN
      RAISE EXCEPTION 'TM_ALLOTMENT_FULL: zone=% start=%', p_new_zone_id, p_new_start_at;
    END IF;
  ELSE
    -- Verify specified table belongs to the zone
    IF NOT EXISTS (
      SELECT 1 FROM tm_tables WHERE zone_id = p_new_zone_id AND table_code = p_new_table_code AND is_active = true
    ) THEN
      RAISE EXCEPTION 'TM_TABLE_NOT_FOUND: zone=% table=%', p_new_zone_id, p_new_table_code;
    END IF;

    -- Verify it's free at the new time
    IF EXISTS (
      SELECT 1 FROM tm_allotments
      WHERE zone_id = p_new_zone_id
        AND table_code = p_new_table_code
        AND start_at < v_end
        AND end_at   > p_new_start_at
    ) THEN
      RAISE EXCEPTION 'TM_TABLE_TAKEN: zone=% table=% start=%', p_new_zone_id, p_new_table_code, p_new_start_at;
    END IF;
    v_target_table := p_new_table_code;
  END IF;

  -- 5. Insert new block with the SAME metadata
  INSERT INTO tm_allotments (
    zone_id, table_code, start_at, end_at, source, booking_id,
    customer_name, guest_count, notes, created_by
  )
  VALUES (
    p_new_zone_id, v_target_table, p_new_start_at, v_end, v_old.source, v_old.booking_id,
    v_old.customer_name, v_old.guest_count, v_old.notes, v_old.created_by
  )
  RETURNING id INTO v_new_id;

  -- 6. Keep bookings.zone_id + table_code in sync if linked
  IF v_old.booking_id IS NOT NULL THEN
    UPDATE bookings
    SET zone_id = p_new_zone_id, table_code = v_target_table
    WHERE id = v_old.booking_id;
  END IF;

  allotment_id := v_new_id;
  table_code   := v_target_table;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_move_allotment(UUID, TEXT, TIMESTAMPTZ, TEXT) TO service_role, authenticated;
