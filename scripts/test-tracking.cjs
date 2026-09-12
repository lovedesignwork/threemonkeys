'use strict';

// Offline only: all database reads and fetches are mocked.
// Run with: node scripts/test-tracking.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
function load(filename, imports = {}, extra = {}) {
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(projectRoot, filename), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    module: loadedModule, exports: loadedModule.exports,
    console: { error() {}, warn() {}, log() {} },
    require(name) {
      if (name in imports) return imports[name];
      throw new Error(`Unexpected import: ${name}`);
    },
    ...extra,
  }, { filename });
  return loadedModule.exports;
}
const tracking = load('lib/tracking.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const valid = { gtmId: 'GTM-ABCD123', ga4Id: 'G-ABC1234567', metaPixelId: '123456789012345' };

function testPublicValues() {
  const result = tracking.normalizePublicTracking({
    ...valid,
    apiKey: 'private-api-key', notifications: { email: 'private@example.com' },
    headerScripts: `<script>window.secret = 'private-script';</script>
      <meta name="google-site-verification" content="Google_Token-123">
      <meta content='FacebookToken123' name='facebook-domain-verification'>
      <meta name="private-value" content="secret">
      <!-- <meta name="msvalidate.01" content="commented-out"> -->`,
    bodyScripts: 'private-body-script', footerScripts: 'private-footer-script',
  });
  assert.deepEqual(plain(result), {
    ...valid,
    verification: [
      { name: 'google-site-verification', content: 'Google_Token-123' },
      { name: 'facebook-domain-verification', content: 'FacebookToken123' },
    ],
  });
  assert.equal(JSON.stringify(result).includes('private'), false);
  assert.deepEqual(plain(tracking.normalizePublicTracking(result)), plain(result));
  for (const payload of [null, [], 7, 'text', {}, {
    gtmId: "GTM-ABCD');alert(1)//", ga4Id: 'G-ABCD<script>', metaPixelId: '123456&ev=Other',
    verification: [{ name: 'google-site-verification', content: '<script>' }],
  }, { gtmId: {}, ga4Id: 123, metaPixelId: ['123456'] }]) {
    assert.deepEqual(plain(tracking.normalizePublicTracking(payload)), { gtmId: '', ga4Id: '', metaPixelId: '', verification: [] });
  }
  assert.deepEqual(plain(tracking.normalizePublicTracking({
    gtmId: ` ${valid.gtmId} `, ga4Id: `\n${valid.ga4Id}`, metaPixelId: `${valid.metaPixelId} `,
  })), { ...valid, verification: [] });
  console.log('PASS: public field allowlist, valid IDs, verification extraction, and injection rejection');
}

async function testEndpoint() {
  const response = { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200, headers: init.headers }) } };
  for (const scenario of [
    { value: { ...valid, password: 'secret' } },
    { value: null },
    { error: { message: 'private database detail' } },
    { throws: true },
  ]) {
    const reads = [];
    const route = load('app/api/tracking/route.ts', {
      'next/server': response, '@/lib/tracking': tracking,
      '@/lib/supabase/server': { supabaseAdmin: {
        from(table) {
          reads.push(table);
          assert.equal(table, 'site_settings');
          return { select(columns) {
            assert.equal(columns, 'value');
            return { eq(key, value) {
              assert.equal(key, 'key'); assert.equal(value, 'tracking');
              return { maybeSingle: async () => {
                if (scenario.throws) throw new Error('private database detail');
                return { data: scenario.value ? { value: scenario.value } : null, error: scenario.error };
              } };
            } };
          } };
        },
      } },
    });
    const result = await route.GET();
    assert.equal(reads.length, 1);
    if (scenario.error || scenario.throws) {
      assert.equal(result.status, 503);
      assert.equal(result.headers['Cache-Control'], 'no-store');
      assert.equal(JSON.stringify(result.body).includes('private'), false);
    } else {
      assert.equal(result.status, 200);
      assert.deepEqual(plain(result.body.tracking), plain(tracking.normalizePublicTracking(scenario.value)));
      assert.deepEqual(Object.keys(result.body), ['tracking']);
    }
  }

  const unauthorized = { status: 401 };
  const admin = load('app/api/admin/settings/route.ts', {
    'next/server': response,
    '@/lib/auth/api-auth': { requireAdmin: async () => unauthorized, isAuthError: value => value === unauthorized },
    '@/lib/supabase/server': { supabaseAdmin: { from() { throw new Error('Unauthenticated admin read reached database'); } } },
  });
  assert.equal((await admin.GET({})).status, 401);
  console.log('PASS: public endpoint reads only tracking; database failures stay private; admin authentication remains enforced');
}

