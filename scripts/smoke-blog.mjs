import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';
import { get } from './http-test-client.mjs';
const base = process.argv[2] || 'http://localhost:3127';
const posts = JSON.parse(fs.readFileSync('docs/verification/blog/posts.json'));
const links = new Set();
for (const post of posts) {
  const path = '/blog/' + post.slug;
  const response = await get(base + path); assert.equal(response.status, 200, path);
  const body = await response.text(); const $ = load(body);
  assert.equal($('h1').length, 1);
  assert.equal($('title').text(), post.seo_title);
  assert.equal($('meta[name="description"]').attr('content'), post.seo_description);
  assert.equal($('link[rel="canonical"]').attr('href'), 'https://threemonkeysphuket.com' + path);
  assert.equal($('meta[property="og:image"]').attr('content'), 'https://threemonkeysphuket.com' + post.featured_image);
  assert.ok(!/datePublished|dateModified|published_at|updated_at|created_at|readingTime|readTime/.test(body));
  assert.equal($('main > figure img').length + $('.article-body img').length, post.image_manifest.length);
  assert.equal($('.article-body figure').length, post.image_manifest.length - 1);
  assert.equal($('.article-toc summary').text(), 'In this article');
  const schema = $('script[type="application/ld+json"]').toArray().map(el => JSON.parse($(el).text()));
  const article = schema.find(s => ['Article','BlogPosting'].includes(s['@type']));
  assert.ok(article); assert.ok(!article.datePublished && !article.dateModified);
  assert.ok(schema.some(s => s['@type'] === 'BreadcrumbList'));
  $('.article-body a,main aside a').each((_,el) => { const href=$(el).attr('href'); if(href?.startsWith('/'))links.add(href); });
  console.log('PASS article HTML, metadata, schema, private timestamps:', post.slug);
}
for (const path of ['/', '/blog', '/sitemap.xml', '/blog?category=Cuisine']) {
  const response = await get(base + path); assert.equal(response.status, 200, path);
  const text = await response.text(); const $ = load(text);
  assert.ok(!text.includes('editorial-draft-verification'));
  if (path === '/') {
    const cards = $('[aria-labelledby="latest-stories"] article'); assert.equal(cards.length, 3);
    assert.deepEqual(cards.map((_,el) => $(el).find('h3 a').attr('href')).get(), posts.slice(0,3).map(p=>'/blog/'+p.slug));
  }
  if (path === '/blog') assert.equal($('main article').length, posts.length);
  if (path.includes('?')) assert.equal($('main article').length, 1);
  if (path === '/sitemap.xml') {
    const xml = load(text,{xmlMode:true}); const entries = xml('url').toArray().filter(el=>xml(el).find('loc').text().includes('/blog/'));
    assert.equal(entries.length, posts.length); assert.ok(entries.every(el=>!xml(el).find('lastmod').length));
  }
  console.log('PASS latest/archive/filter/sitemap:', path);
}
for (const path of ['/blog/editorial-draft-verification','/blog/not-a-published-story','/api/admin/blog','/api/admin/blog/media']) {
  const r=await get(base+path);assert.equal(r.status,path.startsWith('/api')?401:404,path); console.log('PASS privacy:', path, r.status);
}
for (const path of links) { const r=await get(base+path); assert.equal(r.status,200,path); }
console.log(`PASS ${links.size} unique internal article destinations`);

