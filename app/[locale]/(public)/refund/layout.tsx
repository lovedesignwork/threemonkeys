import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Refund & Cancellation Policy",
  "Review the refund and cancellation policy for reservations and packages at Three Monkeys Restaurant Phuket.",
  '/refund'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
