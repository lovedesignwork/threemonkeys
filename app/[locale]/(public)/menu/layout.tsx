import type { Metadata } from 'next';
import { generatePageMetadata, localizePageMetadata } from '@/lib/seo/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(generatePageMetadata(
    "Menu - Food & Drinks",
    "Explore the Three Monkeys Restaurant menu, with Southern Thai dishes, international favorites, vegetarian options, desserts and drinks.",
    "/menu"
  ), locale);
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
