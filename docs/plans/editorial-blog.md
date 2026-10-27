# Editorial blog implementation

Approved scope: publish topics 1–6, improve overlapping existing pages, preserve useful URLs, and meet the original editorial, image, CMS, performance and SEO requirements. Existing additional published stories receive the same quality checks.

Design: retain Krona One, Inter, black/olive brand colours and the shared header. Use a plain warm reading surface, a single headline and introduction above a wide photograph, a 720px text column, collapsible contents and related articles. No public dates or reading estimates, including metadata and structured data.

Implementation order:
1. Align the empty Supabase blog table with the admin editor; restrict direct table access to the server. Add a private media registry with permanent article ownership and an atomic ownership trigger.
2. Inspect and allocate supplied and existing original photographs. Produce responsive WebP files with orientation corrected, original hashes and captions. Use generated editorial close-ups only if authentic photography is insufficient.
3. Write the six approved guides and refresh the two remaining legacy stories. Keep legacy slugs, add two descriptive new slugs. Verify each body is 800–1,600 words and each article has 3–5 unique images.
4. Implement one published-content service for homepage (latest three), archive, article, related content and sitemap. Fail closed for drafts and database failures; remove static fallback. Article bodies remain server-rendered and sanitized.
5. Make the existing dashboard handle rich text, tables, images, alt text, captions, SEO fields, draft saving and publishing with quality validation. Refresh public routes after saves.
6. Run content/ownership/draft/metadata tests, TypeScript, lint and production build. Inspect desktop/mobile and exercise navigation, contents, booking and CMS editing without making real bookings.
7. Deploy through the established Vercel project and verify live pages, sitemap, images and draft exclusion. Record URLs and limitations.

Article timestamps remain private database sorting fields. English article copies under other locale shells canonicalize to English until actual translations exist. Public article sitemap entries use canonical English URLs only. No outside operator recommendations are needed.
