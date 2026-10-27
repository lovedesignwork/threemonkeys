import { siteConfig } from './config';

interface BreadcrumbItem { name: string; url: string }
interface ProductData {
  name: string; description: string; price: number; currency?: string; image?: string; url: string;
}
interface FAQItem { question: string; answer: string }

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  }} />;
}

const organizationId = `${siteConfig.url}/#organization`;
const restaurantId = `${siteConfig.url}/#restaurant`;
const logo = `${siteConfig.url}/images/threemonkeyslogo.png`;
const sameAs = [siteConfig.social.facebook, siteConfig.social.instagram];

export function OrganizationSchema() {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'Organization', '@id': organizationId,
    name: siteConfig.name, url: siteConfig.url, logo,
    telephone: siteConfig.contact.phone, email: siteConfig.contact.email, sameAs,
  }} />;
}

export function WebsiteSchema() {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name, url: siteConfig.url, description: siteConfig.description,
    publisher: { '@id': organizationId },
  }} />;
}

export function RestaurantSchema() {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'Restaurant', '@id': restaurantId,
    name: siteConfig.name, alternateName: 'Three Monkeys Phuket',
    description: siteConfig.description, url: siteConfig.url, logo,
    image: `${siteConfig.url}/opengraph-image`,
    telephone: siteConfig.contact.phone, email: siteConfig.contact.email,
    parentOrganization: { '@id': organizationId },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Inside Hanuman World, 105 Moo 4, Muang Chao Fa Rd.',
      addressLocality: 'Wichit, Mueang Phuket', addressRegion: 'Phuket',
      postalCode: '83000', addressCountry: 'TH',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00', closes: '01:00',
    },
    servesCuisine: ['Thai', 'Southern Thai', 'Western', 'Japanese', 'Bali fusion'],
    hasMenu: `${siteConfig.url}/menu`,
    acceptsReservations: `${siteConfig.url}/booking`,
    hasMap: 'https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6',
    sameAs,
  }} />;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
    })),
  }} />;
}

export function ProductSchema({ product }: { product: ProductData }) {
  // Prices and availability are controlled live in the booking flow. Do not
  // publish static offers or invented aggregate ratings as current facts.
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'Service',
    name: product.name, description: product.description,
    image: product.image || `${siteConfig.url}/opengraph-image`, url: product.url,
    provider: { '@id': restaurantId },
  }} />;
}

export function MenuItemSchema({ product }: { product: ProductData }) {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'MenuItem',
    name: product.name, description: product.description,
    image: product.image || `${siteConfig.url}/opengraph-image`, url: product.url,
  }} />;
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question', name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }} />;
}

export function ArticleSchema({ title, description, image, url, datePublished, dateModified, author }: {
  title: string; description: string; image: string; url: string;
  datePublished: string; dateModified?: string; author?: string;
}) {
  return <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: title, description, image, url, datePublished,
    dateModified: dateModified || datePublished,
    author: { '@type': 'Person', name: author || siteConfig.name },
    publisher: { '@id': organizationId },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }} />;
}

// The Restaurant entity already describes this business. The previous global
// speakable and HowTo markup did not correspond to visible content.
export function LocalBusinessSchema() { return null; }
export function SpeakableSchema() { return null; }
export function HowToBookSchema() { return null; }
