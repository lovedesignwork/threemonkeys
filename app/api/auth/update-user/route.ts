import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAuthError, requireSuperAdmin } from '@/lib/auth/api-auth';
import { updateUserSchema } from '@/lib/auth/user-management';

export async function PUT(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { userId, fullName, role, password } = parsed.data;

    // Check if user is a superadmin (cannot modify superadmins)
    const { data: adminUser, error: lookupError } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
    }
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    if (userId === auth.user?.id || adminUser.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot modify superadmin accounts' }, { status: 403 });
    }

    // Update admin_users record
    const updateData: Record<string, string> = {};
    if (fullName) updateData.full_name = fullName;
    if (role) updateData.role = role;

    if (Object.keys(updateData).length > 0) {
      const { error: adminError } = await supabaseAdmin
        .from('admin_users')
        .update(updateData)
        .eq('id', userId);

      if (adminError) {
        console.error('Update admin user error:', adminError);
        return NextResponse.json({ error: 'Failed to update user record' }, { status: 500 });
      }
    }

    // Update password if provided
    if (password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      });

      if (authError) {
        console.error('Update password error:', authError);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
