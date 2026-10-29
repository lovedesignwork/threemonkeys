// Prepare a reviewed data-only transaction. This script never connects to Supabase.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const media=JSON.parse(fs.readFileSync('docs/brand-optimization/article-media.json','utf8'));
const posts=JSON.parse(fs.readFileSync('docs/verification/brand/article-payloads.json','utf8'));
assert.equal(media.length,12);assert.equal(posts.length,4);
assert.equal(new Set(media.map(m=>m.id)).size,12);assert.equal(new Set(posts.map(p=>p.id)).size,4);
assert.ok(posts.every(p=>p.status==='published' && p.author==='Three Monkeys Team'));
assert.equal(posts.filter(p=>!p.published_at).length,1);
for(const p of posts){assert.equal(p.image_manifest.length,3);assert.ok(p.image_manifest.every(m=>media.some(x=>x.id===m.id)));}
const serialize=(value,tag)=>{const json=JSON.stringify(value);assert.ok(!json.includes(`$${tag}$`));return `$${tag}$${json}$${tag}$::jsonb`;};
const ids=posts.map(p=>`'${p.id}'::uuid`).join(',');
const sql=`-- Target Supabase project: rsyykxiwshfqmkjfuqjy (Three Monkeys only).
-- DO NOT execute until root confirms the source deployment and all image URLs are live.
-- No existing content is overwritten. A mismatched conflict aborts the entire transaction.
-- Actual first publication uses the existing trigger's now(); future dates are Bangkok 09:00.
BEGIN;
SET LOCAL statement_timeout = '30s';
DO $publish$
DECLARE
  expected_media jsonb := ${serialize(media,'media')};
  expected_posts jsonb := ${serialize(posts,'posts')};
  item jsonb;
  existing_row jsonb;
  expected_owner uuid;
  old_posts jsonb;
  inserted_media integer;
  inserted_posts integer;
BEGIN
  IF jsonb_array_length(expected_media) <> 12 OR jsonb_array_length(expected_posts) <> 4 THEN
    RAISE EXCEPTION 'Expected exactly twelve media records and four articles';
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) INTO old_posts
  FROM public.blog_posts p WHERE p.id NOT IN (${ids});

  -- Check every existing conflict before insert-trigger ownership claims can run.
  FOR item IN SELECT value FROM jsonb_array_elements(expected_media) LOOP
    SELECT to_jsonb(m) INTO existing_row FROM public.blog_media m
    WHERE m.id=(item->>'id')::uuid OR m.src=item->>'src' OR m.source_hash=item->>'source_hash' LIMIT 1;
    IF existing_row IS NOT NULL AND NOT (existing_row @> item) THEN
      RAISE EXCEPTION 'Conflicting media differs from prepared record: %',item->>'id';
    END IF;
    SELECT (p->>'id')::uuid INTO expected_owner FROM jsonb_array_elements(expected_posts) p
    WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p->'image_manifest') i WHERE i->>'id'=item->>'id');
    IF expected_owner IS NULL OR (existing_row->>'owner_id' IS NOT NULL AND (existing_row->>'owner_id')::uuid <> expected_owner) THEN
      RAISE EXCEPTION 'Invalid or conflicting media ownership: %',item->>'id';
    END IF;
  END LOOP;
  FOR item IN SELECT value FROM jsonb_array_elements(expected_posts) LOOP
    SELECT to_jsonb(p) INTO existing_row FROM public.blog_posts p
    WHERE p.id=(item->>'id')::uuid OR p.slug=item->>'slug' LIMIT 1;
    IF existing_row IS NOT NULL AND (
      NOT (existing_row @> (item - 'published_at')) OR
      (item ? 'published_at' AND (existing_row->>'published_at')::timestamptz IS DISTINCT FROM (item->>'published_at')::timestamptz)
    ) THEN RAISE EXCEPTION 'Conflicting article differs from prepared record: %',item->>'slug'; END IF;
  END LOOP;

  INSERT INTO public.blog_media (id,src,source_hash,fingerprint,source_name,width,height,variants,alt,caption,generated)
  SELECT id,src,source_hash,fingerprint,source_name,width,height,variants,alt,caption,generated
  FROM jsonb_to_recordset(expected_media) AS m(id uuid,src text,source_hash text,fingerprint text,source_name text,width integer,height integer,variants jsonb,alt text,caption text,generated boolean)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted_media=ROW_COUNT;

  INSERT INTO public.blog_posts (id,slug,title,excerpt,content,category,tags,focus_keyword,seo_title,seo_description,featured_image,image_manifest,status,author,published_at)
  SELECT p.id,p.slug,p.title,p.excerpt,p.content,p.category,p.tags,p.focus_keyword,p.seo_title,p.seo_description,p.featured_image,p.image_manifest,p.status,p.author,p.published_at
  FROM jsonb_to_recordset(expected_posts) AS p(id uuid,slug text,title text,excerpt text,content text,category text,tags text[],focus_keyword text,seo_title text,seo_description text,featured_image text,image_manifest jsonb,status text,author text,published_at timestamptz)
  WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts current_post WHERE current_post.id=p.id OR current_post.slug=p.slug)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted_posts=ROW_COUNT;

  IF (SELECT count(*) FROM public.blog_media m JOIN jsonb_array_elements(expected_media) e ON m.id=(e->>'id')::uuid AND to_jsonb(m) @> e) <> 12 THEN
    RAISE EXCEPTION 'Expected all twelve exact media records after insert';
  END IF;
  IF (SELECT count(*) FROM public.blog_posts p JOIN jsonb_array_elements(expected_posts) e ON p.id=(e->>'id')::uuid AND to_jsonb(p) @> (e-'published_at') WHERE p.is_published AND p.published_at IS NOT NULL AND p.updated_at IS NOT NULL AND (NOT(e ? 'published_at') OR p.published_at=(e->>'published_at')::timestamptz)) <> 4 THEN
    RAISE EXCEPTION 'Expected all four exact published/scheduled articles with actual timestamps';
  END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(expected_posts) p CROSS JOIN LATERAL jsonb_array_elements(p->'image_manifest') i JOIN public.blog_media m ON m.id=(i->>'id')::uuid AND m.owner_id=(p->>'id')::uuid) <> 12 THEN
    RAISE EXCEPTION 'All twelve images must belong to their intended article';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(old_posts) old LEFT JOIN public.blog_posts current_post ON current_post.id=(old->>'id')::uuid WHERE to_jsonb(current_post) IS DISTINCT FROM old) THEN
    RAISE EXCEPTION 'An existing unrelated article changed; rolling back';
  END IF;
  RAISE NOTICE 'Inserted % media and % articles; all expected rows verified',inserted_media,inserted_posts;
END;
$publish$;
SELECT id,slug,status,is_published,published_at,updated_at,
  CASE WHEN published_at<=now() THEN 'public' ELSE 'scheduled' END AS release_state,
  (SELECT count(*) FROM public.blog_media m WHERE m.owner_id=p.id) AS owned_image_count
FROM public.blog_posts p WHERE id IN (${ids}) ORDER BY published_at;
COMMIT;
`;
fs.writeFileSync('docs/verification/brand/publish.sql',sql);
console.log('Prepared transaction for 12 media + 4 articles; no database execution. Bytes:',Buffer.byteLength(sql));
