import assert from 'node:assert/strict';
import test from 'node:test';
import { createTrackingLoader, publicTrackingSettings } from '../lib/tracking.ts';

test('public configuration excludes unrelated and nested private settings', () => {
  const settings = publicTrackingSettings({
    ga4Id: 'G-EXAMPLE123',
    stripeSecret: 'private',
    smtp: { password: 'private' },
    headerScripts: 'window.customTracking = true;',
  });
  assert.equal(settings.ga4Id, 'G-EXAMPLE123');
  assert.equal(settings.headerScripts, 'window.customTracking = true;');
  assert.equal(JSON.stringify(settings).includes('private'), false);
  assert.deepEqual(Object.keys(settings).sort(),
    ['bodyScripts', 'footerScripts', 'ga4Id', 'gtmId', 'headerScripts', 'metaPixelId']);
});

test('IDs cannot inject JavaScript and invalid GA settings use the valid fallback', () => {
  const settings = publicTrackingSettings({
    ga4Id: "G-X');alert(1);//",
    gtmId: "GTM-X'</script>",
    metaPixelId: '123;alert(1)',
    bodyScripts: { nested: 'not a string' },
  }, 'G-FALLBACK123');
  assert.equal(settings.ga4Id, 'G-FALLBACK123');
  assert.equal(settings.gtmId, '');
  assert.equal(settings.metaPixelId, '');
  assert.equal(settings.bodyScripts, '');
  assert.equal(publicTrackingSettings(null, 'invalid').ga4Id, '');
});

test('head and body share a public request without authentication', async () => {
  let calls = 0;
  const load = createTrackingLoader(async (url, options) => {
    calls++;
    assert.equal(url, '/api/tracking');
    assert.equal(options, undefined);
    return Response.json({ tracking: { ga4Id: 'G-SAVED123' } });
  }, 'G-FALLBACK123');
  const [head, body] = await Promise.all([load(), load()]);
  assert.equal(calls, 1);
  assert.equal(head, body);
  assert.equal(head.ga4Id, 'G-SAVED123');
});

test('HTTP authorization failure, invalid JSON and network failure retain env analytics', async () => {
  const failures = [
    async () => new Response('Unauthorized', { status: 401 }),
    async () => new Response('not JSON'),
    async () => { throw new Error('network unavailable'); },
  ];
  for (const fetcher of failures) {
    assert.equal((await createTrackingLoader(fetcher, 'G-FALLBACK123')()).ga4Id, 'G-FALLBACK123');
  }
});
