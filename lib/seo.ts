import { Metadata } from 'next';

const baseUrl = 'https://threemonkeysphuket.com';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Three Monkeys Phuket | Authentic Thai Fine Dining Experience",
    template: '%s | Three Monkeys Phuket',
  },
  description:
    "Experience authentic Thai fine dining at Three Monkeys Phuket. Award-winning chefs, locally-sourced ingredients, tasting menus, cooking classes & more in beautiful Kathu.",
  keywords: [
    'thai restaurant',
    'phuket',
    'fine dining',
    'thailand',
    'three monkeys',
    'thai cuisine',
    'tasting menu',
    'cooking class',
    'phuket restaurants',
    'best restaurants phuket',
    'things to do in phuket',
  ],
  authors: [{ name: 'Three Monkeys Phuket' }],
  creator: 'Three Monkeys Phuket',
  publisher: 'Three Monkeys Phuket',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Three Monkeys Phuket',
    title: "Three Monkeys Phuket | Authentic Thai Fine Dining Experience",
    description:
      "Experience authentic Thai fine dining at Three Monkeys Phuket.",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Three Monkeys Phuket',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Three Monkeys Phuket | Authentic Thai Fine Dining Experience",
    description:
      "Experience authentic Thai fine dining at Three Monkeys Phuket.",
    images: ['/images/og-image.jpg'],
  },
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
  verification: {
    // Add verification codes when available
    // google: 'google-site-verification-code',
  },
};

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Three Monkeys Phuket',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    sameAs: [
      'https://facebook.com/threemonkeysphuket',
      'https://www.instagram.com/threemonkeysrestaurant/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+66-76-323-264',
      contactType: 'customer service',
      areaServed: 'TH',
      availableLanguage: ['English', 'Thai', 'Chinese', 'Russian'],
    },
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Three Monkeys Phuket',
    description:
      "Phuket's premier Thai fine dining restaurant featuring authentic Southern Thai cuisine, tasting menus, cooking classes, and unforgettable culinary experiences.",
    url: baseUrl,
    telephone: '+66-98-010-8838',
    email: 'enjoy@threemonkeysphuket.com',
    servesCuisine: 'Thai',
    priceRange: '฿฿฿',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '105 Moo 4, Muang Chao Fa Rd.',
      addressLocality: 'Wichit, Mueang Phuket',
      addressRegion: 'Phuket',
      postalCode: '83000',
      addressCountry: 'TH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 7.9128,
      longitude: 98.3264,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '11:00',
      closes: '22:00',
    },
    image: `${baseUrl}/images/og-image.jpg`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1500',
    },
    acceptsReservations: true,
    menu: `${baseUrl}/packages`,
  };
}
