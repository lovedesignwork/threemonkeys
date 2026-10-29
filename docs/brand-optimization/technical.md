# Technical SEO and performance — Three Monkeys

Checked 29 October 2026, Asia/Bangkok. Baseline source: `6a0c3ea`, including the CMS blog work in `9dc0349` and the earlier SEO release `c70675c`.

## Production release verification

Latest application release `fa16b5c` is READY on deployment `dpl_HUzquT7dW6WUX8h2GgG5D9mooxdm` and aliased to the public domain. Production build and TypeScript passed. The legacy redirect integration script exited 0 against production after all eight redirects, seven valid routes and seven deliberate 404 controls passed. The live chat timed contact fallback and Wichit location copy were verified in the preceding `37bf29b` release. Earlier source-preparation notes below are historical; the current status is this verified release.

### Legacy navigation recovery

The release owner exported 293 Search Console 404 URLs from the historical 23 October indexing report. Trailing private-use UI icon characters were removed in memory when examining the export. Current HTTP checks confirmed four obsolete navigation URLs still returned 404 while their exact current counterparts returned 200 with matching page intent. Four explicit permanent 308 redirects were added: `/home` to `/`, `/contact-phuket-three-monkeys-restaurant` to `/contact`, `/faq-three-monkeys-restaurant-phuket` to `/faq`, and `/menu-three-monkeys-phuket-diner-thailand` to `/menu`. No blanket article/category redirect was added, no rooftop package was guessed, and Thai image-attachment URLs were left untouched.

`npm run build`, targeted ESLint and `git diff --check` passed. The local production integration test `node scripts/smoke-legacy-redirects.mjs http://localhost:3128` passed eight legacy/slash variants, permanent status, bounded redirect chains, query preservation, fixed same-origin destinations, seven unchanged current/localized pages and seven preserved unknown/deleted/attachment 404s. The temporary server was stopped. The release owner deploys and repeats this same test against the public domain.

Final release `4152b3b` also passed both production suites: `smoke-seo.mjs` (ten endpoints) and `smoke-blog.mjs` (nine currently published articles, latest/archive/category/sitemap checks, unpublished/private route protection and 16 unique internal article destinations). The final response confirms consent markup at byte 9,230 before main content at byte 15,635 and the corrected footer contrast classes.

### Final official scores — 19:19 Bangkok

