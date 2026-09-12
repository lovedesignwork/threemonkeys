import type { Metadata } from 'next';
import { generatePageMetadata, localizePageMetadata } from '@/lib/seo/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(generatePageMetadata(
    "Our Seats - Rainforest Dining Zones",
    "Choose your table at Three Monkeys Restaurant. Explore Monkey Dome, Monkey Nest and our indoor and outdoor rainforest dining zones.",
    "/seats"
  ), locale);
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
