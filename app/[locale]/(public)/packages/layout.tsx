import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Dining Packages & Seating",
  "Explore dining packages and seating at Three Monkeys Restaurant Phuket. Choose your rainforest dining experience and reserve a table.",
  '/packages'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
