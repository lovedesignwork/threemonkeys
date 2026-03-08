# Flying Hanuman - Branding Checklist

Use this checklist to track progress on rebranding from Hanuman World to Flying Hanuman.

---

## Phase 1: Configuration & Setup

### Environment
- [ ] Create `.env.local` from `.env.example`
- [ ] Set `WEBSITE_ID=flying-hanuman`
- [ ] Set `NEXT_PUBLIC_SITE_NAME=Flying Hanuman`
- [ ] Configure Supabase keys (same as HW)
- [ ] Configure Stripe keys
- [ ] Configure Resend API key
- [ ] Configure OneBooking API key

### Tailwind Config (`tailwind.config.ts`)
- [ ] Change primary color from `#1a237e` to `#f2e421`
- [ ] Add primary-dark color `#d4c91e`
- [ ] Add Trade Winds font family
- [ ] Add Google Sans font family

### Root Layout (`app/layout.tsx`)
- [ ] Update site title to "Flying Hanuman"
- [ ] Update meta description
- [ ] Import Trade Winds font from Google Fonts
- [ ] Import Google Sans font (or use Inter as fallback)
- [ ] Update favicon reference

### Global CSS (`app/globals.css`)
- [ ] Update any hardcoded color values
- [ ] Add Trade Winds font-face if needed

---

## Phase 2: Assets

### Logo
- [ ] Move `logo/LOGO-NS.png` to `public/images/FH-Logo.png`
- [ ] Update all logo references in code
- [ ] Create favicon from FH logo

### Images (Replace all HW images)
- [ ] Replace hero images in `public/images/Hero Image/`
- [ ] Replace gallery images in `public/images/Gallery/`
- [ ] Replace package images in `public/images/Package image/`
- [ ] Replace background images
- [ ] Delete HW-specific images

---

## Phase 3: Rebrand Pages (KEEP SAME DESIGN)

### Admin Dashboard
Files to update (change `#1a237e` to `#f2e421`):
- [ ] `app/admin/layout.tsx` - Sidebar and header colors
- [ ] `app/admin/page.tsx` - Dashboard cards
- [ ] `app/admin/login/page.tsx` - Login form
- [ ] `app/admin/bookings/page.tsx`
- [ ] `app/admin/bookings/[id]/page.tsx`
- [ ] `app/admin/products/page.tsx`
- [ ] `app/admin/addons/page.tsx`
- [ ] `app/admin/promo-codes/page.tsx`
- [ ] `app/admin/blog/page.tsx`
- [ ] `app/admin/blog/new/page.tsx`
- [ ] `app/admin/blog/[id]/page.tsx`
- [ ] `app/admin/contacts/page.tsx`
- [ ] `app/admin/legal/page.tsx`
- [ ] `app/admin/users/page.tsx`
- [ ] `app/admin/settings/page.tsx`

### Booking Page (KEEP EXACT LAYOUT)
- [ ] `app/(public)/booking/page.tsx` - Change colors only
- [ ] `app/(public)/booking/layout.tsx` - Update metadata

### Checkout Pages (KEEP EXACT LAYOUT)
- [ ] `app/(public)/checkout/page.tsx` - Change colors only
- [ ] `app/(public)/checkout/layout.tsx` - Update metadata
- [ ] `app/(public)/checkout/success/page.tsx` - Change colors, update brand name
- [ ] `app/(public)/checkout/cancel/page.tsx` - Change colors, update brand name

