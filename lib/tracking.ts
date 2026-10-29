export interface TrackingSettings {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  headerScripts: string;
  bodyScripts: string;
  footerScripts: string;
}

/** gtag's command queue uses native Arguments objects, not rest-parameter arrays. */
export function createGoogleTagQueue(dataLayer: unknown[]): (...args: unknown[]) => void {
  return function gtag() {
    // Google's loader distinguishes this command protocol from dataLayer arrays.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
}

function validId(value: unknown, pattern: RegExp): string {
  return typeof value === 'string' && pattern.test(value.trim()) ? value.trim() : '';
}

/** Only fields intended to be embedded in the public page may cross this boundary. */
export function publicTrackingSettings(value: unknown, ga4Fallback = ''): TrackingSettings {
  const settings = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    gtmId: validId(settings.gtmId, /^GTM-[A-Z0-9]+$/),
    ga4Id: validId(settings.ga4Id, /^G-[A-Z0-9]+$/) || validId(ga4Fallback, /^G-[A-Z0-9]+$/),
    metaPixelId: validId(settings.metaPixelId, /^\d+$/),
    headerScripts: typeof settings.headerScripts === 'string' ? settings.headerScripts : '',
    bodyScripts: typeof settings.bodyScripts === 'string' ? settings.bodyScripts : '',
    footerScripts: typeof settings.footerScripts === 'string' ? settings.footerScripts : '',
  };
}

/** Share one request between the head and body components (including Strict Mode). */
export function createTrackingLoader(fetcher: typeof fetch, ga4Fallback = '') {
  let pending: Promise<TrackingSettings> | undefined;
  return () => {
    pending ??= fetcher('/api/tracking')
      .then(async (response) => {
        if (!response.ok) throw new Error('Tracking settings unavailable');
        const data = await response.json();
        return publicTrackingSettings(data.tracking, ga4Fallback);
      })
      .catch(() => publicTrackingSettings(null, ga4Fallback));
    return pending;
  };
}
