import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = generatePageMetadata(
  'About Us - Our Story & Mission',
  'Learn about Three Monkeys Restaurant, Phuket\'s premier Thai dining destination. Discover our culinary philosophy, fresh ingredients, and commitment to authentic Southern Thai cuisine.',
  '/about'
);

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
