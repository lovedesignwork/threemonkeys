-- =====================================================================
-- Migration 007: Fix admin_users role mismatch
-- =====================================================================
-- The original schema used 'super_admin' (with underscore) in the role
-- CHECK constraint and seed data, but the entire application codebase
-- (lib/supabase/auth.ts, lib/auth/api-auth.ts, app/admin/layout.tsx,
-- app/admin/users/page.tsx, etc.) checks for 'superadmin' (no underscore).
--
-- This migration:
--   1. Migrates any existing 'super_admin' rows to 'superadmin'
--   2. Replaces the CHECK constraint to use the spelling the app expects
--      and adds the 'writer' role that the app already supports
-- =====================================================================

-- Drop the old constraint
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- Migrate any existing rows (safe even if none exist)
UPDATE public.admin_users SET role = 'superadmin' WHERE role = 'super_admin';

-- Add the correct constraint matching what the app expects
ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('superadmin', 'admin', 'staff', 'writer'));