### UI Components
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Badge.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/CalendarPicker.tsx`
- [ ] `components/ui/CustomSelect.tsx`
- [ ] `components/ui/LegalModal.tsx`

---

## Phase 4: Redesign Pages (NEW DESIGN)

### Layout Components
- [ ] `components/layout/Header.tsx` - NEW DESIGN
- [ ] `components/layout/Footer.tsx` - NEW DESIGN

### Homepage
- [ ] `app/(public)/page.tsx` - NEW DESIGN
- [ ] `components/home/HeroSlideshow.tsx` - NEW DESIGN or replace
- [ ] `components/home/FeaturedPackages.tsx` - NEW DESIGN
- [ ] `components/home/WhyChooseUs.tsx` - NEW DESIGN
- [ ] `components/home/PhotoGallery.tsx` - NEW DESIGN
- [ ] `components/home/Testimonials.tsx` - NEW DESIGN
- [ ] `components/home/Location.tsx` - NEW DESIGN
- [ ] `components/home/CallToAction.tsx` - NEW DESIGN
- [ ] `components/home/Partners.tsx` - NEW DESIGN
- [ ] `components/home/SafetyCertifications.tsx` - NEW DESIGN

### Public Pages
- [ ] `app/(public)/about/page.tsx` - NEW DESIGN
- [ ] `app/(public)/contact/page.tsx` - NEW DESIGN
- [ ] `app/(public)/faq/page.tsx` - NEW DESIGN
- [ ] `app/(public)/blog/page.tsx` - NEW DESIGN
- [ ] `app/(public)/blog/[slug]/page.tsx` - NEW DESIGN
- [ ] `app/(public)/privacy/page.tsx` - NEW DESIGN
- [ ] `app/(public)/terms/page.tsx` - NEW DESIGN

### Package Pages
- [ ] `app/(public)/packages/combined/page.tsx` - NEW DESIGN
- [ ] `app/(public)/packages/zipline/page.tsx` - NEW DESIGN
- [ ] `app/(public)/packages/roller/page.tsx` - NEW DESIGN
- [ ] `app/(public)/packages/skywalk/page.tsx` - NEW DESIGN
- [ ] `app/(public)/packages/slingshot/page.tsx` - NEW DESIGN
- [ ] `app/(public)/packages/luge/page.tsx` - NEW DESIGN

---

## Phase 5: Content & Data

### Email Templates (Update brand name)
- [ ] `lib/email/resend.ts` - Change EMAIL_FROM
- [ ] `lib/email/templates/BookingConfirmation.tsx` - Change "Hanuman World" to "Flying Hanuman"
- [ ] `lib/email/templates/NewBookingNotification.tsx` - Change brand name
- [ ] `lib/email/templates/ContactFormEmail.tsx` - Change brand name
- [ ] `lib/email/templates/ContactAutoReply.tsx` - Change brand name

### Data Files (Update content)
- [ ] `lib/data/packages.ts` - FH packages and pricing
- [ ] `lib/data/faq.ts` - FH FAQ content
- [ ] `lib/data/blog.ts` - FH blog content (if using static data)

### SEO
- [ ] `lib/seo/config.ts` - Update all SEO settings
- [ ] `app/robots.ts` - Update sitemap URL
- [ ] `app/sitemap.ts` - Update URLs
- [ ] `public/manifest.json` - Update app name and colors
- [ ] `public/robots.txt` - Update domain
- [ ] `public/llms.txt` - Update for FH

---

## Phase 6: Testing

### Functionality Tests
- [ ] Admin login works
- [ ] Create a test product
- [ ] Create a test add-on
- [ ] Create a test promo code
- [ ] Complete a test booking (use Stripe test mode)
- [ ] Verify booking appears in admin
- [ ] Verify booking syncs to OneBooking Dashboard
- [ ] Test contact form submission
- [ ] Test email notifications

### Visual Tests
- [ ] All pages display correctly on desktop
- [ ] All pages display correctly on mobile
- [ ] No blue (#1a237e) colors remaining
- [ ] Logo displays correctly everywhere
- [ ] Fonts load correctly

---

## Phase 7: Deployment

- [ ] Create GitHub repository for FH
- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Add environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up Stripe webhook for production domain
- [ ] Verify Resend domain
- [ ] Test production booking flow

---

## Quick Find & Replace

Use your IDE's find & replace to speed up rebranding:

| Find | Replace With |
|------|--------------|
| `Hanuman World` | `Flying Hanuman` |
| `#1a237e` | `#f2e421` |
| `#0d1259` | `#1a1a1a` (or your dark color) |
| `hanumanworldphuket` | `flyinghanuman` |
| `HW Logo.png` | `FH-Logo.png` |
