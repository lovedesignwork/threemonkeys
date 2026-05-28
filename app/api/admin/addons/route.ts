import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

// GET - Fetch disabled addons list
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, returning empty disabled addons list');
    return NextResponse.json({ disabledAddons: [] });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'disabled_addons')
      .single();

    // PGRST116 = no rows returned (which is fine - means no addons disabled yet)
    // 42P01 = table doesn't exist (also fine - just return empty array)
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ disabledAddons: [] });
      }
      throw error;
    }

    const disabledAddons: string[] = data?.value || [];
    return NextResponse.json({ disabledAddons });
  } catch (error) {
    console.error('Error fetching disabled addons:', error);
    // Return empty array on error so the page still loads
    return NextResponse.json({ disabledAddons: [] });
  }
}

// POST - Update disabled addons list
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: 'Database not configured. Please set up Supabase environment variables.' 
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { disabledAddons } = body;

    if (!Array.isArray(disabledAddons)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'disabled_addons',
        value: disabledAddons,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, disabledAddons });
  } catch (error: any) {
    console.error('Error updating disabled addons:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update disabled addons',
      details: error.toString()
    }, { status: 500 });
  }
}
