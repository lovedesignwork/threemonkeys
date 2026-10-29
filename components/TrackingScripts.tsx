'use client';

import Script from 'next/script';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { createGoogleTagQueue, createTrackingLoader, type TrackingSettings } from '@/lib/tracking';
import {
  ANALYTICS_ORIGIN, ATTRIBUTION_KEY, CONSENT_KEY, campaignFromUrl, nextAttribution,
  purchaseAlreadySent, readConsent, rememberPurchase, safePageLocation, safeReferrer, type Consent,
  safePurchase, type AnalyticsPurchase,
} from '@/lib/analytics';

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};
const loadTracking = createTrackingLoader((...args) => fetch(...args), process.env.NEXT_PUBLIC_GA4_ID);
const CONSENT_EVENT = 'tm-consent-change';
const PURCHASE_KEY = 'tm_reported_purchases_v1';
const PENDING_PURCHASE_KEY = 'tm_pending_purchase_v1';
const sentPurchases = new Set<string>();

function subscribeConsent(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(CONSENT_EVENT, callback); };
}
function consentSnapshot() { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } }
function storageRead(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function storageWrite(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } }

function forgetAnalytics() {
  try { localStorage.removeItem(ATTRIBUTION_KEY); localStorage.removeItem(PURCHASE_KEY); localStorage.removeItem(PENDING_PURCHASE_KEY); } catch { /* Optional storage. */ }
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!/^(_ga|_gid|_gat|_fbp|_fbc)/.test(name)) continue;
    for (const domain of ['', `; Domain=${location.hostname}`, '; Domain=.threemonkeysphuket.com']) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}; SameSite=Lax`;
    }
  }
}

function ConsentControls({ consent, gaId }: { consent: Consent | null; gaId: string }) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  function save(nextAnalytics: boolean, nextMarketing: boolean) {
    const choice = { analytics: nextAnalytics, marketing: nextMarketing, savedAt: Date.now() };
    storageWrite(CONSENT_KEY, JSON.stringify(choice));
    if (!nextAnalytics) {
      if (gaId) (window as unknown as AnalyticsWindow)[`ga-disable-${gaId}`] = true;
      forgetAnalytics();
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setOpen(false);
    // Removing a rendered script does not unload a vendor already in memory.
    if ((consent?.analytics && !nextAnalytics) || (consent?.marketing && !nextMarketing)) location.reload();
  }
  if (consent && !open) return <button type="button" onClick={() => { setAnalytics(consent.analytics); setMarketing(consent.marketing); setOpen(true); }}
    className="fixed bottom-3 left-3 z-[90] rounded-full border border-white/30 bg-black px-3 py-2 text-xs text-white shadow-lg">Cookie Settings</button>;
  return <section aria-label="Cookie preferences" className="fixed bottom-3 left-3 right-3 z-[90] max-w-lg rounded-2xl border border-white/30 bg-[#111] p-5 text-sm text-white shadow-2xl">
    <h2 className="mb-2 text-lg font-semibold">Your cookie choices</h2>
    <p className="mb-3 text-white/80">Essential storage supports reservations. With your permission, analytics helps us understand visits; marketing tools measure campaigns. You can change these choices anytime. <Link href="/cookies" className="underline">Cookie policy</Link></p>
    <div className="mb-4 flex flex-wrap gap-5">
      <label className="flex items-center gap-2"><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Analytics</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /> Marketing</label>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => save(false, false)} className="rounded-lg border border-white/40 px-4 py-2">Reject optional</button>
      <button type="button" onClick={() => save(analytics, marketing)} className="rounded-lg bg-[#b1b94c] px-4 py-2 font-semibold text-black">Save choices</button>
      <button type="button" onClick={() => save(true, true)} className="rounded-lg border border-white/40 px-4 py-2">Accept all</button>
    </div>
  </section>;
}

export function TrackingScriptsHead() {
  const pathname = usePathname();
  const rawConsent = useSyncExternalStore(subscribeConsent, consentSnapshot, () => null);
  const consent = useMemo(() => readConsent(rawConsent), [rawConsent]);
  const [tracking, setTracking] = useState<TrackingSettings | null>(null);
  const [purchase, setPurchase] = useState<AnalyticsPurchase | null>(null);
  const initializedId = useRef('');
  const lastPage = useRef('');
  const previousPage = useRef('');
  const purchasePath = /^\/(?:en\/|th\/|cn\/|ja\/|ko\/|ru\/|fr\/|es\/|ar\/)?checkout\/success\/?$/.test(pathname || '');
  const isPrivate = !safePageLocation(`${ANALYTICS_ORIGIN}${pathname || '/'}`);
  // Existing GTM containers own their Google tags. Do not add a duplicate direct tag.
  const gaId = tracking?.gtmId ? '' : tracking?.ga4Id || '';
  const canMeasure = Boolean(consent?.analytics && gaId && !isPrivate);

  useEffect(() => { let active = true; loadTracking().then(v => { if (active) setTracking(v); }); return () => { active = false; }; }, []);

  useEffect(() => {
    if (!consent?.analytics) return;
    const attribution = nextAttribution(storageRead(ATTRIBUTION_KEY), campaignFromUrl(location.href));
    if (attribution) storageWrite(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }, [pathname, consent?.analytics]);

  useEffect(() => {
    if (!purchasePath || !consent?.analytics) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const params = new URLSearchParams(location.search);
    const bookingRef = params.get('booking_ref');
    const paymentIntent = params.get('payment_intent');
    if (!bookingRef || !paymentIntent) return;
    async function check() {
      try {
        const response = await fetch('/api/analytics/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingRef, paymentIntent }) });
        const data = await response.json();
        if (!active) return;
        const receipt = safePurchase(data.purchase);
        if (receipt) {
          setPurchase(receipt);
          // Keep Google scripts off confirmation/token URLs. Report this verified
          // receipt if the consenting visitor returns to a public page.
          storageWrite(PENDING_PURCHASE_KEY, JSON.stringify({ purchase: receipt, expiresAt: Date.now() + 7 * 86400000 }));
        }
        else if (++attempts < 5) timer = setTimeout(check, 3000);
      } catch { if (active && ++attempts < 5) timer = setTimeout(check, 3000); }
    }
    void check();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [purchasePath, consent?.analytics]);

  useEffect(() => {
    if (!gaId) return;
    const w = window as unknown as AnalyticsWindow;
    w[`ga-disable-${gaId}`] = !canMeasure;
    if (!canMeasure) { lastPage.current = ''; return; }
    const page = safePageLocation(location.href)!;
    const referrer = previousPage.current || safeReferrer(document.referrer);
    w.dataLayer ||= [];
    w.gtag ||= createGoogleTagQueue(w.dataLayer);
    if (initializedId.current !== gaId) {
      w.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      w.gtag('js', new Date());
      w.gtag('config', gaId, { send_page_view: false, page_location: page, page_referrer: referrer,
        allow_google_signals: false, allow_ad_personalization_signals: false, cookie_flags: 'SameSite=Lax;Secure' });
      initializedId.current = gaId;
    }
    w.gtag('set', { page_location: page, page_referrer: referrer, page_title: document.title });
    // This component is the sole page_view owner. Enhanced Measurement history,
    // form/search/outbound auto events must be disabled in this GA4 stream.
    if (!isPrivate && lastPage.current !== page) {
      w.gtag('event', 'page_view', { send_to: gaId, page_location: page, page_referrer: referrer, page_title: document.title });
      lastPage.current = page;
      previousPage.current = safeReferrer(page);
    }
    let receipt = purchase;
    if (!receipt) {
      try {
        const saved = JSON.parse(storageRead(PENDING_PURCHASE_KEY) || 'null');
        if (saved?.expiresAt > Date.now() && saved.expiresAt <= Date.now() + 7 * 86400000) receipt = safePurchase(saved.purchase);
      } catch { /* Ignore a malformed local receipt. */ }
    }
    if (receipt && !sentPurchases.has(receipt.transaction_id)
      && !purchaseAlreadySent(storageRead(PURCHASE_KEY), receipt.transaction_id)) {
      w.gtag('event', 'purchase', { ...receipt, send_to: gaId, page_location: page, page_referrer: '', page_title: document.title });
      sentPurchases.add(receipt.transaction_id);
      storageWrite(PURCHASE_KEY, rememberPurchase(storageRead(PURCHASE_KEY), receipt.transaction_id));
      try { localStorage.removeItem(PENDING_PURCHASE_KEY); } catch { /* Memory ledger still deduplicates this session. */ }
    }
  }, [pathname, canMeasure, gaId, isPrivate, purchasePath, purchase]);

  const marketingAllowed = consent?.marketing && !isPrivate;
  const showConsent = !/^\/(?:admin|api|reservation|maintenance)(?:\/|$)/.test(pathname || '');
  return <>
    {showConsent && <ConsentControls consent={consent} gaId={gaId} />}
    {canMeasure && <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />}
    {marketingAllowed && tracking?.gtmId && <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tracking.gtmId}');` }} />}
    {marketingAllowed && tracking?.metaPixelId && <Script id="meta-pixel-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tracking.metaPixelId}');fbq('track','PageView');` }} />}
    {marketingAllowed && tracking?.headerScripts && <Script id="custom-header-scripts" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: tracking.headerScripts }} />}
    {marketingAllowed && tracking?.footerScripts && <Script id="custom-footer-scripts" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: tracking.footerScripts }} />}
    {marketingAllowed && tracking?.bodyScripts && <div dangerouslySetInnerHTML={{ __html: tracking.bodyScripts }} />}
  </>;
}

// All optional scripts now share one consent boundary; the root layout retains
// this export for compatibility. No noscript pixel can bypass consent.
export function TrackingScriptsBody() { return null; }
