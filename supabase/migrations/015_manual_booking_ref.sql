-- =====================================================================
-- Migration 015: Sequential booking ref for MANUAL bookings
-- =====================================================================
-- Manual bookings (created by staff, booking_id IS NULL) now get their
-- own running reference in the format 3M-S-000001, 3M-S-000002, ...
-- The "S" denotes a staff/manual booking, distinct from online bookings
-- which use 3M-000001 (see migration 012).
--
-- Online-booking-backed allotments (booking_id NOT NULL) keep the booking's
-- own 3M-NNNNNN ref and are never touched by this trigger.
-- =====================================================================

-- 1. Dedicated sequence for manual booking refs.
CREATE SEQUENCE IF NOT EXISTS public.tm_manual_booking_ref_seq START WITH 1;

-- 2. Continue from the highest existing 3M-S-NNNNNN ref (if re-run).
DO $$
DECLARE
  current_ref TEXT;
  extracted   INTEGER;
  max_num     INTEGER := 0;
BEGIN
  FOR current_ref IN
    SELECT booking_ref FROM public.tm_allotments WHERE booking_ref ~ '^3M-S-[0-9]+$'
  LOOP
    BEGIN
      extracted := CAST(SUBSTRING(current_ref FROM 6) AS INTEGER);
      IF extracted > max_num THEN
        max_num := extracted;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  IF max_num > 0 THEN
    PERFORM setval('public.tm_manual_booking_ref_seq', max_num);
  END IF;
END $$;

-- 3. Trigger function: assign 3M-S-NNNNNN for manual bookings on insert.
CREATE OR REPLACE FUNCTION public.tm_assign_manual_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_ref := '3M-S-' || LPAD(nextval('public.tm_manual_booking_ref_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Fire only for genuine manual rows that don't already have a ref.
DROP TRIGGER IF EXISTS tm_assign_manual_booking_ref_trg ON public.tm_allotments;
CREATE TRIGGER tm_assign_manual_booking_ref_trg
  BEFORE INSERT ON public.tm_allotments
  FOR EACH ROW
  WHEN (NEW.booking_id IS NULL AND NEW.booking_ref IS NULL)
  EXECUTE FUNCTION public.tm_assign_manual_booking_ref();

-- 5. Backfill existing manual bookings without a ref (oldest first).
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT id
    FROM public.tm_allotments
    WHERE booking_id IS NULL AND booking_ref IS NULL
    ORDER BY created_at ASC
  LOOP
    UPDATE public.tm_allotments
    SET booking_ref = '3M-S-' || LPAD(nextval('public.tm_manual_booking_ref_seq')::TEXT, 6, '0')
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 6. Permissions.
GRANT USAGE, SELECT ON SEQUENCE public.tm_manual_booking_ref_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.tm_manual_booking_ref_seq TO service_role;
