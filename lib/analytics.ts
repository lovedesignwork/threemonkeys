/** Public analytics payloads must never include booking URLs or customer input. */
export const ANALYTICS_ORIGIN = 'https://threemonkeysphuket.com';
export const ATTRIBUTION_KEY = 'tm_attribution_v1';
export const CONSENT_KEY = 'tm_consent_v1';
export const ATTRIBUTION_TTL = 30 * 24 * 60 * 60 * 1000;
export const CONSENT_TTL = 365 * 24 * 60 * 60 * 1000;
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type Campaign = Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>>;
export type Consent = { analytics: boolean; marketing: boolean; savedAt: number };
export type Attribution = { campaign: Campaign; expiresAt: number };
const LOCALES = /^\/(?:en|th|cn|ru|ja|ko|es|fr|ar)(?=\/|$)/;

export function publicPath(pathname: string): string | null {
  const path = pathname.replace(LOCALES, '') || '/';
  return /^\/(?:about|menu|seats|special-packages|packages|booking|contact|faq|blog|privacy|terms|refund|safety|cookies)?\/?$/.test(path)
    || /^\/(?:blog|packages)\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(path) ? pathname : null;
}

export function validateCampaign(value: unknown): Campaign {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const result: Campaign = {};
  for (const key of CAMPAIGN_KEYS) {
    const label = source[key];
    // Campaign labels, not arbitrary user text. Reject emails, URLs, phone-like
    // digit sequences, encoded separators and known secret/reference prefixes.
    if (typeof label === 'string' && /^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(label)
      && !/\d{7}|(?:secret|token|booking_ref|email|phone|pi_|cs_)/i.test(label)) result[key] = label;
  }
  return result;
}

export function campaignFromUrl(url: string): Campaign {
  try { return validateCampaign(Object.fromEntries(new URL(url).searchParams)); } catch { return {}; }
}

export function safePageLocation(raw: string): string | null {
  try {
    const url = new URL(raw, ANALYTICS_ORIGIN);
    if (!publicPath(url.pathname)) return null;
    const clean = new URL(url.pathname, ANALYTICS_ORIGIN);
    for (const [key, value] of Object.entries(campaignFromUrl(raw))) clean.searchParams.set(key, value);
    return clean.toString();
  } catch { return null; }
}

export function safeReferrer(raw: string): string {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (url.origin === ANALYTICS_ORIGIN) return publicPath(url.pathname) ? `${url.origin}${url.pathname}` : '';
    // External paths and queries may contain names, IDs, or private search terms.
    return `${url.origin}/`;
  } catch { return ''; }
}

export function readConsent(raw: string | null, now = Date.now()): Consent | null {
  try {
    const value = JSON.parse(raw || 'null');
    return value && typeof value.analytics === 'boolean' && typeof value.marketing === 'boolean'
      && Number.isFinite(value.savedAt) && value.savedAt <= now && now - value.savedAt < CONSENT_TTL
      ? value : null;
  } catch { return null; }
}

export function nextAttribution(raw: string | null, campaign: Campaign, now = Date.now()): Attribution | null {
  const validated = validateCampaign(campaign);
  // Last campaign touch wins; direct navigation retains the last valid touch.
  if (validated.utm_source && validated.utm_medium) return { campaign: validated, expiresAt: now + ATTRIBUTION_TTL };
  try {
    const stored = JSON.parse(raw || 'null');
    const previous = validateCampaign(stored?.campaign);
    return stored && stored.expiresAt > now && stored.expiresAt <= now + ATTRIBUTION_TTL
      && previous.utm_source && previous.utm_medium ? { campaign: previous, expiresAt: stored.expiresAt } : null;
  } catch { return null; }
}

/** Called only by checkout; denied consent/storage failure cannot break payment. */
export function checkoutAttribution(): { analyticsConsent: boolean; attribution: Campaign } {
  try {
    if (!readConsent(localStorage.getItem(CONSENT_KEY))?.analytics) return { analyticsConsent: false, attribution: {} };
    return { analyticsConsent: true, attribution: nextAttribution(localStorage.getItem(ATTRIBUTION_KEY), {})?.campaign || {} };
  } catch { return { analyticsConsent: false, attribution: {} }; }
}

export function stripeAttribution(value: unknown, analyticsConsent: unknown): Record<string, string> {
  if (analyticsConsent !== true) return {};
  return { analytics_consent: 'true', ...validateCampaign(value) };
}

export interface PurchaseEvidence {
  bookingStatus: string; bookingAmount: number; bookingCurrency: string;
  bookingPaymentId: string; bookingId: string;
  paymentStatus: string; paymentAmountReceived: number; paymentCurrency: string;
  paymentId: string; paymentBookingId?: string; consent?: string;
}

export function isVerifiedPurchase(evidence: PurchaseEvidence): boolean {
  return ['confirmed', 'completed'].includes(evidence.bookingStatus)
    && evidence.paymentStatus === 'succeeded' && evidence.consent === 'true'
    && evidence.bookingPaymentId === evidence.paymentId && evidence.paymentBookingId === evidence.bookingId
    && evidence.bookingCurrency.toUpperCase() === evidence.paymentCurrency.toUpperCase()
    && Number.isFinite(evidence.bookingAmount) && evidence.bookingAmount > 0
    && Math.round(evidence.bookingAmount * 100) === evidence.paymentAmountReceived;
}

export function purchaseAlreadySent(raw: string | null, transactionId: string): boolean {
  try { const values = JSON.parse(raw || '[]'); return Array.isArray(values) && values.includes(transactionId); } catch { return false; }
}

export function rememberPurchase(raw: string | null, transactionId: string): string {
  let values: string[] = [];
  try { const parsed = JSON.parse(raw || '[]'); if (Array.isArray(parsed)) values = parsed.filter(v => typeof v === 'string'); } catch { /* Fresh ledger. */ }
  return JSON.stringify([...new Set([...values, transactionId])].slice(-100));
}

export interface AnalyticsPurchase {
  transaction_id: string; currency: string; value: number;
  items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
}

/** Reapply an allowlist to receipts crossing the localStorage boundary. */
export function safePurchase(value: unknown): AnalyticsPurchase | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (typeof data.transaction_id !== 'string' || !/^tm_[a-f0-9]{32}$/.test(data.transaction_id)
    || data.currency !== 'THB' || typeof data.value !== 'number' || !Number.isFinite(data.value) || data.value <= 0
    || !Array.isArray(data.items) || data.items.length !== 1) return null;
  const item = data.items[0];
  if (!item || typeof item.item_id !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(item.item_id)
    || typeof item.item_name !== 'string' || !/^[\p{L}\p{N} &()–—-]{1,120}$/u.test(item.item_name)
    || item.quantity !== 1 || item.price !== data.value) return null;
  return { transaction_id: data.transaction_id, currency: 'THB', value: data.value,
    items: [{ item_id: item.item_id, item_name: item.item_name, price: item.price, quantity: 1 }] };
}
