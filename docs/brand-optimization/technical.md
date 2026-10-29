# Technical SEO and performance — Three Monkeys

Checked 29 October 2026, Asia/Bangkok. Baseline source: `6a0c3ea`, including the CMS blog work in `9dc0349` and the earlier SEO release `c70675c`.

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
