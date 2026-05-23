# Three Monkeys — Table Allotment Specification

**Version:** 1.0
**Status:** Implementation in progress
**Owner:** Three Monkeys Restaurant
**Last updated:** 2026-05-23

---

## 1. Goal

Prevent overbooking by tracking which physical tables are blocked at which times. The system must:

1. Stop the customer from completing a booking if no table is free for their zone + time.
2. Let staff manually block tables for phone / email / walk-in reservations.
3. Reflect manual blocks instantly on the customer-facing booking page.
4. Auto-release tables when a confirmed booking is cancelled or refunded.

Everything lives **inside the Three Monkeys project + its own Supabase** (`rsyykxiwshfqmkjfuqjy`). OneBooking dashboard is unchanged; it continues to receive confirmed bookings via the existing sync — we just include the assigned zone + table code in the payload.

---

## 2. Decisions (locked)

| ID  | Decision                                                                 |
| --- | ------------------------------------------------------------------------ |
| A   | Table is claimed **at Stripe payment success** only. No pre-checkout holds. |
| B   | Customer sees binary **"Available / Fully Booked"** (no count exposed).  |
| C   | Admin cancelling a booking **auto-releases** its allotment.              |
| D   | Admin editing a booking's date/time **auto-updates** the block, **fails loudly** if the new slot is full. |
| E   | `zone_id` + `table_code` are stored **directly on `bookings`** (denormalised). |
| F   | Confirmation email shows **zone name only**, not the table number.       |
| —   | Double-booking races (two payments at the same second) are accepted; the second one will fail and admin handles manually. |
| —   | Block duration is **3 hours** for every zone (turnover handled manually). |
| —   | Back-to-back bookings on the same table are **allowed** (no buffer).      |

---

## 3. Zone & table inventory

The customer's package selection maps 1:1 to a zone. Internally each zone has named tables, but the customer never sees table names — system auto-assigns.

| Package ID (existing)         | Zone ID (new)              | Zone display name              | Tables                                       | Time slots             |
| ----------------------------- | -------------------------- | ------------------------------ | -------------------------------------------- | ---------------------- |
| `monkey-dome`                 | `monkey-dome`              | Monkey Dome                    | MD1, MD2, MD3 (3)                            | 16:00 / 19:00 / 22:00  |
| `monkey-nest`                 | `monkey-nest`              | Monkey Nest                    | MN1, MN2 (2)                                 | 16:00 / 19:00 / 22:00  |
| `monkey-hilltop`              | `monkey-hilltop`           | Monkey Hilltop                 | Hilltop1 (1)                                 | 19:00 / 22:00          |
| `bamboo-pavilion`             | `bamboo-pavilion`          | Bamboo Pavilion                | BP1, BP2, BP3, BP4 (4)                       | 19:00 / 22:00          |
| `zone-6`                      | `zone-t`                   | Zone T                         | T1–T12, T14–T17 (16)                         | hourly 10:00–22:00     |
| `zone-7`                      | `zone-z`                   | Zone Z                         | Z1–Z25, Z31–Z36 (31)                         | hourly 10:00–22:00     |
| `exclusive-romantic-zone-7`   | `exclusive-romantic`       | Exclusive Romantic — Zone Z    | Z26, Z27, Z28, Z29 (4)                       | hourly 10:00–22:00     |
| `rooftop-romantic`            | `romantic-rooftop-luge`    | Romantic Rooftop Luge          | Luge1, Luge2, Luge3, Luge4, Luge5, Luge6 (6) | hourly 10:00–22:00     |

**Special packages** (`ultimate-dinner`, `ultimate-birthday`, `ultimate-romantic-dinner`, `will-you-marry-me`) do not consume allotment automatically — they are assigned a table manually by staff in the admin allotment page after booking, because the staff coordinates these directly with the customer.

---

## 4. Data model

### New tables (in Three Monkeys Supabase)

```sql
-- tm_zones: the master list of zones
CREATE TABLE tm_zones (
  id              TEXT PRIMARY KEY,          -- e.g. 'monkey-dome'
  name            TEXT NOT NULL,             -- e.g. 'Monkey Dome'
  package_id      TEXT,                      -- maps to packages.id (nullable for special)
  time_slots      TEXT[] NOT NULL,           -- e.g. ARRAY['16:00','19:00','22:00']
  block_minutes   INTEGER NOT NULL DEFAULT 180,
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tm_tables: physical tables per zone
CREATE TABLE tm_tables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         TEXT NOT NULL REFERENCES tm_zones(id) ON DELETE CASCADE,
  table_code      TEXT NOT NULL,             -- e.g. 'MD1'
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(zone_id, table_code)
);

-- tm_allotments: every block (from website booking, phone, email, walk-in, manual)
CREATE TABLE tm_allotments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         TEXT NOT NULL REFERENCES tm_zones(id),
  table_code      TEXT NOT NULL,             -- e.g. 'MD1'
  start_at        TIMESTAMPTZ NOT NULL,      -- start of block (stored UTC, render Asia/Bangkok)
  end_at          TIMESTAMPTZ NOT NULL,      -- start + zone.block_minutes
  source          TEXT NOT NULL CHECK (source IN ('website','phone','email','walk_in','admin','other')),
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_name   TEXT,                      -- denormalised for quick admin view
  guest_count     INTEGER,
  notes           TEXT,
  created_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tm_allotments_zone_time ON tm_allotments(zone_id, start_at);
CREATE INDEX idx_tm_allotments_booking ON tm_allotments(booking_id);
CREATE INDEX idx_tm_allotments_start_at ON tm_allotments(start_at);
```

