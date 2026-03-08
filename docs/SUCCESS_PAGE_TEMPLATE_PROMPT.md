# Success Page Template Prompt

**Copy and paste this prompt to any AI agent to create a checkout success page matching the Flying Hanuman design.**

---

## PROMPT START

```
Create a checkout success/thank you page for our booking website. The page should match the Flying Hanuman design but use our brand colors.

## Design Requirements

The success page must have these sections in order:

### 1. SUCCESS HEADER CARD (Yellow/Brand gradient background)
- Large checkmark icon in a black circle
- "BOOKING CONFIRMED!" title (use heading font)
- "Thank you, [Customer First Name]!" message
- Booking reference displayed prominently in a semi-transparent box
- "Confirmation sent to [customer email]" text

### 2. BOOKING DETAILS CARD (White background)
- Dark header bar showing package name
- 3-column grid showing:
  - Date (with calendar icon)
  - Time (with clock icon)
  - Players count (with users icon)
- If non-players > 0: Show "Non-Players: X person(s)"
- If has transfer: Show transport type and hotel name/room number
- If has add-ons: List each addon with quantity and price
- Total amount at bottom (large, bold)

### 3. IMPORTANT INFORMATION CARD (Amber/Warning background)
- Title: "📋 Important Information"
- Dynamic bullet points:
  - If has transfer: "Be at your hotel lobby 15 minutes before pick-up time"
  - If no transfer: "Arrive at least 30 minutes before your scheduled time"
  - "Bring your booking confirmation"
  - "Wear comfortable clothes and closed-toe shoes"
  - "Weight limit: 120kg maximum for zipline" (adjust for your activity)

### 4. LOCATION CARD (White background)
- Map pin icon in brand color box
- Business name (bold)
- Full address

### 5. ACTION BUTTON
- Full-width "Back to Home" button in brand color

### 6. HELP FOOTER
- "Need help with your booking?"
- Email and Phone links

## Technical Requirements

1. **File Location:** `/app/(public)/checkout/success/page.tsx`

2. **URL Parameters Required:**
   - `booking_ref` - The booking reference
   - `payment_intent` - Stripe payment intent ID (for security validation)

3. **API Endpoint:** Fetch booking from `/api/bookings/[ref]?payment_intent=XXX`

4. **Security:** Only show booking details if payment_intent matches the booking's stripe_payment_intent_id

5. **Data to Display:**
   - From `booking`: booking_ref, activity_date, time_slot, guest_count, total_amount
   - From `booking.packages`: name
   - From `booking.booking_customers`: first_name, last_name, email
   - From `booking.booking_transport`: transport_type, hotel_name, room_number, non_players
   - From `booking.booking_addons`: quantity, unit_price, promo_addons.name

6. **Handle Data Variations:**
   - `booking_customers` may be object or array - handle both
   - `booking_transport` may be object, array, or null - handle all
   - Add-on price calculation: `(addon.unit_price || 0) * (addon.quantity || 1)`

## Brand Colors to Replace

Replace these Flying Hanuman colors with your brand:

| Element | FH Color | Replace With |
|---------|----------|--------------|
| Primary/Accent | `#f2e421` (Yellow) | YOUR_PRIMARY_COLOR |
| Primary Hover | `#d4c91e` | YOUR_PRIMARY_HOVER |
| Dark Background | `#0f0f0f` | Keep or adjust |
| Card Headers | `#1a1a1a` | Keep or adjust |

## Animations

Use Framer Motion for:
- Header card: fade in from top
- Checkmark icon: scale animation with spring
- Detail cards: staggered fade in from bottom (0.1s, 0.2s, 0.3s delays)
- Buttons: fade in last

## Dependencies

- `framer-motion` for animations
- `lucide-react` for icons (CheckCircle, Calendar, Clock, Users, MapPin, Mail, Phone, Car, UserMinus, ChevronRight)
- `next/navigation` for useSearchParams
- `next/link` for navigation

## Error States

1. **Missing parameters:** Show "Invalid booking link" with back to home button
2. **Invalid payment_intent:** Show "This booking confirmation link is not valid or has expired"
3. **Booking not found:** Show "Booking not found"
4. **Loading:** Show spinning loader

## Example Data Structure

The API returns:
```typescript
{
  id: "uuid",
  booking_ref: "FH260221A7B3",
  activity_date: "2026-02-26",
  time_slot: "10:00 AM",
  guest_count: 2,
  total_amount: 6580,
  packages: { name: "FH1 - Premium Package" },
  booking_customers: {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "+66812345678"
  },
  booking_transport: {
    transport_type: "hotel_pickup",
    hotel_name: "Hilton Phuket",
    room_number: "101",
    non_players: 1
  },
  booking_addons: [
    {
      quantity: 2,
      unit_price: 800,
      promo_addons: { name: "Luge 2 Rides" }
    }
  ]
}
```
```

---

## PROMPT END

---

## Quick Color Reference

### For Hanuman World (HW)
```
Primary: #1a237e (Dark Blue)
Primary Hover: #0d1259
Accent: #3949ab (Lighter Blue)
```

### For SkyRock (SR)
```
Primary: [Your SkyRock primary color]
Primary Hover: [Darker shade]
```

### For Flying Hanuman (FH) - Reference
```
Primary: #f2e421 (Yellow)
Primary Hover: #d4c91e
```

---

## Complete Code Reference

If the agent needs the full working code, they can reference:
`D:\SAAS-PROJECT\ONEBOOKING VERSION 2\FLYING HANUMAN\app\(public)\checkout\success\page.tsx`

Or use this implementation guide:
`D:\SAAS-PROJECT\ONEBOOKING VERSION 2\FLYING HANUMAN\docs\integration\06-SUCCESS_PAGE.md`
