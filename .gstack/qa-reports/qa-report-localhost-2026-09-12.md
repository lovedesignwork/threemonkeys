# Three Monkeys Restaurant website audit

Date: 12 September 2026. Target: local website at http://localhost:3000. Baseline: `156a171d39ff6ec63a1f07091dcee4090ea443a7` on `main`.

## Result

**42 issue groups identified and corrected in source.** Repeated occurrences across endpoints/files count once. The 12 vulnerable production dependency packages count as one dependency-maintenance issue, not 12 extra website bugs. Cosmetic lint corrections and the earlier menu/PPTX fixes are not included in this count.

**Three fixes require production configuration or migration work**: the embedded integration credential, paid-promo accounting, and the email sender. No production migration, booking, payment, email, or admin account change was made by this audit. The verified source changes are prepared for GitHub review on `codex/website-audit-2026-09-12`; production setup remains required.

This is a bounded browser, source, dependency and regression-test audit. It does not establish that every possible bug is absent.

## Findings and corrections

| # | Issue observed or reproduced | Correction |
|---|---|---|
| 1 | User creation/update/deletion endpoints exposed service-role operations without caller authorization. | Require an active authenticated superadmin; client requests carry tokens. |
| 2 | Admin bootstrap contained a default setup key/credentials and returned a password. | Disabled by default; explicit opt-in, strong environment key and explicit validated credentials; no password response. |
| 3 | Creating an admin did not consistently bind its primary key to the Auth UUID. | Set both admin identifiers to the newly created Auth UUID. |
| 4 | Account changes accepted invalid fields or continued after failed/missing target lookups. | Validate account payloads and require a successful target lookup before mutation. |
| 5 | Email/wildcard matching could substitute for verified admin identity. | Membership lookup uses the verified Auth UUID only. |
| 6 | Unauthenticated check-admin queries disclosed admin membership. | Require a token and return only the caller's active membership. |
| 7 | Account-management APIs could disable/delete protected superadmins or lock out the caller. | Protect superadmin/self mutations on the server. |
| 8 | Failed Auth deletion could leave the corresponding admin row permanently removed. | Restore the admin record if Auth deletion fails. |
| 9 | A historical SQL function embedded an integration credential and a cloned endpoint. | Remove embedded values and provide migration 019 using secure database settings. **Rotate the historical key and apply the migration.** |
| 10 | A forged client discount could reduce a ฿4,000 booking to ฿1. | Ignore client discount amounts and recompute the payable total on the server. |
| 11 | Payment creation could bypass promo eligibility, dates, minimums and usage checks. | Share promo validation between preview and both payment routes. |
| 12 | Invalid guests, calendar dates, slots, extras and transport details reached payment creation; the UI also stripped valid contact/LINE text. | Validate booking selection and customer data before writes; preserve entered contact text. |
| 13 | Hosted checkout used stale prices and multiplied fixed table/package prices by guest count. | Both payment routes use the same catalog, admin overrides and fixed/per-person pricing rules. |
| 14 | Direct checkout requests bypassed disabled packages, date blocks, add-ons and sold-out checks. | Verify availability and enabled options before creating a pending booking. |
| 15 | Payment initiation could continue after customer, transport or add-on records failed to save. | Require all detail writes to succeed; cancel an incomplete pending booking on failure. |
| 16 | Abandoned/failed checkouts consumed promo uses; repeated success events could miscount. | Count on paid confirmation with an atomic persistent marker. **Migration 018 and coordinated cutover required.** |
| 17 | Malformed checkout query parameters displayed invalid totals/payment controls. | Validate URL selections and show an actionable recovery screen preserving the edit link. |
| 18 | Browser-local dates caused incorrect Phuket deadlines and calendar date/month shifts overseas. | Share Phuket-time booking rules and parse date-only calendar values locally without UTC date shifts; refresh expired selections. |
| 19 | Zone 7 booking accepted 50 guests while its published description allows 10. | Use 10 in both UI and server, including boundary checks. This follows the published catalog pending owner confirmation. |
| 20 | Duplicate/out-of-order payment events could re-confirm refunded bookings, cancel settled bookings, duplicate effects or treat partial refunds as full. | Conditional payment transitions, one confirmation path, stable refund idempotency, guarded failure/refund processing and retryable database errors. |
| 21 | Checkout showed only the weekday, hiding the actual reserved date. | Display the full selected date, including year. |
| 22 | Checkout overflowed narrow mobile screens. | Allow grid/flex children and phone/promo fields to shrink; verified no document overflow at the tested mobile widths. |
| 23 | SEO keywords containing regex syntax such as `[` crashed analysis. | Count literal keyword occurrences. |
| 24 | The SEO introduction check searched the entire article after stripping paragraphs. | Extract the first paragraph before removing HTML. |
| 25 | Nested editor component definitions caused controls/inputs to remount while typing. | Keep SEO sections and rich-text toolbar component identities stable. |
| 26 | Contact/checkout fields and booking controls lacked accessible names or keyboard-operable add-on toggles. | Bind labels, name time/guest controls, and use native add-on switch buttons. |
| 27 | Custom dropdowns lacked expected keyboard navigation and ARIA state. | Add arrow/Home/End/Enter/Space/Escape/Tab behavior, disabled-option handling and focus restoration. |
| 28 | Contact Subject appeared required but empty selection was not validated in the form. | Block submission, show an error and focus the subject control. |
| 29 | Contact API accepted malformed fields and could report success after losing the message. | Trim/validate bounded strings, return 400 for malformed input, require successful persistence, then run notifications. Saved messages remain available when notifications fail. |
| 30 | Public/admin metadata, placeholders and brand documentation retained cloned business/domain references. | Use Three Monkeys restaurant details and configured social/domain values; replace the stale branding checklist. |
| 31 | Live chat greeted visitors as Hanuman World through a hardcoded license. | Remove the cloned license fallback; chat loads only with an explicitly configured restaurant license. |
| 32 | Outgoing email used the cloned site's sender domain. | Support an explicit `EMAIL_FROM` with a Three Monkeys default. **Restaurant sender domain is not listed as verified in the configured Resend account.** |
| 33 | Missing page metadata and preview-domain/incorrect language canonicals misidentified pages. | Add page metadata, use the restaurant domain, and keep translated canonical/alternate URLs tied to the actual page. |
| 34 | Structured data/AI information included unsupported claims, contradictory hours, fabricated ratings and nonexistent image/search URLs. | Align it with restaurant/site information, remove unsupported claims and use existing image endpoints/assets. |
| 35 | Static robots/sitemap files conflicted with generated routes and retained cloned links. | Remove stale public files and use the generated restaurant routes. |
| 36 | Checkout cancellation support links used the cloned site's phone number. | Point phone and WhatsApp links to +66 98-010-8838. |
| 37 | The map marker and booking/email addresses pointed to Kathu instead of the site's Wichit address. | Use a named restaurant map and Wichit address; remove unverified coordinate claims. |
| 38 | Homepage Monkey Nest price/capacity disagreed with the booking catalog, and featured cards ignored admin controls. | Show current effective prices, six-person Nest capacity, and filter disabled packages. |
| 39 | Maintenance preview/admin bypass skipped locale routing. | Continue through locale middleware after a valid bypass. |
| 40 | npm reported 12 vulnerable production packages, including critical Next.js advisories. | Upgrade Next.js/its ESLint config to 16.3.5 and apply compatible dependency fixes; npm audit reports zero known vulnerabilities. |
| 41 | Blog readers depended on an absent author foreign-key relationship and an obsolete author column. | Load posts independently and resolve optional authors explicitly, so author lookup failures cannot hide published content. |
| 42 | Public analytics/verification code called the protected admin-settings API and received 401 responses. | Read only validated, browser-public tracking IDs and verification values through a dedicated public endpoint; keep admin settings protected. |

