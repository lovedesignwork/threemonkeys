import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch disabled addons list
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'disabled_addons')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const disabledAddons: string[] = data?.value || [];
    return NextResponse.json({ disabledAddons });
  } catch (error) {
    console.error('Error fetching disabled addons:', error);
    return NextResponse.json({ error: 'Failed to fetch disabled addons' }, { status: 500 });
  }
}

// POST - Update disabled addons list
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { disabledAddons } = body;

    if (!Array.isArray(disabledAddons)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'disabled_addons',
        value: disabledAddons,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) throw error;

    return NextResponse.json({ success: true, disabledAddons });
  } catch (error) {
    console.error('Error updating disabled addons:', error);
    return NextResponse.json({ error: 'Failed to update disabled addons' }, { status: 500 });
  }
}
