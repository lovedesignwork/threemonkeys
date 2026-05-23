/**
 * IP Geolocation Service
 *
 * Uses ip-api.com (free, no API key, 45 req/min rate limit) for one-shot
 * country lookups. Called from the booking flow so we can tag each booking
 * with the customer's country at the time of payment.
 *
 * Mirrors the approach used by sister Phuket sites (Baboon, Hanuman, etc.)
 * so the OneBooking dashboard sees a consistent payload shape from every
 * source website.
 */

export interface GeoData {
  ip: string;
  country_code: string;   // ISO 2-letter (e.g. "TH", "GB"). "XX" if unknown.
  country_name: string;
}

/**
 * Resolve a country from an IP address. Returns null only when there's no
 * usable IP at all; otherwise returns at least the IP with an "XX/Unknown"
 * placeholder so callers always have something to store.
 */
export async function getGeoFromIP(ip: string): Promise<GeoData | null> {
  // Skip local/private IPs — but still return the IP so we have a record
  if (
    !ip ||
    ip === 'unknown' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    console.log('[GeoIP] Skipping lookup for local/private IP:', ip);
    return ip && ip !== 'unknown'
      ? { ip, country_code: 'XX', country_name: 'Unknown' }
      : null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode,country,query`,
      {
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.status === 'success') {
      console.log('[GeoIP] Success', ip, '->', data.countryCode, data.country);
      return {
        ip: data.query || ip,
        country_code: data.countryCode,
        country_name: data.country,
      };
    }

    console.warn('[GeoIP] Lookup failed for', ip, data);
    return { ip, country_code: 'XX', country_name: 'Unknown' };
  } catch (err) {
    console.error('[GeoIP] Lookup error for', ip, err);
    return { ip, country_code: 'XX', country_name: 'Unknown' };
  }
}

/**
 * Extract a client IP from a request. Tries Vercel-specific headers first
 * because that's where this site is deployed, then falls back to standard
 * proxy headers.
 */
export function getClientIP(request: Request): string {
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP.split(',')[0].trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  return 'unknown';
}

/**
 * ISO 2-letter country code → human-readable name. Used by the Stripe
 * webhook to label `payment_origin_country_name` from `card.country`.
 */
const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AD: 'Andorra', AO: 'Angola',
  AR: 'Argentina', AM: 'Armenia', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan',
  BH: 'Bahrain', BD: 'Bangladesh', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize',
  BJ: 'Benin', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia', BW: 'Botswana',
  BR: 'Brazil', BN: 'Brunei', BG: 'Bulgaria', KH: 'Cambodia', CM: 'Cameroon',
  CA: 'Canada', CL: 'Chile', CN: 'China', CO: 'Colombia', CR: 'Costa Rica',
  HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark',
  DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador',
  EE: 'Estonia', ET: 'Ethiopia', FI: 'Finland', FR: 'France', GE: 'Georgia',
  DE: 'Germany', GH: 'Ghana', GR: 'Greece', GT: 'Guatemala', HK: 'Hong Kong',
  HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran',
  IQ: 'Iraq', IE: 'Ireland', IL: 'Israel', IT: 'Italy', JM: 'Jamaica',
  JP: 'Japan', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KW: 'Kuwait',
  KG: 'Kyrgyzstan', LA: 'Laos', LV: 'Latvia', LB: 'Lebanon', LY: 'Libya',
  LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macau', MK: 'North Macedonia',
  MY: 'Malaysia', MV: 'Maldives', MT: 'Malta', MX: 'Mexico', MD: 'Moldova',
  MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MA: 'Morocco', MM: 'Myanmar',
  NP: 'Nepal', NL: 'Netherlands', NZ: 'New Zealand', NG: 'Nigeria', NO: 'Norway',
  OM: 'Oman', PK: 'Pakistan', PA: 'Panama', PY: 'Paraguay', PE: 'Peru',
  PH: 'Philippines', PL: 'Poland', PT: 'Portugal', QA: 'Qatar', RO: 'Romania',
  RU: 'Russia', SA: 'Saudi Arabia', RS: 'Serbia', SG: 'Singapore', SK: 'Slovakia',
  SI: 'Slovenia', ZA: 'South Africa', KR: 'South Korea', ES: 'Spain', LK: 'Sri Lanka',
  SE: 'Sweden', CH: 'Switzerland', TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania',
  TH: 'Thailand', TR: 'Turkey', UA: 'Ukraine', AE: 'United Arab Emirates',
  GB: 'United Kingdom', US: 'United States', UY: 'Uruguay', UZ: 'Uzbekistan',
  VE: 'Venezuela', VN: 'Vietnam', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe',
};

export function getCountryName(code: string | null | undefined): string {
  if (!code) return '';
  return COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase();
}
