import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';
import {
  PACKAGE_CONTROLS_KEY,
  normalizePackageControls,
} from '@/lib/data/package-controls';
import { fetchPackageControls } from '@/lib/data/package-controls-server';

// GET - Fetch current package controls (availability, blocked dates, prices)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  const controls = await fetchPackageControls();
  return NextResponse.json({ controls });
}

// POST - Update package controls
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up Supabase environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    // Sanitize whatever the client sent so we never persist a broken shape.
    const controls = normalizePackageControls(body?.controls);

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: PACKAGE_CONTROLS_KEY,
          value: controls,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}`, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, controls });
  } catch (error: any) {
    console.error('Error updating package controls:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update package controls', details: error.toString() },
      { status: 500 }
    );
  }
}
