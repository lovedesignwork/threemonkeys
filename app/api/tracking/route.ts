import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { normalizePublicTracking } from '@/lib/tracking';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'tracking')
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(
      { tracking: normalizePublicTracking(data?.value) },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  } catch (error) {
    console.error('Failed to read public tracking settings:', error);
    return NextResponse.json(
      { error: 'Tracking settings are unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
