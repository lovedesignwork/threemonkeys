import { siteConfig } from './config';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: 'Three Monkeys Restaurant Phuket',
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/threemonkeyslogo.png`,
    image: `${siteConfig.url}/opengraph-image`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        ...siteConfig.openingHours,
      },
    ],
    priceRange: '฿฿',
    servesCuisine: 'Thai',
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
    ],
    hasMap: siteConfig.mapUrl,
    acceptsReservations: 'True',
    availableLanguage: ['English', 'Thai', 'Chinese', 'Russian'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({ product }: { product: ProductData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image || `${siteConfig.url}/opengraph-image`,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'THB',
      availability: 'https://schema.org/InStock',
      url: product.url,
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
      validFrom: new Date().toISOString(),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function MenuItemSchema({ product }: { product: ProductData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: product.name,
    description: product.description,
    image: product.image || `${siteConfig.url}/opengraph-image`,
    url: product.url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'THB',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/booking?package=${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, '-'))}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    image: `${siteConfig.url}/opengraph-image`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    url: siteConfig.url,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      ...siteConfig.openingHours,
    },
    priceRange: '฿฿',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
  author,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/threemonkeyslogo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function RestaurantSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteConfig.url}/#restaurant`,
    name: siteConfig.name,
    alternateName: ['Three Monkeys', 'Three Monkeys Thai Restaurant', 'Three Monkeys Phuket'],
    description: siteConfig.description,
    slogan: 'Authentic Thai Cuisine',
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/threemonkeyslogo.png`,
    image: [
      `${siteConfig.url}/opengraph-image`,
      `${siteConfig.url}/images/new/threemonkeys057.jpg`,
      `${siteConfig.url}/images/new/threemonkeys048.jpg`,
    ],
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      ...siteConfig.openingHours,
    },
    priceRange: '฿฿',
    currenciesAccepted: 'THB',
    paymentAccepted: 'Cash, Credit Card',
    servesCuisine: ['Thai', 'Southern Thai', 'Asian'],
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Garden Seating', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Private Dining', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Parking', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Hotel Transfer', value: true },
    ],
    publicAccess: true,
    acceptsReservations: 'True',
    knowsAbout: [
      'Thai cuisine',
      'Southern Thai food',
      'Fine dining in Phuket',
      'Thai culinary experiences',
    ],
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SpeakableSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteConfig.url}/#speakable`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article', '.hero-content', '.package-description', '.faq-answer'],
    },
    name: `${siteConfig.name} - Authentic Thai Cuisine in Phuket`,
    description: siteConfig.description,
    url: siteConfig.url,
    mainEntity: {
      '@type': 'Restaurant',
      name: siteConfig.name,
      description: siteConfig.description,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HowToBookSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Book a Table at Three Monkeys Restaurant',
    description: 'Step-by-step guide to booking your dining experience at Three Monkeys Restaurant Phuket',
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Choose your dining package',
        text: 'Choose a dining zone such as Monkey Dome or Monkey Nest, or a celebration package',
        url: `${siteConfig.url}/booking`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select date and time',
        text: 'Pick your preferred dining date and time slot (lunch or dinner)',
        url: `${siteConfig.url}/booking`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Add extras (optional)',
        text: 'Choose available celebration extras and transfer options for your reservation',
        url: `${siteConfig.url}/booking`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Complete booking',
        text: 'Enter your details, choose hotel transfer option, and confirm your reservation',
        url: `${siteConfig.url}/checkout`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