### Columns added to existing `bookings` table

```sql
ALTER TABLE bookings ADD COLUMN zone_id    TEXT REFERENCES tm_zones(id);
ALTER TABLE bookings ADD COLUMN table_code TEXT;
```

Both nullable — older bookings will remain `NULL`, special-package bookings stay `NULL` until admin manually assigns.

---

## 5. RPC functions (Postgres)

All RPC functions are `SECURITY DEFINER` and run in `public` schema.

### `tm_check_zone_availability(zone_id, start_at)`

Read-only — used by the customer booking page to show Available / Full.

```sql
RETURNS TABLE (
  available_count INTEGER,
  total_count     INTEGER,
  is_available    BOOLEAN
)
```

Logic: count tables in `tm_tables` for the zone that are NOT blocked in `tm_allotments` where `start_at < input_end_at AND end_at > input_start_at`. The end is computed as `start_at + zone.block_minutes`.

### `tm_claim_table(zone_id, booking_id, start_at, source, customer_name, guest_count, notes)`

**Atomic** — used by Stripe webhook on payment success.

```sql
RETURNS TABLE (
  allotment_id UUID,
  table_code   TEXT
)
```

Behaviour:
1. Lock relevant tables (`SELECT ... FOR UPDATE`) on `tm_tables` + `tm_allotments` for the zone.
2. Compute `end_at = start_at + zone.block_minutes`.
3. Find any table in the zone with no overlapping allotment.
4. Insert into `tm_allotments` with chosen `table_code`, return.
5. If no table free → `RAISE EXCEPTION 'TM_ALLOTMENT_FULL: %', zone_id` so caller can refund.
6. Also updates `bookings.zone_id` and `bookings.table_code` for the booking row.

### `tm_release_table(booking_id)`

Idempotent — used when admin cancels / refunds.

```sql
RETURNS INTEGER  -- number of rows deleted
```

Deletes any `tm_allotments` rows whose `booking_id` matches. Also clears `bookings.table_code` (leaves `zone_id` intact for history).

### `tm_block_table_manual(zone_id, table_code, start_at, source, customer_name, guest_count, notes)`

Used by admin allotment UI.

```sql
RETURNS UUID  -- allotment_id
```

If `table_code` is NULL → behave like `tm_claim_table` and auto-pick. If specified → block exactly that table; if already blocked at that time → `RAISE EXCEPTION 'TM_TABLE_TAKEN'`.

### `tm_get_zone_day_availability(zone_id, day)`

Used by admin allotment UI and booking page.

```sql
RETURNS TABLE (
  time_slot       TEXT,        -- 'HH:MM' in Asia/Bangkok
  available_count INTEGER,
  total_count     INTEGER,
  blocked_tables  TEXT[]
)
```

Returns one row per scheduled time slot for that zone, indicating how many tables are free and which are blocked.

---

## 6. RLS policies

| Table            | anon SELECT | anon INSERT | authenticated SELECT | authenticated WRITE | service_role |
| ---------------- | ----------- | ----------- | -------------------- | ------------------- | ------------ |
| `tm_zones`       | ✅ (active)  | ❌           | ✅                    | ❌                   | ✅ all        |
| `tm_tables`      | ✅ (active)  | ❌           | ✅                    | ❌                   | ✅ all        |
| `tm_allotments`  | ❌           | ❌           | ✅                    | ✅                   | ✅ all        |

The customer booking page calls availability RPCs through a **public API route** (using `supabaseAdmin`), so the customer's browser never touches `tm_allotments` directly. The admin UI uses the existing authenticated admin pattern.

---

## 7. Booking flow (customer)

