import { Metadata } from 'next';

export const siteConfig = {
  name: 'Three Monkeys Restaurant',
  description: 'Authentic Southern Thai Cuisine in Phuket\'s rainforest. Book your table for an unforgettable dining experience at Three Monkeys Restaurant.',
  url: 'https://threemonkeys.vercel.app',
  ogImage: '/images/og-image.jpg',
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
    tripadvisor: 'https://www.tripadvisor.com/Restaurant_Review-Three_Monkeys_Phuket',
  },
  contact: {
    email: 'enjoy@threemonkeysphuket.com',
    phone: '+66 98-010-8838',
    address: 'Inside Hanuman World, 105 Moo 4, Muang Chao Fa Rd., Wichit, Mueang Phuket, Phuket 83000, Thailand',
  },
  geo: {
    latitude: 7.9285,
    longitude: 98.3185,
  },
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Authentic Southern Thai Cuisine`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
        url: siteConfig.ogImage,
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
    images: [siteConfig.ogImage],
    creator: '@threemonkeysphuket',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: 'your-google-verification-code',
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
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
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
