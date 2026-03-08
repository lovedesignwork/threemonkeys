-- Admin Features Enhancement Migration
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. Site Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('general', '{"siteName": "Hanuman World Phuket", "timezone": "Asia/Bangkok", "currency": "THB"}'),
  ('contact', '{"email": "info@hanumanworldphuket.com", "phone": "+66 76 391 222"}'),
  ('notifications', '{"emailNotifications": true, "adminEmails": "admin@hanumanworldphuket.com"}'),
  ('tracking', '{"gtmId": "", "ga4Id": "", "metaPixelId": "", "headerScripts": "", "bodyScripts": "", "footerScripts": ""}')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. Contact Submissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- ============================================
-- 3. Promo Codes Table
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  stripe_coupon_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;

-- ============================================
-- 4. Refund History Table
-- ============================================
CREATE TABLE IF NOT EXISTS refund_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_refund_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  refunded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_refund_history_booking_id ON refund_history(booking_id);

-- ============================================
-- 5. Add image_url columns to existing tables
-- ============================================

-- Add image_url to packages table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'image_url') THEN
    ALTER TABLE packages ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Add image_url to promo_addons table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promo_addons' AND column_name = 'image_url') THEN
    ALTER TABLE promo_addons ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- ============================================
-- 6. Add discount fields to bookings table
-- ============================================

-- Add promo_code_id to bookings
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'promo_code_id') THEN
    ALTER TABLE bookings ADD COLUMN promo_code_id UUID REFERENCES promo_codes(id);
  END IF;
END $$;

-- Add discount_amount to bookings
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_amount') THEN
    ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 7. Enable Row Level Security (optional but recommended)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_history ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (admin) access
CREATE POLICY "Service role can manage site_settings" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage contact_submissions" ON contact_submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage promo_codes" ON promo_codes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage refund_history" ON refund_history
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 8. Create updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Function to increment promo code usage
-- ============================================
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes 
  SET current_uses = current_uses + 1 
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql;
