import assert from 'node:assert/strict';
import test from 'node:test';
import { ATTRIBUTION_TTL, CONSENT_TTL, publicPath, safePageLocation, safeReferrer, validateCampaign,
  readConsent, nextAttribution, stripeAttribution, isVerifiedPurchase, purchaseAlreadySent, rememberPurchase, safePurchase } from '../lib/analytics.ts';

test('public page URLs drop personal, payment and fragment data', () => {
  const clean = safePageLocation('https://threemonkeysphuket.com/menu?utm_source=google&utm_medium=organic&utm_content=booking&email=guest%40example.com&payment_intent_client_secret=pi_example_secret&booking_ref=3M-000001#token');
  assert.equal(clean, 'https://threemonkeysphuket.com/menu?utm_source=google&utm_medium=organic&utm_content=booking');
  assert.equal(safePageLocation('https://threemonkeysphuket.com/es/menu?phone=123456789'), 'https://threemonkeysphuket.com/es/menu');
});

test('all private paths and unknown token-bearing paths are excluded', () => {
  for (const path of ['/admin', '/admin/login', '/checkout', '/checkout/success', '/th/checkout/success', '/reservation/secret/1', '/api/bookings/3M-000001', '/account/guest', '/blog/a%40example.com']) {
    assert.equal(publicPath(path), null, path);
    assert.equal(safePageLocation('https://threemonkeysphuket.com' + path), null, path);
  }
  assert.equal(publicPath('/blog/planning-a-visit'), '/blog/planning-a-visit');
  assert.equal(publicPath('/cn/booking'), '/cn/booking');
});

test('referrers retain only public internal paths or external origins', () => {
  assert.equal(safeReferrer('https://example.com/private/name?q=private'), 'https://example.com/');
  assert.equal(safeReferrer('https://threemonkeysphuket.com/menu?email=x@y.com'), 'https://threemonkeysphuket.com/menu');
  assert.equal(safeReferrer('https://threemonkeysphuket.com/checkout/success?booking_ref=3M-123'), '');
  assert.equal(safeReferrer('javascript:alert(1)'), '');
});

test('campaign validation rejects freeform and sensitive labels, preserves the GBP convention', () => {
  assert.deepEqual(validateCampaign({ utm_source: 'google', utm_medium: 'organic', utm_campaign: 'gbp', utm_content: 'post_2026_10_29_rooftop', utm_term: 'guest@example.com', email: 'private' }),
    { utm_source: 'google', utm_medium: 'organic', utm_campaign: 'gbp', utm_content: 'post_2026_10_29_rooftop' });
  for (const label of ['phone_0981234567', 'guest@example.com', 'https://private.example', 'pi_secret1234567', 'a'.repeat(81), '<script>', 'one two']) assert.deepEqual(validateCampaign({ utm_source: label }), {});
});

test('last campaign attribution persists through direct navigation and expires after 30 days', () => {
  const start = 1_000_000;
  const first = nextAttribution(null, { utm_source: 'google', utm_medium: 'organic' }, start);
  assert.equal(first.expiresAt, start + ATTRIBUTION_TTL);
  assert.deepEqual(nextAttribution(JSON.stringify(first), {}, start + 100), first);
  const second = nextAttribution(JSON.stringify(first), { utm_source: 'facebook', utm_medium: 'social' }, start + 100);
  assert.equal(second.campaign.utm_source, 'facebook');
  assert.equal(nextAttribution(JSON.stringify(first), {}, first.expiresAt), null);
  assert.equal(nextAttribution('broken', {}, start), null);
});

test('consent is explicit, expires after a year, and invalid input fails closed', () => {
  const yes = { analytics: true, marketing: false, savedAt: 1000 };
  assert.deepEqual(readConsent(JSON.stringify(yes), 2000), yes);
  assert.equal(readConsent(JSON.stringify(yes), 1000 + CONSENT_TTL), null);
  assert.equal(readConsent(JSON.stringify({ ...yes, analytics: 'true' }), 2000), null);
  assert.equal(readConsent('broken'), null);
  assert.deepEqual(stripeAttribution({ utm_source: 'google' }, false), {});
  assert.deepEqual(stripeAttribution({ utm_source: 'google', email: 'guest@example.com' }, true), { analytics_consent: 'true', utm_source: 'google' });
});

const verified = { bookingStatus: 'confirmed', bookingAmount: 1500, bookingCurrency: 'THB', bookingPaymentId: 'pi_verified', bookingId: 'booking-uuid', paymentStatus: 'succeeded', paymentAmountReceived: 150000, paymentCurrency: 'thb', paymentId: 'pi_verified', paymentBookingId: 'booking-uuid', consent: 'true' };
test('purchase requires matching trusted persisted confirmation and successful payment', () => {
  assert.equal(isVerifiedPurchase(verified), true);
  for (const changed of [{ bookingStatus: 'pending' }, { bookingStatus: 'refunded' }, { paymentStatus: 'processing' }, { paymentStatus: 'requires_payment_method' }, { paymentBookingId: 'other' }, { bookingPaymentId: 'other' }, { paymentAmountReceived: 1500 }, { paymentCurrency: 'usd' }, { consent: undefined }, { bookingAmount: NaN }, { bookingAmount: 0 }]) {
    assert.equal(isVerifiedPurchase({ ...verified, ...changed }), false, JSON.stringify(changed));
  }
});

test('stable transaction IDs are deduplicated and malformed local ledgers recover', () => {
  let ledger = rememberPurchase('broken', 'tm_test');
  assert.equal(purchaseAlreadySent(ledger, 'tm_test'), true);
  assert.equal(purchaseAlreadySent(ledger, 'tm_other'), false);
  ledger = rememberPurchase(ledger, 'tm_test');
  assert.equal(JSON.parse(ledger).length, 1);
});

test('stored receipts cannot add arbitrary customer fields to purchase events', () => {
  const receipt = { transaction_id: 'tm_' + 'a'.repeat(32), currency: 'THB', value: 1500, email: 'guest@example.com', booking_ref: '3M-1', items: [{ item_id: 'monkey-dome', item_name: 'Monkey Dome reservation', price: 1500, quantity: 1, guest_name: 'private' }] };
  const clean = safePurchase(receipt);
  assert.ok(clean);
  assert.equal(JSON.stringify(clean).includes('private'), false);
  assert.equal(JSON.stringify(clean).includes('example.com'), false);
  assert.equal(safePurchase({ ...receipt, currency: 'USD' }), null);
  assert.equal(safePurchase({ ...receipt, items: [{ ...receipt.items[0], item_name: 'guest@example.com' }] }), null);
});
