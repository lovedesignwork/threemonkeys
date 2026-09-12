import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAuthError, requireSuperAdmin } from '@/lib/auth/api-auth';
import { deleteUserSchema } from '@/lib/auth/user-management';

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const parsed = deleteUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { userId } = parsed.data;

    // Check if user is a superadmin (cannot delete superadmins)
    const { data: adminUser, error: lookupError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
    }
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    if (userId === auth.user?.id || adminUser.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin accounts' }, { status: 403 });
    }

    // Delete the referencing record first so restrictive Auth foreign keys work.
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (adminError) {
      console.error('Delete admin user error:', adminError);
      return NextResponse.json({ error: 'Failed to delete admin record' }, { status: 500 });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Delete auth user error:', authError);
      // Auth and PostgREST cannot share a transaction. Restore membership so a
      // transient Auth failure does not silently remove the account from this UI.
      const { error: restoreError } = await supabaseAdmin.from('admin_users').insert(adminUser);
      if (restoreError) {
        console.error('Restore admin record error:', restoreError);
        return NextResponse.json({ error: 'Failed to delete auth user and restore admin record' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Failed to delete auth user; admin record restored' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
