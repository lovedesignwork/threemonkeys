-- =====================================================================
-- Migration 011: Booking + payment origin tracking
-- =====================================================================
-- Mirrors what Baboon Phuket tracks so OneBooking dashboard sees the same
-- shape of data for all websites:
--   * booking_origin_* — where the customer was when they booked
--     (IP + country, populated by create-payment-intent via ip-api.com)
--   * payment_origin_* — where the payment card is issued
--     (populated by the Stripe webhook from payment_method.card.country)
--
-- Both are nullable. Old bookings stay NULL.
-- =====================================================================

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_origin_ip TEXT,
  ADD COLUMN IF NOT EXISTS booking_origin_country_code TEXT,
  ADD COLUMN IF NOT EXISTS booking_origin_country_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_origin_country_code TEXT,
  ADD COLUMN IF NOT EXISTS payment_origin_country_name TEXT;

COMMENT ON COLUMN public.bookings.booking_origin_ip
  IS 'Client IP captured at create-payment-intent (Vercel x-forwarded-for chain)';
COMMENT ON COLUMN public.bookings.booking_origin_country_code
  IS 'ISO 2-letter country code from ip-api.com lookup of booking_origin_ip';
COMMENT ON COLUMN public.bookings.booking_origin_country_name
  IS 'Country name from ip-api.com lookup';
COMMENT ON COLUMN public.bookings.payment_origin_country_code
  IS 'ISO 2-letter card-issuer country from Stripe payment_method.card.country';
COMMENT ON COLUMN public.bookings.payment_origin_country_name
  IS 'Country name mapped from payment_origin_country_code';

CREATE INDEX IF NOT EXISTS idx_bookings_origin_country
  ON public.bookings(booking_origin_country_code)
  WHERE booking_origin_country_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_payment_country
  ON public.bookings(payment_origin_country_code)
  WHERE payment_origin_country_code IS NOT NULL;
