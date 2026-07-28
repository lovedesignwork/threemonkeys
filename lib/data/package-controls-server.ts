import { createClient } from '@supabase/supabase-js';
import {
  PACKAGE_CONTROLS_KEY,
  EMPTY_PACKAGE_CONTROLS,
  normalizePackageControls,
  type PackageControls,
} from '@/lib/data/package-controls';

/**
 * Server-side read of the admin package controls from site_settings.
 * Fails open (returns empty controls) so a database hiccup never takes the
 * public site down — packages just fall back to their catalog defaults.
 */
export async function fetchPackageControls(): Promise<PackageControls> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { ...EMPTY_PACKAGE_CONTROLS };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', PACKAGE_CONTROLS_KEY)
      .single();

    if (error) {
      // PGRST116 = no rows (nothing configured yet); 42P01 = table missing.
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return { ...EMPTY_PACKAGE_CONTROLS };
      }
      throw error;
    }

    return normalizePackageControls(data?.value);
  } catch (error) {
    console.error('Error fetching package controls:', error);
    return { ...EMPTY_PACKAGE_CONTROLS };
  }
}
