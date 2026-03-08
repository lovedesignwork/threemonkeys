# Flying Hanuman - Quick Start Guide

## For the FH Cursor Agent

When you open this project in Cursor, tell the agent:

```
Read the AGENT_PROMPT.md file and follow the instructions to set up Flying Hanuman.
```

Or for a more detailed prompt:

```
This is the Flying Hanuman project. Please read these files in order:
1. AGENT_PROMPT.md - Main instructions and overview
2. FILE_MAP.md - Which files need what changes
3. BRANDING_CHECKLIST.md - Step-by-step checklist

Key requirements:
- Primary color: #f2e421 (yellow)
- Heading font: Trade Winds
- Body font: Google Sans
- Logo: public/images/FH-Logo.png
- Website ID: flying-hanuman

The Booking page and Checkout page must look EXACTLY like Hanuman World but with FH branding (yellow instead of blue). Other public pages (homepage, blog, FAQ, contact) need completely new designs.

Start with Phase 1 (configuration and admin rebranding), then move to Phase 2 (new designs for public pages).
```

## Manual Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
copy .env.example .env.local
```
Then edit `.env.local` with your values (see ENV_SETUP.md)

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Site
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin

## File Structure Overview

```
FLYING HANUMAN/
├── AGENT_PROMPT.md          # Main instructions for AI agent
├── FILE_MAP.md              # Categorized file list
├── BRANDING_CHECKLIST.md    # Step-by-step checklist
├── ENV_SETUP.md             # Environment variables guide
├── QUICK_START.md           # This file
├── logo/                    # Original logo files
│   └── LOGO-NS.png
├── public/
│   └── images/
│       └── FH-Logo.png      # Logo ready to use
├── app/                     # Next.js app directory
├── components/              # React components
├── lib/                     # Utilities and integrations
└── docs/                    # Technical documentation
```

## Key Differences from Hanuman World

| Aspect | Hanuman World | Flying Hanuman |
|--------|---------------|----------------|
| Primary Color | `#1a237e` (Blue) | `#f2e421` (Yellow) |
| Website ID | `hanuman-world` | `flying-hanuman` |
| Heading Font | Oswald | Trade Winds |
| Body Font | System | Google Sans |
| Email Sender | support@hanumanworldphuket.com | support@flyinghanuman.com |

## What's Already Working

These features work out of the box (no changes needed):
- ✅ Stripe payment integration
- ✅ Supabase database
- ✅ Admin authentication
- ✅ Booking flow logic
- ✅ Email sending (just update sender)
- ✅ OneBooking sync (just update website_id)
- ✅ All API routes

## Support

Refer to the `/docs/` folder for technical specifications from the original Hanuman World project.
