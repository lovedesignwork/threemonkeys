// Compatibility exports for older callers; keep restaurant details centralized.
import { siteConfig } from './seo/config';
export { defaultMetadata } from './seo/config';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/threemonkeyslogo.png`,
    sameAs: Object.values(siteConfig.social),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.contact.phone,
      contactType: 'customer service',
      areaServed: 'TH',
    },
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    servesCuisine: 'Thai',
    address: { '@type': 'PostalAddress', ...siteConfig.address },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      ...siteConfig.openingHours,
    },
    image: `${siteConfig.url}/opengraph-image`,
    acceptsReservations: true,
    menu: `${siteConfig.url}/menu`,
  };
}
