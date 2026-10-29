# Three Monkeys brand optimization — 29 October 2026

Timezone: Asia/Bangkok. Owner account: lovedesignwork@gmail.com. Production: https://threemonkeysphuket.com. Repository: lovedesignwork/threemonkeys. Work follows the owner-supplied brand-optimization-handoff.

## Owner decisions

- Guest deposits are non-refundable; rescheduling is allowed. Correct the FAQ and contradictory website copy. Preserve existing restaurant-cancellation remedies and existing rescheduling notice requirements.
- Publish the first campaign item on October 29 as an explicit exception to the already-exceeded October publishing cap. Continue November 2, 5 and 9 at 09:00 Bangkok.
- Activate native scheduling plus local Monday/Thursday checks. No new paid service or outbound guest review invitations.
- Authentic website images are approved for articles and the business workflow. Maintain visual/hash deduplication; historical GBP media comparison is incomplete.

## Google configuration already verified

- Business profile ID 12311846240019152719. Description updated and accepted in editor. Website UTM edit accepted and verified by reopening on October 29. Direct /booking UTM link added and marked PREFERRED, preserving onebooking.co.
- GA4 account 285608319, property 407293377, stream 6112259459, measurement ID G-6JMLEKYFPG. Existing data collection active in preceding 48 hours. Enhanced Measurement switched OFF and verified after reload. Email redaction retained; 17 sensitive query keys saved. Screenshot evidence under docs/verification/brand-optimization.
- Existing Search Console URL-prefix property https://threemonkeysphuket.com/ verified for the owner. October 27 sitemap submission succeeded; current sitemap crawl has 252 URLs after the intervening CMS release. October 29 resubmission accepted with Success and 252 discovered pages at observation; new arrival article was already discovered and its indexing request was accepted. Indexing itself remains pending.
- Search Console already associates a property named Three Monkeys Restaurant Phuket - GA4 with stream Website. This differs from property 407293377. Preserve the existing association; do not unlink legitimate access merely to force another association.

## Local automation

Created and verified ACTIVE: three-monkeys-publishing-and-reviews. Thread heartbeat, Monday/Thursday 09:00 Asia/Bangkok. First eight Monday/Thursday dates each month; November 2, 5, 9, 12, 16, 19, 23, 26 (skip November 30). Requires the computer and authenticated Chrome. Native queued items may publish independently. This is not a deployed cloud automation. Pause through the app automation card or update this exact automation ID.

Each run must reconcile content-calendar.json, article-assets.json, gbp-assets.json and the private review ledger, avoid duplicate native items, record a run lock, and publish only ready accurate content using unused approved media. Notify only meaningful completion/failure/shortage/access issues. Future content beyond the prepared four requires fresh editorial work and new images.

## Release status

Production release 53c8857 and follow-ups 32a4625 / 4152b3b deployed successfully. Latest code release 37bf29b deployment dpl_75xuU2qDpT16vhLRtA9BgA3cn8tJ is READY and aliased to https://threemonkeysphuket.com. Build, TypeScript, targeted lint, SEO/tracking/analytics/blog/policy tests and production SEO/blog smoke checks passed. The first article and GBP post are published and verified; remaining three article and GBP schedules are saved for November 2, 5, 9 at 09:00 Bangkok. Today’s separate profile photo uploaded successfully; on reload its pending label cleared and the correct lantern photo was verified in the manager; future separate photos remain prepared for local checks.

Current limitations: root document initially emits lang=en before client locale correction; purchase reporting intentionally queues a verified receipt until the consenting customer returns to a public page, so it is not complete revenue reporting. No fake purchase or real charge used for testing. No 100 PageSpeed or ranking/AI recommendation claim.

Review replies: root's moayad Khalaf response verified; specialist continues the large unanswered queue. Private ledger: docs/verification/brand-optimization/review-ledger.json. Never overwrite existing staff replies or claim the queue is clear without checking all pages.

## Evidence and supporting notes

- technical.md: crawl, performance baseline, source changes and tests.
- analytics.md: consent, attribution, trusted conversion conditions and limitations.
- gbp-posts.md: draft campaign copy and future content plan (actual saved copy may differ; calendar records final destinations).
- article-media.json and asset ledgers: approved media registry and exclusive usage.
- docs/verification/: private local screenshots, SQL payloads, audit reports; excluded from Git/deployment.

## Latest live verification

- Official PageSpeed after early consent rendering and contrast fix: mobile 97, desktop 96; accessibility, best practices and SEO 100 on both. Report https://pagespeed.web.dev/analysis/https-threemonkeysphuket-com/zpngpxozgc. Performance100 not achieved or guaranteed.
- Consent defaults and rejection show no Google vendor script; Analytics opt-in loads exactly the configured G-6JMLEKYFPG tag. Corrected gtag queue to native Arguments protocol with regression test. Realtime property407293377 shows one arrival-article view and one subsequent contact-page view from the labeled controlled visit. Screenshots ga-realtime-article.png and ga-realtime-navigation.png are private local evidence. No fake purchase or charge.
- GA reporting timezone is ThailandGMT+07. Existing display currency is USD. Changing to THB is blocked by missing required business size; owner asked for employee band. Do not claim the unsaved form changed currency.
- Website UTM and new description accepted on reopened GBP editor. Address/phone/hours remain consistent; Google-suggested dietary/accessibility/service attributes were preserved pending factual confirmation.
- Official review link obtained from brand manager: https://g.page/r/CVMO-9VMLOZ3EBE/review; redirects to verified brand Maps identity and review form.
- Chat vendor loaded its script and iframe but did not emit ready during live test. A 15-second actionable contact fallback is deployed; the widget remains mounted for late readiness. Do not claim live agent availability.

- Existing rating, experience/ranking and Monkey Nest price inconsistencies are documented in listing-open-items.md. No price/payment calculation changes were made.

- Final release37bf29b Vercel build and TypeScript passed, production SEO smoke passed10 endpoints, booking location verified Wichit in live HTML. The last PSI measurement was on4152b3b before the click-only chat timeout and four location-text corrections; these follow-ups do not change initial homepage behavior.
- Review card output/pdf/three-monkeys-review-card.pdf and vectorQR created locally, decoded independently against the official link. Staff guide is review-staff-guide.md. No outbound requests sent.
