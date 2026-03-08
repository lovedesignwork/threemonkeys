-- Update booking reference prefix from FH to 3M for Three Monkeys Restaurant
-- Run this migration to change the booking reference prefix

-- Function to generate booking reference with 3M prefix
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
DECLARE
  new_ref TEXT;
  ref_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference: 3M + date (YYMMDD) + random 4 chars
    new_ref := '3M' || TO_CHAR(NOW(), 'YYMMDD') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if this ref already exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_ref = new_ref) INTO ref_exists;
    
    -- If not exists, use it
    IF NOT ref_exists THEN
      NEW.booking_ref := new_ref;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS generate_booking_ref_trigger ON bookings;
CREATE TRIGGER generate_booking_ref_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL)
  EXECUTE FUNCTION generate_booking_ref();
