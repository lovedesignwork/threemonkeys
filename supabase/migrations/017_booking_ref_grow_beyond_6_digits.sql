-- Booking refs keep 6-digit padding but GROW past 999999 instead of being
-- truncated by LPAD (lpad('1000000',6,'0') = '100000' would collide).
CREATE OR REPLACE FUNCTION public.generate_booking_ref()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('booking_ref_seq');
  -- Min 6 digits, never truncate: 999999 -> 3M-999999, 1000000 -> 3M-1000000.
  NEW.booking_ref := '3M-' || LPAD(next_num::TEXT, GREATEST(6, length(next_num::TEXT)), '0');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tm_assign_manual_booking_ref()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_num BIGINT;
BEGIN
  next_num := nextval('public.tm_manual_booking_ref_seq');
  NEW.booking_ref := '3M-S-' || LPAD(next_num::TEXT, GREATEST(6, length(next_num::TEXT)), '0');
  RETURN NEW;
END;
$function$;
