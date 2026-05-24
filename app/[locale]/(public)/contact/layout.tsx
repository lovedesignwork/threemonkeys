import { Metadata } from 'next';
import { generatePageMetadata, siteConfig } from '@/lib/seo/config';

export const metadata: Metadata = {
  ...generatePageMetadata(
    'Contact Us - Get in Touch',
    `Contact Hanuman World Phuket for bookings, inquiries, and support. Call us at ${siteConfig.contact.phone}, email ${siteConfig.contact.email}, or use our contact form. We\'re here to help!`,
    '/contact'
  ),
  other: {
    'contact:phone': siteConfig.contact.phone,
    'contact:email': siteConfig.contact.email,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
