# Stripe Card Payment Form - Complete Implementation Guide

This guide provides step-by-step instructions to implement a Stripe card payment form in a Next.js application. Copy this to another Cursor agent to replicate the same functionality.

---

## 1. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

---

## 2. Environment Variables

Add these to your `.env.local`:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## 3. Create Stripe Client (Server-side)

Create `lib/stripe/client.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Use latest API version
});
```

---

## 4. Create Stripe Provider Component

Create `components/checkout/StripeCardProvider.tsx`:

```typescript
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Load Stripe outside component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCardProviderProps {
  children: ReactNode;
}

export default function StripeCardProvider({ children }: StripeCardProviderProps) {
  // Customize appearance to match your brand
  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#1a237e',      // Your primary brand color
      colorBackground: '#f8fafc',   // Input background
      colorText: '#1e293b',         // Text color
      colorDanger: '#ef4444',       // Error color
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
        padding: '12px 14px',
      },
      '.Input:focus': {
        border: '1px solid #1a237e',
        boxShadow: '0 0 0 1px #1a237e',
      },
      '.Label': {
        fontWeight: '500',
        fontSize: '14px',
        marginBottom: '6px',
      },
      '.Error': {
        fontSize: '12px',
        marginTop: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ appearance }}>
      {children}
    </Elements>
  );
}
```

---

## 5. Create Card Form Component

Create `components/checkout/EmbeddedCardForm.tsx`:

```typescript
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
  amount: number;                    // Amount to charge (in base currency, e.g., THB)
  isCustomerFormValid: boolean;      // Whether customer details form is complete
  onSubmit: () => Promise<{          // Function to create booking & payment intent
    clientSecret: string; 
    bookingRef: string 
  } | null>;
  isCreatingBooking: boolean;        // Loading state for booking creation
}

export default function EmbeddedCardForm({
  amount,
  isCustomerFormValid,
  onSubmit,
  isCreatingBooking,
}: EmbeddedCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  // Form state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Track card field completion
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  // All card fields must be complete
  const cardComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Check if form can be submitted
  const canSubmit = stripe && agreeTerms && isCustomerFormValid && cardComplete && !isProcessing && !isCreatingBooking;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Stripe is loaded
    if (!stripe || !elements) {
      return;
    }

    // Validate customer form
    if (!isCustomerFormValid) {
      setErrorMessage('Please fill in all customer details first.');
      return;
    }

    // Validate terms agreement
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms & Conditions.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // STEP 1: Call parent's onSubmit to create booking and get payment intent
      const result = await onSubmit();
      
      if (!result) {
        setIsProcessing(false);
        return;
      }

      const { clientSecret, bookingRef } = result;

      // STEP 2: Get the card element
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      // STEP 3: Confirm the card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      // STEP 4: Handle result
      if (error) {
        // Payment failed - show error
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded - redirect to success page
        window.location.href = `/checkout/success?booking_ref=${bookingRef}&payment_intent=${paymentIntent.id}`;
      } else {
        // Other status - still redirect (webhook will handle final status)
        window.location.href = `/checkout/success?booking_ref=${bookingRef}&payment_intent=${paymentIntent?.id}`;
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  // Stripe Element styling
  const elementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#94a3b8',
        },
        iconColor: '#1a237e',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* ============================================ */}
      {/* TERMS & CONDITIONS CHECKBOX                 */}
      {/* ============================================ */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 underline">Terms & Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>.
            {' '}I understand the cancellation policy. *
          </span>
        </label>
      </div>

      {/* ============================================ */}
      {/* CARD NUMBER FIELD                           */}
      {/* ============================================ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <CardNumberElement
            options={elementStyle}
            onChange={(e) => {
              setCardNumberComplete(e.complete);
              if (e.error) {
                setErrorMessage(e.error.message);
              } else {
                setErrorMessage(null);
              }
            }}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* EXPIRY DATE & CVC FIELDS                    */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <CardExpiryElement
              options={elementStyle}
              onChange={(e) => {
                setCardExpiryComplete(e.complete);
                if (e.error) {
                  setErrorMessage(e.error.message);
                }
              }}
            />
          </div>
        </div>

        {/* CVC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV / CVC
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <CardCvcElement
              options={elementStyle}
              onChange={(e) => {
                setCardCvcComplete(e.complete);
                if (e.error) {
                  setErrorMessage(e.error.message);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ERROR MESSAGE                               */}
      {/* ============================================ */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* ============================================ */}
      {/* SUBMIT BUTTON                               */}
      {/* ============================================ */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
          w-full h-14 rounded-xl font-bold text-white 
          flex items-center justify-center gap-2 
          transition-all
          ${canSubmit 
            ? 'bg-blue-900 hover:bg-blue-800 shadow-lg hover:shadow-xl cursor-pointer' 
            : 'bg-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isProcessing || isCreatingBooking ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {isCreatingBooking ? 'Creating booking...' : 'Processing payment...'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay {formatPrice(amount)}
          </>
        )}
      </button>

      {/* ============================================ */}
      {/* SECURITY BADGE                              */}
      {/* ============================================ */}
      <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100 mt-4">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="text-xs text-green-700">
          Your payment is secured with 256-bit SSL encryption
        </span>
      </div>
    </form>
  );
}
```

