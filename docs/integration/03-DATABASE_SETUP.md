# 3. Database Setup (Supabase)

Database schema and migrations required for the booking system.

## Required Tables

### Core Tables

| Table | Purpose |
|-------|---------|
| `bookings` | Main booking records |
| `booking_customers` | Customer details for each booking |
| `booking_transport` | Transport/pickup information |
| `booking_addons` | Add-on purchases |
| `packages` | Available packages/products |
| `promo_addons` | Promotional add-ons |

---

## Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT NOT NULL UNIQUE,
  package_id TEXT REFERENCES packages(id),
  activity_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  admin_notes TEXT,
  promo_code_id UUID REFERENCES promo_codes(id),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_activity_date ON bookings(activity_date);
CREATE INDEX idx_bookings_booking_ref ON bookings(booking_ref);
```

---

## Booking Customers Table

```sql
CREATE TABLE booking_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country_code TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_customers_booking_id ON booking_customers(booking_id);
CREATE INDEX idx_booking_customers_email ON booking_customers(email);
```

---

## Booking Transport Table

```sql
CREATE TABLE booking_transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  transport_type TEXT, -- 'hotel_pickup', 'private', 'self_arrange'
  hotel_name TEXT,
  room_number TEXT,
  private_passengers INTEGER DEFAULT 0,
  non_players INTEGER DEFAULT 0,
  transport_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_transport_booking_id ON booking_transport(booking_id);
```

---

## Booking Addons Table

```sql
CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id TEXT REFERENCES promo_addons(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_addons_booking_id ON booking_addons(booking_id);
```

---

## Critical: Booking Reference Auto-Generation

**This trigger automatically generates unique booking references.**

```sql
-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
DECLARE
  new_ref TEXT;
  ref_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference: PREFIX + date (YYMMDD) + random 4 chars
    -- Change 'SR' to your site prefix (e.g., '3M' for Three Monkeys)
    new_ref := '3M' || TO_CHAR(NOW(), 'YYMMDD') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if this ref already exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_ref = new_ref) INTO ref_exists;
    
    -- If not exists, use it
    IF NOT ref_exists THEN
      NEW.booking_ref := new_ref;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate booking_ref before insert
DROP TRIGGER IF EXISTS generate_booking_ref_trigger ON bookings;
CREATE TRIGGER generate_booking_ref_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL)
  EXECUTE FUNCTION generate_booking_ref();
```

**Booking Reference Format:**
- `SR260221A7B3` = SR (SkyRock) + 260221 (Feb 21, 2026) + A7B3 (random)
- `3M260221C4D2` = 3M (Three Monkeys) + 260221 (Feb 21, 2026) + C4D2 (random)

---

## Updated At Trigger

```sql
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to bookings table
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON booking_customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON booking_transport
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON booking_addons
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Running Migrations

You can run these migrations via:

1. **Supabase Dashboard:** SQL Editor → New Query → Paste and Run
2. **Supabase CLI:** `supabase db push`
3. **Migration Files:** Create files in `/supabase/migrations/`
