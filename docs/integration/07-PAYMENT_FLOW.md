# 7. Payment Flow

Complete payment flow from checkout to confirmation.

## Flow Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              PAYMENT FLOW                                     │
└──────────────────────────────────────────────────────────────────────────────┘

1. CHECKOUT PAGE
   └─▶ User fills booking form (date, time, guests, transport, add-ons)
   └─▶ User enters customer details (name, email, phone)
   └─▶ User clicks "Pay Now"

2. CREATE PAYMENT INTENT (API)
   └─▶ POST /api/checkout/create-payment-intent
   └─▶ Creates booking record in database (status: 'pending')
   └─▶ Creates Stripe PaymentIntent with booking_id in metadata
   └─▶ Returns client_secret to frontend

3. STRIPE CARD FORM
   └─▶ User enters card details in embedded Stripe form
   └─▶ stripe.confirmCardPayment(clientSecret)
   └─▶ On success: redirect to /checkout/success?booking_ref=XXX&payment_intent=pi_XXX

4. STRIPE WEBHOOK (Background)
   └─▶ Stripe sends payment_intent.succeeded event
   └─▶ POST /api/webhooks/stripe
   └─▶ Updates booking status to 'confirmed'
   └─▶ Syncs booking to OneBooking Dashboard
   └─▶ Sends confirmation emails

5. SUCCESS PAGE
   └─▶ GET /api/bookings/[ref]?payment_intent=pi_XXX
   └─▶ Validates payment_intent matches booking
   └─▶ Displays booking confirmation details
```

---

## Step 1: Create Payment Intent API

File: `/app/api/checkout/create-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageId,
      activityDate,
      timeSlot,
      guestCount,
      customer,
      transport,
      addons,
      totalAmount,
    } = body;

    // 1. Create booking record (status: pending)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        package_id: packageId,
        activity_date: activityDate,
        time_slot: timeSlot,
        guest_count: guestCount,
        total_amount: totalAmount,
        currency: 'THB',
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Failed to create booking:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // 2. Create customer record
    await supabaseAdmin.from('booking_customers').insert({
      booking_id: booking.id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      country_code: customer.countryCode,
    });

    // 3. Create transport record
    if (transport) {
      await supabaseAdmin.from('booking_transport').insert({
        booking_id: booking.id,
        transport_type: transport.type,
        hotel_name: transport.hotelName,
        room_number: transport.roomNumber,
        non_players: transport.nonPlayers || 0,
        private_passengers: transport.privatePassengers || 0,
        transport_cost: transport.cost || 0,
      });
    }

    // 4. Create addon records
    if (addons && addons.length > 0) {
      await supabaseAdmin.from('booking_addons').insert(
        addons.map((addon: { id: string; quantity: number; unitPrice: number }) => ({
          booking_id: booking.id,
          addon_id: addon.id,
          quantity: addon.quantity,
          unit_price: addon.unitPrice,
        }))
      );
    }

    // 5. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to satang
      currency: 'thb',
      metadata: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
      },
    });

    // 6. Update booking with payment intent ID
    await supabaseAdmin
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', booking.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingRef: booking.booking_ref,
      bookingId: booking.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Step 2: Embedded Card Form Component

File: `/components/checkout/EmbeddedCardForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface Props {
  clientSecret: string;
  bookingRef: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function EmbeddedCardForm({ clientSecret, bookingRef, onSuccess, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // Redirect to success page with payment_intent for validation
      window.location.href = `/checkout/success?booking_ref=${bookingRef}&payment_intent=${paymentIntent.id}`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#1a1a1a',
              '::placeholder': { color: '#94a3b8' },
            },
          },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 py-4 bg-[#f2e421] text-black font-bold rounded-xl disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

---

## Step 3: Booking Validation API

File: `/app/api/bookings/[ref]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ref: string } }
) {
  const bookingRef = params.ref;
  const paymentIntentId = request.nextUrl.searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Payment intent required' }, { status: 400 });
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

  // Validate payment intent matches
  if (booking.stripe_payment_intent_id !== paymentIntentId) {
    return NextResponse.json({ error: 'Invalid payment reference' }, { status: 401 });
  }

  return NextResponse.json(booking);
}
```

---

## Security Notes

1. **Payment Intent Validation:** The success page requires both `booking_ref` AND `payment_intent` to display booking details. This prevents unauthorized access.

2. **Webhook Signature:** Always verify Stripe webhook signatures to prevent spoofed events.

3. **Service Role Key:** Use `SUPABASE_SERVICE_ROLE_KEY` only on the server side for database operations.

4. **Metadata:** Store `booking_id` in Stripe PaymentIntent metadata to link payments to bookings.
