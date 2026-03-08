# Hanuman World Phuket - Website Redesign Plan

## Project Overview

Redesign of https://hanumanworldphuket.com/ with a fresh, modern look featuring animations, sleek mobile-friendly UI, and super fast loading performance for 50-100k unique visits/month.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Hosting**: Vercel
- **Database**: Supabase
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Payment**: Stripe
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Rich Text Editor**: TipTap (for Admin Blog)
- **Date Picker**: react-day-picker + date-fns

## Brand Colors

- **Primary (Royal Blue)**: `#1a237e`
- **Primary Dark**: `#0D1259`
- **Accent (Orange)**: Standard orange with dark variant
- **Background Dark**: Dark blue tones

## Typography

- **Headings**: Oswald Light 300, ALL CAPS, letter-spacing: 0.02em
- **Menu Items**: Oswald Regular 400, ALL CAPS, 22px
- **Package Card Titles**: Oswald Regular 400
- **Body**: Inter (default)

## Pages Structure

### Public Pages
1. **Home** - Hero slideshow, featured packages, why choose us, photo gallery
2. **Combined Zipline** - Package details
3. **Zipline** - Package details (32, 18, 10 platform options)
4. **Roller Zipline** - Package details
5. **Skywalk** - Package details
6. **Slingshot** - Package details (regular and plus)
7. **Blog** - Blog listing and individual posts
8. **FAQ** - Frequently asked questions
9. **Contact** - Contact form

### Admin Dashboard
1. **Bookings** - View, filter, export, change status
2. **Blog Posts** - Create, edit, delete with rich text editor and image uploads
3. **Contact Submissions** - View contact form submissions

## Booking System Requirements

### Customer Information Collected
- Name
- Email
- Phone
- Number of guests
- Preferred date
- Time slot (8AM, 10AM, 1PM, 3PM)
- Package selection
- Hotel pickup (for round-trip transfer)
- Special requirements

### Payment
- Full upfront payment via Stripe
- No partial payments or deposits

### Availability
- All slots are open
- No calendar availability or allotment system needed
- No child pricing
- No seasonal pricing

### Database (Supabase)
- Booking records
- Blog CMS
- Contact form submissions
- No customer accounts

## SEO Requirements

"Better than YOAST SEO level" including:
- Dynamic metadata (Next.js Metadata API)
- Structured data (JSON-LD)
- Auto-generated sitemap
- robots.txt
- Semantic HTML
- Image optimization (next/image)
- Core Web Vitals performance
- Canonical URLs
- Internal linking
- Breadcrumbs

## Multi-language Support (Future)

Languages to support (develop later):
- Thai
- English
- Chinese
- Russian

## Design Preferences

- Big images
- Big fonts
- Full-screen hero image slideshow
- Both grid view and featured cards for packages
- Fixed header with dynamic background on scroll
- All types of animations:
  - Scroll-triggered
  - Page transitions
  - Hover effects
  - Hero section parallax
  - Loading animations

## Content

User will provide:
- All high-quality images/videos
- Updated text content
- Existing logo and brand assets
