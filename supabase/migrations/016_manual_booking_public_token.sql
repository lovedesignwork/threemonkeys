-- =====================================================================
-- Migration 016: Public e-ticket token for MANUAL bookings
-- =====================================================================
-- Every manual booking (booking_id IS NULL) gets a short, unguessable
-- token used in its public "online ticket" URL:
--
--   https://threemonkeysphuket.com/reservation/<public_token>/<seq>
--   e.g. https://threemonkeysphuket.com/reservation/ngsmhfz/000236
--
-- The <seq> portion is cosmetic (the running number from booking_ref);
-- lookups are keyed on the unguessable public_token so the running
-- number cannot be used to enumerate other customers' tickets.
-- =====================================================================

-- 1. Column.
ALTER TABLE public.tm_allotments
  ADD COLUMN IF NOT EXISTS public_token TEXT;

-- 2. Random token generator.
--    Lowercase letters + digits, ambiguous characters (l, 1, 0, o) removed.
--    8 chars over a 32-char alphabet ≈ 1.1e12 combinations.
CREATE OR REPLACE FUNCTION public.tm_gen_public_token(p_len INT DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  alphabet TEXT := 'abcdefghijkmnpqrstuvwxyz23456789';
  result   TEXT := '';
  i        INT;
BEGIN
  FOR i IN 1..p_len LOOP
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. Trigger: assign a unique token to new manual rows.
CREATE OR REPLACE FUNCTION public.tm_assign_public_token()
RETURNS TRIGGER AS $$
DECLARE
  candidate TEXT;
BEGIN
  LOOP
    candidate := public.tm_gen_public_token(8);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.tm_allotments WHERE public_token = candidate
    );
  END LOOP;
  NEW.public_token := candidate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tm_assign_public_token_trg ON public.tm_allotments;
CREATE TRIGGER tm_assign_public_token_trg
  BEFORE INSERT ON public.tm_allotments
  FOR EACH ROW
  WHEN (NEW.booking_id IS NULL AND NEW.public_token IS NULL)
  EXECUTE FUNCTION public.tm_assign_public_token();

-- 4. Backfill existing manual bookings without a token.
DO $$
DECLARE
  rec       RECORD;
  candidate TEXT;
BEGIN
  FOR rec IN
    SELECT id FROM public.tm_allotments
    WHERE booking_id IS NULL AND public_token IS NULL
  LOOP
    LOOP
      candidate := public.tm_gen_public_token(8);
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.tm_allotments WHERE public_token = candidate
      );
    END LOOP;
    UPDATE public.tm_allotments SET public_token = candidate WHERE id = rec.id;
  END LOOP;
END $$;

-- 5. Enforce uniqueness.
CREATE UNIQUE INDEX IF NOT EXISTS tm_allotments_public_token_uidx
  ON public.tm_allotments (public_token)
  WHERE public_token IS NOT NULL;
