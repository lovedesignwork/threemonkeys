-- Run only in the isolated checkout_regression database. This creates a
-- minimal synthetic schema, never connects to the app's configured database.
\set ON_ERROR_STOP on
DO $$ BEGIN
  IF current_database() <> 'checkout_regression' THEN
    RAISE EXCEPTION 'This fixture requires the isolated checkout_regression database';
  END IF;
END $$;

CREATE TABLE public.promo_codes (id UUID PRIMARY KEY, current_uses INTEGER DEFAULT 0);
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY,
  promo_code_id UUID REFERENCES public.promo_codes(id),
  discount_amount NUMERIC,
  status TEXT,
  stripe_payment_intent_id TEXT
);

INSERT INTO public.promo_codes VALUES ('11111111-1111-4111-8111-111111111111', 1);
INSERT INTO public.bookings VALUES (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111', 400, 'pending', 'pi_legacy_fixture'
);

\ir ../supabase/migrations/018_count_paid_promo_usage.sql

-- Historical pending checkouts were counted by the old application already.
UPDATE public.bookings SET status = 'confirmed' WHERE id = '22222222-2222-4222-8222-222222222222';
DO $$ BEGIN
  IF (SELECT current_uses FROM public.promo_codes WHERE id = '11111111-1111-4111-8111-111111111111') <> 1 THEN
    RAISE EXCEPTION 'Historical promo use counted twice';
  END IF;
END $$;

INSERT INTO public.bookings (id, promo_code_id, discount_amount, status) VALUES (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111', 400, 'pending'
);
-- Reapplying the migration must not mark new unpaid rows as counted.
\ir ../supabase/migrations/018_count_paid_promo_usage.sql

UPDATE public.bookings SET status = 'cancelled' WHERE id = '33333333-3333-4333-8333-333333333333';
UPDATE public.bookings SET status = 'confirmed' WHERE id = '33333333-3333-4333-8333-333333333333';
DO $$ BEGIN
  IF (SELECT current_uses FROM public.promo_codes WHERE id = '11111111-1111-4111-8111-111111111111') <> 1 THEN
    RAISE EXCEPTION 'Unpaid or failed checkout consumed a promo';
  END IF;
END $$;

UPDATE public.bookings SET status = 'confirmed', stripe_payment_intent_id = 'pi_new_fixture' WHERE id = '33333333-3333-4333-8333-333333333333';
UPDATE public.bookings SET status = 'confirmed' WHERE id = '33333333-3333-4333-8333-333333333333';
UPDATE public.bookings SET status = 'refunded' WHERE id = '33333333-3333-4333-8333-333333333333';
UPDATE public.bookings SET status = 'confirmed' WHERE id = '33333333-3333-4333-8333-333333333333';
DO $$ BEGIN
  IF (SELECT current_uses FROM public.promo_codes WHERE id = '11111111-1111-4111-8111-111111111111') <> 2 THEN
    RAISE EXCEPTION 'Payment replay changed the promo count';
  END IF;
  IF NOT (SELECT promo_usage_counted FROM public.bookings WHERE id = '33333333-3333-4333-8333-333333333333') THEN
    RAISE EXCEPTION 'Missing persistent promo marker';
  END IF;
END $$;

-- The runner uses this row for two concurrent success updates.
INSERT INTO public.promo_codes VALUES ('44444444-4444-4444-8444-444444444444', 0);
INSERT INTO public.bookings (id, promo_code_id, discount_amount, status, stripe_payment_intent_id) VALUES (
  '55555555-5555-4555-8555-555555555555',
  '44444444-4444-4444-8444-444444444444', 400, 'pending', 'pi_concurrency_fixture'
);
SELECT 'Sequential promo migration assertions passed' AS result;
