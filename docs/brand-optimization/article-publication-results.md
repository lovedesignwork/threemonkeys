# Article publication verified — 29 October 2026

Production deployment confirmed by root: `53c8857`, `dpl_3oLzb5nfbwxqcs4JfBJ2waKv2ZJD`. All 36 generated editorial WebP URLs returned HTTP 200 before publication. Executed the reviewed `docs/verification/brand/publish.sql` transaction against Three Monkeys Supabase project `rsyykxiwshfqmkjfuqjy` after that confirmation.

| Article | CMS ID | Actual/scheduled publication UTC | Verified state |
|---|---|---|---|
| getting-to-three-monkeys-phuket | 92012041-60e7-40ca-abcf-32df9489f06e | 2026-10-29 12:11:43.305204Z | HTTP 200, in archive and sitemap |
| thai-soups-three-monkeys-phuket | ec80986f-545b-4650-ab63-f09af3c2225f | 2026-11-02 02:00:00Z | Scheduled; HTTP 404 with noindex; absent from archive and sitemap |
| dietary-requests-three-monkeys-phuket | 35c49d04-4fed-4fdd-a21f-241616a2b652 | 2026-11-05 02:00:00Z | Scheduled; HTTP 404 with noindex; absent from archive and sitemap |
| hanuman-world-and-three-monkeys-dining | 891de527-5306-46d2-ae57-eff52bcd6276 | 2026-11-09 02:00:00Z | Scheduled; HTTP 404 with noindex; absent from archive and sitemap |

Bangkok local time is UTC+7: first publication was 19:11:43 on October 29; all three future releases are 09:00. Each article owns exactly three registered images. The database readback confirms nine public articles, three scheduled articles and twelve campaign-owned images. The transaction asserted that unrelated existing article rows were unchanged.

`node scripts/smoke-blog.mjs https://threemonkeysphuket.com` passed: all nine public articles' metadata/schema/image structure, actual publication/update dates, homepage latest cards, archive, category filter, sitemap, draft/future 404 behavior, admin API 401s and sixteen internal link destinations. Separate HTTP verification confirmed noindex on all three future URLs and their absence from the archive and sitemap; evidence is `docs/verification/brand/article-release-check.json`.

Updated only article-related calendar fields. GBP state is owned by the root agent and must be reconciled separately. Index inclusion by Google has not been claimed.
