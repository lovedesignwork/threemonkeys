// Offline handler tests: no Stripe, Supabase, email, or integration calls escape these stubs.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function harness(options = {}) {
  const state = {
    booking: {
      id: 'booking-1', booking_ref: '3M00001', status: 'pending', stripe_payment_intent_id: 'pi_1',
      package_id: 'package-1', activity_date: '2026-12-01', time_slot: '18:00', guest_count: 2,
      total_amount: 1000, admin_notes: null, packages: { name: 'Dinner', price: 1000 },
      booking_customers: [{ first_name: 'Test', last_name: 'Guest', email: 'guest@example.test' }],
      booking_transport: [], booking_addons: [], ...options.booking,
    },
    events: [], updates: [], emails: 0, notifications: 0, claims: 0, releases: 0, refunds: [], counters: 0,
    failWrites: false, failReads: false, failRefund: false, failRelease: false,
  };
  const client = {
    from(table) {
      assert.equal(table, 'bookings');
      const predicates = [];
      let patch;
      const run = () => {
        if (patch && state.failWrites || !patch && state.failReads) return { data: null, error: { message: 'Simulated database failure' } };
        if (patch?.status === 'confirmed' && options.changeNotesOnce && !state.notesChanged) {
          state.notesChanged = true;
          state.booking.admin_notes = 'Customer requested a window table';
        }
        const matches = state.booking && predicates.every((fn) => fn(state.booking));
        if (!matches) return { data: null, error: null };
        if (patch) {
          state.updates.push({ ...patch });
          Object.assign(state.booking, patch);
        }
        return { data: structuredClone(state.booking), error: null };
      };
      const query = {
        select: () => query,
        update: (data) => { patch = data; return query; },
        eq: (key, value) => { predicates.push((row) => row[key] === value); return query; },
        neq: (key, value) => { predicates.push((row) => row[key] !== value); return query; },
        is: (key, value) => { predicates.push((row) => row[key] === value); return query; },
        in: (key, values) => { predicates.push((row) => values.includes(row[key])); return query; },
        or: (filter) => {
          const choices = filter.split(',').map((part) => part.split('.'));
          predicates.push((row) => choices.some(([key, operator, value]) => operator === 'is' ? row[key] === null : row[key] === value));
          return query;
        },
        maybeSingle: async () => run(),
        single: async () => run(),
        then: (resolve, reject) => Promise.resolve(run()).then(resolve, reject),
      };
      return query;
    },
    rpc: async () => { state.counters++; return { data: null, error: null }; },
  };
  const stripe = {
    webhooks: { constructEvent: (body) => JSON.parse(body) },
    paymentMethods: { retrieve: async () => ({}) },
    paymentIntents: { retrieve: async (id) => ({ id, metadata: { booking_id: 'booking-1' } }) },
    refunds: { create: async (data, opts) => {
      state.refunds.push({ data, opts });
      if (state.failRefund) throw new Error('Refund unavailable');
      return { id: 're_1', status: 'succeeded' };
    } },
  };
  const mocks = {
    'next/server': { NextRequest, NextResponse },
    '@/lib/stripe/client': { stripe },
    '@/lib/supabase/server': { supabaseAdmin: client },
    '@/lib/email/send-booking-confirmation': { sendBookingConfirmationEmail: async () => { state.emails++; } },
    '@/lib/email/send-booking-notification': { sendBookingNotificationEmail: async () => { state.notifications++; } },
    '@/lib/onebooking/sync': { pushBookingToOneBooking: async () => ({ success: true }) },
    '@vercel/functions': { waitUntil: () => {} },
    '@/lib/allotment/server': {
      claimTable: async () => {
        state.claims++;
        if (options.full) throw new Error('TM_ALLOTMENT_FULL');
        if (options.refundDuringClaim) state.booking.status = 'refunded';
        return { table_code: 'T1' };
      },
      releaseTable: async () => { state.releases++; if (state.failRelease) throw new Error('Release unavailable'); return 1; },
    },
    '@/lib/allotment/zones': { buildBangkokTimestamp: () => '2026-12-01T18:00:00+07:00', getZoneForPackage: () => options.noZone ? null : ({ zoneId: 'zone-1', zoneName: 'Dining' }) },
    '@/lib/geo/ip-lookup': { getCountryName: () => '' },
  };
  const filename = path.resolve(__dirname, '../app/api/webhooks/stripe/route.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env: { STRIPE_WEBHOOK_SECRET: 'offline-only' } },
    console: { log() {}, warn() {}, error() {} },
    require: (name) => { if (!(name in mocks)) throw new Error(`Blocked dependency: ${name}`); return mocks[name]; },
  }, { filename });
  const send = async (type, object = {}) => {
    const event = { id: `evt_${state.events.length}`, type, data: { object: { id: 'pi_1', metadata: { booking_id: 'booking-1' }, ...object } } };
    state.events.push(event);
    return module.exports.POST(new NextRequest('http://offline.test/api/webhooks/stripe', {
      method: 'POST', body: JSON.stringify(event), headers: { 'stripe-signature': 'offline-signature' },
    }));
  };
  return { state, send };
}

