// Run with: node --test scripts/checkout-regression.test.cjs
// Loads the real route code with in-memory DB/Stripe adapters. No network or
// environment credentials are available inside the route's VM context.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const PROMO_ID = '11111111-1111-4111-8111-111111111111';
const validBody = (overrides = {}) => ({
  packageId: 'monkey-dome', date: '2026-09-13', time: '19:00', guests: 2,
  pickup: false, privateTransfer: false, privatePassengers: 2,
  additionalGuests: 0, promoAddons: {},
  customer: { firstName: 'Test', lastName: 'Guest', email: 'guest@example.test', phone: 'line-id', countryCode: 'TH' },
  ...overrides,
});

// Next imports route modules while collecting build metadata. Use the real
// Stripe/Supabase libraries with an empty environment to reproduce Preview.
function loadBookingRouteWithoutCredentials() {
  const cache = new Map();
  function load(id) {
    if (!id.startsWith('@/')) return require(id);
    const file = path.join(root, `${id.slice(2)}.ts`);
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(compiled, {
      module: loadedModule, exports: loadedModule.exports, require: load,
      process: { env: {} }, URL, console,
      fetch: () => { throw new Error('Network forbidden in regression tests'); },
    }, { filename: file });
    return loadedModule.exports;
  }
  return load('@/app/api/bookings/[ref]/route');
}

test('booking lookup can be imported during a Preview build without private credentials', () => {
  assert.doesNotThrow(loadBookingRouteWithoutCredentials);
});

test('booking lookup still rejects missing payment verification without private credentials', async () => {
  const route = loadBookingRouteWithoutCredentials();
  const response = await route.GET(
    { url: 'https://example.test/api/bookings/3M-123456' },
    { params: Promise.resolve({ ref: '3M-123456' }) },
  );
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'Unauthorized - payment verification required');
});

function harness(options = {}) {
  const writes = [], payments = [], rpcs = [];
  const promo = {
    id: PROMO_ID, code: 'SAVE10', is_active: true, discount_type: 'percentage',
    discount_value: 10, min_order_amount: 0, max_uses: null, current_uses: 0,
    valid_from: null, valid_until: null, ...options.promo,
  };
  const db = {
    from(table) {
      let action = 'select', payload, filters = {};
      const result = () => {
        if (action !== 'select') writes.push({ table, action, payload });
        if (options.failTable === table && action === 'insert') return { data: null, error: { message: 'Mock insert failed' } };
        if (table === 'bookings') return { data: { id: 'booking-id', booking_ref: '3M-123456' }, error: null };
        if (table === 'promo_codes') return { data: options.missingPromo ? null : promo, error: null };
        if (table === 'packages') return { data: { id: filters.id, name: 'Stale package', price: 123, duration: '1 hour' }, error: null };
        if (table === 'promo_addons') return { data: [], error: null };
        if (table === 'site_settings') return { data: { value: options.disabledAddons || [] }, error: null };
        return { data: null, error: null };
      };
      const chain = {
        select() { return chain; }, eq(key, value) { filters[key] = value; return chain; }, in() { return chain; },
        insert(value) { action = 'insert'; payload = value; return chain; },
        update(value) { action = 'update'; payload = value; return chain; },
        delete() { action = 'delete'; return chain; },
        single: async () => result(), maybeSingle: async () => result(),
        then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
      };
      return chain;
    },
    async rpc(name, args) { rpcs.push({ name, args }); return { data: null, error: null }; },
  };
  const mocks = {
    'next/server': { NextResponse: { json: (value, init) => Response.json(value, init) } },
    '@/lib/supabase/server': { supabaseAdmin: db },
    '@/lib/stripe/client': {
      PRIVATE_TRANSFER_PRICE: 2500, NON_PLAYER_PRICE: 300,
      stripe: {
        paymentIntents: { create: async (args) => { payments.push(args); return { id: 'pi_mock', client_secret: 'mock_secret' }; } },
        checkout: { sessions: { create: async (args) => { payments.push(args); return { id: 'cs_mock', url: 'https://example.test/mock' }; } } },
      },
    },
    '@/lib/geo/ip-lookup': { getClientIP: () => null, getGeoFromIP: async () => null },
    '@/lib/data/package-controls-server': { fetchPackageControls: async () => ({ disabledPackages: [], blockedDates: {}, priceOverrides: {}, ...options.controls }) },
    '@/lib/allotment/server': { checkZoneAvailability: async () => ({ is_available: !options.soldOut, available_count: 1, total_count: 1 }) },
  };
  const cache = new Map();
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [options.now || '2026-09-12T04:00:00Z'])); }
    static now() { return new Date(options.now || '2026-09-12T04:00:00Z').getTime(); }
  }
  function load(id, parent = root) {
    if (mocks[id]) return mocks[id];
    if (id === 'zod') return require('zod');
    if (!id.startsWith('@/') && !id.startsWith('.')) throw new Error(`Unexpected dependency: ${id}`);
    const absolute = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(parent, id);
    const file = absolute.endsWith('.ts') ? absolute : `${absolute}.ts`;
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(compiled, {
      module: loadedModule, exports: loadedModule.exports, require: (next) => load(next, path.dirname(file)),
      Date: FixedDate, Response, Request, URL, Intl,
      process: { env: { SUPABASE_SERVICE_ROLE_KEY: 'test-only-placeholder' } },
      console: { log() {}, warn() {}, error() {} },
      fetch: () => { throw new Error('Network forbidden in regression tests'); },
    }, { filename: file });
    return loadedModule.exports;
  }
  return {
    writes, payments, rpcs, load,
    async post(endpoint, body) {
      const route = load(`@/app/api/checkout/${endpoint}/route`);
      const response = await route.POST({ json: async () => body });
      return { status: response.status, body: await response.json() };
    },
  };
}

