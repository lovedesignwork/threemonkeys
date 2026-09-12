// Offline tests: the DB adapter intentionally has no blog_posts -> admin_users FK.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const post = {
  id: 'post-fixture', slug: 'database-only-published-post', title: 'Published database post',
  excerpt: 'A real published post remains readable.', content: '<p>Article body.</p>',
  status: 'published', author_id: 'author-fixture', published_at: '2026-09-12T00:00:00Z',
};

function harness(options = {}) {
  const reads = [];
  const db = {
    from(table) {
      let columns = '', filterValues;
      const result = async (single = false) => {
        reads.push({ table, columns, filterValues });
        if (columns.includes('admin_users!')) return { data: null, error: { code: 'PGRST200', message: 'No relationship exists' } };
        if (table === 'blog_posts') return { data: single ? { ...post } : [{ ...post }, { ...post, id: 'second-post' }], error: null };
        if (table === 'admin_users') {
          if (options.authorThrows) throw new Error('Author lookup unavailable');
          if (options.authorError) return { data: null, error: { code: '42703', message: 'Author lookup failed' } };
          const author = { id: 'author-fixture', full_name: 'Fixture Author', email: 'author@example.test' };
          return { data: options.missingAuthor ? (single ? null : []) : (single ? author : [author]), error: null };
        }
        throw new Error(`Unexpected table: ${table}`);
      };
      const query = {
        select(value) { columns = value; return query; },
        eq(key, value) { filterValues = { ...filterValues, [key]: value }; return query; },
        in(key, value) { filterValues = { ...filterValues, [key]: value }; return query; },
        order() { return query; }, single: () => result(true), maybeSingle: () => result(true),
        then(resolve, reject) { return result().then(resolve, reject); },
      };
      return query;
    },
  };
  const mocks = {
    'next/server': { NextResponse: { json: (value, init) => Response.json(value, init) } },
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
    'next/image': 'img',
    'react/jsx-runtime': require('react/jsx-runtime'),
    'lucide-react': {},
    marked: { marked: async (value) => value },
    '@/i18n/navigation': { Link: 'a' },
    '@/components/ui/RainforestBackground': { RainforestBackground: () => null },
    '@/lib/seo/config': { siteConfig: { url: 'https://example.test', name: 'Three Monkeys', ogImage: '/og.jpg' }, getLanguageAlternates: () => ({ en: 'https://example.test/blog/database-only-published-post' }) },
    '@/lib/seo/structured-data': {},
    '@/lib/data/blog': { getBlogPostBySlug: () => undefined, blogPosts: [] },
    '@/lib/auth/api-auth': { requireAdmin: async () => ({ userId: 'admin-fixture' }), isAuthError: () => false },
    '@/lib/supabase/server': { supabaseAdmin: db },
  };
  const cache = new Map();
  function load(id, parent = root) {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (!id.startsWith('@/') && !id.startsWith('.')) throw new Error(`Unexpected dependency: ${id}`);
    const absolute = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(parent, id);
    const file = /\.tsx?$/.test(absolute) ? absolute : `${absolute}.ts`;
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: file,
    }).outputText;
    vm.runInNewContext(compiled, {
      module: loadedModule, exports: loadedModule.exports, require: (next) => load(next, path.dirname(file)),
      Response, URL, process: { env: {} }, console: { log() {}, error() {}, warn() {} },
      fetch: () => { throw new Error('Network is forbidden'); },
    }, { filename: file });
    return loadedModule.exports;
  }
  return { load, reads };
}

for (const [name, options, expectedAuthor] of [
  ['author available without FK', {}, 'Fixture Author'],
  ['missing author', { missingAuthor: true }, 'Three Monkeys Team'],
  ['author query error', { authorError: true }, 'Three Monkeys Team'],
  ['author connection error', { authorThrows: true }, 'Three Monkeys Team'],
]) {
  test(`public published post survives ${name}`, async () => {
    const h = harness(options);
    const page = h.load('@/app/[locale]/(public)/blog/[slug]/page.tsx');
    const params = Promise.resolve({ slug: post.slug, locale: 'th' });
    const metadata = await page.generateMetadata({ params });
    assert.equal(metadata.title, post.title);
    assert.equal(metadata.authors[0].name, expectedAuthor);
    assert.equal(metadata.alternates.canonical, `https://example.test/th/blog/${post.slug}`);
    assert.ok(await page.default({ params }));
    assert.equal(h.reads.find(read => read.table === 'blog_posts').filterValues.status, 'published');
  });
  test(`admin posts survive ${name}`, async () => {
    const h = harness(options);
    const route = h.load('@/app/api/admin/blog/route.ts');
    const response = await route.GET({});
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.data.length, 2);
    assert.equal(body.data[0].title, post.title);
    assert.equal(body.data[0].author?.name ?? 'Three Monkeys Team', expectedAuthor);
    assert.equal(h.reads.filter(read => read.table === 'admin_users').length, 1);
  });
}
