import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Food & Drink Menu",
  "Explore the food and drink menu at Three Monkeys Restaurant Phuket, featuring Southern Thai cuisine alongside Western and Japanese dishes.",
  '/menu'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
