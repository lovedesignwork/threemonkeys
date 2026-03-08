# Flying Hanuman - File Map

This document categorizes all files by what action is needed for the Flying Hanuman rebrand.

---

## 🎨 REBRAND ONLY (Keep Same Design, Change Colors/Logo)

These files should look **exactly like Hanuman World** but with FH branding.

### Booking & Checkout (CRITICAL - DO NOT CHANGE LAYOUT)
```
app/(public)/booking/page.tsx          # Main booking form - REBRAND ONLY
app/(public)/booking/layout.tsx        # Update metadata only
app/(public)/checkout/page.tsx         # Checkout page - REBRAND ONLY
app/(public)/checkout/layout.tsx       # Update metadata only
app/(public)/checkout/success/page.tsx # Success page - REBRAND ONLY
app/(public)/checkout/cancel/page.tsx  # Cancel page - REBRAND ONLY
```

### Admin Dashboard (Change colors from blue to yellow)
```
app/admin/layout.tsx                   # Main admin layout - change #1a237e to #f2e421
app/admin/page.tsx                     # Dashboard home
app/admin/bookings/page.tsx            # Bookings list
app/admin/bookings/[id]/page.tsx       # Booking detail
app/admin/products/page.tsx            # Products/packages
app/admin/addons/page.tsx              # Add-ons management
app/admin/promo-codes/page.tsx         # Promo codes
app/admin/blog/page.tsx                # Blog management
app/admin/blog/new/page.tsx            # New blog post
app/admin/blog/[id]/page.tsx           # Edit blog post
app/admin/contacts/page.tsx            # Contact submissions
app/admin/legal/page.tsx               # Legal content
app/admin/users/page.tsx               # User management
app/admin/settings/page.tsx            # Settings
app/admin/login/page.tsx               # Admin login
```

### UI Components (Update color variables)
```
components/ui/Button.tsx               # Update color classes
components/ui/Badge.tsx                # Update color classes
components/ui/Card.tsx                 # Update color classes
components/ui/CalendarPicker.tsx       # Update color classes
components/ui/CustomSelect.tsx         # Update color classes
components/ui/LegalModal.tsx           # Update color classes
```

---

## 🆕 COMPLETE REDESIGN (New Design for FH Brand)

These files need **completely new designs** - be creative!

### Public Pages
```
app/(public)/page.tsx                  # Homepage - NEW DESIGN
app/(public)/about/page.tsx            # About page - NEW DESIGN
app/(public)/contact/page.tsx          # Contact page - NEW DESIGN
app/(public)/faq/page.tsx              # FAQ page - NEW DESIGN
app/(public)/blog/page.tsx             # Blog listing - NEW DESIGN
app/(public)/blog/[slug]/page.tsx      # Blog post - NEW DESIGN
app/(public)/privacy/page.tsx          # Privacy policy - NEW DESIGN
app/(public)/terms/page.tsx            # Terms page - NEW DESIGN
```

### Package Pages (All need new design)
```
app/(public)/packages/combined/page.tsx
app/(public)/packages/zipline/page.tsx
app/(public)/packages/roller/page.tsx
app/(public)/packages/skywalk/page.tsx
app/(public)/packages/slingshot/page.tsx
app/(public)/packages/luge/page.tsx
```

### Layout Components
```
components/layout/Header.tsx           # NEW DESIGN - FH navigation
components/layout/Footer.tsx           # NEW DESIGN - FH footer
```

### Home Page Components (All need new design or removal)
```
components/home/HeroSlideshow.tsx      # NEW DESIGN or replace
components/home/FeaturedPackages.tsx   # NEW DESIGN
components/home/WhyChooseUs.tsx        # NEW DESIGN
components/home/PhotoGallery.tsx       # NEW DESIGN
components/home/Testimonials.tsx       # NEW DESIGN
components/home/Location.tsx           # NEW DESIGN
components/home/CallToAction.tsx       # NEW DESIGN
components/home/Partners.tsx           # NEW DESIGN
components/home/SafetyCertifications.tsx # NEW DESIGN
```

---

## ⚙️ CONFIGURATION (Update Values)

### Must Update
```
tailwind.config.ts                     # Change primary color, add fonts
app/layout.tsx                         # Site name, fonts, metadata
app/globals.css                        # May need color variable updates
.env.local                             # Create from .env.example
lib/email/resend.ts                    # Change EMAIL_FROM
lib/seo/config.ts                      # Update SEO settings
public/manifest.json                   # Update app name/colors
public/robots.txt                      # Update sitemap URL
```

### Metadata Files (Update for each page)
```
app/(public)/about/layout.tsx
app/(public)/contact/layout.tsx
app/(public)/faq/layout.tsx
app/(public)/packages/*/layout.tsx     # All package layouts
```

---

## ✅ NO CHANGES NEEDED (Keep As-Is)

### API Routes (All working - don't touch)
```
app/api/*                              # All API routes work as-is
```

### Library Files (Working - don't touch)
```
lib/auth/*                             # Authentication
lib/stripe/*                           # Stripe integration
lib/supabase/*                         # Database
lib/onebooking/*                       # OneBooking sync
lib/utils.ts                           # Utilities
lib/animations.ts                      # Animations
```

### Email Templates (Update branding text only)
```
lib/email/templates/BookingConfirmation.tsx    # Change "Hanuman World" to "Flying Hanuman"
lib/email/templates/NewBookingNotification.tsx # Change brand name
lib/email/templates/ContactFormEmail.tsx       # Change brand name
lib/email/templates/ContactAutoReply.tsx       # Change brand name
```

### Context & Types
```
contexts/AuthContext.tsx               # No changes needed
types/index.ts                         # No changes needed
```

---

## 📁 ASSETS TO REPLACE

### Images (Replace with FH images)
```
public/images/HW Logo.png              # Replace with FH logo
public/images/Gallery/*                # Replace with FH photos
public/images/Hero Image/*             # Replace with FH hero images
public/images/Package image/*          # Replace with FH package images
public/favicon.ico                     # Replace with FH favicon
```

### Logo Already Provided
```
logo/LOGO-NS.png                       # FH logo - move to public/images/
```

---

## 📊 Data Files (Update Content)

```
lib/data/packages.ts                   # FH packages, pricing, descriptions
lib/data/faq.ts                        # FH FAQ content
lib/data/blog.ts                       # FH blog posts (or use database)
```
