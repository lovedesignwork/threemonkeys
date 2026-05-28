import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allAddons } from '@/lib/data/addons';

// GET - Fetch enabled addons for public booking page
export async function GET() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If Supabase not configured, return all addons (no filtering)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ addons: allAddons });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'disabled_addons')
      .single();

    // PGRST116 = no rows, 42P01 = table doesn't exist - both are fine
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ addons: allAddons });
      }
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
