import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "All Dining Packages",
  "Explore Three Monkeys Restaurant dining packages and seating options in Phuket. Compare experiences and reserve online.",
  '/packages/combined'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
