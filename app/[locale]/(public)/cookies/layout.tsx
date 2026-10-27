import { createPageMetadata } from '@/lib/seo/config';

export const generateMetadata = createPageMetadata(
  "Cookie Policy",
  "Read how Three Monkeys Restaurant uses cookies on its website and review your cookie choices.",
  '/cookies'
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
