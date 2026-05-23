import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment');
    }
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment');
    }
    // Catch the common case where .env.local still has the placeholder text
    // from .env.example — without this guard the JWT is invalid and every
    // admin query fails silently, producing confusing "not an admin" errors.
    if (
      supabaseServiceKey === 'your_service_role_key_here' ||
      supabaseServiceKey === 'your_service_key' ||
      supabaseServiceKey.length < 40
    ) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder. ' +
        'Copy your real service_role key from ' +
        'https://supabase.com/dashboard/project/<your-project>/settings/api-keys ' +
        'and put it in .env.local, then restart the dev server.'
      );
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
}

// Proxy object for lazy initialization
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});