test('checkout completion never fulfills unpaid or previously settled bookings', async () => {
  for (const status of ['pending', 'cancelled', 'refunded', 'confirmed']) {
    const h = harness({ booking: { status } });
    assert.equal((await h.send('checkout.session.completed', { id: 'cs_1', payment_intent: 'pi_1', payment_status: 'unpaid' })).status, 200);
    assert.equal(h.state.booking.status, status);
    assert.equal(h.state.counters, 0);
    assert.equal(h.state.updates.length, 0);
  }
});

test('hosted and direct successful payments confirm once regardless of session event order', async () => {
  for (const sessionFirst of [false, true]) {
    const h = harness({ booking: { stripe_payment_intent_id: null } });
    const session = () => h.send('checkout.session.completed', { id: 'cs_1', payment_intent: 'pi_1', payment_status: 'paid' });
    if (sessionFirst) await session();
    await h.send('payment_intent.succeeded');
    if (!sessionFirst) await session();
    await h.send('payment_intent.succeeded');
    assert.equal(h.state.booking.status, 'confirmed');
    assert.equal(h.state.claims, 1);
    assert.equal(h.state.emails, 1);
    assert.equal(h.state.notifications, 1);
    assert.equal(h.state.counters, 0);
  }
});

test('concurrent succeeded deliveries have one confirmation winner', async () => {
  const h = harness();
  await Promise.all([h.send('payment_intent.succeeded'), h.send('payment_intent.succeeded')]);
  assert.equal(h.state.claims, 1);
  assert.equal(h.state.emails, 1);
});

test('a failed event racing succeeded cannot strand an actually paid booking as cancelled', async () => {
  for (const stripe_payment_intent_id of [null, 'pi_1']) {
    const h = harness({ booking: { stripe_payment_intent_id } });
    await Promise.all([h.send('payment_intent.succeeded'), h.send('payment_intent.payment_failed')]);
    assert.equal(h.state.booking.status, 'confirmed');
    assert.equal(h.state.emails, 1);
  }
});

test('succeeded retries do not resurrect settled or availability-cancelled bookings', async () => {
  for (const status of ['confirmed', 'completed', 'refunded', 'partially_refunded', 'cancelled']) {
    const h = harness({ booking: { status, admin_notes: '[AUTO] No tables available at booking time. Refunded automatically. Original payment intent: pi_1' } });
    await h.send('payment_intent.succeeded');
    assert.equal(h.state.booking.status, status);
    assert.equal(h.state.claims, 0);
    assert.equal(h.state.emails, 0);
    assert.equal(h.state.refunds.length, 0);
  }
});

test('a genuine failed payment can later succeed on the same booking', async () => {
  const h = harness({ booking: { stripe_payment_intent_id: null } });
  await h.send('payment_intent.payment_failed');
  assert.equal(h.state.booking.status, 'cancelled');
  await h.send('payment_intent.succeeded');
  assert.equal(h.state.booking.status, 'confirmed');
  assert.equal(h.state.emails, 1);
});

