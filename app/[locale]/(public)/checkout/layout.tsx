import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Complete Your Booking",
  "Review and complete your Three Monkeys Restaurant booking with secure payment.",
  '/checkout',
  { robots: { index: false, follow: false } }
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
