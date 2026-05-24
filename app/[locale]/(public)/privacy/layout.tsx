import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = {
  ...generatePageMetadata(
    'Privacy Policy',
    'Read Three Monkeys Restaurant\'s privacy policy. Learn how we collect, use, and protect your personal information when you use our services.',
    '/privacy'
  ),
  robots: {
    index: true,
    follow: true,
    noarchive: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