function nodes(tree) {
  const result = [];
  const visit = node => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || !node.props) return;
    result.push(node); visit(node.props.children);
  };
  visit(tree);
  return result;
}

function clientHarness(responses) {
  const instances = new Map();
  const effects = [];
  const fetches = [];
  let state;
  let cursor;
  const jsx = (type, props) => ({ type, props });
  const components = load('components/TrackingScripts.tsx', {
    'next/script': { default: 'Script' },
    '@/lib/tracking': tracking,
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    react: {
      useState(initial) {
        const saved = state; const index = cursor++;
        if (!(index in saved)) saved[index] = initial;
        return [saved[index], value => { saved[index] = value; }];
      },
      useEffect(callback) {
        const index = cursor++;
        if (!(index in state)) { state[index] = true; effects.push(callback); }
      },
    },
  }, {
    fetch: async url => {
      fetches.push(url);
      const response = responses[Math.min(fetches.length - 1, responses.length - 1)];
      return { ok: response.ok !== false, json: async () => ({ tracking: response.tracking }) };
    },
  });
  return {
    fetches,
    render(component, instance = component) {
      if (!instances.has(instance)) instances.set(instance, []);
      state = instances.get(instance); cursor = 0;
      return components[component]();
    },
    async settle() {
      effects.splice(0).forEach(effect => effect());
      await new Promise(resolve => setImmediate(resolve));
    },
  };
}

async function testClient() {
  const client = clientHarness([{ tracking: {
    ...valid, headerScripts: '<script>window.unapproved = true;</script>',
    verification: [{ name: 'google-site-verification', content: 'ConfiguredToken123' }],
  } }]);
  assert.equal(client.render('TrackingScriptsHead'), null);
  assert.equal(client.render('TrackingScriptsBody'), null);
  await client.settle();
  assert.deepEqual(client.fetches, ['/api/tracking']);
  const head = client.render('TrackingScriptsHead');
  const body = client.render('TrackingScriptsBody');
  const rendered = nodes(head);
  assert.equal(rendered.filter(node => node.type === 'Script').length, 4);
  assert.ok(rendered.find(node => node.type === 'meta' && node.props.content === 'ConfiguredToken123'));
  assert.equal(JSON.stringify([head, body]).includes('unapproved'), false);

  const invalid = clientHarness([{ tracking: { gtmId: "GTM-ABCD');alert(1)//", ga4Id: '<script>', metaPixelId: {} } }]);
  invalid.render('TrackingScriptsHead'); await invalid.settle();
  assert.equal(nodes(invalid.render('TrackingScriptsHead')).filter(node => node.type === 'Script').length, 0);

  const retry = clientHarness([{ ok: false }, { tracking: valid }]);
  retry.render('TrackingScriptsHead'); retry.render('TrackingScriptsBody'); await retry.settle();
  assert.equal(retry.render('TrackingScriptsHead'), null);
  assert.equal(retry.fetches.length, 1);
  retry.render('TrackingScriptsHead', 'remounted'); await retry.settle();
  assert.equal(retry.fetches.length, 2);
  assert.equal(nodes(retry.render('TrackingScriptsHead', 'remounted')).filter(node => node.type === 'Script').length, 4);
  console.log('PASS: shared public fetch, configured tags only, invalid-ID rejection, and retry after failed reads');
}

async function main() {
  testPublicValues();
  await testEndpoint();
  await testClient();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
