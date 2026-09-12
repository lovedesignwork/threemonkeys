import type { Metadata } from 'next';
import { generatePageMetadata, localizePageMetadata } from '@/lib/seo/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(generatePageMetadata(
    "Special Packages - Celebrations & Romantic Dining",
    "Celebrate birthdays, anniversaries and proposals at Three Monkeys Restaurant. Explore dining packages and reserve online.",
    "/special-packages"
  ), locale);
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
