# OneBooking Dashboard Update - Promo Code & Notes Fields

## Task
Update the OneBooking Dashboard to receive and display `promo_code` and `notes` fields from connected websites (Flying Hanuman, Hanuman World, SkyRock, etc.).

## Background
The website booking sync (`/api/bookings/sync`) now sends two additional fields in the payload that need to be captured and displayed.

## New Payload Fields

```typescript
interface BookingSyncPayload {
  // ... existing fields ...
  promo_code?: string | null;  // The coupon code used (e.g., "SUMMER20", "couponnnnn")
  notes?: string | null;       // Admin notes from the booking
}
```

## Required Changes

### 1. Database Migration
Add columns to the bookings table if not already present:

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
```

### 2. Update Sync API Endpoint
Modify the `/api/bookings/sync` endpoint to accept and save these fields:

```typescript
// In your sync handler, extract and save:
const { promo_code, notes, ...otherFields } = payload;

// Save to database
await supabase.from('bookings').upsert({
  ...otherFields,
  promo_code: promo_code || null,
  notes: notes || null,
});
```

### 3. Update Bookings List Display
In the bookings table/list view:

- **NOTES column**: Display the `promo_code` as a badge and `notes` as text
- **AMOUNT column**: If `discount_amount > 0`, show:
  - Original price (calculated as `total_amount + discount_amount`) with strikethrough
  - Discount percentage badge (e.g., "50% OFF!")
  - The `promo_code` in a small badge
  - Final `total_amount`

Example display for AMOUNT column:
```
฿11,515
⊘ ฿850 (50% OFF!)
🏷️ couponnnnn
```

### 4. Booking Detail View
Show promo_code and notes in the booking detail modal/page.

## Example Incoming Payload

```json
{
  "event": "booking.created",
  "source_booking_id": "uuid-here",
  "booking_ref": "3M-000007",
  "package_name": "FH1",
  "package_price": 2100,
  "activity_date": "2026-02-27",
  "time_slot": "10:00",
  "guest_count": 7,
  "total_amount": 11515,
  "discount_amount": 850,
  "currency": "THB",
  "status": "confirmed",
  "promo_code": "couponnnnn",
  "notes": null,
  "customer": {
    "name": "John Test",
    "email": "test@test.com",
    "phone": "+66812345678",
    "country_code": "TH",
    "special_requests": null
  },
  "transport": {
    "type": "hotel_pickup",
    "hotel_name": "Some test hotel",
    "room_number": "Room 4456",
    "non_players": 0,
    "private_passengers": 0,
    "cost": 0
  },
  "addons": [],
  "stripe_payment_intent_id": "pi_xxxxx",
  "created_at": "2026-02-21T15:30:00.000Z"
}
```

## Summary
1. Add `promo_code` and `notes` columns to bookings table
2. Update sync API to save these fields
3. Display promo_code in NOTES column (or as badge in AMOUNT column)
4. Show discount info with the promo code when discount_amount > 0
