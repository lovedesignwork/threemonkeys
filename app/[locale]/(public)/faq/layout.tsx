import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = generatePageMetadata(
  'FAQ - Frequently Asked Questions',
  'Find answers to frequently asked questions about Three Monkeys Restaurant Phuket. Learn about reservations, menu options, dietary requirements, dress code, and more.',
  '/faq'
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
