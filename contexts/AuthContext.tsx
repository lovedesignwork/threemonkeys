'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { AdminUser, signOut as authSignOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get session directly from localStorage to bypass SDK hang issues
function getSessionFromStorage(): { access_token: string; refresh_token: string; user: User } | null {
  if (typeof window === 'undefined') return null;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
  if (!projectId) return null;
  
  const storageKey = `sb-${projectId}-auth-token`;
  const stored = localStorage.getItem(storageKey);
  
  if (!stored) return null;
  
  try {
    const session = JSON.parse(stored);
    if (session.access_token && session.user) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    // Initialize from localStorage if available (for faster hydration)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminUser');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = async () => {
    try {
      // Read session directly from localStorage to bypass SDK hang issues
      const session = getSessionFromStorage();
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser && session?.access_token) {
        const response = await fetch(`/api/auth/check-admin?email=${encodeURIComponent(authUser.email || '')}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        const data = await response.json();
        if (data.isAdmin && data.user) {
          const newAdminUser: AdminUser = {
            id: data.user.id,
            user_id: authUser.id,
            email: data.user.email,
            role: data.user.role,
            full_name: data.user.fullName,
            is_active: true,
            created_at: '',
            updated_at: '',
          };
          setAdminUser(newAdminUser);
          localStorage.setItem('adminUser', JSON.stringify(newAdminUser));
        } else {
          setAdminUser(null);
          localStorage.removeItem('adminUser');
        }
      } else {
        // Check if there's cached admin user in localStorage but no session
        // This means the session expired, so clear everything
        setAdminUser(null);
        localStorage.removeItem('adminUser');
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      setUser(null);
      setAdminUser(null);
      localStorage.removeItem('adminUser');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    refreshAuth();
    
    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) return;
      const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
      const storageKey = `sb-${projectId}-auth-token`;
      
      if (e.key === storageKey || e.key === 'adminUser') {
        refreshAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    // Clear localStorage session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
      if (projectId) {
        localStorage.removeItem(`sb-${projectId}-auth-token`);
      }
    }
    
    // Also try the SDK signOut (may hang, but we don't wait for it)
    authSignOut().catch(() => {});
    
    setUser(null);
    setAdminUser(null);
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, adminUser, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
