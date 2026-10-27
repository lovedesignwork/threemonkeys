import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Celebration & Special Packages",
  "Explore dinner, birthday, and proposal packages at Three Monkeys Restaurant Phuket. Plan a special occasion in the rainforest.",
  '/special-packages'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
