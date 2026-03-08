-- Migration: Update booking reference format to FH-000001 sequential
-- =====================================================================

-- Create a sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START WITH 1;

-- Get the current max booking number from existing bookings (if any)
DO $$
DECLARE
  max_num INTEGER := 0;
  current_ref TEXT;
  extracted_num INTEGER;
BEGIN
  -- Check for existing FH-XXXXXX format bookings
  FOR current_ref IN SELECT booking_ref FROM bookings WHERE booking_ref LIKE 'FH-%' LOOP
    BEGIN
      extracted_num := CAST(SUBSTRING(current_ref FROM 4) AS INTEGER);
      IF extracted_num > max_num THEN
        max_num := extracted_num;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Skip non-numeric refs
      CONTINUE;
    END;
  END LOOP;
  
  -- Also check for old format (FH260221XXXX) and count them
  SELECT COUNT(*) INTO extracted_num FROM bookings WHERE booking_ref LIKE 'FH%' AND booking_ref NOT LIKE 'FH-%';
  IF extracted_num > max_num THEN
    max_num := extracted_num;
  END IF;
  
  -- Set sequence to start after the highest existing number
  IF max_num > 0 THEN
    PERFORM setval('booking_ref_seq', max_num);
  END IF;
END $$;

-- Update the booking reference generation function
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
DECLARE
  new_ref TEXT;
  next_num INTEGER;
BEGIN
  -- Get next sequence value
  next_num := nextval('booking_ref_seq');
  
  -- Format as FH-000001 (6 digit padded)
  new_ref := 'FH-' || LPAD(next_num::TEXT, 6, '0');
  
  NEW.booking_ref := new_ref;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS generate_booking_ref_trigger ON bookings;
CREATE TRIGGER generate_booking_ref_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL)
  EXECUTE FUNCTION generate_booking_ref();

-- Grant permissions
GRANT USAGE, SELECT ON SEQUENCE booking_ref_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE booking_ref_seq TO service_role;
