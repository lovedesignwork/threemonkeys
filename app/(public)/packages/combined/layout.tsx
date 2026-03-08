import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = generatePageMetadata(
  'Combo Packages - Complete Dining Experiences',
  'Discover our premium combo packages at Three Monkeys Restaurant Phuket. Cooking classes, market tours, tasting menus, and more with round-trip transfers included.',
  '/packages/combined',
  '/images/Package image/32PF.JPG'
);

export default function CombinedPackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
