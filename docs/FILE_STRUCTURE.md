# Project File Structure

```
HANUMAN WORLD/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Homepage
│   │   ├── layout.tsx               # Public layout with Header/Footer
│   │   ├── blog/
│   │   │   ├── page.tsx             # Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Individual blog post
│   │   ├── booking/
│   │   │   ├── page.tsx             # Booking form
│   │   │   └── confirmation/
│   │   │       └── page.tsx         # Booking confirmation
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact page
│   │   ├── faq/
│   │   │   └── page.tsx             # FAQ page
│   │   └── packages/
│   │       ├── combined/
│   │       │   └── page.tsx         # Combined packages
│   │       ├── zipline/
│   │       │   └── page.tsx         # Zipline packages
│   │       ├── roller/
│   │       │   └── page.tsx         # Roller zipline
│   │       ├── skywalk/
│   │       │   └── page.tsx         # Skywalk
│   │       └── slingshot/
│   │           └── page.tsx         # Slingshot packages
│   ├── admin/
│   │   ├── layout.tsx               # Admin layout
│   │   ├── page.tsx                 # Admin dashboard
│   │   ├── bookings/
│   │   │   └── page.tsx             # Manage bookings
│   │   ├── blog/
│   │   │   ├── page.tsx             # Blog management
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create new post
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit post
│   │   └── contacts/
│   │       └── page.tsx             # View contact submissions
│   ├── api/
│   │   ├── bookings/
│   │   │   └── route.ts             # Booking API
│   │   ├── blog/
│   │   │   └── route.ts             # Blog API
│   │   ├── contact/
│   │   │   └── route.ts             # Contact API
│   │   └── stripe/
│   │       └── route.ts             # Stripe webhooks
│   ├── globals.css                   # Global styles & animations
│   ├── layout.tsx                    # Root layout
│   ├── favicon.ico
│   ├── sitemap.ts                    # Auto-generated sitemap
│   └── robots.ts                     # robots.txt generation
│
├── components/
│   ├── home/
│   │   ├── index.ts                  # Export all home components
│   │   ├── HeroSlideshow.tsx         # Hero section with slideshow
│   │   ├── FeaturedPackages.tsx      # Package cards section
│   │   ├── WhyChooseUs.tsx           # Features section
│   │   └── PhotoGallery.tsx          # Scrolling photo gallery
│   ├── layout/
│   │   ├── index.ts
│   │   ├── Header.tsx                # Main navigation
│   │   ├── Footer.tsx                # Footer
│   │   └── MobileMenu.tsx            # Mobile navigation
│   ├── packages/
│   │   ├── index.ts
│   │   ├── PackageCard.tsx           # Individual package card
│   │   ├── PackageGrid.tsx           # Grid of packages
│   │   └── PackageDetails.tsx        # Full package details
│   ├── booking/
│   │   ├── index.ts
│   │   ├── BookingForm.tsx           # Main booking form
│   │   ├── DateTimePicker.tsx        # Date and time selection
│   │   ├── GuestSelector.tsx         # Number of guests
│   │   └── PaymentForm.tsx           # Stripe payment
│   ├── blog/
│   │   ├── index.ts
│   │   ├── BlogCard.tsx              # Blog post preview card
│   │   ├── BlogContent.tsx           # Full blog post content
│   │   └── BlogSidebar.tsx           # Blog sidebar
│   ├── admin/
│   │   ├── index.ts
│   │   ├── AdminSidebar.tsx          # Admin navigation
│   │   ├── BookingsTable.tsx         # Bookings list
│   │   ├── BlogEditor.tsx            # TipTap editor
│   │   └── ContactsTable.tsx         # Contacts list
│   └── ui/
│       ├── index.ts                  # Export all UI components
│       ├── Button.tsx                # Button component
│       ├── Card.tsx                  # Card component
│       ├── Input.tsx                 # Input component
│       ├── Section.tsx               # Section wrapper
│       ├── Container.tsx             # Container component
│       ├── Badge.tsx                 # Badge component
│       └── Modal.tsx                 # Modal component
│
├── lib/
│   ├── data/
│   │   ├── packages.ts               # Package data & helpers
│   │   ├── blog.ts                   # Mock blog data
│   │   └── faq.ts                    # FAQ data
│   ├── utils.ts                      # Utility functions (cn, formatPrice, etc.)
│   ├── animations.ts                 # Framer Motion variants
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client (future)
│   │   └── types.ts                  # Database types (future)
│   └── stripe/
│       └── client.ts                 # Stripe client (future)
│
├── types/
│   └── index.ts                      # TypeScript interfaces
│
├── public/
│   └── images/
│       ├── HW Logo.png               # Main logo
│       ├── grungebg.png              # Grunge texture
│       ├── circlebg.png              # Circle decoration
│       ├── BG_resize.jpg             # Why Choose Us background
│       ├── Hero Image/               # Hero slideshow images
│       │   ├── Combined Zipline.jpg
│       │   ├── Zipline 32 Platform.jpg
│       │   ├── Roller Zipline.jpg
│       │   ├── Skywalk.jpg
│       │   └── Slingshot2.jpg
│       └── Gallery/                  # Photo gallery images
│           ├── Hanuman World Phuket 1 Zipline.JPG
│           ├── Hanuman World Phuket 2 Zipline.jpg
│           └── ... (34 images total)
│
├── docs/
│   ├── PROJECT_PLAN.md               # This file
│   ├── DESIGN_SPECIFICATIONS.md      # Design specs
│   ├── PACKAGE_DATA.md               # Package information
│   └── FILE_STRUCTURE.md             # File structure
│
├── tailwind.config.ts                # Tailwind configuration
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── .env.local                        # Environment variables (future)
```

## Key Configuration Files

### tailwind.config.ts
- Custom colors: primary, primary-dark, accent, accent-dark, background-dark
- Custom fonts: Oswald (headings), Inter (body)
- Extended animations and keyframes

### next.config.ts
- Image optimization with remote patterns
- Allow images from any hostname for development

### package.json Dependencies
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "framer-motion": "^11.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "@supabase/supabase-js": "^2.x",
    "@stripe/stripe-js": "^2.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "react-day-picker": "^8.x",
    "date-fns": "^3.x",
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x"
  }
}
```
