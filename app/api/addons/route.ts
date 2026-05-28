import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allAddons } from '@/lib/data/addons';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch enabled addons for public booking page
export async function GET() {
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
    
    // Filter out disabled addons
    const enabledAddons = allAddons.filter(addon => !disabledAddons.includes(addon.id));

    return NextResponse.json({ addons: enabledAddons });
  } catch (error) {
    console.error('Error fetching addons:', error);
    // Return all addons if there's an error
    return NextResponse.json({ addons: allAddons });
  }
}
