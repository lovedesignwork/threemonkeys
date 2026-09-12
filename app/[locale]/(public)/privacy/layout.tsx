import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = {
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