```
1. Customer picks package → maps to zone_id via packages.ts → ZONE_MAP
2. Customer picks date + time
3. Booking page calls GET /api/allotment/availability?zone=X&start=ISO
   → returns { available: boolean }
4. If available → show "Proceed to Checkout"
   If full     → show red "Fully Booked" banner, disable button
5. Realtime subscription on tm_allotments keeps the badge live
   (re-checks on insert/delete affecting the same zone+date)
6. Customer clicks Proceed → checkout page → Stripe payment intent
   metadata = { booking_id, zone_id }
7. payment_intent.succeeded webhook:
   - update bookings.status = 'confirmed'
   - call rpc('tm_claim_table', {...}) with start_at = activity_date + time_slot
   - if RPC throws TM_ALLOTMENT_FULL:
       - log error
       - set bookings.status = 'cancelled', admin_notes += 'auto-cancelled: no tables'
       - trigger Stripe refund
       - send "we're sorry" email to customer
   - if success:
       - existing email + OneBooking sync continues, now including zone & table_code
```

---

## 8. Admin manual block flow

In `/admin/allotment`:

1. Day view shows a grid: rows = zones, columns = time slots → cell shows `(used / total)` with colour status.
2. "Add Block" button opens modal:
   - Zone (dropdown of active zones)
   - Date (date picker)
   - Time (dropdown of zone's allowed slots)
   - Specific table or auto-pick (dropdown of zone's tables + "auto")
   - Source (phone / email / walk_in / admin / other)
   - Customer name (optional)
   - Guest count (optional)
   - Notes (optional)
3. Submit → `POST /api/admin/allotment` → `tm_block_table_manual`
4. Click a block → side panel with details → Delete button → `DELETE /api/admin/allotment/:id`

Block edits = delete + recreate (simpler than partial update).

---

## 9. Admin booking cancel / edit flow

In `/admin/bookings/[id]`:

- Cancel / Refund booking → existing PUT handler now also calls `tm_release_table(booking_id)` automatically.
- Edit booking time/date (new functionality) → existing PUT handler validates with `tm_check_zone_availability` first; if no table free, returns 409 with a clear error message so the admin sees it and resolves manually. If OK, releases old allotment and claims new table.

---

## 10. OneBooking sync payload

The existing `sync_booking_to_onebooking()` Postgres trigger (migration 002) needs two new fields appended:

```json
{
  ...existing fields,
  "zone_id":     "monkey-dome",
  "zone_name":   "Monkey Dome",
  "table_code":  "MD2"
}
```

OneBooking dashboard can ignore them if it doesn't know what to do with them — they're additive.

The JS-side `lib/onebooking/sync.ts` also gets the same fields added to `BookingSyncPayload`.

---

## 11. File map

```
docs/
  ALLOTMENT_SPEC.md                          (this file)

supabase/migrations/
  006_allotment_system.sql                   (DDL + seed + RPCs + trigger update)

lib/allotment/
  zones.ts                                   (ZONE_MAP, package_id ↔ zone_id, helpers)
  server.ts                                  (server-side RPC wrappers)
  types.ts                                   (TS types for zones, allotments)

app/api/
  allotment/availability/route.ts            (GET — public availability check)
  admin/allotment/route.ts                   (GET list, POST create manual block)
  admin/allotment/[id]/route.ts              (DELETE)

app/admin/
  allotment/page.tsx                         (admin allotment UI)

app/admin/layout.tsx                         (add 'Allotment' nav item)
app/api/admin/bookings/[id]/route.ts         (extended PUT: release on cancel, validate on edit)
app/api/webhooks/stripe/route.ts             (claim table on payment_intent.succeeded)
app/(public)/booking/page.tsx                (call availability, show Available/Full, Realtime)
app/(public)/checkout/page.tsx               (pass zone_id through to Stripe metadata)
app/api/checkout/create-payment-intent/route.ts (include zone_id in metadata)

lib/email/templates/BookingConfirmation.tsx  (add zone name)
lib/email/send-booking-confirmation.ts       (accept + forward zoneName)
lib/onebooking/sync.ts + types.ts            (add zone fields to payload)
```

---

## 12. Acceptance checklist

- [ ] Migration applies cleanly to `rsyykxiwshfqmkjfuqjy.supabase.co`
- [ ] `tm_zones`, `tm_tables`, `tm_allotments` exist and seed data present
- [ ] `bookings.zone_id` and `bookings.table_code` columns added
- [ ] Calling `tm_check_zone_availability('monkey-dome', '2026-06-01T19:00+07:00')` returns `available_count=3, total=3, is_available=true`
- [ ] Calling `tm_claim_table` three times in a row for the same zone+time returns three different table codes; the 4th raises `TM_ALLOTMENT_FULL`
- [ ] Calling `tm_release_table(booking_id)` frees the slot
- [ ] Admin `/admin/allotment` page loads, sidebar nav entry present
- [ ] Admin can add and remove a manual block; change reflects on website availability immediately
- [ ] Customer booking page shows "Fully Booked" when zone is full at chosen time
- [ ] Stripe payment success → booking confirmed, table assigned, confirmation email mentions the zone, OneBooking sync payload includes zone fields
- [ ] Admin cancel from booking detail releases the table
- [ ] No regressions in existing booking, checkout, or admin flows
