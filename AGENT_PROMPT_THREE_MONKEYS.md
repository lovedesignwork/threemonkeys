# Three Monkeys Restaurant - Setup Prompt for AI Agent

## Overview
This is a restaurant booking website for **Three Monkeys Restaurant** - an authentic Southern Thai cuisine restaurant located in Phuket's rainforest. The website allows customers to book dining zones/seats and special packages.

**This is NOT a zipline/adventure activity - this is a RESTAURANT.**

## Brand Guidelines

### Company Information
- **Brand Name:** Three Monkeys Restaurant
- **Company Name:** SKY WORLD ADVENTURES Co., Ltd.
- **Tagline:** "Authentic Southern Thai Cuisine"
- **Location:** Inside Hanuman World, Kathu, Phuket, Thailand
- **Website ID:** `three-monkeys` (for OneBooking integration)
- **Booking Reference Prefix:** `3M` (e.g., `3M-000001`)

### Color Palette
- **Primary Color:** `#b1b94c` (Olive/Moss Green)
- **Secondary Color:** `#ffffff` (White)
- **Text Color:** `#000000` (Black)
- **Background:** White or light variations of primary

### Typography
- **Heading Font:** Use a elegant/decorative font suitable for restaurant (e.g., Playfair Display or similar)
- **Body Font:** Google Sans or Inter
- **CSS Variables to update in `app/layout.tsx`**

### Logo
- Create or use restaurant logo
- Path: `/images/logo.png`

## Required Changes from Flying Hanuman Codebase

### 1. Global Find & Replace
Execute these replacements across the entire codebase:

| Find | Replace With |
|------|--------------|
| `Flying Hanuman` | `Three Monkeys` |
| `FLYING HANUMAN` | `THREE MONKEYS` |
| `flyinghanuman` | `threemonkeys` |
| `FlyingHanuman` | `ThreeMonkeys` |
| `#f2e421` (yellow) | `#b1b94c` (olive green) |
| `SKY TREK ADVENTURES` | `SKY WORLD ADVENTURES` |
| `zipline` | `dining` |
| `adventure` | `dining experience` |
| `FH-` | `3M-` |
| `FH` (booking prefix) | `3M` |

### 2. Replace All Images
**DO NOT use any Flying Hanuman/zipline images.**

Replace all images with restaurant/dining images from Unsplash:
- Hero images: Elegant restaurant interiors, jungle dining
- Gallery: Food photography, dining atmosphere, Thai cuisine
- Package images: Different dining zones (Monkey Dome, Monkey Nest, etc.)

**Unsplash categories to use:**
- `restaurant interior`
- `thai food`
- `fine dining`
- `tropical restaurant`
- `jungle cafe`
- `romantic dinner`
- `outdoor dining`

### 3. Packages Data
Get all packages from: https://onebooking.co/welcome/3M/packages

**Main Packages/Zones to include:**

| Zone Name | Description | Price (THB) |
|-----------|-------------|-------------|
| MONKEY DOME | Photogenic Zone, Romantic Spot (3-4 persons) | 4,000 |
| MONKEY NEST | Must-See Spot, Signature Corner (3-4 persons) | 4,000 |
| ZONE 6 (T) | Meeting Time (5-6 persons) | 2,500 |
| ZONE 7 (Z) | Meeting Time (1-20 persons) | 1,500 |
| Monkey Hill Top | Scenic spot | 2,000 |
| Bamboo Pavilion Exclusive Seat | Exclusive New | 3,000 |
| TABLE RESERVATION | Ambience Corner | 1,250 |
| Ultimate Dinner Package | Exclusive (1-10 persons) | 9,999 |
| Ultimate Birthday Package | Exclusive (1-10 persons) | 12,949 |
| Ultimate Romantic Dinner | Exclusive (1-2 persons) | 13,990 |
| Exclusive Romantic Area Zone 7 | Romantic Spot (1-20 persons) | 1,500 |
| Three Monkeys Roof Top Romantic Zone | Romantic Spot (1-20 persons) | 1,500 |
| WILL YOU MARRY ME? at Three Monkeys | Proposal Package | 1,250 |
| Celebrate Birthday with Ice Cream Cake | Celebration | 1,000 |
| MINI MONKEYS ART FUN | Kids Activity | 1,000 |

**Special Combo Packages:**
| Package Name | Price (THB) |
|--------------|-------------|
| Exclusive Three Monkeys Dinner at Banana Beach (Catamaran) | 19,990 |
| Exclusive Three Monkeys Dinner at Banana Beach (Speed Boat) | 16,990 |
| Exclusive Honeymoon Package at Banana Beach (Catamaran) | 23,999 |
| WILL YOU MARRY ME? at Banana Beach (Catamaran) | 25,980 |

### 4. Content from Three Monkeys Website
Source: https://threemonkeysphuket.com/

**About Section:**
> Welcome to an Unforgettable Culinary Experience at Three Monkeys Restaurant. At Three Monkeys Restaurant, we are committed to crafting each meal into a cherished memory, whether it's a romantic dinner beneath the stars or a lively gathering with friends and family.
>
> As you step inside our restaurant, you'll be captivated by an ambiance that is as enticing as our mouthwatering dishes. Our sophisticated interior seamlessly melds traditional Thai decor with modern design, creating an enchanting setting for your dining pleasure.

