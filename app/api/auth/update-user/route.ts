import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, role, password } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user is a superadmin (cannot modify superadmins)
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (adminUser?.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot modify superadmin accounts' }, { status: 403 });
    }

    // Update admin_users record
    const updateData: Record<string, string> = {};
    if (fullName) updateData.full_name = fullName;
    if (role && ['admin', 'staff', 'writer'].includes(role)) updateData.role = role;

    if (Object.keys(updateData).length > 0) {
      const { error: adminError } = await supabaseAdmin
        .from('admin_users')
        .update(updateData)
        .eq('user_id', userId);

      if (adminError) {
        console.error('Update admin user error:', adminError);
        return NextResponse.json({ error: 'Failed to update user record' }, { status: 500 });
      }
    }

    // Update password if provided
    if (password && password.length >= 8) {
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
