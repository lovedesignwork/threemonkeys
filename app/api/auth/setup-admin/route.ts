import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check if setup key is provided (security measure)
    const body = await request.json();
    const { setupKey } = body;
    
    // Simple security check - in production, use a more secure method
    if (setupKey !== 'HANUMAN_SETUP_2024') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

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
      return NextResponse.json({ error: 'Admin users already exist' }, { status: 400 });
    }

    // Create the superadmin user in Supabase Auth
    const email = body.email || 'john@hanumanworldphuket.com';
    const password = body.password || 'HW@dmin2024!Secure';
    const fullName = body.fullName || 'John Admin';

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
      credentials: {
        email,
        password,
      },
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
