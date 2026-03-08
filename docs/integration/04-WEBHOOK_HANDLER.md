# 4. Stripe Webhook Handler

The webhook handler receives events from Stripe and processes them accordingly.

## File Location

Create this file at: `/app/api/webhooks/stripe/route.ts`

## Complete Implementation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { pushBookingToOneBooking } from '@/lib/onebooking/sync';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.booking_id;

      if (bookingId) {
        // 1. Update booking status to confirmed
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('id', bookingId);

        // 2. Fetch complete booking data
        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select(`
            *,
            packages (*),
            booking_customers (*),
            booking_addons (*, promo_addons (*)),
            booking_transport (*)
          `)
          .eq('id', bookingId)
          .single();

        if (booking && booking.booking_customers) {
          // Handle potential array returns from Supabase relations
          const customer = Array.isArray(booking.booking_customers) 
            ? booking.booking_customers[0] 
            : booking.booking_customers;
          const transport = Array.isArray(booking.booking_transport) 
            ? booking.booking_transport[0] 
            : booking.booking_transport;

          // 3. Sync to OneBooking Dashboard
          try {
            const syncResult = await pushBookingToOneBooking('booking.created', {
              id: booking.id,
              booking_ref: booking.booking_ref,
              activity_date: booking.activity_date,
              time_slot: booking.time_slot,
              guest_count: Number(booking.guest_count) || 0,
              total_amount: Number(booking.total_amount) || 0,
              discount_amount: Number(booking.discount_amount) || 0,
              currency: 'THB',
              status: 'confirmed',
              special_requests: booking.special_requests || null,
              stripe_payment_intent_id: paymentIntent.id,
              created_at: booking.created_at,
              packages: booking.packages ? {
                name: booking.packages.name,
                price: Number(booking.packages.price) || 0,
              } : null,
              customers: customer ? {
                name: `${customer.first_name} ${customer.last_name}`,
                email: customer.email,
                phone: customer.phone || null,
                country_code: customer.country_code || null,
              } : null,
              transport_type: transport?.transport_type || null,
              hotel_name: transport?.hotel_name || null,
              room_number: transport?.room_number || null,
              non_players: Number(transport?.non_players) || 0,
              private_passengers: Number(transport?.private_passengers) || 0,
              transport_cost: Number(transport?.transport_cost) || 0,
              booking_addons: booking.booking_addons || [],
            });
            
            if (syncResult.success) {
              console.log(`[OneBooking] Synced ${booking.booking_ref}`);
            } else {
              console.warn(`[OneBooking] Sync failed: ${syncResult.error}`);
            }
          } catch (syncError) {
            console.error(`[OneBooking] Sync error:`, syncError);
          }

          // 4. Send confirmation emails (optional)
          // await sendBookingConfirmationEmail({...});
          // await sendAdminNotificationEmail({...});

          console.log(`Booking ${booking.booking_ref} confirmed!`);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.booking_id;

      if (bookingId) {
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        
        console.log(`Booking ${bookingId} cancelled due to payment failure`);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', paymentIntentId);
        
        console.log(`Booking with payment ${paymentIntentId} refunded`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

---

## Key Points

### 1. Raw Body Required
The webhook signature verification requires the raw request body, not parsed JSON:
```typescript
const body = await request.text(); // NOT request.json()
```

### 2. Metadata Usage
The `booking_id` is passed via Stripe's metadata when creating the payment intent:
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount * 100,
  currency: 'thb',
  metadata: {
    booking_id: booking.id,
    booking_ref: booking.booking_ref,
  },
});
```

### 3. Error Handling
Always return `200` status even if internal processing fails - this prevents Stripe from retrying:
```typescript
return NextResponse.json({ received: true });
```

### 4. Idempotency
Stripe may send the same event multiple times. Your handler should be idempotent (safe to run multiple times with the same data).

---

## Stripe Client Setup

Create `/lib/stripe/client.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Use latest stable version
});

export const PRIVATE_TRANSFER_PRICE = 2500;
export const NON_PLAYER_PRICE = 300;
```
