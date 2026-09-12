import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = generatePageMetadata(
  'About Us - Our Story & Mission',
  'Learn about Three Monkeys Restaurant, Phuket\'s premier Thai dining destination. Discover our culinary philosophy, fresh ingredients, and commitment to authentic Southern Thai cuisine.',
  '/about'
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
