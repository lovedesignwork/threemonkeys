import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ isAdmin: false, error: auth.error || 'Not an admin' }, { status: 401 });
  }

  const { id, email, role, fullName } = auth.user;
  return NextResponse.json({
    isAdmin: true,
    role,
    user: {
      id,
      user_id: id,
      email,
      fullName: fullName ?? null,
      full_name: fullName ?? null,
      role,
    },
  });
}
