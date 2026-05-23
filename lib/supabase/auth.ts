import { supabase } from './client';

// Re-export the singleton client for auth operations
export const supabaseAuth = supabase;

export type AdminRole = 'superadmin' | 'admin' | 'staff' | 'writer';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function signIn(email: string, password: string) {
  console.log('[signIn] Starting manual sign in for:', email);
  
  // Use native fetch to bypass SDK hang issue
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  console.log('[signIn] Making fetch request to:', `${supabaseUrl}/auth/v1/token?grant_type=password`);
  
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({ email, password }),
  });
  
  console.log('[signIn] Fetch response status:', response.status);
  
  const data = await response.json();
  console.log('[signIn] Response data:', { hasAccessToken: !!data.access_token, hasUser: !!data.user });
  
  if (!response.ok) {
    console.error('[signIn] Auth error:', data.error_description || data.error || 'Unknown error');
    throw new Error(data.error_description || data.error || 'Sign in failed');
  }
  
  // Store session in localStorage for the Supabase client to pick up
  // This bypasses the SDK's setSession which also hangs
  const storageKey = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
  console.log('[signIn] Storing session in localStorage key:', storageKey);
  
  const sessionData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    token_type: 'bearer',
    user: data.user,
  };
  
  localStorage.setItem(storageKey, JSON.stringify(sessionData));
  console.log('[signIn] Session stored in localStorage');

  // Also set a flag cookie so middleware.ts (which can't read localStorage)
  // can recognise the admin session and bypass maintenance mode. The cookie
  // is just a presence flag — actual admin data is still gated by Supabase
  // JWTs verified inside /api/admin/* routes.
  setAdminFlagCookie(data.expires_in ?? 60 * 60);

  return {
    user: data.user,
    session: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    },
  };
}

export async function signOut() {
  clearAdminFlagCookie();
  const { error } = await supabaseAuth.auth.signOut();
  if (error) {
    throw error;
  }
}

// ---------------------------------------------------------------------
// tm_admin flag cookie helpers
// ---------------------------------------------------------------------
// Browser-only. Safe to call on any admin page — sets/refreshes the flag
// without disturbing the Supabase session storage.
const ADMIN_FLAG_COOKIE = 'tm_admin';

export function setAdminFlagCookie(maxAgeSeconds: number = 60 * 60 * 24 * 7) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const parts = [
    `${ADMIN_FLAG_COOKIE}=1`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'SameSite=Lax',
  ];
  if (isSecure) parts.push('Secure');
  document.cookie = parts.join('; ');
}

export function clearAdminFlagCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${ADMIN_FLAG_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabaseAuth.auth.getUser();
  return user;
}

export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  const { data, error } = await supabaseAuth
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AdminUser;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  return adminUser !== null;
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  return adminUser?.role === 'superadmin';
}
