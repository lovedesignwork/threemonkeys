# 9. Troubleshooting

Common issues and their solutions.

## Booking Status Issues

### Bookings Stuck in "Pending"

**Symptom:** Payment succeeds in Stripe but booking status remains "pending"

**Causes & Solutions:**

1. **Webhook not configured**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Verify endpoint URL is correct: `https://yourdomain.com/api/webhooks/stripe`
   - Verify events are selected: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

2. **Webhook signature mismatch**
   - Check `STRIPE_WEBHOOK_SECRET` in your environment variables
   - Make sure there are no extra spaces or characters
   - The secret should start with `whsec_`

3. **Webhook endpoint returning errors**
   - Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
   - Look for failed deliveries and check the response
   - Check Vercel runtime logs for errors

**Manual Fix:**
```sql
-- Update specific booking to confirmed
UPDATE bookings 
SET status = 'confirmed' 
WHERE booking_ref = 'SR260221XXXX';

-- Update multiple pending bookings that have successful payments
UPDATE bookings 
SET status = 'confirmed' 
WHERE status = 'pending' 
AND stripe_payment_intent_id IS NOT NULL;
```

---

## OneBooking Sync Issues

### Bookings Not Appearing in OneBooking Dashboard

**Symptom:** Booking is confirmed but doesn't appear in OneBooking

**Causes & Solutions:**

1. **Missing environment variables**
   ```env
   ONEBOOKING_API_URL=https://db.onebooking.co
   ONEBOOKING_API_KEY=your_api_key_here
   WEBSITE_ID=your_website_id
   ```

2. **Invalid API key**
   - Contact OneBooking admin to verify your API key
   - Check for typos or extra whitespace

3. **Sync function not called**
   - Verify `pushBookingToOneBooking` is called in webhook handler
   - Check logs for sync errors

**Debug Steps:**
```typescript
// Add logging to sync function
console.log('[OneBooking Sync] Config:', {
  hasApiUrl: !!process.env.ONEBOOKING_API_URL,
  hasApiKey: !!process.env.ONEBOOKING_API_KEY,
  websiteId: process.env.WEBSITE_ID,
});
```

**Manual Sync:**
If you have existing confirmed bookings that weren't synced, you can trigger a manual sync via the admin endpoint (if implemented):
```bash
curl -X POST https://yourdomain.com/api/admin/bookings/bulk-sync-onebooking \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Success Page Issues

### "Invalid booking link" Error

**Symptom:** Success page shows error instead of booking details

**Causes & Solutions:**

1. **Missing payment_intent parameter**
   - Check redirect URL includes `payment_intent` parameter
   - URL should be: `/checkout/success?booking_ref=XXX&payment_intent=pi_XXX`

2. **Payment intent mismatch**
   - The `payment_intent` in URL must match `stripe_payment_intent_id` in database
   - Check if booking was created with correct payment intent ID

3. **Booking not found**
   - Verify `booking_ref` exists in database
   - Check for typos in booking reference

**Debug:**
```sql
-- Check booking exists and has payment intent
SELECT booking_ref, stripe_payment_intent_id, status 
FROM bookings 
WHERE booking_ref = 'SR260221XXXX';
```

### "BNaN" in Add-on Prices

**Symptom:** Add-on prices show as "BNaN" instead of actual price

**Solution:**
Update the price calculation in success page:
```typescript
// Before (broken)
{formatCurrency(addon.total_price)}

// After (fixed)
{formatCurrency((addon.unit_price || 0) * (addon.quantity || 1))}
```

---

## Database Issues

### Booking Reference Not Generated

**Symptom:** `booking_ref` is NULL after insert

**Causes & Solutions:**

1. **Trigger not created**
   - Run the `generate_booking_ref` migration
   - Verify trigger exists in Supabase

2. **Trigger not firing**
   - Check trigger is set to `BEFORE INSERT`
   - Check trigger condition: `WHEN (NEW.booking_ref IS NULL)`

**Verify Trigger:**
```sql
-- Check if trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'generate_booking_ref_trigger';

-- Test trigger
INSERT INTO bookings (package_id, activity_date, time_slot, guest_count, total_amount)
VALUES ('test-pkg', '2026-03-01', '10:00 AM', 2, 1000)
RETURNING booking_ref;
```

### RLS Blocking Queries

**Symptom:** Queries return empty results or permission errors

**Solution:**
Use `supabaseAdmin` (service role) for server-side operations:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
);
```

---

## Stripe Issues

### Payment Intent Creation Fails

**Symptom:** Error when creating payment intent

**Common Errors:**

1. **"Invalid API Key"**
   - Check `STRIPE_SECRET_KEY` is correct
   - Verify you're using the right key (test vs live)

2. **"Amount must be at least 20"**
   - Stripe has minimum amounts per currency
   - For THB, minimum is typically 20 satang (0.20 THB)

3. **"Currency not supported"**
   - Verify your Stripe account supports THB
   - Check currency code is lowercase: `'thb'`

### Webhook Signature Verification Fails

**Symptom:** `400` response with "Invalid signature"

**Solutions:**

1. Read raw body, not parsed JSON:
   ```typescript
   const body = await request.text(); // NOT request.json()
   ```

2. Use correct webhook secret:
   - Each webhook endpoint has its own secret
   - Don't confuse with API keys

3. Check for proxy issues:
   - Some proxies modify request body
   - Ensure raw body reaches your handler

---

## Vercel Deployment Issues

### Environment Variables Not Working

**Symptom:** Code can't read environment variables

**Solutions:**

1. **Redeploy after adding variables**
   - Vercel requires redeployment for env var changes
   - Go to Deployments → Redeploy

2. **Check variable scope**
   - Ensure variables are set for correct environment (Production/Preview/Development)

3. **Check variable names**
   - `NEXT_PUBLIC_` prefix required for client-side access
   - Server-only variables should NOT have this prefix

### Build Errors

**Common Errors:**

1. **Type errors**
   - Check TypeScript types match your data
   - Use `any` temporarily to debug

2. **Import errors**
   - Verify all imports exist
   - Check for circular dependencies

3. **API version mismatch**
   - Update Stripe API version if needed:
   ```typescript
   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2024-12-18.acacia', // Use latest stable
   });
   ```

---

## Quick Diagnostic Commands

```sql
-- Check recent bookings
SELECT booking_ref, status, created_at, stripe_payment_intent_id 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;

-- Check pending bookings with payment intents
SELECT booking_ref, stripe_payment_intent_id 
FROM bookings 
WHERE status = 'pending' 
AND stripe_payment_intent_id IS NOT NULL;

-- Check if triggers exist
SELECT tgname FROM pg_trigger WHERE tgrelid = 'bookings'::regclass;
```
