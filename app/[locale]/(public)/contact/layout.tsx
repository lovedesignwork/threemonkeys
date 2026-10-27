import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Contact & Location",
  "Contact Three Monkeys Restaurant in Wichit, Phuket. Find our location, opening hours, phone number, and contact form.",
  '/contact'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
