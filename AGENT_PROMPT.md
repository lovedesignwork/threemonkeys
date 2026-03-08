# Flying Hanuman - Agent Setup Instructions

## Overview
This is a copy of the Hanuman World codebase. Flying Hanuman (FH) is a separate zipline adventure company that needs its own website with the same booking functionality but different branding and design.

## Brand Information
- **Company Name**: Flying Hanuman
- **Primary Color**: `#f2e421` (Yellow)
- **Logo**: Located at `/logo/LOGO-NS.png`
- **Website ID**: `flying-hanuman`

## Typography
- **Headings & Titles**: [Trade Winds](https://fonts.google.com/specimen/Trade+Winds) - Expressive, active feel
- **Body Text**: [Google Sans](https://fonts.google.com/specimen/Google+Sans) or system sans-serif fallback

## What to Do

### Phase 1: Branding Changes (KEEP SAME DESIGN)
These pages should look **EXACTLY like Hanuman World** but with FH branding:

1. **Admin Dashboard** (`/app/admin/*`)
   - Change primary color from `#1a237e` (blue) to `#f2e421` (yellow)
   - Update logo references
   - Keep exact same layout and functionality

2. **Booking Page** (`/app/(public)/booking/page.tsx`)
   - Change colors from blue to yellow
   - Update logo and brand name
   - **DO NOT change the layout or flow** - keep it identical to HW

3. **Checkout Page** (`/app/(public)/checkout/page.tsx`)
   - Change colors from blue to yellow  
   - Update logo and brand name
   - **DO NOT change the layout or flow** - keep it identical to HW

4. **Checkout Success/Cancel Pages**
   - Same as above - rebrand only

### Phase 2: Complete Redesign (NEW DESIGN)
These pages need **completely new designs** for Flying Hanuman brand:

1. **Homepage** (`/app/(public)/page.tsx`)
2. **Header** (`/components/layout/Header.tsx`)
3. **Footer** (`/components/layout/Footer.tsx`)
4. **Package Pages** (`/app/(public)/packages/*`)
5. **Blog Page** (`/app/(public)/blog/*`)
6. **FAQ Page** (`/app/(public)/faq/*`)
7. **Contact Page** (`/app/(public)/contact/*`)
8. **About Page** (`/app/(public)/about/*`)

### Phase 3: Configuration Updates

1. **Update `tailwind.config.ts`**:
   - Change primary color to `#f2e421`
   - Add Trade Winds font

2. **Update `app/layout.tsx`**:
   - Change site name to "Flying Hanuman"
   - Add Trade Winds and Google Sans fonts
   - Update metadata

3. **Update `.env.local`** (create from `.env.example`):
   ```
   WEBSITE_ID=flying-hanuman
   NEXT_PUBLIC_SITE_NAME=Flying Hanuman
   ```

4. **Update email sender** in `lib/email/resend.ts`:
   - Change `EMAIL_FROM` to `Flying Hanuman <support@flyinghanuman.com>`

5. **Update SEO config** in `lib/seo/config.ts`

## File Reference Guide

See `FILE_MAP.md` for a complete list of files categorized by what action is needed.

## Important Notes

1. **DO NOT modify** the API routes (`/app/api/*`) - they work as-is
2. **DO NOT modify** the database schema or Supabase integration
3. **DO NOT modify** the booking/checkout logic - only the styling
4. The admin dashboard, booking form, and checkout use the same Supabase database
5. All bookings will sync to OneBooking Dashboard with `website_id: flying-hanuman`

## Getting Started

1. Run `npm install` to install dependencies
2. Copy `.env.example` to `.env.local` and update values
3. Start with Phase 1 (branding changes)
4. Then move to Phase 2 (new designs)
5. Test the booking flow end-to-end

## Color Reference

| Element | Hanuman World | Flying Hanuman |
|---------|---------------|----------------|
| Primary | `#1a237e` | `#f2e421` |
| Primary Dark | `#0d1259` | `#d4c91e` |
| Accent | `#f97316` (orange) | TBD by design |
| Background | `#0d1259` | TBD by design |

## Questions?
Refer to the documentation files in `/docs/` folder for technical specifications.
