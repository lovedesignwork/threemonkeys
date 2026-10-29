import assert from 'node:assert/strict';
import { get } from './http-test-client.mjs';

const base = process.argv[2] || 'http://localhost:3127';
for (const path of ['/', '/cn/menu', '/booking', '/cn/booking', '/checkout', '/sitemap.xml', '/robots.txt', '/llms.txt', '/api/tracking', '/api/admin/settings']) {
  const response = await get(base + path);
  const body = await response.text();
  assert.equal(response.status, path === '/api/admin/settings' ? 401 : 200, path);
  if (['/', '/cn/menu', '/booking', '/cn/booking'].includes(path)) {
    const canonical = body.match(/rel="canonical" href="([^"]+)/)?.[1];
    assert.equal(canonical, 'https://threemonkeysphuket.com' + (path === '/' ? '' : path), path);
    assert.ok(body.includes('8hJhSN_Ny1UuKAXeA8UAIPJuv4EgStf4F5JBTudTzdA'), 'verification tag');
    assert.ok(!(response.headers.get('link') || '').includes('hreflang="cn"'), 'invalid language header');
  }
  if (path.endsWith('/booking')) {
    assert.match(body, /<h1[^>]*>\s*Book Your Table\s*<\/h1>/, 'booking heading must be rendered in server HTML');
    assert.ok(body.includes('Select your dining zone and complete your reservation'), 'booking intro must be crawlable');
  }
  if (path === '/checkout') assert.ok(body.includes('noindex'));
  if (path === '/sitemap.xml') {
    assert.ok(body.includes('https://threemonkeysphuket.com'));
    assert.ok(!body.includes('vercel.app'));
    assert.ok(body.includes('hreflang="zh-CN"'));
  }
  if (path === '/api/tracking') {
    const config = JSON.parse(body).tracking;
    assert.equal(config.ga4Id, 'G-6JMLEKYFPG');
    assert.deepEqual(Object.keys(config).sort(), ['gtmId','ga4Id','metaPixelId','headerScripts','bodyScripts','footerScripts'].sort());
  }
  console.log(`PASS ${path}: ${response.status}`);
}
