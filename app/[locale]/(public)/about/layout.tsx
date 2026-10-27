import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "About Three Monkeys Phuket",
  "Discover Three Monkeys Restaurant at Hanuman World in Phuket, serving Southern Thai cuisine in a rainforest setting.",
  '/about'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
