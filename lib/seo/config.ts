import { Metadata } from 'next';

export const siteConfig = {
  name: 'Three Monkeys Restaurant',
  description: 'Authentic Southern Thai Cuisine in Phuket\'s rainforest. Book your table for an unforgettable dining experience at Three Monkeys Restaurant.',
  url: 'https://threemonkeysphuket.com',
  ogImage: '/opengraph-image',
  locale: 'en_US',
  creator: 'Three Monkeys Restaurant',
  keywords: [
    'three monkeys restaurant',
    'three monkeys phuket',
    'thai restaurant phuket',
    'southern thai cuisine',
    'jungle dining phuket',
    'romantic dinner phuket',
    'phuket restaurants',
    'rainforest restaurant thailand',
    'authentic thai food',
    'fine dining phuket',
    'family restaurant phuket',
    'rooftop dining phuket',
    'special occasion restaurant',
    'phuket dining experience',
    'hanuman world restaurant',
  ],
  social: {
    facebook: 'https://www.facebook.com/threemonkeysrestaurant',
    instagram: 'https://www.instagram.com/threemonkeysrestaurant/',
  },
  contact: {
    email: 'enjoy@threemonkeysphuket.com',
    phone: '+66 98-010-8838',
    address: 'Inside Hanuman World, 105 Moo 4, Muang Chao Fa Rd., Wichit, Mueang Phuket, Phuket 83000, Thailand',
  },
  mapUrl: 'https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6',
  address: {
    streetAddress: '105 Moo 4, Muang Chao Fa Rd.',
    addressLocality: 'Wichit, Mueang Phuket',
    addressRegion: 'Phuket',
    postalCode: '83000',
    addressCountry: 'TH',
  },
  openingHours: { opens: '10:00', closes: '01:00' },
  locales: ['en', 'th', 'cn', 'ja', 'ko', 'ru', 'fr', 'es', 'ar'] as const,
  defaultLocale: 'en' as const,
};

export type SupportedLocale = (typeof siteConfig.locales)[number];

/** Keep translated pages canonical to their own route, with language alternates. */
export function localizePageMetadata(metadata: Metadata, locale: string): Metadata {
  const canonical = metadata.alternates?.canonical?.toString() || siteConfig.url;
  const path = new URL(canonical, siteConfig.url).pathname;
  const localizedPath = locale === siteConfig.defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`;
  const url = `${siteConfig.url}${localizedPath}`;
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: url, languages: getLanguageAlternates(path) },
    openGraph: { ...metadata.openGraph, url },
  };
}

export function getLanguageAlternates(path: string = ''): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  for (const locale of siteConfig.locales) {
    const localePath = locale === siteConfig.defaultLocale ? path : `/${locale}${path}`;
    alternates[locale] = `${siteConfig.url}${localePath}`;
  }
  
  alternates['x-default'] = `${siteConfig.url}${path}`;
  
  return alternates;
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Authentic Southern Thai Cuisine`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Authentic Southern Thai Cuisine`,
    description: siteConfig.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Authentic Southern Thai Cuisine`,
    description: siteConfig.description,
    images: ['/twitter-image'],
    creator: '@threemonkeysphuket',
  },
  alternates: {
    canonical: siteConfig.url,
    languages: getLanguageAlternates('/'),
  },
  category: 'food',
};

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = '',
  image?: string
): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || '/opengraph-image';

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
  };
}