test('late failed events do not cancel a confirmed/refunded booking or a different intent', async () => {
  for (const status of ['confirmed', 'completed', 'refunded', 'partially_refunded']) {
    const h = harness({ booking: { status } });
    await h.send('payment_intent.payment_failed');
    assert.equal(h.state.booking.status, status);
  }
  const h = harness();
  await h.send('payment_intent.payment_failed', { id: 'pi_old' });
  assert.equal(h.state.booking.status, 'pending');
});

test('database failures return retryable errors before confirmation side effects', async () => {
  for (const failure of ['failReads', 'failWrites']) {
    const h = harness();
    h.state[failure] = true;
    assert.equal((await h.send('payment_intent.succeeded')).status, 500);
    assert.equal(h.state.emails, 0);
    assert.equal(h.state.claims, 0);
    h.state[failure] = false;
    assert.equal((await h.send('payment_intent.succeeded')).status, 200);
    assert.equal(h.state.emails, 1);
  }
});

test('a concurrent admin note edit retries confirmation instead of acknowledging an unpaid state', async () => {
  const h = harness({ changeNotesOnce: true });
  assert.equal((await h.send('payment_intent.succeeded')).status, 500);
  assert.equal(h.state.booking.status, 'pending');
  assert.equal((await h.send('payment_intent.succeeded')).status, 200);
  assert.equal(h.state.booking.status, 'confirmed');
  assert.equal(h.state.emails, 1);
});

test('availability auto-refund uses a stable idempotency key and never confirms on retry', async () => {
  const h = harness({ full: true });
  h.state.failRefund = true;
  assert.equal((await h.send('payment_intent.succeeded')).status, 500);
  assert.equal(h.state.booking.status, 'cancelled');
  h.state.failRefund = false;
  assert.equal((await h.send('payment_intent.succeeded')).status, 200);
  assert.equal(h.state.booking.status, 'cancelled');
  assert.equal(h.state.claims, 1);
  assert.equal(h.state.emails, 0);
  assert.equal(h.state.refunds[0].opts.idempotencyKey, h.state.refunds[1].opts.idempotencyKey);
});

test('partial refunds retain the table and a late partial event cannot downgrade a full refund', async () => {
  const h = harness({ booking: { status: 'confirmed' } });
  await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 10000, refunded: false });
  assert.equal(h.state.booking.status, 'partially_refunded');
  assert.equal(h.state.releases, 0);
  await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 100000, refunded: true });
  assert.equal(h.state.booking.status, 'refunded');
  await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 10000, refunded: false });
  assert.equal(h.state.booking.status, 'refunded');
  assert.equal(h.state.releases, 1);
});

test('a refund delivered before succeeded binds the intent and prevents resurrection', async () => {
  const h = harness({ booking: { stripe_payment_intent_id: null } });
  await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 100000, refunded: true });
  await h.send('payment_intent.succeeded');
  assert.equal(h.state.booking.status, 'refunded');
  assert.equal(h.state.emails, 0);
  assert.equal(h.state.claims, 0);
});

test('a refund racing table assignment is released before confirmation emails', async () => {
  const h = harness({ refundDuringClaim: true });
  await h.send('payment_intent.succeeded');
  assert.equal(h.state.booking.status, 'refunded');
  assert.equal(h.state.emails, 0);
  assert.equal(h.state.releases, 1);
});

test('concurrent refund and succeeded events converge to refunded for a hosted booking', async () => {
  const h = harness({ booking: { stripe_payment_intent_id: null } });
  await Promise.all([
    h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 100000, refunded: true }),
    h.send('payment_intent.succeeded'),
  ]);
  assert.equal(h.state.booking.status, 'refunded');
});

test('refund persistence and table-release errors return 500 for safe retries', async () => {
  const h = harness({ booking: { status: 'confirmed' } });
  h.state.failWrites = true;
  assert.equal((await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 100000, refunded: true })).status, 500);
  assert.equal(h.state.releases, 0);
  h.state.failWrites = false;
  h.state.failRelease = true;
  assert.equal((await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 100000, refunded: true })).status, 500);
  h.state.failRelease = false;
  assert.equal((await h.send('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 100000, amount_refunded: 100000, refunded: true })).status, 200);
  assert.equal(h.state.booking.status, 'refunded');
});
