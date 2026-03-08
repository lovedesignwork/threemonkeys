# Booking System Integration Guide

This guide covers how to set up a booking website to work with Stripe payments and sync all confirmed bookings to the OneBooking Central Dashboard.

## Table of Contents

1. [Stripe Webhook Configuration](./integration/01-STRIPE_WEBHOOK.md)
2. [Environment Variables](./integration/02-ENVIRONMENT_VARIABLES.md)
3. [Database Setup](./integration/03-DATABASE_SETUP.md)
4. [Stripe Webhook Handler](./integration/04-WEBHOOK_HANDLER.md)
5. [OneBooking Sync Library](./integration/05-ONEBOOKING_SYNC.md)
6. [Checkout Success Page](./integration/06-SUCCESS_PAGE.md)
7. [Payment Flow](./integration/07-PAYMENT_FLOW.md)
8. [Testing Checklist](./integration/08-TESTING_CHECKLIST.md)
9. [Troubleshooting](./integration/09-TROUBLESHOOTING.md)

## Quick Start

1. Configure Stripe webhook endpoint
2. Set all required environment variables
3. Run database migrations
4. Implement webhook handler
5. Add OneBooking sync library
6. Create success page
7. Test the complete flow

## Architecture Overview

```
Customer Payment Flow:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Checkout  │────▶│   Stripe    │────▶│   Webhook   │
│    Page     │     │   Payment   │     │   Handler   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
            │   Update    │           │    Sync     │           │    Send     │
            │   Booking   │           │  OneBooking │           │   Emails    │
            │   Status    │           │  Dashboard  │           │             │
            └─────────────┘           └─────────────┘           └─────────────┘
```

## Reference Implementation

This guide is based on the Flying Hanuman booking system implementation. You can reference the following files:

- Webhook Handler: `/app/api/webhooks/stripe/route.ts`
- OneBooking Sync: `/lib/onebooking/sync.ts`
- Success Page: `/app/(public)/checkout/success/page.tsx`
- Booking API: `/app/api/bookings/[ref]/route.ts`
