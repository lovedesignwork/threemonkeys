# Checkout Page with Stripe Integration Guide

This guide explains how to implement a checkout page with Stripe payment integration. Use your own UI design while following this logic and structure.

## Overview

The checkout page handles:
1. Displaying booking summary from URL parameters
2. Collecting customer details (name, email, phone)
3. Applying promo codes
4. Processing card payments via Stripe Elements
5. Redirecting to success page after payment

---

## 1. URL Parameters (Input Data)

The checkout page receives booking data via URL query parameters:

```typescript
// Example URL: /checkout?package=pkg-001&date=2026-02-27&time=10:00&guests=2&pickup=true&hotel=Marriott

const searchParams = useSearchParams();

// Required parameters
const packageId = searchParams.get('package');      // Package ID
const date = searchParams.get('date');              // YYYY-MM-DD format
const time = searchParams.get('time');              // HH:MM or 'flexible'
const guests = parseInt(searchParams.get('guests') || '1');

// Optional parameters
const pickup = searchParams.get('pickup') === 'true';
const hotel = searchParams.get('hotel') || '';
const room = searchParams.get('room') || '';
const privateTransfer = searchParams.get('privateTransfer') === 'true';
const privatePassengers = parseInt(searchParams.get('privatePassengers') || '0');
const nonPlayers = parseInt(searchParams.get('nonPlayers') || '0');
const promoAddonsParam = searchParams.get('promoAddons') || ''; // Format: "id:qty,id:qty"
```

---

## 2. Customer Details Form

Collect these fields from the user:

```typescript
interface CustomerDetails {
  firstName: string;      // Required
  lastName: string;       // Required
  email: string;          // Required, must be valid email
  phone: string;          // Required, minimum 8 digits
  countryCode: string;    // Phone country code (e.g., '+66')
  specialRequests: string; // Optional
}

// Form validation
const isCustomerFormValid = useMemo(() => {
  const emailValid = Boolean(email && email.includes('@'));
  const phoneValid = phone.length >= 8;
  const nameValid = Boolean(firstName.trim() && lastName.trim());
  return emailValid && phoneValid && nameValid;
}, [email, phone, firstName, lastName]);
```

---

## 3. Price Calculation

Calculate the total price including all components:

```typescript
const prices = useMemo(() => {
  if (!selectedPackage) return { base: 0, addons: 0, transfer: 0, discount: 0, total: 0 };
  
  // Base price = package price × guests
  const base = selectedPackage.price * guests;

  // Add-ons total
  let addonsTotal = 0;
  Object.entries(promoAddonQuantities).forEach(([addonId, qty]) => {
    if (qty > 0) {
      const addon = addons.find(a => a.id === addonId);
      if (addon) addonsTotal += addon.price * qty;
    }
  });

  // Transfer costs
  let transfer = 0;
  if (privateTransfer) {
    transfer = PRIVATE_TRANSFER_PRICE; // e.g., 2500
  } else if (nonPlayers > 0) {
    transfer = nonPlayers * NON_PLAYER_PRICE; // e.g., 300 per person
  }

  const subtotal = base + addonsTotal + transfer;
  const total = Math.max(0, subtotal - discountAmount);

  return { base, addons: addonsTotal, transfer, discount: discountAmount, subtotal, total };
}, [selectedPackage, guests, promoAddonQuantities, privateTransfer, nonPlayers, discountAmount]);
```

---

## 4. Promo Code Validation

### API Endpoint: `/api/checkout/validate-promo`

```typescript
// POST request body
{
  code: string;        // Promo code entered by user
  orderTotal: number;  // Subtotal before discount
}

// Response (success)
{
  valid: true,
  promoCode: {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    stripe_coupon_id: string | null;
  },
  discountAmount: number  // Calculated discount amount
}

// Response (error)
{
  valid: false,
  error: string  // Error message
}
```

### Frontend Implementation

```typescript
const validatePromoCode = async () => {
  if (!promoCodeInput.trim()) return;
  
  setPromoValidating(true);
  setPromoError('');
  
  try {
    const response = await fetch('/api/checkout/validate-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: promoCodeInput.trim(),
        orderTotal: prices.subtotal,
      }),
    });
    
    const data = await response.json();
    
    if (data.valid) {
      setAppliedPromo(data.promoCode);
      setDiscountAmount(data.discountAmount);
      setPromoCode(data.promoCode.code);
    } else {
      setPromoError(data.error || 'Invalid promo code');
    }
  } catch {
    setPromoError('Failed to validate promo code');
  } finally {
    setPromoValidating(false);
  }
};
```

---

## 5. Stripe Integration

### Required Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

### Environment Variables

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Stripe Provider Component

Wrap your checkout form with the Stripe Elements provider:

```typescript
// components/checkout/StripeCardProvider.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripeCardProvider({ children }: { children: ReactNode }) {
  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#1a237e',      // Your brand color
      colorBackground: '#f8fafc',
      colorText: '#1e293b',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '12px',
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ appearance }}>
      {children}
    </Elements>
  );
}
```

### Card Form Component

