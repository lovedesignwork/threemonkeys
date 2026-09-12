import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireSuperAdmin, isAuthError } from '@/lib/auth/api-auth';
import { userStatusSchema } from '@/lib/auth/user-management';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const parsed = userStatusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { id, is_active } = parsed.data;

    const { data: target, error: lookupError } = await supabaseAdmin
      .from('admin_users')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
    }
    if (!target) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }
    // Match edit/delete protection and avoid concurrent bans disabling every superadmin.
    if (!is_active && (id === auth.user?.id || target.role === 'superadmin')) {
      return NextResponse.json({ error: 'Cannot disable superadmin accounts' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ is_active })
      .eq('id', id);

    if (error) {
      console.error('Error updating admin user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin users PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
