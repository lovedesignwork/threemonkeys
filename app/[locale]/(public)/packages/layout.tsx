import type { Metadata } from 'next';
import { generatePageMetadata, localizePageMetadata } from '@/lib/seo/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(generatePageMetadata(
    "Dining Packages & Reservations",
    "Explore dining zones and celebration packages at Three Monkeys Restaurant Phuket.",
    "/packages"
  ), locale);
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
