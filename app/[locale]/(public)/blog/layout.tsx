import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Restaurant Stories & Phuket Dining",
  "Read Three Monkeys Restaurant stories, news, and articles about Southern Thai food and dining in Phuket.",
  '/blog'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