---

## 6. Create Payment Intent API Route

Create `app/api/checkout/create-payment-intent/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      amount,           // Amount in base currency (e.g., 1500 for ฿1,500)
      currency = 'thb', // Currency code
      description,      // Payment description
      customerEmail,    // Customer email for receipt
      metadata,         // Additional data (booking_id, etc.)
    } = body;

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,  // Convert to smallest unit (satang for THB)
      currency: currency,
      payment_method_types: ['card'],
      description: description,
      metadata: metadata || {},
      receipt_email: customerEmail,
      statement_descriptor_suffix: 'YOURBRAND', // Shows on card statement
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

---

## 7. Usage in Checkout Page

In your checkout page component:

```typescript
'use client';

import { useState } from 'react';
import StripeCardProvider from '@/components/checkout/StripeCardProvider';
import EmbeddedCardForm from '@/components/checkout/EmbeddedCardForm';

export default function CheckoutPage() {
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Your customer form state
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  // ... other fields
  
  // Validate customer form
  const isCustomerFormValid = Boolean(firstName && email && email.includes('@'));
  
  // Calculate total amount
  const totalAmount = 1500; // Your calculated total

  // Function to create booking and payment intent
  const handleCreateBookingAndPay = async (): Promise<{ clientSecret: string; bookingRef: string } | null> => {
    if (!isCustomerFormValid) return null;
    
    setIsCreatingBooking(true);
    
    try {
      // Call your API to create booking and payment intent
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'thb',
          description: 'Booking for Package XYZ',
          customerEmail: email,
          metadata: {
            customer_name: firstName,
            // ... other metadata
          },
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        return {
          clientSecret: data.clientSecret,
          bookingRef: data.bookingRef || 'REF-001', // Your booking reference
        };
      } else {
        throw new Error(data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div>
      {/* Your customer form fields here */}
      <input 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)} 
        placeholder="First Name"
      />
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      
      {/* Stripe Card Form */}
      <StripeCardProvider>
        <EmbeddedCardForm
          amount={totalAmount}
          isCustomerFormValid={isCustomerFormValid}
          onSubmit={handleCreateBookingAndPay}
          isCreatingBooking={isCreatingBooking}
        />
      </StripeCardProvider>
    </div>
  );
}
```

---

## 8. Stripe Webhook Handler

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update your database - mark booking as confirmed
      // Send confirmation email
      // etc.
      
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      
      // Update your database - mark booking as failed/cancelled
      
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

---

## 9. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to your `.env.local`

---

## 10. File Structure Summary

```
your-project/
├── .env.local                              # Stripe keys
├── lib/
│   └── stripe/
│       └── client.ts                       # Stripe server client
├── components/
│   └── checkout/
│       ├── StripeCardProvider.tsx          # Stripe Elements wrapper
│       └── EmbeddedCardForm.tsx            # Card input form
├── app/
│   ├── (public)/
│   │   └── checkout/
│   │       ├── page.tsx                    # Checkout page
│   │       └── success/
│   │           └── page.tsx                # Success page
│   └── api/
│       ├── checkout/
│       │   └── create-payment-intent/
│       │       └── route.ts                # Create payment intent
│       └── webhooks/
│           └── stripe/
│               └── route.ts                # Webhook handler
```

---

## 11. Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHECKOUT PAGE                             │
├─────────────────────────────────────────────────────────────────┤
│  1. User fills customer details (name, email, phone)            │
│  2. User enters card details in Stripe Elements                 │
│  3. User clicks "Pay ฿X,XXX" button                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              API: /api/checkout/create-payment-intent           │
├─────────────────────────────────────────────────────────────────┤
│  1. Create booking in database (status: pending)                │
│  2. Create Stripe PaymentIntent                                 │
│  3. Return clientSecret + bookingRef                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE (Frontend)                             │
├─────────────────────────────────────────────────────────────────┤
│  stripe.confirmCardPayment(clientSecret, { card })              │
│  → Stripe processes the payment                                 │
│  → Returns paymentIntent with status                            │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      SUCCESS            │     │       FAILED            │
├─────────────────────────┤     ├─────────────────────────┤
│ Redirect to:            │     │ Show error message      │
│ /checkout/success       │     │ User can retry          │
│ ?booking_ref=XXX        │     │                         │
│ &payment_intent=pi_XXX  │     │                         │
└─────────────────────────┘     └─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE WEBHOOK                                │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/webhooks/stripe                                      │
│  Event: payment_intent.succeeded                                │
│  → Update booking status to 'confirmed'                         │
│  → Send confirmation email                                      │
│  → Sync to external systems                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Testing

### Test Card Numbers

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication required |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0000 0000 0002` | Card declined |

Use any future expiry date (e.g., 12/34) and any 3-digit CVC.

### Test Webhook Locally

```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 13. Customization Checklist

- [ ] Update `colorPrimary` in StripeCardProvider to match your brand
- [ ] Update button colors in EmbeddedCardForm
- [ ] Update `statement_descriptor_suffix` in payment intent
- [ ] Add your Terms & Conditions and Privacy Policy links
- [ ] Customize error messages
- [ ] Add your currency formatting
- [ ] Update success page redirect URL
