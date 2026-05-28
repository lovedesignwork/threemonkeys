import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

const SETTINGS_KEY = 'alcohol_restricted_dates';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

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

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { date, action } = body;

    if (!date || !action) {
      return NextResponse.json({ error: 'Date and action are required' }, { status: 400 });
    }

    // Get current dates
    const { data: current } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .single();

    let dates: string[] = (current?.value as string[]) || [];

    if (action === 'add') {
      if (!dates.includes(date)) {
        dates.push(date);
        dates.sort();
      }
    } else if (action === 'remove') {
      dates = dates.filter(d => d !== date);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Upsert the dates
    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: SETTINGS_KEY, value: dates }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating alcohol restrictions:', error);
      return NextResponse.json({ error: 'Failed to update restrictions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, dates });
  } catch (error) {
    console.error('Alcohol restrictions update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
