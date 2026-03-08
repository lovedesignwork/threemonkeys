import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface AuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

export async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return { authenticated: false, error: 'Invalid or expired token' };
    }

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminUser) {
      return { authenticated: false, error: 'User is not an admin' };
    }

    if (!adminUser.is_active) {
      return { authenticated: false, error: 'Admin account is disabled' };
    }

    return {
      authenticated: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await verifyAdminAuth(request);
  
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }
  
  return auth;
}

export async function requireSuperAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await verifyAdminAuth(request);
  
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }
  
  if (auth.user?.role !== 'superadmin') {
    return forbiddenResponse('Superadmin access required');
  }
  
  return auth;
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
