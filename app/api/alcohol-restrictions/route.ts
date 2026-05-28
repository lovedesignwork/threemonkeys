import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const SETTINGS_KEY = 'alcohol_restricted_dates';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching alcohol restrictions:', error);
      return NextResponse.json({ error: 'Failed to fetch restrictions' }, { status: 500 });
    }

    const dates: string[] = (data?.value as string[]) || [];
    return NextResponse.json({ dates });
  } catch (error) {
    console.error('Alcohol restrictions fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
