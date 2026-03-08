# Flying Hanuman - Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ===========================================
# FLYING HANUMAN CONFIGURATION
# ===========================================

# Website Identifier (used for OneBooking sync)
WEBSITE_ID=flying-hanuman

# Public site name
NEXT_PUBLIC_SITE_NAME=Flying Hanuman

# ===========================================
# SUPABASE (Same as Hanuman World - shared database)
# ===========================================

# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# STRIPE (Can use same account or separate)
# ===========================================

# Get these from Stripe Dashboard > Developers > API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Webhook secret - create new webhook for FH domain
# Stripe Dashboard > Developers > Webhooks > Add endpoint
# Endpoint URL: https://flyinghanuman.com/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# ===========================================
# RESEND (Same API key, different sender)
# ===========================================

# Same Resend API key (verify flyinghanuman.com domain in Resend)
RESEND_API_KEY=re_...

# ===========================================
# ONEBOOKING DASHBOARD SYNC
# ===========================================

# OneBooking API URL
ONEBOOKING_API_URL=https://onebooking-dashboard.vercel.app

# Get a new API key from OneBooking Dashboard for Flying Hanuman
# This should be different from Hanuman World's key
ONEBOOKING_API_KEY=fh_sk_live_...
```

## Setup Steps

### 1. Supabase
- Use the **same Supabase project** as Hanuman World
- All tables are already set up
- Products, add-ons, blog posts will be separate per website
- Bookings will have `website_id: flying-hanuman`

### 2. Stripe
You have two options:

**Option A: Same Stripe Account (Recommended)**
- Use the same API keys
- Create a NEW webhook endpoint for FH domain
- Products/prices will be separate in Stripe

**Option B: Separate Stripe Account**
- Create new Stripe account for FH
- Get new API keys
- Set up new webhook

### 3. Resend Email
- Use the **same Resend API key**
- Add `flyinghanuman.com` domain in Resend Dashboard
- Verify domain with DNS records
- Update `EMAIL_FROM` in `lib/email/resend.ts` to:
  ```typescript
  export const EMAIL_FROM = 'Flying Hanuman <support@flyinghanuman.com>';
  ```

### 4. OneBooking Dashboard
- Request a new API key from OneBooking Dashboard
- The key should be prefixed with `fh_` for Flying Hanuman
- Bookings will appear under "FH Bookings" in the dashboard

### 5. Vercel Deployment
When deploying to Vercel:
1. Create new Vercel project
2. Connect to GitHub repo (create new repo for FH)
3. Add all environment variables in Vercel Dashboard
4. Deploy

## Domain Setup

For production:
1. Register `flyinghanuman.com` (or your domain)
2. Add domain in Vercel
3. Update DNS records
4. Add domain to Resend for email sending
5. Update Stripe webhook URL

## Testing Checklist

After setup, test:
- [ ] Admin login works
- [ ] Can create/edit products
- [ ] Booking form loads packages
- [ ] Payment flow completes
- [ ] Confirmation email sends
- [ ] Admin notification email sends
- [ ] Booking syncs to OneBooking Dashboard
- [ ] Contact form works
