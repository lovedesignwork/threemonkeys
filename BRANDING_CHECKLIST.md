# Three Monkeys Restaurant — Branding Checklist

Use this checklist when reviewing restaurant branding and content inherited from the original booking-site template. It is a review aid, not a deployment plan. Unchecked items require verification; they do not imply that a defect exists.

## Current references

| Item | Source of truth |
| --- | --- |
| Public name | `siteConfig.name` in `lib/seo/config.ts`: Three Monkeys Restaurant |
| Website URL | `siteConfig.url` in `lib/seo/config.ts` |
| Customer contact | `siteConfig.contact` in `lib/seo/config.ts` |
| Email | `enjoy@threemonkeysphuket.com` |
| Phone | `+66 98-010-8838` |
| Location | Inside Hanuman World, Phuket; use the full address from `siteConfig.contact.address` |
| Public colors and fonts | `app/globals.css`: primary `#b1b94c`, heading font Krona, body font Inter |
| Dining zones and booking allocation | `lib/allotment/zones.ts`, `lib/allotment/server.ts`, and the configured `tm_zones` inventory |

Use the shared configuration for new branding references so page copy, metadata, and admin previews stay consistent when the site URL or contact details change.

## Confirmed corrections

- [x] Contact metadata uses the restaurant name and shared contact details.
- [x] Admin settings defaults use the restaurant name, email, and phone.
- [x] Admin booking information describes table availability and manual assignment for special packages.
- [x] Blog SEO previews and the canonical URL placeholder use the configured website URL.
- [x] This checklist describes Three Monkeys Restaurant and its current application structure.

## Public website review

- [ ] Check the header, footer, logo alt text, favicon, and social preview images for the restaurant identity.
- [ ] Review all locale variants under `app/[locale]/(public)` and their translation messages.
- [ ] Review the home, about, contact, menu, seats, FAQ, and blog pages for restaurant-specific copy and working links.
- [ ] Review dining-zone and special-package pages against the current restaurant offerings.
- [ ] Check booking, checkout, success, cancellation, and reservation pages for the correct name and contact details.
- [ ] Check privacy, terms, refund, and cookie pages for the correct business references.
- [ ] Check metadata, canonical URLs, alternate-language URLs, structured data, sitemap, robots, and AI-readable content against the shared site configuration.
- [ ] Verify public pages on desktop and mobile, including keyboard navigation and readable contrast.

## Admin and communications review

- [ ] Review admin login, navigation, settings, empty states, and help text for copied branding.
- [ ] Verify persisted site settings as well as code defaults; saved settings can override defaults.
- [ ] Check blog search and social previews against the configured site URL.
- [ ] Review customer confirmations, booking notifications, contact messages, and auto-replies for the restaurant name, links, logo, and customer contact details.
- [ ] Confirm table availability messages agree with dining-zone allotment rules and special-package handling.

## Preserve valid references and integration settings

- Keep the factual location reference **Inside Hanuman World** and genuine partner names or links.
- Review matches in context; do not globally replace every occurrence of another business name.
- Preserve internal website IDs, database identifiers, booking references, storage paths, and integration keys unless a separately scoped integration change requires them.
- Treat the verified email sender domain separately from customer-facing contact details; a branding edit must not change delivery configuration automatically.
- Review existing assets before replacing or removing them. A filename alone does not establish whether an image is incorrect.
- Validate payment, email, contact submissions, and booking synchronization in an appropriate test environment before performing actions that create bookings, send messages, or charge payments.
