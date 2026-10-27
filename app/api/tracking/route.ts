import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { publicTrackingSettings } from '@/lib/tracking';

/** Public tracking configuration only. Admin settings remain authenticated. */
export async function GET() {
  let value: unknown = null;
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'tracking')
      .maybeSingle();
    if (error) throw error;
    value = data?.value;
  } catch {
    // Analytics can still use the deployment's public measurement ID if the
    // settings database is temporarily unavailable. Never return database errors.
    console.warn('Public tracking settings unavailable; using environment fallback.');
  }

  return NextResponse.json({
    tracking: publicTrackingSettings(value, process.env.NEXT_PUBLIC_GA4_ID),
  });
}
