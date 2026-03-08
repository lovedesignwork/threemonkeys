-- Add Super Admin User
-- Run this SQL in Supabase SQL Editor

INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
  '01a1635a-ac0e-4b96-a83b-94ffcc04a681',
  'superadmin@threemonkeysphuket.com',
  'Super Admin',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();
