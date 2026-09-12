import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata, siteConfig } from '@/lib/seo/config';

const pageMetadata: Metadata = {
  ...generatePageMetadata(
    'Contact Us - Get in Touch',
    `Contact ${siteConfig.name} for table reservations, inquiries, and support. Call us at ${siteConfig.contact.phone}, email ${siteConfig.contact.email}, or use our contact form. We're here to help!`,
    '/contact'
  ),
  other: {
    'contact:phone': siteConfig.contact.phone,
    'contact:email': siteConfig.contact.email,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
