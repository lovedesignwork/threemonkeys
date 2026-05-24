import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = {
  ...generatePageMetadata(
    'Terms & Conditions',
    'Read the terms and conditions for Three Monkeys Restaurant. Learn about booking policies, cancellation terms, dining requirements, and reservation guidelines.',
    '/terms'
  ),
  robots: {
    index: true,
    follow: true,
    noarchive: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
