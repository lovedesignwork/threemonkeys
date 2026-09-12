import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = generatePageMetadata(
  'Combo Packages - Complete Dining Experiences',
  'Discover our premium combo packages at Three Monkeys Restaurant Phuket. Dining zones and celebration packages for your rainforest restaurant experience.',
  '/packages/combined',
  '/opengraph-image'
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function CombinedPackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
