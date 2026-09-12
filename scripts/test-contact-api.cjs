'use strict';

// Offline regression checks. No database, email, or network requests are made.
// Run with: node scripts/test-contact-api.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.join(__dirname, '../app/api/contact/route.ts');
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const validPayload = {
  name: 'Guest Name', email: 'guest@example.com', phone: '+66 98 010 8838',
  subject: 'reservation', message: 'Please help with my reservation.',
};

function loadRoute(options = {}) {
  const calls = { inserts: [], emails: [], syncs: [], events: [] };
  const loadedModule = { exports: {} };
  const context = {
    module: loadedModule,
    exports: loadedModule.exports,
    process: { env: { ONEBOOKING_API_KEY: options.noSyncKey ? '' : 'offline-test-key' } },
    crypto: { randomUUID: () => 'invented-id-must-not-be-used' },
    console: { log() {}, warn() {}, error() {} },
    fetch: async (url, init) => {
      calls.events.push('sync'); calls.syncs.push({ url, init });
      if (options.syncThrows) throw new Error('Sync unavailable');
      return {
        ok: !options.syncFails,
        status: options.syncFails ? 503 : 200,
        text: async () => 'Sync unavailable',
        json: async () => ({ data: { inquiry_ref: 'offline-inquiry' } }),
      };
    },
    require(name) {
      if (name === 'next/server') return { NextResponse: {
        json: (body, init) => ({ status: init?.status || 200, json: async () => body }),
      } };
      if (name === 'zod') return require('zod');
      if (name === '@/lib/email/send-contact-email') return {
        sendContactFormEmail: async data => {
          calls.events.push('email'); calls.emails.push(data);
          if (options.emailThrows) throw new Error('Email unavailable');
          return { success: !options.emailFails };
        },
      };
      if (name === '@/lib/supabase/server') return { supabaseAdmin: {
        from(table) {
          assert.equal(table, 'contact_submissions');
          return {
            insert(data) {
              calls.events.push('save'); calls.inserts.push(data);
              return { select(columns) {
                assert.equal(columns, 'id');
                return { single: async () => {
                  if (options.waitForSave) await options.waitForSave;
                  if (options.dbThrows) throw new Error('Database unavailable');
                  return {
                    data: options.dbFails || options.missingId ? null : { id: 'persisted-id' },
                    error: options.dbFails ? { message: 'Database unavailable' } : null,
                  };
                } };
              } };
            },
          };
        },
      } };
      throw new Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(source, context, { filename });
  return {
    calls,
    post: body => loadedModule.exports.POST({ json: async () => body }),
    malformed: () => loadedModule.exports.POST({ json: async () => { throw new SyntaxError('Malformed JSON'); } }),
  };
}

async function testValidation() {
  const malformed = loadRoute();
  assert.equal((await malformed.malformed()).status, 400, 'Malformed JSON must return 400');

  const invalidPayloads = [null, [], 'text', 3, true, {}, { ...validPayload, email: 'not-an-email' }];
  for (const field of ['name', 'email', 'subject', 'message']) {
    for (const value of [undefined, null, '', '  \n ', {}, [], 7]) {
      invalidPayloads.push({ ...validPayload, [field]: value });
    }
  }
  for (const phone of [{ number: '123' }, [], 123, true]) invalidPayloads.push({ ...validPayload, phone });
  for (const [field, limit] of [['name', 100], ['email', 254], ['phone', 50], ['subject', 200], ['message', 10000]]) {
    const value = field === 'email'
      ? `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(58)}.com`
      : 'x'.repeat(limit + 1);
    invalidPayloads.push({ ...validPayload, [field]: value });
  }
  for (const payload of invalidPayloads) {
    const route = loadRoute();
    assert.equal((await route.post(payload)).status, 400, `Must reject invalid payload: ${JSON.stringify(payload).slice(0, 100)}`);
    assert.deepEqual(route.calls.events, [], 'Invalid payloads must not save, notify, or sync');
  }
  console.log(`PASS: malformed JSON and ${invalidPayloads.length} invalid payloads`);
}

async function testPersistenceFailure() {
  for (const options of [{ dbFails: true }, { missingId: true }, { dbThrows: true }]) {
    const route = loadRoute(options);
    const response = await route.post(validPayload);
    assert.equal(response.status, 500, 'An unconfirmed save must not report success');
    assert.equal((await response.json()).success, undefined);
    assert.deepEqual(route.calls.events, ['save'], 'Notifications and synchronization require a saved message');
  }
  console.log('PASS: database errors, thrown failures, and missing saved IDs stop follow-ups');
}

async function testSavedMessage() {
  const route = loadRoute();
  const payload = Object.fromEntries(Object.entries(validPayload).map(([key, value]) => [key, `  ${value}\n`]));
  const response = await route.post({ ...payload, status: 'replied' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(route.calls.inserts[0])), { ...validPayload, status: 'new' });
  assert.deepEqual(JSON.parse(JSON.stringify(route.calls.emails[0])), validPayload);
  assert.equal(route.calls.events[0], 'save');
  assert.equal(JSON.parse(route.calls.syncs[0].init.body).source_inquiry_id, 'persisted-id');
  for (const phone of [undefined, null, '', '  ']) {
    const optionalPhone = loadRoute();
    assert.equal((await optionalPhone.post({ ...validPayload, phone })).status, 200);
    assert.equal(optionalPhone.calls.inserts[0].phone, null);
  }
  const maximumLength = loadRoute();
  assert.equal((await maximumLength.post({
    name: 'n'.repeat(100),
    email: `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`,
    phone: '1'.repeat(50), subject: 's'.repeat(200), message: 'm'.repeat(10000),
  })).status, 200, 'Values at the documented limits must be accepted');

  let completeSave;
  const waitForSave = new Promise(resolve => { completeSave = resolve; });
  const delayed = loadRoute({ waitForSave });
  const pending = delayed.post(validPayload);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(delayed.calls.events, ['save'], 'Follow-ups must wait until persistence completes');
  completeSave();
  assert.equal((await pending).status, 200);
  assert.equal(delayed.calls.emails.length, 1);
  assert.equal(delayed.calls.syncs.length, 1);
  console.log('PASS: trimmed saved fields, optional phone, server-owned status, and persisted sync ID');
}

async function testOptionalFollowups() {
  for (const options of [
    { emailThrows: true }, { emailFails: true }, { syncThrows: true }, { syncFails: true },
    { emailThrows: true, syncFails: true }, { noSyncKey: true },
  ]) {
    const route = loadRoute(options);
    const response = await route.post(validPayload);
    assert.equal(response.status, 200, 'A saved message remains accepted if optional follow-ups fail');
    assert.equal((await response.json()).success, true);
    assert.equal(route.calls.inserts.length, 1);
  }
  console.log('PASS: saved messages remain accepted when notifications or synchronization fail');
}

async function main() {
  const failures = [];
  for (const test of [testValidation, testPersistenceFailure, testSavedMessage, testOptionalFollowups]) {
    try { await test(); } catch (error) { failures.push(error); console.error(error.message); }
  }
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
