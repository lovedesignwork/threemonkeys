import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Privacy Policy",
  "Learn how Three Monkeys Restaurant collects, uses, and protects personal information when you use our website and booking services.",
  '/privacy'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
