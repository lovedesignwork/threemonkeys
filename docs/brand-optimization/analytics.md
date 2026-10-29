# Analytics privacy and attribution — Three Monkeys

Verification date: 29 October 2026 (Asia/Bangkok)

## State and configuration

- Existing production GA4 measurement ID: G-6JMLEKYFPG; property407293377; web stream6112259459. No duplicate property was created.
- Before these changes, the direct Google tag autoloaded across the root layout, including private booking/checkout URLs, with automatic page views. No cookie preference UI existed even though the cookie policy described one.
- New source is implemented and code-tested; deployment and owner-account live validation are recorded by the main work log. Do not interpret this file as proof of an observed purchase.
- GA4 Enhanced Measurement must remain OFF for this stream. In particular, automatic browser-history page views, form/search interactions, outgoing links and downloads must not be re-enabled without reviewing private data exposure. `send_page_view:false` alone does not suppress automatic history events.
- Root `TrackingScriptsHead` is the sole initial/public client-navigation page-view owner. When an existing GTM ID is configured, it takes precedence and direct GA is omitted to avoid a second Google tag. Current production uses direct GA, not GTM.
- Keep Google email redaction enabled. The parent is adding sensitive URL query keys as defense in depth. Manual page views remove all query parameters except validated campaign labels, and exclude private routes entirely.

## Consent and data minimization

- Optional analytics and marketing default to off. Consent controls allow separate categories, reject optional, save choices, and accept all. A persistent Cookie Settings button allows changes.
- Choice storage: `tm_consent_v1`, one-year lifetime. Existing/unknown or malformed choices fail closed. Revocation disables GA immediately, clears analytics attribution/receipt storage and identifiable vendor cookies, then reloads to unload already-running vendors.
- The current production GA tag is loaded only after analytics opt-in on allowlisted public routes. Admin, APIs, maintenance, reservation capability URLs, checkout and checkout-success/cancel pages never initialize the tag. If navigating there from an already-tracked public page, the GA disable flag is set.
- Public page locations use the canonical production origin and public path. Email, phone, freeform text, booking references, payment/client secrets, session IDs, hashes and all non-campaign queries are omitted. External referrers retain only their origin; internal referrers retain only a public path with no query/hash. GA advertising signals/personalization are disabled.
- No hidden noscript pixel bypasses consent. Optional custom/pixel/GTM scripts are gated by marketing opt-in and a public route. These are not configured in the current live settings. If vendors are introduced later, audit their own SPA/private-route behavior; a generic container's code is not proof of privacy compliance.
- Cookie policy text now points to the actual bottom-of-page settings control and explains optional tracking stays off until chosen. This implementation is not a legal compliance certification.

## Campaign attribution

- Model: last valid campaign touch, retained through direct/internal navigation for30days, refreshed only by a new valid campaign. Requires analytics consent. Storage: `tm_attribution_v1`.
- Allowed keys: utm_source, utm_medium, utm_campaign, utm_content, utm_term. Values are short campaign labels (letters, digits, hyphens and underscores), with rejection of likely secrets, email/URL/freeform values and long phone-like digit runs. GBP labels such as `google/organic/gbp` and `post_2026_10_29_rooftop` are supported.
- Click identifiers are intentionally not retained: no Google Ads integration was established, so they are not needed for this scope.
- Checkout reads a validated snapshot; both payment-intent and legacy Checkout-session creation routes revalidate it server-side and persist labels plus the consent flag in Stripe payment metadata. Customer details already required by the payment provider are unchanged. No new booking database column/migration is required.
- Malformed attribution or unavailable storage produces an empty optional metadata object, never a booking/payment failure. Amount calculation, discounts, payment creation and booking status behavior are unchanged.

## Purchase reporting and practical limits

- `/api/analytics/purchase` accepts a same-origin POST using the existing booking-reference/payment-intent confirmation capability. It does not return names, emails, phones, booking references, payment IDs or client secrets.
- A receipt is eligible only when the persisted booking is confirmed/completed, its payment ID and booking ID match the Stripe record, Stripe reports succeeded, amount received exactly matches the stored amount, currency matches, and analytics consent was recorded at checkout.
- Transaction IDs sent to GA are stable hashes of the payment ID. They are not booking access credentials. The value is the actual THB paid total, including any extras/discounts; the single item represents the reservation transaction rather than an invented per-guest food bill.
- The private confirmation page queues only the server-verified sanitized receipt; it does not run GA. Reporting happens only when that consenting visitor next opens a public site page. Queue lifetime is7days. Receipt payloads are allowlisted again after reading browser storage.
- An in-memory ledger, a bounded persisted browser ledger and GA's stable transaction ID prevent routine repeat purchase reporting on refresh/navigation. Storage/queue semantics do not provide a distributed exactly-once delivery guarantee.
- **Undercount limitation:** visitors who leave from confirmation without returning to a public page will not emit purchase. Blocked scripts/storage, declined consent and network loss also reduce counts. This is a conservative client implementation, not complete server-side revenue reporting. Legacy Stripe hosted-session return URLs do not provide the direct payment-intent confirmation pair, so this implementation does not report that legacy return path.
- No payment was made, no fake purchase was sent to production, and no real paid conversion was observed for validation. Purchase logic is code-tested only. A future consent-aware server Measurement Protocol implementation would require securely managed API credentials and durable event/outbox handling.

## Verification performed

- `node scripts/analytics.test.mjs`: nine tests pass (public URL cleaning; private route exclusion; referrer minimization; campaign validation;30-day attribution; explicit/expiring consent; trusted paid-state checks; duplicate ledger; stored receipt allowlist).
- `node scripts/tracking.test.mjs`: five tests pass, including the native Arguments command protocol expected by Google's loader. The direct tag uses this queue instead of rest-parameter arrays; config and event commands retain their order and payload identity.
- `npx tsc --noEmit`: passed before final documentation; main release should run the full build after combining other agents' work.
- ESLint on changed tracking/analytics/payment/cookie files: no errors; two pre-existing unused-variable warnings in checkout/page.tsx.

## Production acceptance checks

1. In a fresh browser context, reject optional tracking: no GA tag or collection requests; bookings remain usable.
2. Allow Analytics only: one initial public page_view and one per actual public navigation; no duplicate history events. Marketing remains off.
3. Visit a tagged public URL with a controlled `utm_content=verification_2026_10_29` label; verify the exact property Realtime/DebugView and campaign metadata.
4. Navigate to checkout/private paths: GA disable flag active and no private page view; inspect outgoing payloads for absence of hotel/requests/payment/booking identifiers.
5. Revoke consent: reload and confirm the tag stays off. Re-enable only if explicitly chosen.
6. Test malformed purchase lookup with dummy values only; response exposes no private booking record. Do not create a fake production order to test reporting.

Primary documentation: https://developers.google.com/analytics/devguides/collection/ga4/views?technology=websites ; https://developers.google.com/analytics/devguides/collection/ga4/reference/config ; installed Next16.3.5 `node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md`, `use-pathname.md`, and route-handler documentation were read before implementation.
