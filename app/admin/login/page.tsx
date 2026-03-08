'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from '@/lib/supabase/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('[Login] Starting sign in for:', email);

    try {
      console.log('[Login] Calling signIn...');
      const authData = await signIn(email, password);
      console.log('[Login] signIn returned:', { 
        hasSession: !!authData.session, 
        hasUser: !!authData.user,
        userId: authData.user?.id 
      });
      
      if (!authData.session) {
        console.log('[Login] No session returned');
        setError('Sign in failed. Please try again.');
        return;
      }

      console.log('[Login] Calling check-admin API...');
      // Check if user is admin - pass the access token
      const response = await fetch(`/api/auth/check-admin?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
      });
      console.log('[Login] check-admin response status:', response.status);
      const data = await response.json();
      console.log('[Login] check-admin data:', data);
      
      if (data.isAdmin) {
        console.log('[Login] User is admin, redirecting...');
        // Store admin info in localStorage for client-side checks
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        // Force navigation using window.location for a clean redirect
        window.location.href = '/admin';
      } else {
        console.log('[Login] User is NOT admin');
        setError('You do not have admin access.');
      }
    } catch (err: unknown) {
      console.error('[Login] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
    } finally {
      console.log('[Login] Finally block, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#252525] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#b1b94c] px-8 py-6 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-[#b1b94c] font-bold text-2xl">TM</span>
            </div>
            <h1 className="text-2xl font-bold text-black">Admin Login</h1>
            <p className="text-black/70 text-sm mt-1">Three Monkeys Restaurant</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@threemonkeysrestaurant.com"
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#b1b94c] focus:ring-1 focus:ring-[#b1b94c]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#b1b94c] focus:ring-1 focus:ring-[#b1b94c]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#b1b94c] hover:bg-[#d4c91e] text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-slate-400">
              SKY WORLD ADVENTURES Co., Ltd. - Protected area.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
