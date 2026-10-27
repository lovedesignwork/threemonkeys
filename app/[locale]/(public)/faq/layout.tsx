import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Dining & Reservation FAQ",
  "Find answers about reservations, menu options, dietary requirements, dress code, and dining at Three Monkeys Restaurant Phuket.",
  '/faq'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
