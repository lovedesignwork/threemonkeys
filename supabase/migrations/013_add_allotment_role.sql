-- =====================================================================
-- Migration 013: Add `allotment` role
-- =====================================================================
-- A new restricted role that can only access /admin/allotment in the
-- dashboard. Existing roles (superadmin, admin, staff, writer) are
-- preserved.
-- =====================================================================

ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('superadmin', 'admin', 'staff', 'writer', 'allotment'));