## Verification

- Browser: desktop and narrow mobile layouts; homepage, menu/categories, seats, contact, FAQ/search/answers, booking selections, checkout/edit navigation, invalid checkout parameters and translated routes. The previous Enoki Thai label correction remained visible.
- Confirmed a valid Monkey Dome reservation shows ฿4,000 for two guests. Invalid negative guest count shows recovery UI and no payment form. Back-navigation preserves package/date/time/guest selections.
- Contact subject keyboard selection works. The cloned live-chat iframe is absent. Mobile checkout no longer overflows and the full date remains visible.
- `npm run test:audit`: all eight offline suites pass. Core suites include 29 auth tests, 62 checkout tests, 15 webhook tests, 44 invalid contact payload cases plus persistence cases, UI behavior assertions, site-routing/metadata checks, eight blog-reader tests and tracking/privacy assertions.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-checkout-promo.ps1`: isolated temporary local PostgreSQL checks passed, including repeated/concurrent payment updates and migration reapplication. No application database credentials were used.
- `npm audit`: zero known vulnerabilities after updates; initial production-only audit reported 12 affected packages.
- Production build, final TypeScript check and post-build browser smoke: final result recorded below before completion.
- Full-repository ESLint baseline was 82 errors / 62 warnings. The audit removed the editor remount errors and escaped existing JSX punctuation. Some pre-existing type/style/effect warnings remain; these are not counted as separate runtime bugs. Final counts recorded below.

## Production work still required

1. **Promo accounting (018):** pause checkout traffic, let old in-flight payment-creation requests finish, apply `supabase/migrations/018_count_paid_promo_usage.sql`, deploy the matching checkout code, then resume. Mixing old creation code and the new marker migration can miscount. Existing historical usage totals are preserved rather than reconstructed.
2. **Integration credential (019):** revoke/rotate the exposed historical credential at the receiving service. Configure database settings `app.onebooking_api_url` (full HTTPS sync endpoint) and `app.onebooking_api_key`, then apply `supabase/migrations/019_secure_onebooking_sync_config.sql`. Missing values skip database sync; the migration does not create/re-enable triggers. The old value remains in Git history and must not be reused.
3. **Email:** verify the restaurant sender domain in Resend and configure `EMAIL_FROM`. The new default sender will not deliver until its domain is verified (or EMAIL_FROM names another explicitly approved verified sender). This audit did not send mail or change provider settings. Contact messages now survive notification failures because database persistence is required first.

Optional: configure the restaurant's own `NEXT_PUBLIC_LIVECHAT_LICENSE` to restore live chat. Phone, WhatsApp and email links remain available. Review persisted admin settings for legacy values: corrected defaults do not overwrite saved settings.

## Remaining limits and assumptions

- No live payment/refund, admin login/mutation, email delivery or deployed-database migration was exercised. Those integration paths were tested with mocks or a temporary PostgreSQL fixture.
- Promo maximum use is checked when quoting without reserving uses. Distinct concurrent checkouts can exceed a final remaining use; this remains a concurrency limitation.
- Payment fulfillment has no durable outbox. An interruption after the winning confirmation update but before table assignment/notifications can still require admin recovery. A later automatic availability refund may retain the successful-payment promo usage count.
- Zone 7 uses the published maximum of 10 pending owner confirmation. Existing Zone 6 group limit (50) and Hilltop group limit (20) were retained despite per-table wording that would benefit from owner clarification.
- Hours were aligned to the current site's 10AM–1AM / midnight-last-order copy. The older live site's contact page has different hours; the restaurant should confirm the operational schedule.
- Unverified third-party link ownership, all nine complete translations, every menu photograph and historical database content were not exhaustively certified. Valid references to being located **inside Hanuman World** were retained because they identify the venue's location.

## Source references

- Restaurant identity/contact reference: [official contact page](https://threemonkeysphuket.com/contact/). Current repository booking catalog and admin-control code were used for prices and booking behavior.
- Next.js Windows RCE advisory: [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36).
- Tiptap DOM-attribute advisory: [GHSA-cp6q-959q-f8rh](https://github.com/advisories/GHSA-cp6q-959q-f8rh).

## Final verification record

- Final production build on Next.js 16.3.5: PASS (227 static pages; new public tracking route included).
- TypeScript check performed by the final production build: PASS.
- All eight offline regression suites: PASS.
- Dependency audit: zero known vulnerabilities.
- Whitespace check: PASS.
- Repository-wide ESLint: 18 existing errors and 65 warnings remain, primarily explicit-any types, effect rules and unused variables. The lint command is not clean.
- Post-build production browser smoke: PASS for home, menu, contact, valid/invalid checkout and Thai menu. Desktop width 1280 and mobile width 375 checked; no horizontal document overflow in the inspected pages.
- Production route checks: robots.txt, sitemap.xml, manifest and /api/tracking returned 200; unauthenticated /api/admin/settings remained 401. Tracking response contains only ga4Id, gtmId, metaPixelId and verification.
- Verified homepage Monkey Nest: ฿5,000 per table, up to six guests. Valid two-guest Monkey Dome checkout: ฿4,000, complete date visible, payment disabled until required details. Negative guests: recovery screen and no Pay button.
- Final preview: http://localhost:3000/menu, running the production build locally. The verified source changes are included in the audit review branch; publication is recorded in Git history.