[Final mobile report](https://pagespeed.web.dev/analysis/https-threemonkeysphuket-com/zpngpxozgc?form_factor=mobile) and [final desktop report](https://pagespeed.web.dev/analysis/https-threemonkeysphuket-com/zpngpxozgc?form_factor=desktop), captured 29 October 2026 after release `4152b3b`:

| Check | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | **97** | **96** |
| Accessibility | **100** | **100** |
| Best practices | **100** | **100** |
| SEO | **100** | **100** |
| Agentic browsing | 3/3 | 3/3 |
| FCP | 1.4 s | 0.4 s |
| LCP | 2.3 s | 0.9 s |
| TBT | 40 ms | 60 ms |
| CLS | 0.001 | 0.001 |
| Speed index | 3.9 s | 1.9 s |

Mobile consent element render delay fell to 660 ms from 1,190 ms in the preceding report; its lab LCP improved from 3.8 s to 2.3 s. Remaining diagnostics include server response latency (mobile TTFB 770 ms, estimated 670 ms opportunity), first-party CSS blocking (530 ms estimated mobile opportunity), and unused JavaScript. These are real remaining costs, but automatic diagnostic savings are not additive score promises. No artificial consent delay, content removal or animation removal was used. Performance is not 100 on either device; historical field data remains unchanged over this short interval. Screenshots: `docs/verification/psi-mobile-final-2026-10-29.jpg` and `psi-desktop-final-2026-10-29.jpg`.

### Chat resilience follow-up

The release owner's browser test loaded the vendor script/iframe after clicking chat, but the vendor did not emit its ready event within roughly one minute. The installed adapter confirms `onReady` and `visibility="maximized"` are supported; the specific external failure remains unverified. A 15-second fallback now replaces the disabled loading button with an actionable **Contact us** link and a status message. The existing immediate contact link remains while loading; the widget stays mounted so a late ready event can still open chat. No vendor script is loaded before the visitor clicks. ESLint, TypeScript and diff checks passed; the release owner verifies the timed UI after deployment.

Release `53c8857` was deployed to `https://threemonkeysphuket.com/` on 29 October. `node scripts/smoke-seo.mjs https://threemonkeysphuket.com` passed all ten endpoint checks, including real server-rendered headings on English and Chinese booking routes, canonical metadata, Search Console verification, private checkout noindex, sitemap, robots, llms, existing GA configuration and unauthenticated admin denial (401). Browser interaction and analytics checks are recorded separately by the release owner.

### Official PageSpeed after deployment

Fresh official report captured **29 October 2026, 19:12 Bangkok**, Lighthouse 13.5.0. [Mobile report](https://pagespeed.web.dev/analysis/https-threemonkeysphuket-com/e6uctrrpry?form_factor=mobile) and [desktop report](https://pagespeed.web.dev/analysis/https-threemonkeysphuket-com/e6uctrrpry?form_factor=desktop).

| Check | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | **86** | **93** |
| Accessibility | 97 | 97 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| Agentic browsing | 3/3 | 3/3 |
| FCP | 1.4 s | 0.4 s |
| LCP | 3.8 s | 0.9 s |
| TBT | 20 ms | 30 ms |
| CLS | 0 | 0.001 |
| Speed index | 4.4 s | 2.6 s |

The consent paragraph is the reported LCP element. The mobile detailed timing identifies 1,190 ms of element render delay and 610 ms TTFB. Mobile diagnostics estimate 510 ms for document latency, 510 ms for render-blocking requests, and 152 KiB unused JavaScript. Desktop estimates 170 KiB image-delivery savings and 124 KiB unused JavaScript. A safe accessibility follow-up is to increase the footer copyright and ONEBOOKING credit contrast: both currently use `text-white/30` against `#0a0a0a`. No content or feature removal is needed.

Historical 28-day Core Web Vitals remain failed (mobile LCP 3.1 s / CLS 0.49; desktop LCP 2.8 s / CLS 0.13). These field measurements cover past visits and must not be presented as measurements of only this release. Local screenshots: `docs/verification/psi-mobile-2026-10-29.jpg` and `psi-desktop-2026-10-29.jpg` (ignored artifacts).

### Measured follow-up prepared after the first report

- Footer copyright and ONEBOOKING credit now use `text-white/60` instead of `/30`, preserving their text and layout while improving contrast against `#0a0a0a`.
- The existing consent component was already server-rendered, but appeared after the full page content at byte 650,098 of a 724,335-byte production response. It now appears before page content inside the body. This makes the fixed consent panel available to the HTML parser earlier without altering its choices, storage, events or blocking defaults. Local production HTML confirms consent at byte 9,010 before `<main>` at byte 15,415, with no Google vendor script before consent. The local environment uses a placeholder CMS service key, so the article stream fell back locally; this check validates ordering and markup, not local CMS content.
- Production build, TypeScript, 13 analytics/tracking tests, targeted ESLint and `git diff --check` passed. The local production server was stopped after testing. These follow-up changes still need deployment and a new official PageSpeed run; do not attribute the earlier 86/93 result to them.
- Remaining blocking resources are three first-party stylesheets totaling 27.3 KiB transferred. Fonts already use `next/font`, self-hosting, preload and swap. Deferring all CSS or changing the brand's slideshow animation would risk visual behavior and is not part of this minimal follow-up.

## Verified current production

- `https://threemonkeysphuket.com/sitemap.xml` and `/robots.txt` both returned 200.
- A bounded crawl of all **252** current sitemap URLs found successful 200 responses, unique URLs, self-consistent production canonicals, titles and descriptions, and no unintended `noindex`. The sitemap count is lower than the 306 recorded on 27 October because the later CMS blog release consolidates English articles rather than advertising duplicate translated article routes.
- All 243 non-booking pages had exactly one H1 in the fetched HTML. The nine localized booking pages contained only their loading fallback until JavaScript ran. This is addressed in the source changes below.
- Requests using ordinary browser, Googlebot and OAI-SearchBot user-agent labels returned 200 and the homepage H1/title. This proves public HTTP access from this test environment, not that any provider has indexed or cited the site.
- Existing robots rules allow public content and image rendering while excluding admin, API, private and reservation capability paths. No existing AI training restrictions were changed. Robots/noindex are discovery controls, not access control.
- Full crawl evidence is stored locally at `docs/verification/public-seo-audit.json` (excluded from Git). Repeat with `node scripts/audit-public-seo.mjs`; it caps at 500 URLs, uses five concurrent workers and a one-second delay between requests per worker.

## Fresh performance evidence

The connected Ubersuggest PageSpeed tool completed a forced refresh of both device modes on 29 October. It returned the following lab metrics, but **did not expose numeric category scores**:

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| First contentful paint | 1.7 s | 478 ms |
| Largest contentful paint | 4.2 s | 1.1 s |
| Total blocking time | 92 ms | 124 ms |
| Cumulative layout shift | 0.001 | 0.001 |
| Speed index | 6.6 s | 2.8 s |
| Time to interactive | 11.7 s | 2.4 s |

The principal diagnostic was unused JavaScript (528 KiB mobile; 291 KiB desktop). The domain-based tool also included the HTTP-to-HTTPS redirect in its opportunities; canonical website/profile links should use HTTPS directly. Its field-data classifications still show slow mobile CLS and average LCP; field history does not reset when code is deployed. Do not reuse the older 59/95 scores as new measurements or claim a 100 performance result.

## Source changes prepared for release

- The homepage streams its below-fold CMS article section through Suspense. Its reserved responsive placeholder avoids delaying initial hero HTML on an uncached database query. Article content, navigation and publication filtering are preserved.
- The hero's current image loads eagerly; the first image gets high fetch priority. This uses the installed Next 16 image API rather than its deprecated `priority` prop. Slideshow controls, images and timing remain intact.
- LiveChat is a separate client chunk and loads only after the visitor selects **Chat with us**. It opens the same licensed support widget, with a contact-page fallback while loading. No chat vendor is initialized on admin, checkout, private reservation or other non-public paths. The installed adapter calls `destroy()` on unmount. Root approved this explicit support interaction as a privacy/performance improvement. Support availability remains; the previous automatic minimized-widget initialization is intentionally replaced.
- Booking's existing UI and behavior were moved unchanged to `BookingClient.tsx`. Its thin server page awaits Next `connection()` so the search-param-driven component renders for the request instead of emitting only a static loading spinner. Prices, availability, payments and selection logic were not modified by this move.
- `llms.txt` now describes factual public navigation without requesting AI recommendations. It explicitly identifies itself as supplementary and makes no ranking/citation guarantee.

These source changes require the main release's production deployment and browser verification before being marked **verified live**.

## Checks and limits

- ESLint passes for the changed technical files; SEO regression tests pass. The integrated production build passed compilation, TypeScript and generation of 228 static pages. Booking is now rendered dynamically. A local production server returned HTTP 200 for `/booking` and `/cn/booking`, with the actual booking H1 and introduction present in server HTML. The temporary verification server was stopped. Live browser and post-deployment checks remain outstanding.
- The combined command `node --test scripts/seo.test.mjs scripts/tracking.test.mjs scripts/analytics.test.mjs scripts/blog.test.mjs` passed all 15 reported tests, including the 12 existing/prepared article fixtures and publication guards.
- The final integrated build was repeated successfully after the content agent repaired a JSX closing-tag error in the refund page. It includes the final FAQ/policy source edits; `node scripts/booking-policy.test.mjs` also passed.
- The existing root document still emits `lang="en"` initially for localized routes; the existing `HtmlLangSync` corrects language/direction after hydration. Fixing this at the shared root using request headers would make all otherwise-static routes dynamic. The release owner elected to preserve static rendering and defer a larger root-layout restructuring. Valid language alternates remain present.
- No certification of all accessibility, SEO ranking, AI visibility or legal compliance is implied by automated checks.
- Independent analytics review found no release blocker in the current direct-GA configuration. Enhanced Measurement must be OFF for the stream to avoid duplicate/unsanitized automatic events. Purchase reporting remains client-dependent and intentionally partial: a trusted paid receipt is queued on confirmation and emitted only on return to a public page; the legacy hosted-session return path is not covered. See `analytics.md`.

## Documentation consulted

Installed Next 16.3.5 documentation was read before code changes: `dist/docs/01-app/03-api-reference/02-components/image.md`, `01-getting-started/06-fetching-data.md`, `02-guides/lazy-loading.md`, `02-guides/streaming.md` and `03-api-reference/04-functions/connection.md` under `node_modules/next`.

Primary public references: [Next Image API](https://nextjs.org/docs/app/api-reference/components/image), [Next streaming](https://nextjs.org/docs/app/guides/streaming), and [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots). OAI-SearchBot concerns search discovery; GPTBot concerns training. Neither bot's access is a promise of ranking or recommendation.
