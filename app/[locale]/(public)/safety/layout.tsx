import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Guest Safety",
  "Read guest safety information for visiting and dining at Three Monkeys Restaurant Phuket.",
  '/safety'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
