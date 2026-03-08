# 2. Environment Variables

All required environment variables for the booking system to function properly.

## Required Variables

### Supabase Configuration

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co

# Supabase Anonymous Key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
- Supabase Dashboard → Project Settings → API

---

### Stripe Configuration

```env
# Stripe Publishable Key (safe for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Stripe Secret Key (server-side only)
STRIPE_SECRET_KEY=sk_live_xxxxx

# Stripe Webhook Signing Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Where to find:**
- Publishable & Secret Keys: Stripe Dashboard → Developers → API keys
- Webhook Secret: Stripe Dashboard → Developers → Webhooks → Your endpoint

**Note:** Use `pk_test_` and `sk_test_` keys for development/staging.

---

### OneBooking Integration

```env
# OneBooking API URL
ONEBOOKING_API_URL=https://db.onebooking.co

# OneBooking API Key (get from OneBooking admin)
ONEBOOKING_API_KEY=sr_sk_live_xxxxx

# Your Website ID (unique identifier for your site)
WEBSITE_ID=skyrock
```

**Where to find:**
- Contact OneBooking admin to get your API key
- Website ID is assigned when your site is registered with OneBooking

---

### Application Configuration

```env
# Your application URL
NEXT_PUBLIC_APP_URL=https://skyrock.com

# Email Configuration (optional)
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@skyrock.com
CONTACT_EMAIL=contact@skyrock.com
```

---

## Environment Variable Template

Create a `.env.example` file in your project root:

```env
# ===========================================
# SKYROCK - Environment Variables
# ===========================================
# Copy this file to .env.local and fill in your values

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OneBooking Integration
ONEBOOKING_API_URL=https://db.onebooking.co
ONEBOOKING_API_KEY=sr_sk_live_xxxxx
WEBSITE_ID=skyrock

# App URL
NEXT_PUBLIC_APP_URL=https://skyrock.com

# Email (Optional)
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@skyrock.com
CONTACT_EMAIL=contact@skyrock.com
```

---

## Vercel Deployment

When deploying to Vercel:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable with appropriate environment scope:
   - `Production` - for live site
   - `Preview` - for PR previews
   - `Development` - for local development

**Important:** After adding/changing environment variables, you must redeploy for changes to take effect.