test('payment amount ignores a forged client discount without a promo', async () => {
  const h = harness();
  const response = await h.post('create-payment-intent', validBody({ discountAmount: 3999 }));
  assert.equal(response.status, 200);
  assert.equal(h.payments[0].amount, 400000);
  assert.equal(h.writes.find(w => w.table === 'bookings' && w.action === 'insert').payload.discount_amount, 0);
});

test('promo discount is recomputed from server subtotal and never consumed before payment', async () => {
  const h = harness();
  const response = await h.post('create-payment-intent', validBody({ promoCodeId: PROMO_ID, discountAmount: 3999 }));
  assert.equal(response.status, 200);
  assert.equal(h.payments[0].amount, 360000);
  assert.equal(h.rpcs.filter(rpc => rpc.name === 'increment_promo_usage').length, 0);
});

for (const [name, promo] of [
  ['inactive', { is_active: false }], ['expired', { valid_until: '2026-09-01T00:00:00Z' }],
  ['not started', { valid_from: '2026-10-01T00:00:00Z' }],
  ['exhausted', { max_uses: 1, current_uses: 1 }], ['below minimum', { min_order_amount: 5000 }],
  ['invalid percentage', { discount_value: 110 }],
]) {
  test(`rejects ${name} promo before creating any booking or payment`, async () => {
    const h = harness({ promo });
    const response = await h.post('create-payment-intent', validBody({ promoCodeId: PROMO_ID, discountAmount: 500 }));
    assert.equal(response.status, 400);
    assert.equal(h.writes.length, 0);
    assert.equal(h.payments.length, 0);
  });
}

