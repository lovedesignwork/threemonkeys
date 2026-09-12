import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { timingSafeEqual } from 'node:crypto';
import { setupAdminSchema } from '@/lib/auth/user-management';

export async function POST(request: NextRequest) {
  // Bootstrap is an explicit, temporary operator action. Never use a baked-in key.
  const expectedKey = process.env.ADMIN_BOOTSTRAP_KEY;
  if (process.env.ENABLE_ADMIN_BOOTSTRAP !== 'true' || !expectedKey || expectedKey.length < 32) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => null);
    const setupKey = body?.setupKey;
    const providedKey = typeof setupKey === 'string' ? Buffer.from(setupKey) : Buffer.alloc(0);
    const configuredKey = Buffer.from(expectedKey);
    if (providedKey.length !== configuredKey.length || !timingSafeEqual(providedKey, configuredKey)) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

    const parsed = setupAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { email, password, fullName } = parsed.data;

    // Check if any admin users already exist
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Check existing admins error:', checkError);
      return NextResponse.json({ error: 'Failed to check existing admins' }, { status: 500 });
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ error: 'Admin users already exist' }, { status: 409 });
    }

    // Create the superadmin user in Supabase Auth
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

    // Create the admin_users record
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authUser.user.id,
        user_id: authUser.user.id,
        email: email,
        role: 'superadmin',
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
      message: 'Superadmin created successfully',
      user: {
        id: authUser.user.id,
        email,
      },
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
