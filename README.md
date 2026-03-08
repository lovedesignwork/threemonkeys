# Three Monkeys Restaurant

A modern restaurant booking website built with Next.js 15, featuring a beautiful dark theme with green accents, complete booking flow with Stripe payments, and admin dashboard.

## Features

- **Modern UI/UX**: Dark theme with green accent colors, smooth Framer Motion animations
- **Booking System**: Complete reservation flow with date/time selection, guest count, add-ons
- **Payment Integration**: Stripe payment processing with embedded card form
- **Admin Dashboard**: Manage bookings, products, blog posts, and settings
- **Email Notifications**: Automated booking confirmations via Resend
- **SEO Optimized**: Structured data, meta tags, sitemap, robots.txt
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Resend account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lovedesignwork/threemonkeys.git
cd threemonkeys
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
```env
# Site Configuration
NEXT_PUBLIC_SITE_NAME="Three Monkeys"
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
WEBSITE_ID="three-monkeys"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Resend (Email)
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Database Setup

Run the Supabase migrations in order:

```sql
-- Run these in your Supabase SQL editor
-- 1. supabase/migrations/001_admin_features.sql
-- 2. supabase/migrations/002_booking_sync_trigger.sql
-- 3. supabase/migrations/003_booking_ref_sequential.sql
-- 4. supabase/migrations/004_update_booking_ref_prefix.sql
-- 5. supabase/migrations/005_add_superadmin_user.sql
```

## Deploy to Vercel

### Option 1: Import from GitHub (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select the GitHub repository `lovedesignwork/threemonkeys`
4. Configure environment variables (copy from `.env.example`)
5. Click "Deploy"

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_NAME` | Site name displayed in UI |
| `NEXT_PUBLIC_SITE_URL` | Production URL |
| `WEBSITE_ID` | Unique identifier |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `RESEND_API_KEY` | Resend API key |
| `ADMIN_EMAIL` | Admin notification email |
| `CONTACT_EMAIL` | Contact form recipient |

## Stripe Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Project Structure

```
├── app/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Homepage
│   │   ├── booking/       # Booking page
│   │   ├── checkout/      # Checkout flow
│   │   ├── seats/         # Dining seats
│   │   ├── special-packages/
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── faq/
│   │   └── [legal pages]
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── home/              # Homepage components
│   ├── layout/            # Header, Footer
│   ├── checkout/          # Payment components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── data/              # Static data (packages, blog)
│   ├── email/             # Email templates
│   ├── stripe/            # Stripe client
│   └── supabase/          # Supabase clients
├── public/
│   └── images/            # Static images
└── supabase/
    └── migrations/        # Database migrations
```

## License

Private - All rights reserved.
