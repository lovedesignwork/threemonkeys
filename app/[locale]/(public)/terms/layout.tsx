import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Terms & Conditions",
  "Read the terms and conditions for Three Monkeys Restaurant, including booking policies, cancellation terms, and reservation guidelines.",
  '/terms'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
