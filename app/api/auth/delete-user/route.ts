import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user is a superadmin (cannot delete superadmins)
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (adminUser?.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin accounts' }, { status: 403 });
    }

    // Delete admin_users record first
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (adminError) {
      console.error('Delete admin user error:', adminError);
      return NextResponse.json({ error: 'Failed to delete admin record' }, { status: 500 });
    }

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Delete auth user error:', authError);
      return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
