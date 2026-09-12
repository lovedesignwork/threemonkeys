export interface PublicTrackingSettings {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  verification: Array<{ name: string; content: string }>;
}

const verificationNames = new Set([
  'google-site-verification',
  'facebook-domain-verification',
  'msvalidate.01',
  'yandex-verification',
  'p:domain_verify',
]);

function publicId(value: unknown, pattern: RegExp): string {
  if (typeof value !== 'string') return '';
  const id = value.trim();
  return pattern.test(id) ? id : '';
}

/** Only values intended for public browser tags may leave the settings API. */
export function normalizePublicTracking(value: unknown): PublicTrackingSettings {
  const settings = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const verification = new Map<string, string>();
  const addVerification = (name: unknown, content: unknown) => {
    if (typeof name !== 'string' || typeof content !== 'string') return;
    const normalizedName = name.trim().toLowerCase();
    const token = content.trim();
    if (verificationNames.has(normalizedName) && /^[A-Za-z0-9_-]{1,256}={0,2}$/.test(token)) {
      verification.set(normalizedName, token);
    }
  };

  // Revalidate the endpoint's public shape when consuming it in the browser.
  if (Array.isArray(settings.verification)) {
    for (const item of settings.verification) {
      if (item && typeof item === 'object') addVerification(item.name, item.content);
    }
  }

  // Existing admin settings store verification meta tags in headerScripts.
  // Extract only recognized name/content pairs; never publish raw snippets.
  if (typeof settings.headerScripts === 'string' && settings.headerScripts.length <= 50000) {
    const markup = settings.headerScripts
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
    for (const tag of markup.match(/<meta\b[^>]*>/gi) ?? []) {
      const attributes: Record<string, string> = {};
      for (const match of tag.matchAll(/\s(name|content)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
        attributes[match[1].toLowerCase()] ??= match[2] ?? match[3];
      }
      addVerification(attributes.name, attributes.content);
    }
  }

  return {
    gtmId: publicId(settings.gtmId, /^GTM-[A-Z0-9]{4,20}$/),
    ga4Id: publicId(settings.ga4Id, /^G-[A-Z0-9]{4,20}$/),
    metaPixelId: publicId(settings.metaPixelId, /^[0-9]{5,25}$/),
    verification: Array.from(verification, ([name, content]) => ({ name, content })),
  };
}
