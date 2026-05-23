-- =====================================================================
-- Migration 008: Align admin_users schema with what the codebase expects
-- =====================================================================
-- The application code (AdminUser type in lib/supabase/auth.ts, the admin
-- users page, create-user/update-user/delete-user routes, the blog author
-- join, and the layout display) all reference two column names that did
-- not exist in the deployed schema:
--   - user_id  (referencing auth.users.id; same value as admin_users.id)
--   - full_name (was called `name`)
--
-- This migration brings the schema in line with the code, so every admin
-- code path works without needing per-file patches.
--
-- Idempotent: safe to re-apply.
-- =====================================================================

-- 1) Rename `name` → `full_name`
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_users' AND column_name='name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_users' AND column_name='full_name') THEN
    ALTER TABLE public.admin_users RENAME COLUMN name TO full_name;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_users' AND column_name='full_name') THEN
    ALTER TABLE public.admin_users ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- 2) Add `user_id` column that mirrors `id` (admin_users.id == auth.users.id).
-- The legacy code structure expects user_id as a separate FK column even though
-- our PK is already the auth user id. We keep them in sync.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_users' AND column_name='user_id') THEN
    ALTER TABLE public.admin_users ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Backfill user_id from id for any rows missing it
UPDATE public.admin_users SET user_id = id WHERE user_id IS NULL;

-- Make user_id NOT NULL once backfilled
ALTER TABLE public.admin_users ALTER COLUMN user_id SET NOT NULL;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- 3) Trigger to keep user_id == id on any insert/update so the two columns
-- can never drift. (Both reference the same auth user.)
CREATE OR REPLACE FUNCTION public.admin_users_sync_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL OR NEW.user_id IS DISTINCT FROM NEW.id THEN
    NEW.user_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_users_sync_user_id_trigger ON public.admin_users;
CREATE TRIGGER admin_users_sync_user_id_trigger
  BEFORE INSERT OR UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.admin_users_sync_user_id();
