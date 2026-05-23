import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/auth/check-admin
 *
 * Resolves whether the current request belongs to an active admin.
 *
 * Resolution order (the first match wins):
 *   1. Bearer token  → look up admin_users by auth.users.id (PK match)
 *   2. ?email query  → look up admin_users by email (case-insensitive)
 *
 * admin_users schema in this project:
 *   id (uuid, PK and matches auth.users.id) · email · name · role · is_active
 *   NOTE: there is no user_id column and no full_name column despite some
 *   legacy code references — we read `name` here and return it as `fullName`
 *   in the response so existing callers keep working.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email');

    let authUserId: string | null = null;
    let authUserEmail: string | null = null;

    // Verify Bearer token if present
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ isAdmin: false, error: 'Invalid token' });
      }
      authUserId = user.id;
      authUserEmail = user.email ?? null;
    }

    // Helper to format the admin row into the response shape callers expect
    const respond = (adminUser: { id: string; user_id: string; email: string; full_name: string | null; role: string } | null) =>
      NextResponse.json({
        isAdmin: !!adminUser,
        role: adminUser?.role || null,
        user: adminUser ? {
          id: adminUser.id,
          user_id: adminUser.user_id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          full_name: adminUser.full_name,
          role: adminUser.role,
        } : null,
      });

    // 1) Prefer id-based lookup (admin_users.id == auth.users.id)
    if (authUserId) {
      const { data: byId } = await supabaseAdmin
        .from('admin_users')
        .select('id, user_id, email, full_name, role, is_active')
        .eq('id', authUserId)
        .eq('is_active', true)
        .maybeSingle();
      if (byId) return respond(byId);
    }

    // 2) Fallback: email match (case-insensitive)
    const emailToCheck = (authUserEmail ?? queryEmail)?.toLowerCase() ?? null;
    if (emailToCheck) {
      const { data: byEmail } = await supabaseAdmin
        .from('admin_users')
        .select('id, user_id, email, full_name, role, is_active')
        .ilike('email', emailToCheck)
        .eq('is_active', true)
        .maybeSingle();
      if (byEmail) return respond(byEmail);
    }

    return NextResponse.json({ isAdmin: false, error: 'Not an admin' });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Failed to check admin status' });
  }
}
