import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAuthError, requireSuperAdmin } from '@/lib/auth/api-auth';
import { createUserSchema } from '@/lib/auth/user-management';

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const parsed = createUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { email, password, fullName, role } = parsed.data;

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Create auth user error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create admin_users record
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authUser.user.id,
        user_id: authUser.user.id,
        email: email,
        role: role,
        full_name: fullName,
        is_active: true,
      });

    if (adminError) {
      console.error('Create admin user error:', adminError);
      // Cleanup: delete the auth user if admin record fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: 'Failed to create admin record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
