import type { Metadata } from 'next';
import { generatePageMetadata, localizePageMetadata } from '@/lib/seo/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(generatePageMetadata(
    "Cookie Policy",
    "Learn how Three Monkeys Restaurant uses cookies and how to manage your preferences.",
    "/cookies"
  ), locale);
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
