import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports, URL, Date, process: { env: {} },
    require: (name) => imports[name] ?? require(name),
  }, { filename: file });
  return exports;
}
const config = load('lib/seo/config.ts');
assert.ok(!fs.existsSync('public/sitemap.xml'), 'static file must not shadow generated sitemap');
assert.ok(!fs.existsSync('public/robots.txt'), 'static file must not shadow generated robots');
for (const locale of config.siteConfig.locales) {
  const metadata = await config.createPageMetadata('Menu', 'Food and drink', '/menu')({ params: Promise.resolve({ locale }) });
  const expected = config.siteConfig.url + (locale === 'en' ? '' : '/' + locale) + '/menu';
  assert.equal(metadata.alternates.canonical, expected);
  assert.equal(metadata.openGraph.url, expected);
  assert.equal(Object.keys(metadata.alternates.languages).length, 10);
}
assert.equal(config.getLanguageAlternates('/')['zh-CN'], config.siteConfig.url + '/cn');
assert.equal(config.getLanguageAlternates('/').cn, undefined);
assert.equal(config.defaultMetadata.verification, undefined);
const checkout = await config.createPageMetadata('Checkout', '', '/checkout', { robots: { index: false, follow: false } })({ params: Promise.resolve({ locale: 'th' }) });
assert.equal(checkout.robots.index, false);

const robots = load('app/robots.ts', { '@/lib/seo/config': config }).default();
assert.equal(robots.sitemap, config.siteConfig.url + '/sitemap.xml');
assert.ok(!robots.rules[0].disallow.some((path) => '/_next/image'.startsWith(path)));
assert.ok(robots.rules[0].disallow.includes('/reservation/'));

const sitemap = load('app/sitemap.ts', {
  '@/lib/seo/config': config,
  '@/i18n/routing': { routing: { locales: config.siteConfig.locales, defaultLocale: 'en' } },
  '@/lib/data/packages': { packages: [
    { slug: 'open-package', category: 'combined' },
    { slug: 'suspended', category: 'combined', suspended: true },
    { slug: 'transfer', category: 'transfer' },
  ] },
  '@/lib/blog/posts': { getPublishedPosts: async () => [{ slug: 'story' }, { slug: 'new-story' }] },
}).default;
const entries = await sitemap();
assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
assert.ok(entries.every((entry) => entry.url.startsWith(config.siteConfig.url)));
assert.ok(!entries.some((entry) => /checkout|admin|reservation|suspended|transfer/.test(entry.url)));
assert.equal(entries.filter((entry) => entry.url.endsWith('/blog/story')).length, 1);
assert.equal(entries.find((entry) => entry.url.endsWith('/menu')).lastModified, undefined);
assert.equal(entries.find((entry) => entry.url.endsWith('/blog/story')).lastModified, undefined);
assert.ok(entries.filter(entry => !/\/blog(?:\/|$)/.test(entry.url)).every((entry) => entry.alternates.languages['zh-CN']));

const jsx = (type, props) => typeof type === 'function' ? type(props) : { type, props };
const schema = load('lib/seo/structured-data.tsx', {
  './config': config, 'react/jsx-runtime': { jsx, jsxs: jsx },
});
const restaurant = JSON.parse(schema.RestaurantSchema().props.dangerouslySetInnerHTML.__html);
assert.equal(restaurant.address.postalCode, '83000');
assert.equal(restaurant.openingHoursSpecification.opens, '10:00');
assert.equal(restaurant.openingHoursSpecification.closes, '01:00');
assert.equal(restaurant.aggregateRating, undefined);
const injected = schema.FAQSchema({ faqs: [{ question: '</script><script>alert(1)</script>', answer: 'Answer' }] }).props.dangerouslySetInnerHTML.__html;
assert.ok(!injected.includes('</script>'));
assert.equal(JSON.parse(injected).mainEntity[0].name, '</script><script>alert(1)</script>');
console.log('PASS: localized metadata, hreflang, robots, sitemap filtering/dates, truthful schema and JSON-LD escaping');
