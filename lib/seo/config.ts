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
  locales: ['en', 'th', 'cn', 'ja', 'ko', 'ru', 'fr', 'es', 'ar'] as const,
  defaultLocale: 'en' as const,
};

export type SupportedLocale = (typeof siteConfig.locales)[number];

// URL slugs and language tags differ for Chinese: /cn is the public route,
// while zh-CN is the valid language tag used by search engines.
export const languageTags: Record<SupportedLocale, string> = {
  en: 'en', th: 'th', cn: 'zh-CN', ja: 'ja', ko: 'ko',
  ru: 'ru', fr: 'fr', es: 'es', ar: 'ar',
};

export function getLocalizedUrl(path: string = '', locale: string = 'en') {
  const normalizedPath = path === '/' ? '' : path;
  return `${siteConfig.url}${locale === 'en' ? '' : `/${locale}`}${normalizedPath}`;
}

export function getLanguageAlternates(path: string = ''): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  for (const locale of siteConfig.locales) {
    alternates[languageTags[locale]] = getLocalizedUrl(path, locale);
  }
  
  alternates['x-default'] = getLocalizedUrl(path);
  
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
  ...(process.env.GOOGLE_SITE_VERIFICATION ? {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  } : {}),
  category: 'food',
};

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = '',
  image?: string,
  locale: string = 'en'
): Metadata {
  const url = getLocalizedUrl(path, locale);
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

export function createPageMetadata(title: string, description: string, path: string, options: Metadata = {}) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    return { ...generatePageMetadata(title, description, path, undefined, locale), ...options };
  };
}
