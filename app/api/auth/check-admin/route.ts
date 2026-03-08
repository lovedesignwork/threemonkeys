import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header or check for email in query params
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let userId: string | null = null;
    let userEmail: string | null = email;

    // If we have an auth header with Bearer token, verify it
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        return NextResponse.json({ isAdmin: false, error: 'Invalid token' });
      }
      
      userId = user.id;
      userEmail = user.email || null;
    }

    // If we have an email (from query or token), look up the admin user
    if (userEmail) {
      const { data: adminUser, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', userEmail)
        .eq('is_active', true)
        .single();

      if (adminError) {
        console.error('Admin lookup error:', adminError);
        return NextResponse.json({ isAdmin: false, error: 'Not an admin' });
      }

      return NextResponse.json({
        isAdmin: !!adminUser,
        role: adminUser?.role || null,
        user: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          role: adminUser.role,
        } : null,
      });
    }

    // If we have a userId from the token, look up by user_id
    if (userId) {
      const { data: adminUser } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      return NextResponse.json({
        isAdmin: !!adminUser,
        role: adminUser?.role || null,
        user: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          role: adminUser.role,
        } : null,
      });
    }

    return NextResponse.json({ isAdmin: false, error: 'Not authenticated' });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Failed to check admin status' });
  }
}
