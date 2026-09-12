import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = {
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
