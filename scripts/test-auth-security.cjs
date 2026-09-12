// Offline regression tests. Service-role operations are always replaced by local stubs.
// Run: node --test scripts/test-auth-security.cjs
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

const root = path.resolve(__dirname, '..');
const callerId = '11111111-1111-4111-8111-111111111111';
const targetId = '22222222-2222-4222-8222-222222222222';
const newId = '33333333-3333-4333-8333-333333333333';
const createBody = { email: 'new@example.test', password: 'a-strong-password', fullName: 'New User', role: 'staff' };
const setupEnv = { ENABLE_ADMIN_BOOTSTRAP: 'true', ADMIN_BOOTSTRAP_KEY: 'offline-test-key-with-at-least-32-characters' };

function harness(options = {}) {
  const calls = [];
  const mutations = [];
  const caller = { id: callerId, email: 'owner@example.test', role: 'superadmin', is_active: true, ...options.caller };
  const target = { id: targetId, user_id: targetId, email: 'staff@example.test', role: 'staff', is_active: true, ...options.target };
  const rows = options.rows ?? [caller, target];
  const client = {
    auth: {
      getUser: async (token) => {
        calls.push(['getUser', token]);
        return { data: { user: token === 'valid-token' ? { id: callerId, email: options.tokenEmail ?? caller.email } : null }, error: null };
      },
      admin: {
        createUser: async (data) => { mutations.push(['createUser', data]); return { data: { user: { id: newId, email: data.email } }, error: null }; },
        updateUserById: async (...args) => { mutations.push(['updateUserById', ...args]); return { error: null }; },
        deleteUser: async (...args) => { mutations.push(['deleteUser', ...args]); return { error: options.deleteAuthError ? { message: 'Simulated failure' } : null }; },
      },
    },
    from: (table) => {
      calls.push(['from', table]);
      const filters = [];
      let action = null;
      let payload;
      let limit;
      const execute = (single = false) => {
        if (action) {
          mutations.push([action, table, payload, filters]);
          return { data: null, error: options.insertError && action === 'insert' ? { message: 'Simulated insert failure' } : null };
        }
        if (options.targetLookupError && filters.some(([key, value]) => key === 'id' && value === targetId || key === 'user_id' && value === targetId)) {
          return { data: null, error: { message: 'Simulated lookup failure' } };
        }
        let found = rows.filter((row) => filters.every(([key, value, operator]) => operator === 'ilike'
          ? new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('%', '.*').replaceAll('_', '.')}$`, 'i').test(row[key])
          : row[key] === value));
        if (limit) found = found.slice(0, limit);
        return { data: single ? found[0] ?? null : found, error: null, count: found.length };
      };
      const query = {
        select: () => query,
        eq: (key, value) => { filters.push([key, value]); return query; },
        ilike: (key, value) => { calls.push(['ilike', key, value]); filters.push([key, value, 'ilike']); return query; },
        limit: (value) => { limit = value; return query; },
        order: () => query,
        insert: (value) => { action = 'insert'; payload = value; return query; },
        update: (value) => { action = 'update'; payload = value; return query; },
        delete: () => { action = 'delete'; return query; },
        maybeSingle: async () => execute(true),
        single: async () => execute(true),
        then: (resolve, reject) => Promise.resolve(execute()).then(resolve, reject),
      };
      return query;
    },
  };
  const cache = new Map();
  function load(relativePath) {
    const filename = path.join(root, relativePath);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: filename,
    }).outputText;
    const safeRequire = (name) => {
      if (name === '@/lib/supabase/server') return { supabaseAdmin: client };
      if (name === 'next/server') return { NextRequest, NextResponse };
      if (name === 'zod' || name === 'node:crypto') return require(name);
      if (name.startsWith('@/lib/auth/')) return load(`${name.slice(2)}.ts`);
      throw new Error(`Unexpected dependency blocked by offline harness: ${name}`);
    };
    vm.runInNewContext(output, { module, exports: module.exports, require: safeRequire, process: { env: options.env ?? {} }, Buffer, URL, console: { error() {} } }, { filename });
    return module.exports;
  }
  async function request(route, method, body, token = 'valid-token', query = '') {
    const req = new NextRequest(`http://offline.test/${route}${query}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(method === 'GET' ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });
    return load(`app/api/${route}/route.ts`)[method](req);
  }
  return { request, load, calls, mutations };
}

const operations = [
  ['auth/create-user', 'POST', createBody],
  ['auth/update-user', 'PUT', { userId: targetId, password: 'changed-password' }],
  ['auth/delete-user', 'DELETE', { userId: targetId }],
];

for (const [route, method, body] of operations) {
  test(`${route}: rejects missing and invalid tokens before service writes`, async () => {
    for (const token of [null, 'expired-token']) {
      const h = harness();
      assert.equal((await h.request(route, method, body, token)).status, 401);
      assert.equal(h.mutations.length, 0);
    }
  });
  test(`${route}: only an active superadmin can mutate accounts`, async () => {
    for (const role of ['admin', 'staff', 'writer', 'allotment']) {
      const h = harness({ caller: { role } });
      assert.equal((await h.request(route, method, body)).status, 403);
      assert.equal(h.mutations.length, 0);
    }
    const h = harness({ caller: { is_active: false } });
    assert.equal((await h.request(route, method, body)).status, 401);
    assert.equal(h.mutations.length, 0);
  });
  test(`${route}: malformed JSON returns 400 without writes`, async () => {
    const h = harness();
    assert.equal((await h.request(route, method, '{')).status, 400);
    assert.equal(h.mutations.length, 0);
  });
}

test('create-user links the admin PK to the newly created Auth UUID', async () => {
  const h = harness();
  assert.equal((await h.request('auth/create-user', 'POST', createBody)).status, 200);
  const inserted = h.mutations.find(([action]) => action === 'insert')[2];
  assert.equal(inserted.id, newId);
  assert.equal(inserted.user_id, newId);
});

test('create-user rejects invalid credentials and attempts to create a superadmin', async () => {
  for (const invalid of [{ email: 'bad' }, { fullName: '  ' }, { password: 12345678 }, { password: 'short' }, { role: 'superadmin' }]) {
    const h = harness();
    assert.equal((await h.request('auth/create-user', 'POST', { ...createBody, ...invalid })).status, 400);
    assert.equal(h.mutations.length, 0);
  }
});

test('create-user rolls back Auth creation when the admin record cannot be inserted', async () => {
  const h = harness({ insertError: true });
  assert.equal((await h.request('auth/create-user', 'POST', createBody)).status, 500);
  assert.ok(h.mutations.some(([action, id]) => action === 'deleteUser' && id === newId));
});

for (const [route, method] of operations.slice(1)) {
  test(`${route}: missing targets and database lookup errors fail closed`, async () => {
    for (const [options, status] of [[{ rows: [{ id: callerId, email: 'owner@example.test', role: 'superadmin', is_active: true }] }, 404], [{ targetLookupError: true }, 500]]) {
      const h = harness(options);
      assert.equal((await h.request(route, method, { userId: targetId, password: 'changed-password' })).status, status);
      assert.equal(h.mutations.length, 0);
    }
  });
  test(`${route}: protects superadmin accounts including the caller`, async () => {
    for (const userId of [callerId, targetId]) {
      const h = harness({ target: { role: 'superadmin' } });
      assert.equal((await h.request(route, method, { userId, password: 'changed-password' })).status, 403);
      assert.equal(h.mutations.length, 0);
    }
  });
  test(`${route}: active superadmin may manage an existing staff account`, async () => {
    const h = harness();
    assert.equal((await h.request(route, method, { userId: targetId, password: 'changed-password' })).status, 200);
    assert.ok(h.mutations.some(([action, id]) => action === (method === 'PUT' ? 'updateUserById' : 'deleteUser') && id === targetId));
  });
}

test('update-user rejects invalid optional fields rather than silently reporting success', async () => {
  for (const invalid of [{ password: 'short' }, { password: 12345678 }, { fullName: ' ' }, { role: 'superadmin' }, {}]) {
    const h = harness();
    assert.equal((await h.request('auth/update-user', 'PUT', { userId: targetId, ...invalid })).status, 400);
    assert.equal(h.mutations.length, 0);
  }
});

test('delete-user restores the admin record if Auth deletion fails', async () => {
  const h = harness({ deleteAuthError: true });
  assert.equal((await h.request('auth/delete-user', 'DELETE', { userId: targetId })).status, 500);
  assert.ok(h.mutations.some(([action, table, row]) => action === 'insert' && table === 'admin_users' && row.id === targetId));
});

test('admin membership never falls back to a matching email or wildcard pattern', async () => {
  for (const email of ['owner@example.test', '%@example.test']) {
    const h = harness({ rows: [{ id: targetId, email: 'owner@example.test', role: 'superadmin', is_active: true }], tokenEmail: email });
    const result = await h.load('lib/auth/api-auth.ts').requireSuperAdmin(new NextRequest('http://offline.test', { headers: { Authorization: 'Bearer valid-token' } }));
    assert.equal(result.status, 401);
    assert.equal(h.mutations.length, 0);
    assert.ok(!h.calls.some(([action]) => action === 'ilike'));
  }
});

test('check-admin does not expose membership to unauthenticated email queries', async () => {
  const h = harness();
  const response = await h.request('auth/check-admin', 'GET', undefined, null, '?email=owner%40example.test');
  assert.equal(response.status, 401);
  assert.equal((await response.json()).isAdmin, false);
  assert.equal(h.calls.length, 0);
});

test('check-admin returns only the authenticated UUID membership and excludes disabled accounts', async () => {
  const h = harness();
  const body = await (await h.request('auth/check-admin', 'GET', undefined, 'valid-token', '?email=staff%40example.test')).json();
  assert.equal(body.isAdmin, true);
  assert.equal(body.user.id, callerId);
  const disabled = harness({ caller: { is_active: false } });
  assert.equal((await (await disabled.request('auth/check-admin', 'GET')).json()).isAdmin, false);
});

test('admin users status changes reject self or superadmin disable operations', async () => {
  for (const id of [callerId, targetId]) {
    const h = harness({ target: { role: 'superadmin' } });
    assert.equal((await h.request('admin/users', 'PATCH', { id, is_active: false })).status, 403);
    assert.equal(h.mutations.length, 0);
  }
});

test('admin users status changes validate payload and target before writing', async () => {
  for (const body of [{}, { id: targetId, is_active: 'false' }, { id: 'invalid', is_active: false }]) {
    const h = harness();
    assert.equal((await h.request('admin/users', 'PATCH', body)).status, 400);
    assert.equal(h.mutations.length, 0);
  }
  const h = harness();
  assert.equal((await h.request('admin/users', 'PATCH', { id: targetId, is_active: false })).status, 200);
});

test('bootstrap is disabled unless explicitly enabled with a strong environment key', async () => {
  for (const env of [{}, { ENABLE_ADMIN_BOOTSTRAP: 'true' }, { ...setupEnv, ADMIN_BOOTSTRAP_KEY: 'short' }]) {
    const h = harness({ env, rows: [] });
    assert.equal((await h.request('auth/setup-admin', 'POST', { ...createBody, setupKey: 'legacy-key' }, null)).status, 404);
    assert.equal(h.calls.length, 0);
    assert.equal(h.mutations.length, 0);
  }
});

test('bootstrap rejects wrong keys and missing or weak explicit credentials', async () => {
  const wrongKey = harness({ env: setupEnv, rows: [] });
  assert.equal((await wrongKey.request('auth/setup-admin', 'POST', { ...createBody, setupKey: 'wrong-key' }, null)).status, 403);
  assert.equal(wrongKey.mutations.length, 0);
  for (const body of [{}, { ...createBody, password: 'short' }, { ...createBody, email: '' }]) {
    const h = harness({ env: setupEnv, rows: [] });
    assert.equal((await h.request('auth/setup-admin', 'POST', { ...body, setupKey: setupEnv.ADMIN_BOOTSTRAP_KEY }, null)).status, 400);
    assert.equal(h.mutations.length, 0);
  }
});

test('bootstrap creates an explicitly configured superadmin without returning a password', async () => {
  const h = harness({ env: setupEnv, rows: [] });
  const response = await h.request('auth/setup-admin', 'POST', { ...createBody, setupKey: setupEnv.ADMIN_BOOTSTRAP_KEY }, null);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.ok(!body.includes(createBody.password));
  assert.ok(!body.includes('password'));
  const inserted = h.mutations.find(([action]) => action === 'insert')[2];
  assert.equal(inserted.id, newId);
  assert.equal(inserted.role, 'superadmin');
});

test('bootstrap refuses to run when any admin already exists', async () => {
  const h = harness({ env: setupEnv });
  assert.equal((await h.request('auth/setup-admin', 'POST', { ...createBody, setupKey: setupEnv.ADMIN_BOOTSTRAP_KEY }, null)).status, 409);
  assert.equal(h.mutations.length, 0);
});
