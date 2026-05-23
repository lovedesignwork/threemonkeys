-- Migration: Switch booking_ref format to sequential 3M-000001
-- =====================================================================
-- Replaces the random 3M{YYMMDD}{4chars} format with a clean
-- monotonically-increasing 3M-000001 reference, padded to 6 digits.

-- 1. Re-use (or create) the booking number sequence.
CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START WITH 1;

-- 2. Reset sequence to one above the highest existing 3M-NNNNNN booking_ref
--    so future inserts continue from there. If no rows match, sequence
--    starts at 1.
DO $$
DECLARE
  max_num INTEGER := 0;
  current_ref TEXT;
  extracted_num INTEGER;
BEGIN
  FOR current_ref IN
    SELECT booking_ref
    FROM public.bookings
    WHERE booking_ref ~ '^3M-[0-9]+$'
  LOOP
    BEGIN
      extracted_num := CAST(SUBSTRING(current_ref FROM 4) AS INTEGER);
      IF extracted_num > max_num THEN
        max_num := extracted_num;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;

  IF max_num > 0 THEN
    PERFORM setval('booking_ref_seq', max_num);
  END IF;
END $$;

-- 3. Replace the booking_ref generator with the sequential version.
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('booking_ref_seq');
  NEW.booking_ref := '3M-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure trigger is in place.
DROP TRIGGER IF EXISTS generate_booking_ref_trigger ON public.bookings;
CREATE TRIGGER generate_booking_ref_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL)
  EXECUTE FUNCTION generate_booking_ref();

-- 5. Permissions
GRANT USAGE, SELECT ON SEQUENCE booking_ref_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE booking_ref_seq TO service_role;

-- 6. Backfill any existing bookings that aren't yet in the new format
--    so the admin/customer UI and Stripe metadata stay consistent.
DO $$
DECLARE
  booking_record RECORD;
  next_num INTEGER;
BEGIN
  FOR booking_record IN
    SELECT id
    FROM public.bookings
    WHERE booking_ref IS NULL OR booking_ref !~ '^3M-[0-9]+$'
    ORDER BY created_at ASC
  LOOP
    next_num := nextval('booking_ref_seq');
    UPDATE public.bookings
    SET booking_ref = '3M-' || LPAD(next_num::TEXT, 6, '0')
    WHERE id = booking_record.id;
  END LOOP;
END $$;