for (const endpoint of ['create-payment-intent', 'create-session']) {
  for (const [name, values] of [
    ['negative guests', { guests: -1 }], ['fractional guests', { guests: 1.5 }], ['too many table guests', { guests: 5 }],
    ['invalid date', { date: '2026-02-30' }], ['past date', { date: '2026-09-11' }], ['invalid slot', { time: '10:00' }],
    ['too little lead time', { packageId: 'indoor-seat', date: '2026-09-12', time: '12:00' }],
    ['same day special', { packageId: 'ultimate-dinner', date: '2026-09-12' }],
    ['unknown addon', { promoAddons: { bogus: 1 } }], ['negative addon', { promoAddons: { 'birthday-mini': -1 } }],
    ['fractional addon', { promoAddons: { 'birthday-mini': 0.5 } }], ['same day addon', { date: '2026-09-12', promoAddons: { 'birthday-mini': 1 } }],
    ['same day transfer', { date: '2026-09-12', pickup: true, privateTransfer: true, hotel: 'Test hotel' }],
    ['duplicate included transfer', { packageId: 'ultimate-dinner', pickup: true, privateTransfer: true, hotel: 'Test hotel' }],
    ['excess van passengers', { packageId: 'indoor-seat', guests: 11, privatePassengers: 11, pickup: true, privateTransfer: true, hotel: 'Test hotel' }],
    ['invalid customer', { customer: { firstName: '', lastName: 'Guest', email: 'bad', phone: '' } }],
  ]) {
    test(`${endpoint}: rejects ${name} before writes`, async () => {
      const h = harness();
      const response = await h.post(endpoint, validBody(values));
      assert.equal(response.status, 400);
      assert.equal(h.writes.length, 0);
      assert.equal(h.payments.length, 0);
    });
  }
  test(`${endpoint}: checks sold-out availability before creating payment`, async () => {
    const h = harness({ soldOut: true });
    const response = await h.post(endpoint, validBody());
    assert.equal(response.status, 409);
    assert.equal(h.writes.length, 0);
  });
  test(`${endpoint}: rejects disabled addons before writes`, async () => {
    const h = harness({ disabledAddons: ['birthday-mini'] });
    const response = await h.post(endpoint, validBody({ promoAddons: { 'birthday-mini': 1 } }));
    assert.equal(response.status, 409);
    assert.equal(h.writes.length, 0);
  });
  test(`${endpoint}: aborts payment if customer persistence fails`, async () => {
    const h = harness({ failTable: 'booking_customers' });
    const response = await h.post(endpoint, validBody());
    assert.equal(response.status, 500);
    assert.equal(h.payments.length, 0);
  });
}

for (const [packageId, guests, expected] of [
  ['monkey-dome', 4, 4000], ['monkey-nest', 6, 5000], ['ultimate-dinner', 10, 9999], ['indoor-seat', 4, 4000],
]) {
  test(`create-session: authoritative ${packageId} pricing`, async () => {
    const h = harness();
    const response = await h.post('create-session', validBody({ packageId, guests }));
    assert.equal(response.status, 200);
    const total = h.payments[0].line_items.reduce((sum, line) => sum + line.price_data.unit_amount * line.quantity, 0);
    assert.equal(total, expected * 100);
  });
}

test('admin price override, addon, and paid transfer all contribute to server discount base', async () => {
  const h = harness({ controls: { priceOverrides: { 'monkey-dome': 5000 } } });
  const response = await h.post('create-payment-intent', validBody({
    pickup: true, privateTransfer: true, hotel: 'Test hotel', promoAddons: { 'birthday-mini': 1 }, promoCodeId: PROMO_ID, discountAmount: 1,
  }));
  assert.equal(response.status, 200);
  assert.equal(h.payments[0].amount, 783000);
});

test('promo preview rejects invalid order total before querying', async () => {
  const h = harness();
  assert.equal((await h.post('validate-promo', { code: 'SAVE10', orderTotal: -100 })).status, 400);
});

test('checkout URL rejects malformed guests and addon quantities instead of truncating them', () => {
  const h = harness();
  const { parseCheckoutSelection } = h.load('@/lib/checkout/validation');
  assert.equal(typeof parseCheckoutSelection, 'function');
  for (const suffix of ['&guests=2oops', '&guests=-2', '&guests=NaN', '&guests=1.5', '&addons=birthday-mini:1oops', '&addons=bogus:1', '&addons=birthday-mini:1:2']) {
    const params = new URLSearchParams(`package=monkey-dome&date=2026-09-13&time=19:00${suffix}`);
    assert.throws(() => parseCheckoutSelection(params));
  }
});

test('checkout URL accepts valid details and rejects missing dates and suspended packages', () => {
  const h = harness();
  const { parseCheckoutSelection } = h.load('@/lib/checkout/validation');
  assert.equal(typeof parseCheckoutSelection, 'function');
  const params = new URLSearchParams('package=monkey-dome&date=2026-09-13&time=19:00&guests=4&addons=birthday-mini:1');
  assert.equal(parseCheckoutSelection(params).guests, 4);
  params.delete('date');
  assert.throws(() => parseCheckoutSelection(params));
  params.set('date', '2026-09-13');
  params.set('package', 'rooftop-romantic');
  assert.throws(() => parseCheckoutSelection(params));
});

