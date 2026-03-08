# 1. Stripe Webhook Configuration

**Critical:** The Stripe webhook is what triggers booking confirmation and OneBooking sync. Without this, bookings will remain in "pending" status forever.

## Setup Steps

### Step 1: Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**

### Step 2: Add Endpoint
1. Click **Add endpoint**
2. Enter your endpoint URL:
   ```
   https://[YOUR-DOMAIN]/api/webhooks/stripe
   ```
   
   Examples:
   - Production: `https://skyrock.com/api/webhooks/stripe`
   - Staging: `https://staging.skyrock.com/api/webhooks/stripe`

### Step 3: Select Events
Select these events to listen to:

| Event | Purpose |
|-------|---------|
| `payment_intent.succeeded` | Confirms booking after successful payment |
| `payment_intent.payment_failed` | Marks booking as cancelled on payment failure |
| `charge.refunded` | Updates booking status when refunded |

### Step 4: Get Signing Secret
1. After creating the endpoint, click on it
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Verification

To verify your webhook is working:

1. Make a test payment using card `4242 4242 4242 4242`
2. Check Stripe Dashboard → Webhooks → Your endpoint → "Webhook attempts"
3. You should see a successful delivery with status `200`

## Common Issues

### Webhook not receiving events
- Ensure the URL is publicly accessible (not localhost)
- Check if your hosting platform has any firewall rules blocking Stripe IPs

### Signature verification failed
- Make sure `STRIPE_WEBHOOK_SECRET` matches exactly (no extra spaces)
- Ensure you're reading the raw request body, not parsed JSON

### Events not triggering
- Verify you selected the correct events when creating the endpoint
- Check if you're in Test mode vs Live mode in Stripe Dashboard