**Taglines to use:**
- "Authentic Southern Thai Cuisine"
- "Forest Dining Experience"
- "The Best Memories Are Made Around the Table"
- "People Who Love to Eat Are the Best People"
- "Our Restaurant is Located in the Rainforest!"

**Features to highlight:**
- Jungle/forest dining atmosphere
- Traditional Thai decor with modern design
- Romantic dinner settings
- Family-style dining options
- Special celebrations (birthdays, proposals, anniversaries)
- Rooftop views

### 5. Booking Flow Adjustments

#### Remove/Modify:
- Remove "Non-Players" field (not applicable for restaurant)
- Remove "Players" terminology - use "Guests" instead
- Remove zipline weight limit warnings
- Remove transfer/pickup options (or replace with "Private Transfer" if they offer it)

#### Keep:
- Date & Time selection
- Guest count (number of diners)
- Special requests field
- Add-ons (could be: Birthday cake, Flowers, Wine, etc.)
- Contact information

### 6. Success Page Updates
- Remove "What's Next?" pickup section (unless they have transfer)
- Update Important Information for restaurant context:
  - "Please arrive 15 minutes before your reservation time"
  - "Smart casual dress code recommended"
  - "Please inform us of any dietary requirements"
  - "Reservations held for 15 minutes past booking time"

### 7. Admin Dashboard
- Update sidebar color to `#b1b94c` (olive green) background with black text
- Update branding throughout admin

### 8. Database Setup (Supabase)
Create new Supabase project for Three Monkeys with:
- Booking reference sequence starting with `3M-`
- Update `generate_booking_ref()` function:
```sql
new_ref := '3M-' || LPAD(next_num::TEXT, 6, '0');
```

### 9. Environment Variables
Update `.env.local`:
```env
NEXT_PUBLIC_SITE_NAME="Three Monkeys"
NEXT_PUBLIC_SITE_URL="https://threemonkeys.vercel.app"
WEBSITE_ID="three-monkeys"

# New Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe (new account or same)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# OneBooking sync
ONEBOOKING_API_URL=https://onebooking.co/api
ONEBOOKING_API_KEY=your_api_key
```

### 10. SEO & Metadata
Update `lib/seo/config.ts`:
```typescript
export const siteConfig = {
  name: 'Three Monkeys Restaurant',
  description: 'Authentic Southern Thai Cuisine in Phuket\'s rainforest. Book your table for an unforgettable dining experience.',
  url: 'https://threemonkeys.vercel.app',
  ogImage: '/images/og-image.jpg',
  keywords: ['three monkeys', 'phuket restaurant', 'thai food', 'jungle dining', 'romantic dinner phuket'],
};
```

### 11. Footer Updates
- Update company name to SKY WORLD ADVENTURES Co., Ltd.
- Update contact information
- Keep payment processor info (OneBooking/Chamnanthang Co., Ltd.)

### 12. Delete Unnecessary Files
- Remove all FH/zipline specific images from `/public/images/`
- Remove any zipline-specific components
- Clean up old Flying Hanuman documentation

## File Structure Changes

### Files to Update:
1. `app/layout.tsx` - Fonts, colors, metadata
2. `tailwind.config.ts` - Primary color
3. `components/layout/Header.tsx` - Logo, navigation
4. `components/layout/Footer.tsx` - Company info
5. `components/home/*` - All homepage sections
6. `app/(public)/booking/page.tsx` - Booking form
7. `app/(public)/checkout/page.tsx` - Checkout
8. `app/(public)/checkout/success/page.tsx` - Success page
9. `app/admin/layout.tsx` - Admin sidebar
10. `lib/onebooking/sync.ts` - Booking sync
11. `public/manifest.json` - PWA manifest
12. `public/robots.txt` - Site URL

## Quick Start Commands

```bash
# Navigate to project
cd "D:\SAAS-PROJECT\ONEBOOKING VERSION 2\THREE MONKEYS RESTAURANT"

# Remove old git history
Remove-Item -Recurse -Force .git

# Initialize fresh git
git init

# Install dependencies (if needed)
npm install

# Run development server
npm run dev
```

## Summary Checklist

- [ ] Replace all colors (#f2e421 → #b1b94c)
- [ ] Replace all brand names (Flying Hanuman → Three Monkeys)
- [ ] Replace company name (SKY TREK → SKY WORLD ADVENTURES)
- [ ] Replace all images with restaurant/food images from Unsplash
- [ ] Update packages to match https://onebooking.co/welcome/3M/packages
- [ ] Update content from https://threemonkeysphuket.com/
- [ ] Remove zipline-specific terminology (players, non-players, weight limits)
- [ ] Update booking form for restaurant context (guests, not players)
- [ ] Create new Supabase project with 3M- booking prefix
- [ ] Update all environment variables
- [ ] Update SEO metadata
- [ ] Test booking flow end-to-end
- [ ] Deploy to Vercel

---

**Important:** This is a RESTAURANT booking website. Focus on dining experience, ambiance, special occasions, and Thai cuisine. Do NOT include any adventure/zipline content.
