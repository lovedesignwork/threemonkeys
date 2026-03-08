# Booking Success / Thank You Page Guide

This guide explains how to implement a booking success page that displays after successful payment. Use your own UI design while following this logic and structure.

## Overview

The success page:
1. Validates the booking using payment_intent from URL
2. Fetches and displays booking details
3. Shows appropriate content based on transfer type
4. Displays discount information if applicable
5. Provides next steps and contact information

---

## 1. URL Parameters

The success page receives these parameters after payment redirect:

```typescript
// URL: /checkout/success?booking_ref=FH-000001&payment_intent=pi_xxx

const searchParams = useSearchParams();
const bookingRef = searchParams.get('booking_ref');     // Booking reference
const paymentIntent = searchParams.get('payment_intent'); // Stripe payment intent ID
```

**Important:** Both parameters are required for security validation.

---

## 2. Fetch Booking Data

### API Endpoint: `/api/bookings/[ref]`

```typescript
// GET /api/bookings/FH-000001?payment_intent=pi_xxx

// Response structure
interface BookingData {
  id: string;
  booking_ref: string;
  activity_date: string;        // YYYY-MM-DD
  time_slot: string;            // HH:MM or 'flexible'
  guest_count: number;
  total_amount: number;
  discount_amount?: number;     // Amount saved (if promo used)
  currency: string;
  packages: {
    name: string;
    slug: string;
    price: number;
  };
  booking_customers: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  booking_addons: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    promo_addons: {
      id: string;
      name: string;
    };
  }>;
  booking_transport: {
    transport_type: 'hotel_pickup' | 'private' | 'self_arrange';
    hotel_name: string | null;
    room_number: string | null;
    non_players: number;
    private_passengers: number;
    transport_cost?: number;
  } | null;
}
```

### Frontend Implementation

```typescript
const [booking, setBooking] = useState<BookingData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchBookingDetails = async () => {
    // Validate required parameters
    if (!bookingRef || !paymentIntent) {
      setError('Invalid booking link');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(
        `/api/bookings/${bookingRef}?payment_intent=${paymentIntent}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else if (response.status === 401) {
        setError('This booking confirmation link is not valid or has expired.');
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      setError('Failed to load booking details');
    }
    setLoading(false);
  };

  fetchBookingDetails();
}, [bookingRef, paymentIntent]);
```

---

## 3. API Route Implementation

```typescript
// app/api/bookings/[ref]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref: bookingRef } = await params;
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent');

    // Require payment_intent for security
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Unauthorized - payment verification required' },
        { status: 401 }
      );
    }

    // Fetch booking with all related data
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (*),
        booking_customers (*),
        booking_addons (*, promo_addons (*)),
        booking_transport (*)
      `)
      .eq('booking_ref', bookingRef)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify payment_intent matches the booking
    if (booking.stripe_payment_intent_id !== paymentIntentId) {
      // Fallback: verify with Stripe
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.metadata?.booking_ref !== bookingRef) {
          return NextResponse.json(
            { error: 'Unauthorized - payment does not match booking' },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Unauthorized - invalid payment' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
```

---

## 4. Transfer Type Display Logic

Display the customer's transfer choice with appropriate styling:

```typescript
// Helper functions
const getTransport = () => {
  if (!booking?.booking_transport) return null;
  return Array.isArray(booking.booking_transport) 
    ? booking.booking_transport[0] 
    : booking.booking_transport;
};

const transport = getTransport();

// Transfer type flags
const isPrivatePickup = transport?.transport_type === 'private';
const isFreeSharedPickup = transport?.transport_type === 'hotel_pickup';
const isComingDirect = !transport || transport.transport_type === 'self_arrange';
const hasPickup = isPrivatePickup || isFreeSharedPickup;
```

### Display Rules

| Transfer Type | Badge Color | Badge Text | Show Hotel? |
|---------------|-------------|------------|-------------|
| Private | Purple (`bg-purple-100 text-purple-700`) | "Private" | Yes |
| Free Shared | Green (`bg-green-100 text-green-700`) | "Free Shared" | Yes |
| Coming Direct | Gray (`bg-slate-100 text-slate-600`) | "Coming Direct" | No |

