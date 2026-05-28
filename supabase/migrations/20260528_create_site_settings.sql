-- Create site_settings table for storing configuration like disabled addons
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access" ON public.site_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Add comment
COMMENT ON TABLE public.site_settings IS 'Stores site-wide configuration settings like disabled addons, feature flags, etc.';
