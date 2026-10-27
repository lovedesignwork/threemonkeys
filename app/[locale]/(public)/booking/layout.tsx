import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Reserve a Table in Phuket",
  "Reserve your Three Monkeys Restaurant table online. Choose a dining zone or package, date, time, and guests, then review your booking.",
  '/booking'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
