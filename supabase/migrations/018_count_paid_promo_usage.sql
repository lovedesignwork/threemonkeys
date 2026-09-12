-- Promo usage belongs to a successful payment, not an abandoned checkout.
-- Apply together with the checkout code change during a checkout maintenance
-- window: old code increments before payment, new code relies on this trigger.
-- Do not deploy one half while the other version is still accepting checkouts.
-- This migration intentionally preserves historical current_uses counts; old
-- pending promo bookings have already consumed a use and must not count again.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings'
      AND column_name = 'promo_usage_counted'
  ) THEN
    ALTER TABLE public.bookings
      ADD COLUMN promo_usage_counted BOOLEAN NOT NULL DEFAULT false;
    UPDATE public.bookings
      SET promo_usage_counted = true
      WHERE promo_code_id IS NOT NULL AND COALESCE(discount_amount, 0) > 0;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.count_paid_booking_promo_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- A booking row update is serialized by PostgreSQL. Both Stripe success
  -- event types and any retry therefore see the marker from the first update.
  -- Keep the marker across payment failures, cancellation and refund updates.
  NEW.promo_usage_counted := OLD.promo_usage_counted;
  IF NOT OLD.promo_usage_counted
     AND NEW.status = 'confirmed'
     AND NEW.stripe_payment_intent_id IS NOT NULL
     AND NEW.promo_code_id IS NOT NULL
     AND COALESCE(NEW.discount_amount, 0) > 0 THEN
    UPDATE public.promo_codes
      SET current_uses = COALESCE(current_uses, 0) + 1
      WHERE id = NEW.promo_code_id;
    NEW.promo_usage_counted := true;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS count_paid_booking_promo_usage_trigger ON public.bookings;
CREATE TRIGGER count_paid_booking_promo_usage_trigger
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.count_paid_booking_promo_usage();

REVOKE ALL ON FUNCTION public.count_paid_booking_promo_usage() FROM PUBLIC;

COMMENT ON COLUMN public.bookings.promo_usage_counted IS
  'Persistent, atomic marker preventing duplicate promo counts on payment webhook retries.';

COMMIT;
