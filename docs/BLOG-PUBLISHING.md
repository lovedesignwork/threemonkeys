# Publishing Three Monkeys articles

Open `/admin/blog` and sign in with an existing administrator account. Choose **New article** or open a published story to edit it.

1. Enter the headline, permanent URL slug, introduction, category, target keyword, SEO title and description.
2. Write 800–1,600 body words. Use the H2/H3, list, link and comparison-table controls. Keep prices and booking conditions tied to the current official product pages.
3. Add accurate alt text and a useful caption, then upload an original photograph up to 4 MB. Larger source files need resizing before upload. The server generates responsive WebP sizes. Select one featured photo and insert two to four different supporting photos in the body.
4. Save an unfinished article as a draft. Choose **Publish** when ready. The archive and sitemap update automatically; the homepage shows the latest three publications. Updating an existing story retains its original private sort position.
5. **Unpublish to draft** removes a published article from public routes, the archive, homepage and sitemap. Saved URL slugs are locked to protect existing links.

No publication or update dates, timestamps or reading times appear in the public article data, cards or article schema. Articles are currently in English, including when the surrounding navigation uses another language. Canonicals point to the English URLs.

## Photo ownership

`blog_media` records the original file hash, perceptual fingerprint, dimensions, captions and permanent owning article. A database trigger atomically prevents an existing library photo from being claimed by another article. Ownership remains reserved even if the article is removed.

The upload endpoint rejects exact duplicates and very similar fingerprints. This is an aid, not a reliable detector of every crop or edit: editors must also check the original source. A renamed, cropped or edited photograph still belongs to its original article. Generated images must be explicitly marked and captioned as editorial illustrations.

Captions are rendered from the photo registry, so editor HTML normalization cannot discard them. Images are sanitized against registered sources. New media are stored in the existing Supabase blog-images bucket; initial launch assets are in public/images/blog.

## Content source and deployment

- Supabase blog_posts is the only public article source; there is no hardcoded fallback.
- Public queries only return published articles whose private publication time has arrived. Draft data and private publication fields are unavailable through anonymous database access.
- `docs/blog-content` keeps the launch copy and source-photo registry for reference. Ongoing editorial changes belong in the CMS.
- Do not rerun the launch seed over subsequent CMS edits. The preparation scripts are for controlled launch/recovery use, not routine publishing.
- `node scripts/blog.test.mjs` verifies launch copy, image sizes/ownership uniqueness, sanitization and publishing guards. Run `node scripts/prepare-blog-content.mjs` first if the local verification fixtures are absent.
- `node scripts/seo.test.mjs` checks metadata and sitemap rules. `node scripts/smoke-blog.mjs https://threemonkeysphuket.com` verifies the published routes and links.

## Factual review sources

Copy was checked against the restaurant's own menu, seats, booking and package pages: `/menu`, `/seats`, `/booking`, `/packages/monkey-dome`, `/packages/monkey-nest`, and the birthday/romantic products linked in the articles. No unverified external businesses are recommended. Photography comes from the supplied 3M folder and the restaurant's existing image library; no generated photographs were needed.