test('Bangkok midnight changes advance booking eligibility and minimum dates', () => {
  const h = harness();
  const rules = h.load('@/lib/checkout/validation');
  assert.equal(typeof rules.getMinimumBookingDate, 'function');
  const before = new Date('2026-09-12T16:59:59Z');
  const after = new Date('2026-09-12T17:00:00Z');
  assert.equal(rules.getMinimumBookingDate('monkey-dome', before), '2026-09-12');
  assert.equal(rules.getMinimumBookingDate('monkey-dome', after), '2026-09-13');
  assert.equal(rules.getMinimumBookingDate('ultimate-dinner', before), '2026-09-13');
  assert.equal(rules.getMinimumBookingDate('ultimate-dinner', after), '2026-09-14');
  assert.equal(rules.isAdvanceBooking('2026-09-13', before), true);
  assert.equal(rules.isAdvanceBooking('2026-09-13', after), false);
});

for (const timezone of ['America/Los_Angeles', 'Europe/London', 'Pacific/Auckland', 'Asia/Bangkok']) {
  test(`Phuket booking rules and calendar dates are stable for visitors in ${timezone}`, () => {
    const originalTimezone = process.env.TZ;
    try {
      process.env.TZ = timezone;
      const h = harness();
      const rules = h.load('@/lib/checkout/validation');
      assert.equal(typeof rules.isTimeSlotBookable, 'function');
      const now = new Date('2026-09-12T09:30:00Z'); // 16:30 Phuket.
      assert.equal(rules.isTimeSlotBookable('19:00', '2026-09-12', now), true);
      assert.equal(rules.isTimeSlotBookable('16:00', '2026-09-12', now), false);
      assert.equal(rules.isTimeSlotBookable('19:00', '2026-09-12', new Date('2026-09-12T10:00:00Z')), false);
      assert.equal(rules.isAdvanceBooking('2026-09-13', new Date('2026-09-12T17:30:00Z')), false);
      const calendar = rules.parseCalendarDate('2026-10-01');
      assert.equal(calendar.getFullYear(), 2026);
      assert.equal(calendar.getMonth(), 9);
      assert.equal(calendar.getDate(), 1);
      assert.equal(rules.parseCalendarDate('2026-02-30'), null);
      // The same-day API decision agrees with the visible booking rule.
      assert.throws(() => rules.parseBookingData(validBody({ packageId: 'ultimate-dinner' }), new Date('2026-09-12T17:30:00Z')));
    } finally {
      if (originalTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimezone;
    }
  });
}

test('shared special package rules cover Ultimate Romantic Dinner without enabling its catalog entry', () => {
  const h = harness();
  const addons = h.load('@/lib/data/addons');
  const rules = h.load('@/lib/checkout/validation');
  assert.equal(addons.isSpecialPackage('ultimate-romantic-dinner'), true);
  assert.equal(addons.isFixedPricePackage('ultimate-romantic-dinner'), true);
  assert.equal(rules.getMaxGuestsForPackage('ultimate-romantic-dinner'), 10);
  assert.equal(rules.getAvailableTimeSlots('ultimate-romantic-dinner')[0], '17:00');
  assert.equal(rules.getMaxGuestsForPackage('zone-6'), 50);
  assert.equal(h.load('@/lib/data/packages').getPackageById('ultimate-romantic-dinner'), undefined);
});

for (const endpoint of ['create-payment-intent', 'create-session']) {
  test(`${endpoint}: Zone 7 accepts ten guests and rejects eleven`, async () => {
    const accepted = harness();
    assert.equal((await accepted.post(endpoint, validBody({ packageId: 'zone-7', guests: 10 }))).status, 200);
    const rejected = harness();
    assert.equal((await rejected.post(endpoint, validBody({ packageId: 'zone-7', guests: 11 }))).status, 400);
    assert.equal(rejected.writes.length, 0);
    assert.equal(rejected.payments.length, 0);
  });
}