```tsx
{/* Transfer Type Badge */}
<div className="transfer-badge">
  {isPrivatePickup && (
    <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold">
      Private
    </span>
  )}
  {isFreeSharedPickup && (
    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
      Free Shared
    </span>
  )}
  {isComingDirect && (
    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold">
      Coming Direct
    </span>
  )}
</div>

{/* Hotel Name - only for pickup customers */}
{hasPickup && transport?.hotel_name && (
  <div className="hotel-info">
    <span>Pickup Location:</span>
    <span className="font-semibold">
      {transport.hotel_name}
      {transport.room_number ? ` #${transport.room_number}` : ''}
    </span>
  </div>
)}
```

---

## 5. Price Display with Discount

### Logic

```typescript
const hasDiscount = booking.discount_amount && booking.discount_amount > 0;
const originalPrice = booking.total_amount + (booking.discount_amount || 0);
const discountPercentage = hasDiscount 
  ? Math.round((booking.discount_amount / originalPrice) * 100)
  : 0;
```

### Display Rules

**If discount was applied:**
1. Show original price with strikethrough
2. Show discount percentage badge (e.g., "10% OFF")
3. Show discount amount (e.g., "-฿500")
4. Show final total paid
5. **NEVER show the actual promo code** - only percentage and savings

**If no discount:**
- Just show "Total Paid" with the amount

```tsx
{/* Price Display */}
{hasDiscount ? (
  <div className="discount-display bg-green-50 rounded-xl p-4">
    {/* Original Price - Strikethrough */}
    <div className="flex justify-between mb-2">
      <span className="text-slate-500">Original Price</span>
      <span className="text-slate-400 line-through text-lg">
        ฿{originalPrice.toLocaleString()}
      </span>
    </div>
    
    {/* Discount Badge and Amount */}
    <div className="flex justify-between mb-3 pb-3 border-b border-green-200">
      <div className="flex items-center gap-2">
        <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {discountPercentage}% OFF
        </span>
        <span className="text-green-700 text-sm">You saved!</span>
      </div>
      <span className="text-green-600 text-lg font-bold">
        -฿{booking.discount_amount.toLocaleString()}
      </span>
    </div>
    
    {/* Final Total */}
    <div className="flex justify-between">
      <span className="font-semibold">Total Paid</span>
      <span className="text-2xl font-bold">
        ฿{booking.total_amount.toLocaleString()}
      </span>
    </div>
  </div>
) : (
  <div className="flex justify-between">
    <span className="font-medium">Total Paid</span>
    <span className="text-2xl font-bold">
      ฿{booking.total_amount.toLocaleString()}
    </span>
  </div>
)}
```

---

## 6. "What's Next?" Section

**Only show for customers with pickup (Free Shared or Private).**

This section informs customers that they will receive a follow-up email with their exact pickup time.

```tsx
{/* What's Next - Only for pickup customers */}
{hasPickup && customer?.email && transport?.hotel_name && (
  <div className="whats-next-card">
    <div className="flex items-start gap-4">
      <div className="icon-container">
        <MailIcon />
      </div>
      <div>
        <h3 className="font-bold">What's Next?</h3>
        <p>
          A confirmation email with your{' '}
          <span className="highlight">exact pick-up time</span> at{' '}
          <span className="font-semibold">{transport.hotel_name}</span>{' '}
          will be sent to{' '}
          <span className="email-highlight">{customer.email}</span>.
        </p>
        <p className="text-sm text-muted">
          Please check your inbox (and spam folder) for this important information.
        </p>
      </div>
    </div>
  </div>
)}
```

### Styling Suggestion

Make this section prominent with:
- Dark background (`bg-[#1a1a1a]`)
- Animated gradient border (yellow/orange)
- Email icon with gradient background
- Highlighted text for key information

---

## 7. Location Card

**Only show for "Coming Direct" customers** who need the venue address.

```tsx
{/* Location - Only for Coming Direct */}
{isComingDirect && (
  <div className="location-card">
    <div className="flex items-center gap-3">
      <div className="icon bg-primary">
        <MapPinIcon />
      </div>
      <div>
        <h3 className="font-bold">{businessName}</h3>
        <p className="text-sm text-muted">{businessAddress}</p>
      </div>
    </div>
  </div>
)}
```

---

## 8. Important Information Section

Customize based on your business type:

### For Adventure Activities (Zipline, etc.)
```tsx
<ul>
  <li>Bring your booking confirmation</li>
  <li>Wear comfortable clothes and closed-toe shoes</li>
  <li>Weight limit: 120kg maximum for zipline</li>
</ul>
```

### For Restaurants
```tsx
<ul>
  <li>Please arrive 15 minutes before your reservation</li>
  <li>Smart casual dress code recommended</li>
  <li>Please inform us of any dietary requirements</li>
  <li>Reservations held for 15 minutes past booking time</li>
</ul>
```

### For Boat Trips
```tsx
<ul>
  <li>Bring sunscreen and a hat</li>
  <li>Wear comfortable swimwear</li>
  <li>Bring a change of clothes</li>
  <li>Motion sickness medication recommended if needed</li>
</ul>
```

---

## 9. Page Sections Summary

| Section | When to Show | Content |
|---------|--------------|---------|
| Success Header | Always | Checkmark, "Booking Confirmed!", customer name, booking ref, email |
| Booking Details | Always | Package name, date, time, guests |
| Transfer Badge | Always | Private (purple) / Free Shared (green) / Coming Direct (gray) |
| Pickup Location | hasPickup | Hotel name and room number |
| Non-Players | nonPlayers > 0 | Number of non-playing guests |
| Add-ons | Has add-ons | List with quantities and prices |
| Price with Discount | hasDiscount | Original price, % off badge, savings, final total |
| Price Simple | !hasDiscount | Just "Total Paid" |
| What's Next? | hasPickup | Email notification about pickup time |
| Location Card | isComingDirect | Venue address |
| Important Info | Always | Business-specific instructions |
| Help Footer | Always | Contact email and phone |

---

## 10. Error Handling

Display a friendly error page when:
- Missing booking_ref or payment_intent
- Invalid payment_intent (doesn't match booking)
- Booking not found

```tsx
if (error) {
  return (
    <div className="error-page">
      <div className="error-icon">
        <MailIcon className="text-red-500" />
      </div>
      <h1>Access Denied</h1>
      <p>{error}</p>
      <Link href="/">
        <button>Back to Home</button>
      </Link>
    </div>
  );
}
```

---

## 11. Loading State

Show a spinner while fetching booking data:

```tsx
if (loading) {
  return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );
}
```

---

## 12. Complete Page Structure

```tsx
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  // 1. Get URL params
  // 2. Fetch booking data
  // 3. Handle loading/error states
  
  return (
    <main>
      {/* Success Header Card */}
      <SuccessHeader 
        bookingRef={bookingRef}
        customerName={customer?.first_name}
        customerEmail={customer?.email}
      />

      {/* Booking Details Card */}
      <BookingDetails
        packageName={booking.packages?.name}
        date={booking.activity_date}
        time={booking.time_slot}
        guests={booking.guest_count}
      />

      {/* Transfer & Non-Players */}
      <TransferSection
        transportType={transport?.transport_type}
        hotelName={transport?.hotel_name}
        roomNumber={transport?.room_number}
        nonPlayers={transport?.non_players}
      />

      {/* Add-ons */}
      {booking.booking_addons?.length > 0 && (
        <AddonsSection addons={booking.booking_addons} />
      )}

      {/* Price Display */}
      <PriceSection
        totalAmount={booking.total_amount}
        discountAmount={booking.discount_amount}
      />

      {/* What's Next - Pickup customers only */}
      {hasPickup && (
        <WhatsNextSection
          hotelName={transport?.hotel_name}
          customerEmail={customer?.email}
        />
      )}

      {/* Important Information */}
      <ImportantInfoSection />

      {/* Location - Coming Direct only */}
      {isComingDirect && <LocationCard />}

      {/* Back to Home Button */}
      <BackToHomeButton />

      {/* Help Footer */}
      <HelpFooter />
    </main>
  );
}
```

---

## 13. Customization Checklist

When implementing for your brand:

- [ ] Update primary color throughout
- [ ] Update brand name and logo
- [ ] Update venue address
- [ ] Update contact email and phone
- [ ] Customize "Important Information" for your business type
- [ ] Adjust terminology (players → guests, etc.)
- [ ] Update fonts to match brand
- [ ] Add/remove sections based on your needs
