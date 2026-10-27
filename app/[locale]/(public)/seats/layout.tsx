import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Rainforest Dining Zones",
  "Find your dining zone at Three Monkeys Restaurant Phuket, from Monkey Dome and Monkey Nest to indoor and outdoor seating.",
  '/seats'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