```typescript
// components/checkout/EmbeddedCardForm.tsx
'use client';

import { useState } from 'react';
import { 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

interface EmbeddedCardFormProps {
  amount: number;
  isCustomerFormValid: boolean;
  onSubmit: () => Promise<{ clientSecret: string; bookingRef: string } | null>;
  isCreatingBooking: boolean;
}

export default function EmbeddedCardForm({
  amount,
  isCustomerFormValid,
  onSubmit,
  isCreatingBooking,
}: EmbeddedCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Track card field completion
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  const cardComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;
  const canSubmit = stripe && agreeTerms && isCustomerFormValid && cardComplete && !isProcessing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !canSubmit) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Create booking and get payment intent client secret
      const result = await onSubmit();
      if (!result) {
        setIsProcessing(false);
        return;
      }

      const { clientSecret, bookingRef } = result;

      // Step 2: Confirm card payment with Stripe
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) throw new Error('Card element not found');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumberElement },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        // Step 3: Redirect to success page
        window.location.href = `/checkout/success?booking_ref=${bookingRef}&payment_intent=${paymentIntent.id}`;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const elementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': { color: '#94a3b8' },
      },
      invalid: { color: '#ef4444' },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Terms checkbox */}
      <label>
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
        />
        I agree to the Terms & Conditions
      </label>

      {/* Card Number */}
      <div>
        <label>Card Number</label>
        <CardNumberElement
          options={elementStyle}
          onChange={(e) => setCardNumberComplete(e.complete)}
        />
      </div>

      {/* Expiry and CVC */}
      <div>
        <div>
          <label>Expiry Date</label>
          <CardExpiryElement
            options={elementStyle}
            onChange={(e) => setCardExpiryComplete(e.complete)}
          />
        </div>
        <div>
          <label>CVC</label>
          <CardCvcElement
            options={elementStyle}
            onChange={(e) => setCardCvcComplete(e.complete)}
          />
        </div>
      </div>

      {/* Error message */}
      {errorMessage && <div className="error">{errorMessage}</div>}

      {/* Submit button */}
      <button type="submit" disabled={!canSubmit}>
        {isProcessing ? 'Processing...' : `Pay ฿${amount.toLocaleString()}`}
      </button>
    </form>
  );
}
```

---

## 6. Create Payment Intent API

### API Endpoint: `/api/checkout/create-payment-intent`

```typescript
// app/api/checkout/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageId,
      date,
      time,
      guests,
      pickup,
      hotel,
      room,
      privateTransfer,
      privatePassengers,
      nonPlayers,
      promoAddons,
      promoCodeId,
      discountAmount = 0,
      customer,
    } = body;

    // 1. Get package details from database
    const { data: packageData } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // 2. Calculate total amount
    let totalAmount = packageData.price * guests;
    // ... add addons, transfer costs, apply discount

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 3. Create booking in database (pending status)
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .insert({
        package_id: packageId,
        activity_date: date,
        time_slot: time,
        guest_count: guests,
        status: 'pending',
        total_amount: finalAmount,
        discount_amount: discountAmount,
        promo_code_id: promoCodeId || null,
        currency: 'THB',
      })
      .select()
      .single();

    // 4. Insert customer, transport, addons records
    await supabaseAdmin.from('booking_customers').insert({
      booking_id: booking.id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      country_code: customer.countryCode,
    });

    // 5. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount * 100, // Convert to smallest currency unit
      currency: 'thb',
      payment_method_types: ['card'],
      metadata: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        customer_email: customer.email,
      },
      receipt_email: customer.email,
    });

    // 6. Update booking with payment intent ID
    await supabaseAdmin
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', booking.id);

    // 7. Return client secret
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      bookingRef: booking.booking_ref,
      amount: finalAmount,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
```

---

## 7. Stripe Webhook Handler

### API Endpoint: `/api/webhooks/stripe`

This endpoint handles payment confirmation from Stripe:

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.booking_id;

      if (bookingId) {
        // Update booking status to confirmed
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('id', bookingId);

        // Send confirmation email, sync to dashboard, etc.
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
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## 8. Payment Flow Summary

```
1. User fills customer details form
2. User enters card details in Stripe Elements
3. User clicks "Pay" button
4. Frontend calls `/api/checkout/create-payment-intent`
   - Creates booking in database (status: pending)
   - Creates Stripe PaymentIntent
   - Returns clientSecret
5. Frontend calls `stripe.confirmCardPayment(clientSecret)`
   - Stripe processes the card payment
6. On success, redirect to `/checkout/success?booking_ref=XXX&payment_intent=pi_XXX`
7. Stripe sends webhook to `/api/webhooks/stripe`
   - Updates booking status to 'confirmed'
   - Sends confirmation emails
```

---

## 9. Security Considerations

1. **Never expose Stripe Secret Key** - Only use on server-side
2. **Validate payment_intent on success page** - Verify it matches the booking
3. **Use webhooks for status updates** - Don't rely solely on frontend redirect
4. **Validate promo codes server-side** - Recalculate discounts on the server
5. **Use HTTPS** - Required for Stripe in production

---

## 10. UI Components to Include

- [ ] Booking summary card (package, date, time, guests)
- [ ] Customer details form (name, email, phone)
- [ ] Promo code input with apply/remove buttons
- [ ] Price breakdown (base, addons, transfer, discount, total)
- [ ] Stripe card input fields (number, expiry, CVC)
- [ ] Terms & conditions checkbox
- [ ] Pay button with loading state
- [ ] Error message display
- [ ] Security badges (SSL, secure payment)
