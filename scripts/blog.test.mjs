import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { load as html } from 'cheerio';
import sharp from 'sharp';
const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => imports[name] ?? require(name) }, { filename: file });
  return exports;
}
const rendering = load('lib/blog/html.ts');
const { validatePost } = load('lib/blog/validation.ts', { './html': rendering });
const posts = JSON.parse(fs.readFileSync('docs/verification/blog/posts.json'));
const registry = Object.values(JSON.parse(fs.readFileSync('docs/blog-content/images.json'))).flat();
assert.equal(new Set(registry.map(m => m.source_hash)).size, registry.length);
for (const post of posts) {
  const saved = validatePost(post, registry);
  const rendered = rendering.prepareArticle(saved.content, saved.image_manifest);
  const $ = html(rendered.html);
  assert.ok(rendered.toc.length >= 4);
  assert.equal($('h1').length, 0);
  assert.equal($('figure').length, post.image_manifest.length - 1);
  assert.equal($('p figure').length, 0);
  assert.ok($('figcaption').toArray().every(el => $(el).text().trim()));
  for (const el of $('img').toArray()) {
    assert.equal($(el).attr('loading'), 'lazy');
    assert.ok($(el).attr('width') && $(el).attr('height') && $(el).attr('alt') && $(el).attr('srcset'));
  }
  for (const m of post.image_manifest) {
    for (const v of m.variants) {
      const path = 'public' + v.src;
      const meta = await sharp(path).metadata();
      assert.equal(meta.format, 'webp');
      assert.equal(meta.width, v.width);
      assert.ok(Math.max(meta.width, meta.height) <= 1600);
      assert.ok(fs.statSync(path).size <= 250000);
    }
  }
  console.log(`PASS ${post.slug}: ${rendering.wordCount(saved.content)} words, ${post.image_manifest.length} unique photos`);
}
const sample = posts[0];
assert.throws(() => validatePost({ ...sample, content: '<h2>Too short</h2><p>Text</p>' }, registry), /800/);
assert.throws(() => validatePost({ ...sample, content: sample.content + `<img src="${sample.featured_image}">` }, registry), /different/);
assert.throws(() => validatePost({ ...sample, featured_image: 'https://example.com/unregistered.jpg' }, registry), /library/);
assert.equal(validatePost({ title: 'Private draft', slug: 'private-draft', content: '<p>Work in progress</p>', status: 'draft' }, registry).status, 'draft');
assert.ok(!rendering.cleanArticle('<script>alert(1)</script><p onclick="alert(1)">Safe<a href="javascript:alert(1)">link</a></p>').includes('alert'));
assert.equal(rendering.wordCount('<p>one two</p><p>three four</p>'), 4);
const wrapped = rendering.prepareArticle(`<p><img src="${sample.image_manifest[1].src}"></p>`, sample.image_manifest);
assert.equal(html(wrapped.html)('p figure').length, 0);
console.log('PASS publishing guards, draft save, sanitization, block word count, image dimensions/bytes and editor image round-trip');
